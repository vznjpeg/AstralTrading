// NotLoom — offscreen document. MediaRecorder must live here because MV3
// service workers have no DOM and die at will; this document stays alive for
// the whole recording.

let recorder = null;
let chunks = [];
let streams = [];
let audioCtx = null;
let opts = null;
let begun = false;
let cancelled = false;
let startTs = 0;
let totalPausedMs = 0;
let pausedAt = 0;

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.target !== 'offscreen') return;
  switch (msg.type) {
    case 'OFFSCREEN_START':
      start(msg).catch(fail);
      break;
    case 'OFFSCREEN_STOP':
      stopRecording(false);
      break;
    case 'OFFSCREEN_CANCEL':
      stopRecording(true);
      break;
    case 'OFFSCREEN_PAUSE':
      if (recorder && recorder.state === 'recording') {
        recorder.pause();
        pausedAt = Date.now();
      }
      break;
    case 'OFFSCREEN_RESUME':
      if (recorder && recorder.state === 'paused') {
        recorder.resume();
        totalPausedMs += Date.now() - pausedAt;
        pausedAt = 0;
      }
      break;
  }
});

async function start(msg) {
  opts = msg.opts;
  begun = false;
  cancelled = false;
  chunks = [];
  totalPausedMs = 0;
  pausedAt = 0;

  let videoStream;
  if (opts.mode === 'camera') {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    });
  } else {
    const constraints = {
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: msg.streamId,
          maxWidth: 3840,
          maxHeight: 2160,
          maxFrameRate: 30,
        },
      },
    };
    if (opts.systemAudio && msg.canRequestAudioTrack) {
      constraints.audio = {
        mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: msg.streamId },
      };
    }
    videoStream = await navigator.mediaDevices.getUserMedia(constraints);
  }
  streams.push(videoStream);

  let micStream = null;
  if (opts.mic) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streams.push(micStream);
    } catch {
      // mic unavailable or permission denied — record without it
    }
  }

  const tracks = [...videoStream.getVideoTracks(), ...mixAudio(videoStream, micStream)];
  const combined = new MediaStream(tracks);

  recorder = new MediaRecorder(combined, {
    mimeType: pickMime(),
    videoBitsPerSecond: 8_000_000,
  });
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data);
  };

  // The browser's native "Stop sharing" bar ends the video track.
  videoStream.getVideoTracks()[0].addEventListener('ended', () => stopRecording(false));

  chrome.runtime.sendMessage({ type: 'RECORDING_READY', opts });
  await sleep(3200); // 3-2-1 countdown shown by the content script
  if (cancelled) return;

  recorder.start(1000);
  begun = true;
  startTs = Date.now();
  chrome.runtime.sendMessage({ type: 'RECORDING_STARTED', opts });
}

function mixAudio(systemStream, micStream) {
  const sysAudio = systemStream ? systemStream.getAudioTracks() : [];
  const micAudio = micStream ? micStream.getAudioTracks() : [];
  if (sysAudio.length && micAudio.length) {
    audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    audioCtx.createMediaStreamSource(new MediaStream(sysAudio)).connect(dest);
    audioCtx.createMediaStreamSource(new MediaStream(micAudio)).connect(dest);
    return dest.stream.getAudioTracks();
  }
  return [...sysAudio, ...micAudio];
}

function pickMime() {
  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) || '';
}

async function stopRecording(discard) {
  if (cancelled) return;
  if (!begun) {
    // Stop/cancel during the countdown: throw everything away.
    cancelled = true;
    cleanup();
    chrome.runtime.sendMessage({ type: 'RECORDING_CANCELLED' });
    return;
  }
  if (!recorder || recorder.state === 'inactive') return;

  const pausedNow = pausedAt ? Date.now() - pausedAt : 0;
  const duration = Date.now() - startTs - totalPausedMs - pausedNow;

  await new Promise((resolve) => {
    recorder.addEventListener('stop', resolve, { once: true });
    recorder.stop();
  });

  if (discard) {
    cleanup();
    chrome.runtime.sendMessage({ type: 'RECORDING_CANCELLED' });
    return;
  }

  const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
  const thumb = await makeThumbnail(blob).catch(() => null);
  const id = await dbAdd({
    name: defaultName(),
    createdAt: Date.now(),
    duration,
    size: blob.size,
    type: blob.type,
    blob,
    thumb,
  });
  cleanup();
  chrome.runtime.sendMessage({ type: 'RECORDING_SAVED', id });
}

function cleanup() {
  for (const s of streams) for (const t of s.getTracks()) t.stop();
  streams = [];
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
  recorder = null;
  chunks = [];
}

function fail(e) {
  cleanup();
  chrome.runtime.sendMessage({ type: 'RECORDING_ERROR', message: e.message || String(e) });
}

function defaultName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `Recording ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}.${pad(d.getMinutes())}`;
}

async function makeThumbnail(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.src = url;
    await once(video, 'loadedmetadata');
    if (!isFinite(video.duration)) {
      // Chrome's MediaRecorder writes webm without a duration header;
      // seeking to the end forces it to be computed.
      video.currentTime = 1e9;
      await once(video, 'seeked');
    }
    video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    await once(video, 'seeked');
    const canvas = document.createElement('canvas');
    const scale = 320 / video.videoWidth;
    canvas.width = 320;
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function once(el, event) {
  return new Promise((resolve, reject) => {
    el.addEventListener(event, resolve, { once: true });
    el.addEventListener('error', reject, { once: true });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
