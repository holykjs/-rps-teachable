import { useState, useRef } from 'react';

const CHOICES = ["Rock", "Paper", "Scissors"];

export const useGameLogic = (winScore = 5) => {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [humanMove, setHumanMove] = useState(null);
  const [computerMove, setComputerMove] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [scores, setScores] = useState({ human: 0, computer: 0, ties: 0 });
  const [countdown, setCountdown] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [gameWinner, setGameWinner] = useState(null);
  const [shufflingImage, setShufflingImage] = useState(null);
  const shuffleIntervalRef = useRef(null);

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
    setRoundResult(null);
    setGameWinner(null);
    stopImageShuffle();
  };

  const playRound = (humanGesture, onError) => {
    if (gameWinner) {
      onError("Game over! Reset to play again.");
      return;
    }

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
          
          const result = captureGestures(computerChoice, humanGesture);
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

  return {
    // State
    gameActive,
    humanMove,
    computerMove,
    roundResult,
    scores,
    countdown,
    roundHistory,
    gameWinner,
    shufflingImage,
    
    // Actions
    playRound,
    resetGame,
    generateComputerMove,
    determineWinner
  };
};
