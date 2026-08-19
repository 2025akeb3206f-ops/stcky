export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
export const lerp = (start, end, amount) => start + (end - start) * amount
