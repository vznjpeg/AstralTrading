// NotLoom — popup. Lets the user pick recording options and start/stop,
// and mirrors the live recording state.

const $ = (sel) => document.querySelector(sel);
let state = { status: 'idle' };
let timerInterval = null;

init();

async function init() {
  const { lastOpts } = await chrome.storage.local.get('lastOpts');
  if (lastOpts) {
    const radio = document.querySelector(`input[name="mode"][value="${lastOpts.mode}"]`);
    if (radio) radio.checked = true;
    $('#mic').checked = lastOpts.mic !== false;
    $('#camera').checked = lastOpts.camera !== false;
    $('#sysaudio').checked = lastOpts.systemAudio !== false;
  }
  syncModeRows();

  for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.addEventListener('change', syncModeRows);
  }
  $('#start').addEventListener('click', start);
  $('#stop').addEventListener('click', () => send('STOP_RECORDING'));
  $('#cancel').addEventListener('click', () => send('CANCEL_RECORDING'));
  $('#pause').addEventListener('click', () =>
    send(state.status === 'paused' ? 'RESUME_RECORDING' : 'PAUSE_RECORDING')
  );
  $('#library').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('library.html') });
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'STATE_CHANGED') {
      state = msg.state;
      render();
    }
  });

  state = (await send('GET_STATE')) || state;
  render();
}

function readOpts() {
  return {
    mode: document.querySelector('input[name="mode"]:checked').value,
    mic: $('#mic').checked,
    camera: $('#camera').checked,
    systemAudio: $('#sysaudio').checked,
  };
}

function syncModeRows() {
  const cameraMode = document.querySelector('input[name="mode"]:checked').value === 'camera';
  $('#camera-row').style.display = cameraMode ? 'none' : '';
  $('#sysaudio-row').style.display = cameraMode ? 'none' : '';
}

async function start() {
  const opts = readOpts();
  $('#error').hidden = true;

  // Mic/camera permission belongs to the extension origin. Prompts can't be
  // shown from the offscreen recorder, so make sure they're granted first.
  const missing = [];
  if (opts.mic) missing.push(...(await needs('microphone')));
  if (opts.camera || opts.mode === 'camera') missing.push(...(await needs('camera')));
  if (missing.length) {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`permissions.html?ask=${missing.join(',')}`),
    });
    window.close();
    return;
  }

  const res = await send('START_RECORDING', { opts });
  if (res && res.error) {
    $('#error').textContent = res.error;
    $('#error').hidden = false;
    return;
  }
  window.close(); // get out of the way of the source picker
}

async function needs(name) {
  try {
    const p = await navigator.permissions.query({ name });
    return p.state === 'granted' ? [] : [name];
  } catch {
    return [name];
  }
}

function send(type, extra = {}) {
  return chrome.runtime.sendMessage({ type, ...extra }).catch(() => null);
}

function render() {
  const recording = state.status === 'recording' || state.status === 'paused' || state.status === 'countdown';
  $('#idle-view').hidden = recording;
  $('#rec-view').hidden = !recording;

  if (state.status === 'idle' && state.error) {
    $('#error').textContent = `Last recording failed: ${state.error}`;
    $('#error').hidden = false;
  }
  if (!recording) {
    clearInterval(timerInterval);
    return;
  }

  $('#rec-view').classList.toggle('paused', state.status === 'paused');
  $('#pause').textContent = state.status === 'paused' ? 'Resume' : 'Pause';
  $('#rec-label').textContent =
    state.status === 'countdown' ? 'Starting…' : state.status === 'paused' ? 'Paused' : 'Recording…';

  clearInterval(timerInterval);
  const tick = () => {
    if (!state.startTime) {
      $('#rec-timer').textContent = '00:00';
      return;
    }
    const base = state.status === 'paused' ? state.pausedAt : Date.now();
    const s = Math.max(0, Math.floor((base - state.startTime - (state.pausedMs || 0)) / 1000));
    $('#rec-timer').textContent =
      `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };
  tick();
  if (state.status === 'recording') timerInterval = setInterval(tick, 500);
}
