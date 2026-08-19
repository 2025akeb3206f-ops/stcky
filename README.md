# stcky

A starter web app for generating a stickman lip-sync video preview from uploaded audio.

## What this starter includes

- Browser-based UI built with **HTML/CSS/JavaScript** (Vite scaffold)
- Audio upload flow for **mp3, wav, ogg, m4a**
- Canvas-rendered stickman scene with audio-reactive mouth + simple body motion
- Play/pause/restart controls with live timeline preview
- Starter export pipeline:
  - implemented: **WebM** export via `MediaRecorder` (canvas + audio)
  - documented path to **MP4** via **WebCodecs + MP4Box.js** or **ffmpeg.wasm** conversion

## Setup

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Usage

1. Upload an audio file (`.mp3`, `.wav`, `.ogg`, `.m4a`).
2. Click **Play** to preview stickman lip-sync animation.
3. Click **Pause** or **Restart** as needed.
4. Click **Export WebM (starter)** to download a recorded preview.
5. Use the **MP4 export path** note in the UI as the next implementation step.

## Project structure

```text
src/
  audio/
    analyzer.js
    loader.js
  export/
    mp4Pipeline.js
    recorder.js
  render/
    preview.js
    stickman.js
  utils/
    math.js
  main.js
  style.css
```
