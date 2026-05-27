import '@testing-library/jest-dom'

// Stub getUserMedia so CameraScreen does not throw in jsdom
Object.defineProperty(global.navigator, 'mediaDevices', {
  configurable: true,
  value: {
    getUserMedia: vi.fn(() =>
      Promise.resolve({ getTracks: () => [] })
    ),
  },
})

// Stub canvas getContext so PreviewScreen does not throw when jsdom
// has no real canvas implementation
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  font: '',
  textAlign: '',
  filter: '',
  fillText: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  roundRect: vi.fn(),
  clip: vi.fn(),
  drawImage: vi.fn(),
}))

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,stub')
