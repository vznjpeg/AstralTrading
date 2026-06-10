// NotLoom — library page. Lists every saved recording from IndexedDB.

const grid = document.getElementById('grid');
const urls = [];

render();

async function render() {
  for (const u of urls.splice(0)) URL.revokeObjectURL(u);
  const recs = (await dbAll()).sort((a, b) => b.createdAt - a.createdAt);

  document.getElementById('empty').hidden = recs.length > 0;
  document.getElementById('stats').textContent = recs.length
    ? `${recs.length} video${recs.length > 1 ? 's' : ''} · ${fmtSize(recs.reduce((n, r) => n + r.size, 0))}`
    : '';

  grid.replaceChildren(...recs.map(card));
}

function card(rec) {
  const c = el('div', 'card');

  const thumb = el('div', 'thumb');
  if (rec.thumb) {
    const img = document.createElement('img');
    const u = URL.createObjectURL(rec.thumb);
    urls.push(u);
    img.src = u;
    thumb.appendChild(img);
  } else {
    thumb.appendChild(Object.assign(el('span', 'ph'), { textContent: '▶' }));
  }
  thumb.appendChild(Object.assign(el('span', 'dur'), { textContent: fmtDur(rec.duration) }));
  thumb.addEventListener('click', () => open(rec.id));
  c.appendChild(thumb);

  const meta = el('div', 'meta');
  const name = document.createElement('input');
  name.className = 'name';
  name.value = rec.name;
  name.title = 'Click to rename';
  name.addEventListener('change', async () => {
    rec.name = name.value.trim() || rec.name;
    name.value = rec.name;
    await dbPut(rec);
  });
  meta.appendChild(name);
  meta.appendChild(Object.assign(el('p', 'when'), {
    textContent: `${new Date(rec.createdAt).toLocaleString()} · ${fmtSize(rec.size)}`,
  }));
  c.appendChild(meta);

  const actions = el('div', 'actions');
  actions.appendChild(btn('Play', () => open(rec.id)));
  actions.appendChild(btn('Download', () => download(rec)));
  actions.appendChild(btn('Delete', async () => {
    if (!confirm(`Delete "${rec.name}"? This can't be undone.`)) return;
    await dbDelete(rec.id);
    render();
  }, 'danger'));
  c.appendChild(actions);

  return c;
}

function open(id) {
  location.href = `player.html?id=${id}`;
}

function download(rec) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(rec.blob);
  a.download = `${rec.name.replace(/[\\/:*?"<>|]/g, '_')}.webm`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

function el(tag, cls) {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}

function btn(label, onClick, cls = '') {
  const b = el('button', cls);
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function fmtDur(ms) {
  const s = Math.max(0, Math.round((ms || 0) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function fmtSize(bytes) {
  if (bytes > 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.round(bytes / 1e3)} KB`;
}
