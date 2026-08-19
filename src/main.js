import './style.css'
import { createAudioSourceFromFile, formatAudioFileError } from './audio/loader.js'
import { AudioReactiveAnalyzer } from './audio/analyzer.js'
import { StickmanPreview } from './render/preview.js'
import { PreviewRecorder } from './export/recorder.js'
import { describeMp4Pipeline } from './export/mp4Pipeline.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="app-shell">
    <header>
      <p class="eyebrow">Starter</p>
      <h1>Stickman Lip-Sync Video Generator</h1>
      <p class="subhead">Upload audio, preview a canvas stickman animation, and use the export starter pipeline for video output.</p>
    </header>

    <section class="card controls-grid">
      <label class="file-input">
        <span>Audio file</span>
        <input id="audio-file" type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,.mp3,.wav,.ogg,.m4a" />
      </label>
      <p id="file-status" class="status">No file selected.</p>

      <div class="button-row">
        <button id="play-toggle" type="button" disabled>Play</button>
        <button id="restart" type="button" disabled>Restart</button>
        <button id="export-webm" type="button" disabled>Export WebM (starter)</button>
      </div>

      <p id="export-status" class="status">Upload an audio file to enable controls.</p>
      <details>
        <summary>MP4 export path</summary>
        <p id="mp4-plan"></p>
      </details>
    </section>

    <section class="card preview-wrap">
      <div class="preview-head">
        <h2>Live preview</h2>
        <p id="time-readout">00:00 / 00:00</p>
      </div>
      <canvas id="preview-canvas" width="960" height="540" aria-label="Stickman preview"></canvas>
      <audio id="preview-audio" preload="metadata"></audio>
    </section>
  </main>
`

const fileInput = document.querySelector('#audio-file')
const fileStatus = document.querySelector('#file-status')
const playToggle = document.querySelector('#play-toggle')
const restart = document.querySelector('#restart')
const exportWebm = document.querySelector('#export-webm')
const exportStatus = document.querySelector('#export-status')
const timeReadout = document.querySelector('#time-readout')
const audio = document.querySelector('#preview-audio')
const canvas = document.querySelector('#preview-canvas')
const mp4Plan = document.querySelector('#mp4-plan')

const analyzer = new AudioReactiveAnalyzer()
const preview = new StickmanPreview(canvas)
const recorder = new PreviewRecorder(canvas, audio)

let activeSource = null
let rafId = 0

mp4Plan.textContent = describeMp4Pipeline()

const setControlsEnabled = (enabled) => {
  playToggle.disabled = !enabled
  restart.disabled = !enabled
  exportWebm.disabled = !enabled
}

const syncPlaybackLabel = () => {
  playToggle.textContent = audio.paused ? 'Play' : 'Pause'
}

const formatTime = (value) => {
  if (!Number.isFinite(value)) return '00:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const drawFrame = () => {
  const metrics = analyzer.getMetrics()
  preview.draw({
    mouthOpen: metrics.mouthOpen,
    headBob: metrics.headBob,
    blink: metrics.blink,
    progress: audio.duration ? audio.currentTime / audio.duration : 0,
    playing: !audio.paused,
  })
  timeReadout.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`
  rafId = requestAnimationFrame(drawFrame)
}

const beginDrawing = () => {
  if (rafId) return
  drawFrame()
}

const stopDrawing = () => {
  if (!rafId) return
  cancelAnimationFrame(rafId)
  rafId = 0
}

const setStatus = (message) => {
  exportStatus.textContent = message
}

fileInput.addEventListener('change', async (event) => {
  const [file] = event.target.files ?? []
  if (!file) return

  const source = createAudioSourceFromFile(file)
  if (!source.ok) {
    fileStatus.textContent = formatAudioFileError(source.reason)
    setControlsEnabled(false)
    setStatus('Upload a supported audio file to continue.')
    return
  }

  if (activeSource?.revoke) activeSource.revoke()
  activeSource = source

  audio.src = source.url
  fileStatus.textContent = `${file.name} loaded (${Math.round(file.size / 1024)} KB)`
  setControlsEnabled(true)
  setStatus('Ready to preview. Press play to start lip-sync animation.')

  try {
    await analyzer.connectToAudio(audio)
    preview.draw({ mouthOpen: 0.02, headBob: 0, blink: 0, progress: 0, playing: false })
  } catch {
    setStatus('Audio loaded, but analyzer could not be initialized in this browser.')
  }
})

playToggle.addEventListener('click', async () => {
  if (!audio.src) return
  if (audio.paused) {
    try {
      await audio.play()
      await analyzer.resume()
      setStatus('Playing preview...')
    } catch {
      setStatus('Playback blocked by browser policy. Click play again.')
    }
  } else {
    audio.pause()
    setStatus('Paused preview.')
  }
  syncPlaybackLabel()
})

restart.addEventListener('click', () => {
  audio.currentTime = 0
  if (audio.paused) {
    preview.draw({ mouthOpen: 0.02, headBob: 0, blink: 0, progress: 0, playing: false })
  }
  setStatus('Timeline reset.')
})

exportWebm.addEventListener('click', async () => {
  if (!audio.src) return
  exportWebm.disabled = true
  setStatus('Preparing WebM export...')

  try {
    const result = await recorder.recordPlayback({
      fps: 30,
      draw: (timeline) => {
        const metrics = analyzer.getMetrics()
        preview.draw({
          mouthOpen: metrics.mouthOpen,
          headBob: metrics.headBob,
          blink: metrics.blink,
          progress: timeline.progress,
          playing: true,
        })
      },
    })

    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(result.blob)
    anchor.download = `stickman-preview-${Date.now()}.webm`
    anchor.click()
    URL.revokeObjectURL(anchor.href)

    setStatus('Export complete (WebM). Use the MP4 starter path below for conversion.')
  } catch (error) {
    setStatus(error.message || 'Export failed in this browser.')
  } finally {
    exportWebm.disabled = false
  }
})

audio.addEventListener('play', () => {
  beginDrawing()
  syncPlaybackLabel()
})

audio.addEventListener('pause', () => {
  syncPlaybackLabel()
})

audio.addEventListener('ended', () => {
  syncPlaybackLabel()
  setStatus('Playback ended. You can restart or export.')
})

audio.addEventListener('loadedmetadata', () => {
  timeReadout.textContent = `${formatTime(0)} / ${formatTime(audio.duration)}`
})

window.addEventListener('beforeunload', () => {
  stopDrawing()
  analyzer.destroy()
  activeSource?.revoke?.()
})

beginDrawing()
