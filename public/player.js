const video = document.getElementById('video-player');
const playPauseBtn = document.getElementById('play-pause');
const rewindBtn = document.getElementById('rewind');
const forwardBtn = document.getElementById('forward');
const fullscreenBtn = document.getElementById('fullscreen');
const timeline = document.getElementById('timeline');

// Play/Pause
playPauseBtn.addEventListener('click', () => {
  if (video.paused) video.play();
  else video.pause();
});

// Rewind 10s
rewindBtn.addEventListener('click', () => {
  video.currentTime = Math.max(video.currentTime - 10, 0);
});

// Forward 10s
forwardBtn.addEventListener('click', () => {
  video.currentTime = Math.min(video.currentTime + 10, video.duration);
});

// Fullscreen
fullscreenBtn.addEventListener('click', () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
  else if (video.msRequestFullscreen) video.msRequestFullscreen();
});

// Timeline update
video.addEventListener('timeupdate', () => {
  timeline.value = (video.currentTime / video.duration) * 100 || 0;
});

timeline.addEventListener('input', () => {
  video.currentTime = (timeline.value / 100) * video.duration;
});
