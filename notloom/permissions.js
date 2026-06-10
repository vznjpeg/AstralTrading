// NotLoom — one-time mic/camera grant page. Permission prompts can't appear
// in the offscreen recorder, so we trigger them here on a visible page.

const ask = (new URLSearchParams(location.search).get('ask') || 'microphone,camera').split(',');
const wantMic = ask.includes('microphone');
const wantCam = ask.includes('camera');

document.getElementById('what').textContent =
  wantMic && wantCam ? 'microphone and camera' : wantMic ? 'microphone' : 'camera';

document.getElementById('grant').addEventListener('click', async () => {
  const result = document.getElementById('result');
  result.hidden = false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: wantMic,
      video: wantCam,
    });
    for (const t of stream.getTracks()) t.stop();
    result.className = 'ok';
    result.textContent = 'Done! Click the NotLoom icon to start recording. Closing…';
    document.getElementById('grant').hidden = true;
    setTimeout(() => window.close(), 1800);
  } catch (e) {
    result.className = 'err';
    result.textContent =
      'Permission was blocked. Click the camera icon in the address bar to allow it, then try again.';
  }
});
