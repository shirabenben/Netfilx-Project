const video = document.getElementById('video-player');
const playPauseBtn = document.getElementById('play-pause');
const back10Btn = document.getElementById('rewind');
const forward10Btn = document.getElementById('forward');
const fullscreenBtn = document.getElementById('fullscreen');
const timeline = document.getElementById('timeline');
const nextEpisodeBtn = document.getElementById('nextEpisode');
const toggleEpisodesBtn = document.getElementById('toggleEpisodes');
const episodesOverlay = document.getElementById('episodesOverlay');
const closeOverlayBtn = document.getElementById('closeOverlay');

// IDs passed from server-side template
const profileId = window.PROFILE_ID;
const contentId = window.CONTENT_ID;

// Episodes list from server
const episodes = window.EPISODES || [];
const currentIndex = episodes.findIndex(ep => ep._id === contentId);

// --------------------- VIDEO CONTROLS ---------------------

// Play / Pause
playPauseBtn.addEventListener('click', () => {
  if (video.paused) video.play();
  else video.pause();
});

// Backward 10s
back10Btn.addEventListener('click', () => {
  video.currentTime = Math.max(video.currentTime - 10, 0);
});

// Forward 10s
forward10Btn.addEventListener('click', () => {
  video.currentTime = Math.min(video.currentTime + 10, video.duration);
});

// Timeline update
video.addEventListener('timeupdate', () => {
  timeline.max = video.duration;
  timeline.value = video.currentTime;
});

// Timeline seek
timeline.addEventListener('input', () => {
  video.currentTime = timeline.value;
});

// Fullscreen toggle
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    else if (video.msRequestFullscreen) video.msRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
});

// Next episode
if (currentIndex === -1 || currentIndex === episodes.length - 1) {
  nextEpisodeBtn.disabled = true;
  nextEpisodeBtn.style.opacity = 0.5;
  nextEpisodeBtn.style.cursor = 'not-allowed';
} else {
  nextEpisodeBtn.addEventListener('click', () => {
    window.location.href = `/player/${episodes[currentIndex + 1]._id}`;
  });
}

// Toggle episodes overlay
toggleEpisodesBtn.addEventListener('click', () => {
  episodesOverlay.classList.add('active');
});

// Close overlay
closeOverlayBtn.addEventListener('click', () => {
  episodesOverlay.classList.remove('active');
});

// --------------------- WATCH PROGRESS ---------------------

// Fetch last watched position when video loads
window.addEventListener('load', async () => {
  try {
    if (!profileId) return; // אם אין פרופיל, לא מבצעים
    const res = await fetch(`/watch-progress/${profileId}/${contentId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.position) {
        video.currentTime = data.position;
      }
    }
  } catch (err) {
    console.error('Error fetching watch progress:', err);
  }
});

// Save progress periodically (every 5 seconds)
setInterval(async () => {
  try {
    if (!profileId) return; // אם אין פרופיל, לא שומרים
    if (!video.paused) {
      await fetch('/watch-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          contentId,
          position: video.currentTime
        })
      });
    }
  } catch (err) {
    console.error('Error saving watch progress:', err);
  }
}, 5000);

// --------------------- OPTIONAL: Keyboard Shortcuts ---------------------
document.addEventListener('keydown', (e) => {
  switch(e.code) {
    case 'Space':
      e.preventDefault();
      if (video.paused) video.play();
      else video.pause();
      break;
    case 'ArrowLeft':
      video.currentTime = Math.max(video.currentTime - 10, 0);
      break;
    case 'ArrowRight':
      video.currentTime = Math.min(video.currentTime + 10, video.duration);
      break;
    case 'KeyF':
      if (!document.fullscreenElement) video.requestFullscreen();
      else document.exitFullscreen();
      break;
  }
});


// --------------------- TRACK WATCH ACTIVITY ---------------------

async function trackWatch(profileId, contentId) {
  try {
    if (!profileId || !contentId) return;
    
    const response = await fetch('/watch-progress/track-watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, contentId })
    });

    if (response.ok) {
      console.log(`✅ Watch tracked for content ${contentId}`);
    } else {
      console.warn('⚠️ Failed to track watch');
    }
  } catch (error) {
    console.error('Error tracking watch activity:', error);
  }
}

// Call the function when the video starts playing
video.addEventListener('play', () => {
  trackWatch(profileId, contentId);
});
