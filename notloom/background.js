// NotLoom — background service worker.
// Owns the recording state machine and routes messages between the popup,
// the content scripts (on-page controls) and the offscreen document (recorder).

const DEFAULT_OPTS = { mode: 'screen', mic: true, systemAudio: true, camera: true };

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.target === 'offscreen') return; // addressed to the offscreen doc
  handle(msg)
    .then(sendResponse)
    .catch((e) => sendResponse({ error: e.message }));
  return true; // async response
});

async function handle(msg) {
  switch (msg.type) {
    case 'GET_STATE':
      return getState();
    case 'START_RECORDING':
      return startRecording(msg.opts);
    case 'STOP_RECORDING':
      return forward('OFFSCREEN_STOP');
    case 'CANCEL_RECORDING':
      return forward('OFFSCREEN_CANCEL');
    case 'PAUSE_RECORDING':
      return pauseResume(true);
    case 'RESUME_RECORDING':
      return pauseResume(false);

    // Events reported by the offscreen recorder:
    case 'RECORDING_READY':
      return setState({ status: 'countdown', opts: msg.opts, countdownUntil: Date.now() + 3200 });
    case 'RECORDING_STARTED':
      return setState({ status: 'recording', opts: msg.opts, startTime: Date.now(), pausedMs: 0 });
    case 'RECORDING_SAVED':
      return onSaved(msg);
    case 'RECORDING_CANCELLED':
      await setState({ status: 'idle' });
      return closeOffscreen();
    case 'RECORDING_ERROR':
      await setState({ status: 'idle', error: msg.message });
      return closeOffscreen();
  }
}

async function getState() {
  const { recState } = await chrome.storage.session.get('recState');
  return recState || { status: 'idle' };
}

async function setState(recState) {
  await chrome.storage.session.set({ recState });
  updateBadge(recState);
  broadcast({ type: 'STATE_CHANGED', state: recState });
  return recState;
}

function broadcast(msg) {
  chrome.runtime.sendMessage(msg).catch(() => {});
  chrome.tabs.query({}, (tabs) => {
    for (const t of tabs) {
      if (t.id !== undefined) chrome.tabs.sendMessage(t.id, msg).catch(() => {});
    }
  });
}

function updateBadge(st) {
  const map = { recording: ['REC', '#d93025'], paused: ['❚❚', '#f9ab00'], countdown: ['3·2·1', '#5f6368'] };
  const [text, color] = map[st.status] || [''];
  chrome.action.setBadgeText({ text });
  if (color) chrome.action.setBadgeBackgroundColor({ color });
}

async function startRecording(opts = DEFAULT_OPTS) {
  const st = await getState();
  if (st.status !== 'idle') throw new Error('A recording is already in progress');
  await chrome.storage.local.set({ lastOpts: opts });

  if (opts.mode === 'camera') {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ target: 'offscreen', type: 'OFFSCREEN_START', opts });
    return getState();
  }

  chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab', 'audio'], async (streamId, pickerOpts) => {
    if (!streamId) return; // user dismissed the source picker
    await ensureOffscreen();
    chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'OFFSCREEN_START',
      opts,
      streamId,
      canRequestAudioTrack: !!(pickerOpts && pickerOpts.canRequestAudioTrack),
    });
  });
  return getState();
}

async function pauseResume(pause) {
  const st = await getState();
  if (pause && st.status === 'recording') {
    chrome.runtime.sendMessage({ target: 'offscreen', type: 'OFFSCREEN_PAUSE' });
    return setState({ ...st, status: 'paused', pausedAt: Date.now() });
  }
  if (!pause && st.status === 'paused') {
    chrome.runtime.sendMessage({ target: 'offscreen', type: 'OFFSCREEN_RESUME' });
    return setState({ ...st, status: 'recording', pausedMs: st.pausedMs + (Date.now() - st.pausedAt), pausedAt: undefined });
  }
  return st;
}

async function forward(type) {
  chrome.runtime.sendMessage({ target: 'offscreen', type });
  return getState();
}

async function onSaved(msg) {
  await setState({ status: 'idle' });
  await closeOffscreen();
  chrome.tabs.create({ url: chrome.runtime.getURL(`player.html?id=${msg.id}`) });
}

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Records the screen, microphone and camera with MediaRecorder',
  });
}

async function closeOffscreen() {
  try {
    if (await chrome.offscreen.hasDocument()) await chrome.offscreen.closeDocument();
  } catch {
    // already closed
  }
}

chrome.commands.onCommand.addListener(async (cmd) => {
  const st = await getState();
  if (cmd === 'toggle-recording') {
    if (st.status === 'idle') {
      const { lastOpts } = await chrome.storage.local.get('lastOpts');
      await startRecording(lastOpts || DEFAULT_OPTS);
    } else {
      await forward(st.status === 'countdown' ? 'OFFSCREEN_CANCEL' : 'OFFSCREEN_STOP');
    }
  } else if (cmd === 'pause-resume') {
    if (st.status === 'recording') await pauseResume(true);
    else if (st.status === 'paused') await pauseResume(false);
  }
});
