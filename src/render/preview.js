import { drawStickman } from './stickman.js'

export class StickmanPreview {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.onResize = this.onResize.bind(this)

    this.onResize()
    window.addEventListener('resize', this.onResize)
  }

  onResize() {
    const { width } = this.canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    const cssWidth = Math.max(320, Math.floor(width || 960))
    const cssHeight = Math.floor(cssWidth * 9 / 16)

    this.canvas.width = Math.floor(cssWidth * ratio)
    this.canvas.height = Math.floor(cssHeight * ratio)

    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(ratio, ratio)
  }

  draw(state) {
    const { width, height } = this.canvas.getBoundingClientRect()
    drawStickman(this.ctx, Math.max(320, width), Math.max(180, height), state)
  }
}
