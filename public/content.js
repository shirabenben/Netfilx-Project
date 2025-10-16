document.addEventListener('DOMContentLoaded', () => {
  const profileId = window.profileId;
  const contentId = window.contentId;

  // Like / Unlike
  const likeBtn = document.getElementById('like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/profile/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, contentId })
        });
        const data = await res.json();
        if (data.success) {
          likeBtn.classList.toggle('btn-success', data.liked);
          likeBtn.classList.toggle('btn-outline-success', !data.liked);
          likeBtn.textContent = data.liked ? '♥ Liked' : '♡ Like';
        }
      } catch (err) {
        console.error('Error toggling like:', err);
      }
    });
  }

  // Watch from beginning
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/watchProgress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, contentId, position: 0 })
        });
        window.location.href = `/player/${contentId}`;
      } catch (err) {
        console.error('Error resetting progress:', err);
      }
    });
  }

  // Continue watching
  const continueBtn = document.getElementById('continue-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      window.location.href = `/player/${contentId}`;
    });
  }

  // Replay series
  const rewatchBtn = document.getElementById('replay-series-btn');
  if (rewatchBtn) {
    rewatchBtn.addEventListener('click', async () => {
      try {
        await fetch(`/api/watchProgress/reset/${profileId}/${contentId}`, { method: 'POST' });
        window.location.href = `/player/${contentId}`;
      } catch (err) {
        console.error('Error resetting series progress:', err);
      }
    });
  }

  // Play episode buttons
  document.querySelectorAll('.play-episode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const episodeId = btn.dataset.episodeId;
      window.location.href = `/player/${episodeId}`;
    });
  });

  // Similar content
  document.querySelectorAll('.similar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const similarId = btn.dataset.contentId;
      window.location.href = `/view/${similarId}`;
    });
  });

  // Actor links
  document.querySelectorAll('.actor-link').forEach(link => {
    link.addEventListener('click', () => {
      const actorName = link.dataset.actorName;
      window.open(`https://he.wikipedia.org/wiki/${encodeURIComponent(actorName)}`, '_blank');
    });
  });
});
