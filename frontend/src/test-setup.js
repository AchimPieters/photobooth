// Globale mocks voor browser-APIs die jsdom niet heeft
global.URL.createObjectURL = () => 'blob:mock'
global.URL.revokeObjectURL = () => {}

// Canvas mock (jsdom heeft geen echte Canvas)
HTMLCanvasElement.prototype.getContext = () => ({
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
  fillRect: () => {},
  fillText: () => {},
  drawImage: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  scale: () => {},
  clip: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  quadraticCurveTo: () => {},
  closePath: () => {},
})
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,mock'
