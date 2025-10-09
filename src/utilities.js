// Hand landmark drawing utilities (cvzone-like style)

// Hand connections for drawing skeleton
const fingerJoints = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Draw hand skeleton with cvzone-like styling
export const drawHand = (predictions, ctx) => {
  // Check if we have predictions
  if (predictions.length > 0) {
    // Only draw the first hand (max 1 hand like cvzone)
    const hand = predictions[0];
    const landmarks = hand.landmarks;

    // Draw connections (green lines like cvzone)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Draw finger connections
    Object.values(fingerJoints).forEach(finger => {
      for (let i = 0; i < finger.length - 1; i++) {
        const firstJoint = landmarks[finger[i]];
        const secondJoint = landmarks[finger[i + 1]];
        
        ctx.beginPath();
        ctx.moveTo(firstJoint[0], firstJoint[1]);
        ctx.lineTo(secondJoint[0], secondJoint[1]);
        ctx.stroke();
      }
    });

    // Draw palm connections
    const palmConnections = [
      [0, 5], [5, 9], [9, 13], [13, 17], [17, 0]
    ];
    
    palmConnections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      ctx.beginPath();
      ctx.moveTo(startPoint[0], startPoint[1]);
      ctx.lineTo(endPoint[0], endPoint[1]);
      ctx.stroke();
    });

    // Draw landmarks (red dots like cvzone)
    ctx.fillStyle = '#FF0000';
    landmarks.forEach(landmark => {
      ctx.beginPath();
      ctx.arc(landmark[0], landmark[1], 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
};

// Create custom gestures for Rock, Paper, Scissors
export const createRPSGestures = () => {
  // This will be used with fingerpose to detect RPS gestures
  // For now, we'll rely on the Teachable Machine model for gesture recognition
  // but this structure allows for future fingerpose integration
  return {
    rock: 'rock',
    paper: 'paper', 
    scissors: 'scissors'
  };
};
