import { useState, useRef, useEffect } from 'react';

const CHOICES = ["Rock", "Paper", "Scissors"];

export const useEnhancedGameLogic = (winScore = 5, multiplayer = null) => {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [humanMove, setHumanMove] = useState(null);
  const [computerMove, setComputerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [scores, setScores] = useState({ human: 0, computer: 0, ties: 0 });
  const [countdown, setCountdown] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [gameWinner, setGameWinner] = useState(null);
  const [shufflingImage, setShufflingImage] = useState(null);
  const shuffleIntervalRef = useRef(null);

  // Multiplayer-specific state
  const [isMultiplayerMode, setIsMultiplayerMode] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  // Update multiplayer mode when multiplayer hook changes
  useEffect(() => {
    setIsMultiplayerMode(multiplayer?.isMultiplayer || false);
  }, [multiplayer?.isMultiplayer]);

  // Listen to multiplayer events
  useEffect(() => {
    if (!multiplayer) return;

    // Handle multiplayer round results
    if (multiplayer.roundResult) {
      const playerMove = multiplayer.getPlayerMove();
      const opponentMove = multiplayer.getOpponentMove();
      const winner = multiplayer.getRoundWinner();

      setHumanMove(playerMove);
      setOpponentMove(opponentMove);
      
      // Convert multiplayer winner to game logic format
      let gameResult;
      if (winner === 'tie') gameResult = 'tie';
      else if (winner === 'player') gameResult = 'human';
      else gameResult = 'opponent';

      setRoundResult(gameResult);
      setWaitingForOpponent(false);
      setGameActive(false);
      stopImageShuffle();

      // Update scores from multiplayer
      const multiScores = multiplayer.multiplayerScores;
      const playerPosition = multiplayer.getPlayerPosition();
      
      if (playerPosition === 'player1') {
        setScores({
          human: multiScores.player1,
          computer: multiScores.player2,
          ties: multiScores.ties
        });
      } else {
        setScores({
          human: multiScores.player2,
          computer: multiScores.player1,
          ties: multiScores.ties
        });
      }

      // Check for game winner
      if (multiScores.player1 >= winScore || multiScores.player2 >= winScore) {
        const playerWon = (playerPosition === 'player1' && multiScores.player1 >= winScore) ||
                         (playerPosition === 'player2' && multiScores.player2 >= winScore);
        setGameWinner(playerWon ? "Human" : "Opponent");
      }

      // Add to history
      setRoundHistory((prev) => [
        { 
          human: playerMove?.gesture || playerMove, 
          computer: opponentMove?.gesture || opponentMove, 
          winner: gameResult, 
          confidence: playerMove?.confidence || 0.8
        },
        ...prev.slice(0, 9),
      ]);
    }
  }, [multiplayer?.roundResult, winScore]); // Remove multiplayer object dependency to prevent infinite re-renders

  // Game Logic Functions
  const determineWinner = (human, computer) => {
    if (human === computer) return "tie";
    if (
      (human === "Rock" && computer === "Scissors") ||
      (human === "Paper" && computer === "Rock") ||
      (human === "Scissors" && computer === "Paper")
    ) {
      return "human";
    }
    return "computer";
  };

  const generateComputerMove = () => {
    return CHOICES[Math.floor(Math.random() * CHOICES.length)];
  };

  const startImageShuffle = () => {
    shuffleIntervalRef.current = setInterval(() => {
      const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      setShufflingImage(randomChoice);
    }, 150);
  };

  const stopImageShuffle = () => {
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
    setShufflingImage(null);
  };

  const captureGestures = (computerChoice, humanResult) => {
    if (!humanResult || humanResult.confidence < 0.5) {
      return { success: false, error: "Human gesture not detected clearly! Try again." };
    }

    const winner = determineWinner(humanResult.gesture, computerChoice);

    setHumanMove(humanResult.gesture);
    setRoundResult(winner);

    // Update scores
    const newScores = {
      human: scores.human + (winner === "human" ? 1 : 0),
      computer: scores.computer + (winner === "computer" ? 1 : 0),
      ties: scores.ties + (winner === "tie" ? 1 : 0),
    };
    setScores(newScores);

    // Check for game winner
    if (newScores.human >= winScore) {
      setGameWinner("Human");
    } else if (newScores.computer >= winScore) {
      setGameWinner("Computer");
    }

    // Add to history
    setRoundHistory((prev) => [
      { 
        human: humanResult.gesture, 
        computer: computerChoice, 
        winner, 
        confidence: humanResult.confidence
      },
      ...prev.slice(0, 9),
    ]);

    return { success: true };
  };

  const resetGame = () => {
    setScores({ human: 0, computer: 0, ties: 0 });
    setRoundHistory([]);
    setHumanMove(null);
    setComputerMove(null);
    setOpponentMove(null);
    setRoundResult(null);
    setGameWinner(null);
    setWaitingForOpponent(false);
    stopImageShuffle();

    // Reset multiplayer game if in multiplayer mode
    if (isMultiplayerMode && multiplayer?.canResetGame) {
      multiplayer.resetGame();
    }
  };

  const playRound = (getCurrentGesture, onError) => {
    if (gameWinner) {
      onError("Game over! Reset to play again.");
      return;
    }

    // Multiplayer mode
    if (isMultiplayerMode) {
      if (multiplayer?.gameStatus !== 'playing') {
        onError("Game not ready! Wait for both players.");
        return;
      }

      setGameActive(true);
      setRoundResult(null);
      setWaitingForOpponent(true);
      setHumanMove(humanGesture);
      
      // Start shuffling animation for opponent
      startImageShuffle();

      // Send move to multiplayer
      multiplayer.sendMove(humanGesture.gesture, humanGesture.confidence);
      return;
    }

    // Single player mode (original logic)
    setGameActive(true);
    setRoundResult(null);
    setCountdown(3);
    setComputerMove(null);

    // Generate computer move but don't show it yet
    const computerChoice = generateComputerMove();
    
    // Start shuffling animation for AI images
    startImageShuffle();

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          stopImageShuffle();
          setComputerMove(computerChoice);
          
          const currentGesture = getCurrentGesture();
          const result = captureGestures(computerChoice, currentGesture);
          if (!result.success) {
            onError(result.error);
          }
          setGameActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Helper functions for multiplayer
  const getOpponentName = () => {
    return multiplayer?.opponent?.name || "Opponent";
  };

  const getPlayerScore = () => {
    if (!isMultiplayerMode) return scores.human;
    
    const multiScores = multiplayer?.multiplayerScores;
    const playerPosition = multiplayer?.getPlayerPosition();
    
    if (!multiScores || !playerPosition) return 0;
    
    return playerPosition === 'player1' ? multiScores.player1 : multiScores.player2;
  };

  const getOpponentScore = () => {
    if (!isMultiplayerMode) return scores.computer;
    
    const multiScores = multiplayer?.multiplayerScores;
    const playerPosition = multiplayer?.getPlayerPosition();
    
    if (!multiScores || !playerPosition) return 0;
    
    return playerPosition === 'player1' ? multiScores.player2 : multiScores.player1;
  };

  const getTieScore = () => {
    if (!isMultiplayerMode) return scores.ties;
    return multiplayer?.multiplayerScores?.ties || 0;
  };

  return {
    // State
    gameActive,
    humanMove,
    computerMove: isMultiplayerMode ? opponentMove : computerMove,
    roundResult,
    scores: {
      human: getPlayerScore(),
      computer: getOpponentScore(),
      ties: getTieScore()
    },
    countdown: isMultiplayerMode ? null : countdown,
    roundHistory,
    gameWinner,
    shufflingImage,
    
    // Multiplayer-specific state
    isMultiplayerMode,
    waitingForOpponent: isMultiplayerMode ? (multiplayer?.waitingForOpponent || waitingForOpponent) : false,
    opponentName: getOpponentName(),
    
    // Actions
    playRound,
    resetGame,
    generateComputerMove,
    determineWinner
  };
};
