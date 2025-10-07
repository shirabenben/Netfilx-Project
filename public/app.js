document.addEventListener('DOMContentLoaded', function() {
  loadMovies();
});

async function loadMovies() {
  try {
    const response = await fetch('/api/content/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      displayMovies(result.data);
    } else {
      throw new Error('Failed to load movies: ' + (result.message || 'Unknown server error'));
    }
  } catch (error) {
    console.error('Error loading movies:', error);
    document.getElementById('movies').innerHTML = '<p class="text-center">Error loading movies.</p>';
  }
}

function displayMovies(movies) {
  const moviesContainer = document.getElementById('movies');
  if (movies.length === 0) {
    moviesContainer.innerHTML = '<p class="text-center">No movies found.</p>';
    return;
  }

  moviesContainer.innerHTML = movies.map(movie => `
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text">Genre: ${movie.genre}</p>
          <p class="card-text">Year: ${movie.year}</p>
        </div>
      </div>
    </div>
  `).join('');
}
