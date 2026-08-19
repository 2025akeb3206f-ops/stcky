import { clamp } from '../utils/math.js'

export function drawStickman(ctx, width, height, state) {
  const mouthOpen = clamp(state.mouthOpen ?? 0.04, 0.02, 1)
  const headBob = clamp(state.headBob ?? 0, 0, 1)
  const blink = state.blink ? 1 : 0
  const progress = clamp(state.progress ?? 0, 0, 1)

  const centerX = width * 0.5
  const floorY = height * 0.82
  const bounce = Math.sin(progress * Math.PI * 12) * 4 * headBob
  const bob = headBob * 14 + bounce

  ctx.clearRect(0, 0, width, height)

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#f3f6ff')
  gradient.addColorStop(1, '#ebf0ff')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = '#b5c1e6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(width * 0.05, floorY + 40)
  ctx.lineTo(width * 0.95, floorY + 40)
  ctx.stroke()

  const headY = height * 0.26 + bob
  const bodyTop = headY + 58
  const bodyBottom = floorY - 86

  ctx.strokeStyle = '#131829'
  ctx.fillStyle = '#131829'
  ctx.lineCap = 'round'
  ctx.lineWidth = 9

  ctx.beginPath()
  ctx.arc(centerX, headY, 44, 0, Math.PI * 2)
  ctx.stroke()

  const eyeY = headY - 8
  ctx.lineWidth = 4
  if (blink) {
    ctx.beginPath()
    ctx.moveTo(centerX - 20, eyeY)
    ctx.lineTo(centerX - 8, eyeY)
    ctx.moveTo(centerX + 8, eyeY)
    ctx.lineTo(centerX + 20, eyeY)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(centerX - 14, eyeY, 3, 0, Math.PI * 2)
    ctx.arc(centerX + 14, eyeY, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  const mouthWidth = 14 + mouthOpen * 36
  const mouthHeight = 3 + mouthOpen * 24
  ctx.beginPath()
  ctx.ellipse(centerX, headY + 21, mouthWidth * 0.5, mouthHeight * 0.5, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.moveTo(centerX, bodyTop)
  ctx.lineTo(centerX, bodyBottom)
  ctx.stroke()

  const shoulderY = bodyTop + 18
  const armSwing = 14 + headBob * 26
  ctx.beginPath()
  ctx.moveTo(centerX, shoulderY)
  ctx.lineTo(centerX - 70, shoulderY + armSwing)
  ctx.moveTo(centerX, shoulderY)
  ctx.lineTo(centerX + 70, shoulderY - armSwing)
  ctx.stroke()

  const hipY = bodyBottom
  const legSpread = 55
  ctx.beginPath()
  ctx.moveTo(centerX, hipY)
  ctx.lineTo(centerX - legSpread, floorY + 35)
  ctx.moveTo(centerX, hipY)
  ctx.lineTo(centerX + legSpread, floorY + 35)
  ctx.stroke()
}
