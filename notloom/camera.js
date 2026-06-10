// NotLoom — camera bubble preview. Runs inside an extension-origin iframe so
// the camera permission belongs to the extension (granted once), not to every
// site the user records on.

navigator.mediaDevices
  .getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 640 } } })
  .then((stream) => {
    const video = document.querySelector('video');
    video.srcObject = stream;
    window.addEventListener('pagehide', () => {
      for (const t of stream.getTracks()) t.stop();
    });
  })
  .catch(() => {
    document.body.innerHTML = '<div class="err">Camera unavailable</div>';
  });
