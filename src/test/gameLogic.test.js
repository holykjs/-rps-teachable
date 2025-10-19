import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameLogic } from '../hooks/useGameLogic'

describe('useGameLogic', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useGameLogic(5))
    
    expect(result.current.scores).toEqual({ human: 0, computer: 0, ties: 0 })
    expect(result.current.gameActive).toBe(false)
    expect(result.current.gameWinner).toBe(null)
    expect(result.current.humanMove).toBe(null)
    expect(result.current.computerMove).toBe(null)
  })

  it('should determine winner correctly', () => {
    const { result } = renderHook(() => useGameLogic(5))
    
    // Rock beats Scissors
    expect(result.current.determineWinner('Rock', 'Scissors')).toBe('human')
    // Paper beats Rock
    expect(result.current.determineWinner('Paper', 'Rock')).toBe('human')
    // Scissors beats Paper
    expect(result.current.determineWinner('Scissors', 'Paper')).toBe('human')
    
    // Computer wins
    expect(result.current.determineWinner('Rock', 'Paper')).toBe('computer')
    expect(result.current.determineWinner('Paper', 'Scissors')).toBe('computer')
    expect(result.current.determineWinner('Scissors', 'Rock')).toBe('computer')
    
    // Ties
    expect(result.current.determineWinner('Rock', 'Rock')).toBe('tie')
    expect(result.current.determineWinner('Paper', 'Paper')).toBe('tie')
    expect(result.current.determineWinner('Scissors', 'Scissors')).toBe('tie')
  })

  it('should generate valid computer moves', () => {
    const { result } = renderHook(() => useGameLogic(5))
    const validMoves = ['Rock', 'Paper', 'Scissors']
    
    for (let i = 0; i < 10; i++) {
      const move = result.current.generateComputerMove()
      expect(validMoves).toContain(move)
    }
  })

  it('should reset game correctly', () => {
    const { result } = renderHook(() => useGameLogic(5))
    
    act(() => {
      result.current.resetGame()
    })
    
    expect(result.current.scores).toEqual({ human: 0, computer: 0, ties: 0 })
    expect(result.current.gameWinner).toBe(null)
    expect(result.current.humanMove).toBe(null)
    expect(result.current.computerMove).toBe(null)
  })
})

describe('Game Rules', () => {
  it('should follow standard Rock Paper Scissors rules', () => {
    const { result } = renderHook(() => useGameLogic(5))
    
    // Test all winning combinations for human
    const humanWins = [
      ['Rock', 'Scissors'],
      ['Paper', 'Rock'],
      ['Scissors', 'Paper']
    ]
    
    humanWins.forEach(([human, computer]) => {
      expect(result.current.determineWinner(human, computer)).toBe('human')
    })
    
    // Test all winning combinations for computer
    const computerWins = [
      ['Scissors', 'Rock'],
      ['Rock', 'Paper'],
      ['Paper', 'Scissors']
    ]
    
    computerWins.forEach(([human, computer]) => {
      expect(result.current.determineWinner(human, computer)).toBe('computer')
    })
  })
})
