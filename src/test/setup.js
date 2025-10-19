import '@testing-library/jest-dom'

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_MODEL_URL: 'https://teachablemachine.withgoogle.com/models/test/',
    VITE_CONFIDENCE_THRESHOLD: '0.6',
    VITE_WIN_SCORE: '5',
    VITE_SERVER_URL: 'http://localhost:3001',
  },
  writable: true,
})

// Mock MediaDevices API
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
})

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
})

// Mock TensorFlow.js
vi.mock('@teachablemachine/image', () => ({
  load: vi.fn().mockResolvedValue({
    predict: vi.fn().mockResolvedValue([
      { className: 'Rock', probability: 0.8 },
      { className: 'Paper', probability: 0.1 },
      { className: 'Scissors', probability: 0.1 },
    ]),
  }),
}))

// Mock Socket.IO
vi.mock('socket.io-client', () => ({
  io: vi.fn().mockReturnValue({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  }),
}))
