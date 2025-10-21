import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebRTC = (socket, roomId, isHost) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // WebRTC configuration with STUN servers
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream');
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setIsConnected(pc.connectionState === 'connected');
      
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError('WebRTC connection failed');
      }
    };

    return pc;
  }, [socket, roomId]);

  // Start local video stream
  const startLocalVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false // Disable audio for now to avoid feedback
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add stream to peer connection
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      return stream;
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Failed to access webcam: ' + err.message);
      throw err;
    }
  }, [createPeerConnection]);

  // Create offer (host initiates)
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current || !socket) return;

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      socket.emit('webrtc-offer', {
        roomId,
        offer
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      setError('Failed to create WebRTC offer');
    }
  }, [socket, roomId]);

  // Handle incoming offer (guest responds)
  const handleOffer = useCallback(async (offer) => {
    if (!peerConnectionRef.current || !socket) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      socket.emit('webrtc-answer', {
        roomId,
        answer
      });
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to handle WebRTC offer');
    }
  }, [socket, roomId]);

  // Handle incoming answer (host receives)
  const handleAnswer = useCallback(async (answer) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Failed to handle WebRTC answer');
    }
  }, []);

  // Handle ICE candidates
  const handleIceCandidate = useCallback(async (candidate) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }, []);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('ice-candidate', ({ candidate }) => handleIceCandidate(candidate));

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('ice-candidate');
    };
  }, [socket]); // Remove callback dependencies to prevent infinite re-renders

  // Initialize WebRTC when room is ready
  const initializeWebRTC = useCallback(async () => {
    try {
      await startLocalVideo();
      
      // Host creates offer after both players are ready
      if (isHost) {
        setTimeout(() => createOffer(), 1000); // Small delay to ensure both peers are ready
      }
    } catch (err) {
      console.error('Failed to initialize WebRTC:', err);
    }
  }, [startLocalVideo, createOffer, isHost]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setError(null);
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    isConnected,
    error,
    localVideoRef,
    remoteVideoRef,
    initializeWebRTC,
    cleanup,
    startLocalVideo
  };
};
