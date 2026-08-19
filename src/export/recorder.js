export class PreviewRecorder {
  constructor(canvas, audioElement) {
    this.canvas = canvas
    this.audioElement = audioElement
  }

  async recordPlayback({ fps = 30, draw }) {
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder is not supported in this browser.')
    }

    const canvasStream = this.canvas.captureStream(fps)
    const mixedStream = new MediaStream(canvasStream.getVideoTracks())

    const audioStream = this.audioElement.captureStream?.() ?? this.audioElement.mozCaptureStream?.()
    const [audioTrack] = audioStream?.getAudioTracks?.() ?? []
    if (audioTrack) {
      mixedStream.addTrack(audioTrack)
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm'

    const chunks = []
    const recorder = new MediaRecorder(mixedStream, { mimeType })

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    return new Promise((resolve, reject) => {
      const onStop = () => {
        if (!chunks.length) {
          reject(new Error('No data captured during export.'))
          return
        }

        resolve({
          blob: new Blob(chunks, { type: 'video/webm' }),
        })
      }

      const onEnded = () => {
        recorder.stop()
      }

      recorder.onerror = () => reject(new Error('Recorder failed to start.'))
      recorder.onstop = onStop

      this.audioElement.currentTime = 0
      this.audioElement.onended = onEnded

      const renderLoop = () => {
        if (!this.audioElement.paused) {
          draw({
            progress: this.audioElement.duration
              ? this.audioElement.currentTime / this.audioElement.duration
              : 0,
          })
          requestAnimationFrame(renderLoop)
        }
      }

      recorder.start(100)
      this.audioElement.play().then(() => {
        renderLoop()
      }).catch(() => {
        recorder.stop()
        reject(new Error('Unable to play audio for export.'))
      })
    }).finally(() => {
      this.audioElement.onended = null
    })
  }
}
