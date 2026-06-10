# NotLoom 🎥

A free, lightweight, local-first screen recorder for Chrome. All the everyday
Loom workflows — record your screen with a camera bubble and mic, pause/resume,
get an instant playback page, keep a library of your videos — with **no
account, no subscription, and no uploads**. Your recordings never leave your
browser.

## Features

- **Screen + camera + mic recording** — record any screen, window or tab with
  an optional draggable webcam bubble overlaid on the page (so it's baked into
  the recording, Loom-style) and your microphone narration.
- **Camera-only mode** — quick talking-head videos.
- **Tab / system audio** — captured and mixed with your mic when Chrome offers it.
- **3-2-1 countdown** before recording starts.
- **On-page controls** — draggable pill with live timer, pause/resume, stop,
  and discard. Also controllable from the toolbar popup, the keyboard
  (`Alt+Shift+R` start/stop, `Alt+Shift+P` pause/resume), or Chrome's native
  "Stop sharing" bar.
- **Instant playback page** opens the moment you stop, just like Loom.
- **Video library** — every recording is saved locally (IndexedDB) with
  thumbnails; rename, replay, download or delete from `My videos`.
- **One-click download** as `.webm` — share the file however you like.
- **Private by design** — no servers, no telemetry, no account. The extension
  requests zero host permissions for network access.

## Install (load unpacked)

1. Clone this repo (or download it as a ZIP and extract it).
2. Open `chrome://extensions` in Chrome.
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked** and select the repo folder.
5. Pin **NotLoom** to your toolbar.

## Usage

1. Click the NotLoom icon (or press `Alt+Shift+R`).
2. Pick **Screen** or **Camera only**, toggle mic / camera bubble, hit
   **Start recording**.
3. Choose what to share in Chrome's picker (tick "Share audio" for tab sound).
4. After the 3-2-1 countdown you're live. Drag the bubble and control pill
   wherever you want — they're part of the recording.
5. Hit **■ Stop** — the playback page opens instantly. Rename, download, or
   find it later under **My videos**.

> First time using mic/camera: NotLoom opens a one-time permission page.
> Chrome remembers the grant for the extension afterwards.

## How it works

```
popup.js          options UI, starts a recording
background.js     MV3 service worker: state machine, desktopCapture picker,
                  badge, keyboard shortcuts, message routing
offscreen.js      the actual MediaRecorder (offscreen document — survives the
                  service worker's lifecycle), audio mixing, thumbnailing,
                  saving to IndexedDB
content.js        on-page UI: countdown, control pill, camera bubble (shadow DOM)
camera.html/js    webcam preview iframe (extension origin → one-time permission)
library.html/js   your videos, from IndexedDB
player.html/js    playback page
db.js             shared IndexedDB helper
```

No build step, no dependencies — plain JS, load-and-go.

## Limitations (a.k.a. why it's free)

- **No cloud share links.** Loom charges for hosting; NotLoom keeps videos
  local and you share the downloaded file instead.
- Recordings are `.webm` (VP9/Opus) — plays everywhere modern, and you can
  convert with ffmpeg if you need `.mp4`.
- The control pill and bubble can't render on `chrome://` pages or the Chrome
  Web Store (Chrome forbids content scripts there) — recording still works;
  use the popup, shortcut, or Chrome's "Stop sharing" bar.
- Videos live in the browser profile's IndexedDB. Download anything you'd
  hate to lose before clearing site data or uninstalling the extension.

## License

MIT
