// NotLoom — content script. Renders the on-page recording UI: the 3-2-1
// countdown, the draggable control bar (timer / pause / stop / discard) and
// the draggable camera bubble. Everything lives in a closed shadow root so
// page styles can't touch it.

(() => {
  if (window.__notloomLoaded) return;
  window.__notloomLoaded = true;

  let state = { status: 'idle' };
  let host = null;
  let shadow = null;
  let timerEl = null;
  let pauseBtn = null;
  let countdownEl = null;
  let bubble = null;
  let timerInterval = null;
  let countdownInterval = null;

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }

    .nl-bar {
      position: fixed; left: 24px; bottom: 24px; z-index: 2147483647;
      display: flex; align-items: center; gap: 10px;
      background: #16161d; color: #fff; border-radius: 999px;
      padding: 8px 14px; box-shadow: 0 6px 24px rgba(0,0,0,.35);
      user-select: none; cursor: grab;
    }
    .nl-bar:active { cursor: grabbing; }
    .nl-dot { width: 10px; height: 10px; border-radius: 50%; background: #ff4d4f; animation: nl-pulse 1.4s infinite; }
    .nl-bar.paused .nl-dot { background: #f9ab00; animation: none; }
    @keyframes nl-pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
    .nl-timer { font-size: 13px; font-variant-numeric: tabular-nums; min-width: 44px; }
    .nl-btn {
      border: 0; background: #2a2a35; color: #fff; border-radius: 50%;
      width: 30px; height: 30px; cursor: pointer; font-size: 13px;
      display: flex; align-items: center; justify-content: center; padding: 0;
    }
    .nl-btn:hover { background: #3a3a48; }
    .nl-btn.stop { background: #ff4d4f; }
    .nl-btn.stop:hover { background: #ff6b6d; }

    .nl-bubble {
      position: fixed; left: 24px; bottom: 96px; z-index: 2147483646;
      width: 200px; height: 200px; border-radius: 50%; overflow: hidden;
      box-shadow: 0 6px 24px rgba(0,0,0,.35); cursor: grab;
      border: 3px solid #16161d; background: #000;
    }
    .nl-bubble iframe { width: 100%; height: 100%; border: 0; pointer-events: none; }

    .nl-countdown {
      position: fixed; inset: 0; z-index: 2147483647;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,.35); pointer-events: none;
    }
    .nl-countdown span {
      font-size: 140px; font-weight: 700; color: #fff;
      text-shadow: 0 4px 30px rgba(0,0,0,.6);
    }
  `;

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'STATE_CHANGED') {
      state = msg.state;
      render();
    }
  });

  chrome.runtime.sendMessage({ type: 'GET_STATE' }).then((st) => {
    if (st && st.status) {
      state = st;
      render();
    }
  }).catch(() => {});

  function ensureHost() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'notloom-root';
    shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = CSS;
    shadow.appendChild(style);
    document.documentElement.appendChild(host);
  }

  function render() {
    const { status } = state;
    if (status === 'countdown') {
      ensureHost();
      removeBar();
      renderBubble();
      renderCountdown();
    } else if (status === 'recording' || status === 'paused') {
      ensureHost();
      removeCountdown();
      renderBubble();
      renderBar();
    } else {
      teardown();
    }
  }

  // ---- countdown -----------------------------------------------------------

  function renderCountdown() {
    if (!countdownEl) {
      countdownEl = el('div', 'nl-countdown');
      countdownEl.appendChild(document.createElement('span'));
      shadow.appendChild(countdownEl);
    }
    clearInterval(countdownInterval);
    const update = () => {
      const left = Math.ceil((state.countdownUntil - Date.now()) / 1000);
      countdownEl.querySelector('span').textContent = left > 0 ? left : '';
    };
    update();
    countdownInterval = setInterval(update, 100);
  }

  function removeCountdown() {
    clearInterval(countdownInterval);
    if (countdownEl) {
      countdownEl.remove();
      countdownEl = null;
    }
  }

  // ---- control bar ---------------------------------------------------------

  function renderBar() {
    if (!shadow.querySelector('.nl-bar')) {
      const bar = el('div', 'nl-bar');
      bar.appendChild(el('div', 'nl-dot'));
      timerEl = el('div', 'nl-timer');
      bar.appendChild(timerEl);

      pauseBtn = button('❚❚', 'Pause / resume', () => {
        chrome.runtime.sendMessage({
          type: state.status === 'paused' ? 'RESUME_RECORDING' : 'PAUSE_RECORDING',
        }).catch(() => {});
      });
      bar.appendChild(pauseBtn);

      bar.appendChild(button('■', 'Stop and save', () => {
        chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }).catch(() => {});
      }, 'stop'));

      bar.appendChild(button('✕', 'Discard recording', () => {
        chrome.runtime.sendMessage({ type: 'CANCEL_RECORDING' }).catch(() => {});
      }));

      makeDraggable(bar);
      shadow.appendChild(bar);
    }
    const bar = shadow.querySelector('.nl-bar');
    bar.classList.toggle('paused', state.status === 'paused');
    pauseBtn.textContent = state.status === 'paused' ? '▶' : '❚❚';

    clearInterval(timerInterval);
    const tick = () => {
      const base = state.status === 'paused' ? state.pausedAt : Date.now();
      timerEl.textContent = fmt(base - state.startTime - (state.pausedMs || 0));
    };
    tick();
    if (state.status === 'recording') timerInterval = setInterval(tick, 500);
  }

  function removeBar() {
    clearInterval(timerInterval);
    const bar = shadow && shadow.querySelector('.nl-bar');
    if (bar) bar.remove();
  }

  // ---- camera bubble -------------------------------------------------------

  function renderBubble() {
    const wantBubble = state.opts && (state.opts.camera || state.opts.mode === 'camera');
    if (!wantBubble) return;
    if (bubble) return;
    bubble = el('div', 'nl-bubble');
    const frame = document.createElement('iframe');
    frame.src = chrome.runtime.getURL('camera.html');
    frame.allow = 'camera';
    bubble.appendChild(frame);
    makeDraggable(bubble);
    shadow.appendChild(bubble);
  }

  function teardown() {
    removeBar();
    removeCountdown();
    if (bubble) {
      bubble.remove();
      bubble = null;
    }
    if (host) {
      host.remove();
      host = null;
      shadow = null;
    }
  }

  // ---- helpers -------------------------------------------------------------

  function el(tag, cls) {
    const e = document.createElement(tag);
    e.className = cls;
    return e;
  }

  function button(label, title, onClick, extraCls = '') {
    const b = el('button', `nl-btn ${extraCls}`.trim());
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return b;
  }

  function makeDraggable(node) {
    let sx, sy, ox, oy, dragging = false;
    node.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      const r = node.getBoundingClientRect();
      ox = r.left;
      oy = r.top;
      node.setPointerCapture(e.pointerId);
    });
    node.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      node.style.left = `${ox + e.clientX - sx}px`;
      node.style.top = `${oy + e.clientY - sy}px`;
      node.style.bottom = 'auto';
    });
    node.addEventListener('pointerup', () => (dragging = false));
  }

  function fmt(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
})();
