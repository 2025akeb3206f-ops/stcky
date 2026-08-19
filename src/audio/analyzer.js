import { clamp, lerp } from '../utils/math.js'

export class AudioReactiveAnalyzer {
  constructor() {
    this.audioContext = null
    this.sourceNode = null
    this.analyzerNode = null
    this.timeData = null
    this.level = 0
    this.energy = 0
    this.seed = Math.random() * 1000
  }

  async connectToAudio(audioElement) {
    if (!window.AudioContext && !window.webkitAudioContext) {
      throw new Error('Web Audio API is not supported.')
    }

    if (!this.audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext
      this.audioContext = new Context()
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect()
    }

    this.sourceNode = this.audioContext.createMediaElementSource(audioElement)
    this.analyzerNode = this.audioContext.createAnalyser()
    this.analyzerNode.fftSize = 2048
    this.analyzerNode.smoothingTimeConstant = 0.78

    this.sourceNode.connect(this.analyzerNode)
    this.analyzerNode.connect(this.audioContext.destination)

    this.timeData = new Uint8Array(this.analyzerNode.fftSize)

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  async resume() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  getMetrics() {
    if (!this.analyzerNode || !this.timeData) {
      return { mouthOpen: 0.02, headBob: 0, blink: 0 }
    }

    this.analyzerNode.getByteTimeDomainData(this.timeData)

    let rmsAccumulator = 0
    for (let index = 0; index < this.timeData.length; index += 1) {
      const normalized = (this.timeData[index] - 128) / 128
      rmsAccumulator += normalized * normalized
    }

    const rms = Math.sqrt(rmsAccumulator / this.timeData.length)
    this.level = lerp(this.level, rms, 0.25)
    this.energy = lerp(this.energy, Math.min(1, rms * 8), 0.1)

    const now = performance.now() / 1000
    const blinkWave = Math.sin(now * 1.7 + this.seed)
    const blink = blinkWave > 0.985 ? 1 : 0

    return {
      mouthOpen: clamp(0.04 + this.level * 4.8, 0.02, 1),
      headBob: clamp(this.energy * 0.7, 0, 1),
      blink,
    }
  }

  destroy() {
    this.sourceNode?.disconnect()
    this.analyzerNode?.disconnect()
    this.audioContext?.close()
  }
}
