// public/content.js
document.addEventListener('DOMContentLoaded', () => {
  const profileId = window.profileId;
  const contentId = window.contentId;

  if (!profileId || !contentId) {
    console.warn('profileId or contentId missing on window — like/controls may not work.');
  }

  // helper: set like button UI
  const setLikeUI = (btn, liked) => {
    if (!btn) return;
    btn.classList.toggle('btn-success', liked);
    btn.classList.toggle('btn-outline-success', !liked);
    btn.textContent = liked ? '♥ Liked' : '♡ Like';
  };

  // ---------- initial like status fetch ----------
  const likeBtn = document.getElementById('like-btn');
  (async () => {
    if (!likeBtn || !profileId || !contentId) return;
    try {
      const res = await fetch(`/watch-progress/${profileId}/${contentId}`);
      if (!res.ok) throw new Error('Failed to fetch like status');
      const data = await res.json();
      // server should return { position, liked } — we only need liked
      setLikeUI(likeBtn, !!data.liked);
    } catch (err) {
      console.error('Error fetching like status:', err);
    }
  })();

  // ---------- like / unlike (immediate UI update) ----------
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      if (!profileId || !contentId) {
        console.warn('Missing profileId/contentId for like toggle');
        return;
      }

      // optimistic UI: flip immediately
      const currentlyLiked = likeBtn.classList.contains('btn-success');
      setLikeUI(likeBtn, !currentlyLiked);

      try {
        const res = await fetch('/watch-progress/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, contentId })
        });
        const body = await res.json();
        if (!res.ok) {
          setLikeUI(likeBtn, currentlyLiked);
          console.error('Like toggle failed:', body);
          return;
        }
        setLikeUI(likeBtn, !!body.liked);
      } catch (err) {
        setLikeUI(likeBtn, currentlyLiked);
        console.error('Error toggling like:', err);
      }
    });
  }

  // ---------- play / continue / restart / replay / episodes ----------
  const playBtn = document.getElementById('play-btn');
  const continueBtn = document.getElementById('continue-btn');
  const restartBtn = document.getElementById('restart-btn');
  const replayBtn = document.getElementById('replay-series-btn');

  const toPlayer = (episodeId, opts = {}) => {
    const id = episodeId || contentId;
    let url = `/player/${id}`;
    if (profileId) url += `?profileId=${profileId}`;
    if (opts.continue) url += (url.includes('?') ? '&' : '?') + 'continue=true';
    if (opts.startAt === 0) url += (url.includes('?') ? '&' : '?') + 'start=0';
    window.location.href = url;
  };

  // Play new content
  if (playBtn) {
    playBtn.addEventListener('click', () => toPlayer(null));
  }

  // Continue watching
  if (continueBtn) {
    continueBtn.addEventListener('click', () => toPlayer(null, { continue: true }));
  }

  // Restart content
  if (restartBtn) {
    restartBtn.addEventListener('click', async () => {
      if (!profileId || !contentId) return;
      try {
        await fetch('/watch-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId, contentId, position: 0 })
        });
      } catch (err) {
        console.error('Error resetting progress:', err);
      } finally {
        toPlayer(null, { startAt: 0 });
      }
    });
  }

  // Replay entire series
  if (replayBtn) {
    replayBtn.addEventListener('click', async () => {
      const firstEpisodeId = replayBtn.dataset.firstEpisodeId;
      const epJson = replayBtn.dataset.episodeIds;

      if (!firstEpisodeId || !profileId) {
        console.warn('Missing firstEpisodeId or profileId for replay');
        return;
      }

      try {
        if (epJson) {
          const episodeIds = JSON.parse(epJson);
          const res = await fetch('/watch-progress/reset-series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId, episodeIds })
          });
          if (!res.ok) throw new Error('Failed to reset series progress');
        } else {
          // fallback (if dataset.episodeIds missing)
          await fetch('/watch-progress/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId, contentId })
          });
        }
      } catch (err) {
        console.error('Error resetting series progress:', err);
      } finally {
        // navigate to first episode from the beginning
        toPlayer(firstEpisodeId, { startAt: 0 });
      }
    });
  }

  // Play specific episode buttons
  document.querySelectorAll('.play-episode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const episodeId = btn.dataset.episodeId;
      toPlayer(episodeId);
    });
  });

  // Similar content click handling
  document.querySelectorAll('.similar-item').forEach(a => {
    a.addEventListener('click', () => {
      const cid = a.dataset.contentId || a.getAttribute('href')?.split('/').pop();
      if (cid) window.location.href = `/content/view/${cid}`;
    });
  });

  // Actor links
  document.querySelectorAll('.actor-link').forEach(link => {
    link.addEventListener('click', () => {
      const actorName = link.dataset.actorName;
      if (actorName)
        window.open(`https://he.wikipedia.org/wiki/${encodeURIComponent(actorName)}`, '_blank');
    });
  });
});
