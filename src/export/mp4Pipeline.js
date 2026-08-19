export function describeMp4Pipeline() {
  const hasWebCodecs = typeof window !== 'undefined' && 'VideoEncoder' in window

  if (hasWebCodecs) {
    return 'Starter path: use WebCodecs (VideoEncoder + AudioEncoder) to encode canvas/audio tracks, then mux with MP4Box.js. Keep the current WebM export as a fallback for unsupported browsers.'
  }

  return 'Starter path: record WebM in-browser (implemented), then convert to MP4 with ffmpeg.wasm (`-i input.webm -c:v libx264 -c:a aac output.mp4`) or process server-side for production-scale rendering.'
}
