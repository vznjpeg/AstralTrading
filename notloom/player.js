// NotLoom — player page. Plays one recording straight from IndexedDB.

const id = Number(new URLSearchParams(location.search).get('id'));

init();

async function init() {
  const rec = await dbGet(id);
  if (!rec) {
    document.querySelector('main').innerHTML = '<p>Recording not found — it may have been deleted.</p>';
    return;
  }

  const video = document.getElementById('video');
  video.src = URL.createObjectURL(rec.blob);

  // Chrome's MediaRecorder writes webm without a duration header, which
  // breaks seeking. Forcing a seek to the end makes Chrome compute it.
  video.addEventListener('loadedmetadata', () => {
    if (!isFinite(video.duration)) {
      const fix = () => {
        video.currentTime = 0;
        video.removeEventListener('seeked', fix);
      };
      video.addEventListener('seeked', fix);
      video.currentTime = 1e9;
    }
  }, { once: true });

  const name = document.getElementById('name');
  name.value = rec.name;
  document.title = `NotLoom — ${rec.name}`;
  name.addEventListener('change', async () => {
    rec.name = name.value.trim() || rec.name;
    name.value = rec.name;
    document.title = `NotLoom — ${rec.name}`;
    await dbPut(rec);
  });

  document.getElementById('meta').textContent =
    `${new Date(rec.createdAt).toLocaleString()} · ${fmtDur(rec.duration)} · ${fmtSize(rec.size)}`;

  document.getElementById('download').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(rec.blob);
    a.download = `${rec.name.replace(/[\\/:*?"<>|]/g, '_')}.webm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  });

  document.getElementById('delete').addEventListener('click', async () => {
    if (!confirm(`Delete "${rec.name}"? This can't be undone.`)) return;
    await dbDelete(rec.id);
    location.href = 'library.html';
  });
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
