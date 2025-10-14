// Movies page logic: render all movies grouped by genre

// ContentSlider provided by shared.js
async function renderAllMoviesGroupedByGenre() {
    const container = document.getElementById('genre-sliders');
    if (!container) return;

    // Add sort dropdown
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-container';
    sortContainer.innerHTML = `
        <label for="sort-movies" class="text-white me-2">Sort By:</label>
        <select id="sort-movies" class="form-select bg-dark text-white w-auto d-inline-block">
            <option value="-popularity">Popularity (High to Low)</option>
            <option value="popularity">Popularity (Low to High)</option>
            <option value="-starRating">Rating (High to Low)</option>
            <option value="starRating">Rating (Low to High)</option>
        </select>
    `;
    container.parentNode.insertBefore(sortContainer, container);

    let currentSort = '-createdAt';

    document.getElementById('sort-movies').addEventListener('change', (event) => {
        currentSort = event.target.value;
        renderMovies(currentSort);
    });

    async function renderMovies(sortOrder) {
        try {
            const configRes = await fetch('/api/config');
            const config = await configRes.json();
            const limit = config.contentFetchLimit || 1000;

            const response = await fetch(`/api/content?type=movie&limit=${limit}&sort=${sortOrder}`);
            const result = await response.json();
            if (!result.success || !Array.isArray(result.data)) {
                container.innerHTML = '<div class="text-white">No movies available</div>';
                return;
            }

            const genreToItems = new Map();
            for (const item of result.data) {
                const genres = Array.isArray(item.genre) ? item.genre : [];
                for (const g of genres) {
                    const key = (g || '').trim();
                    if (!key) continue;
                    if (!genreToItems.has(key)) genreToItems.set(key, []);
                    genreToItems.get(key).push(item);
                }
            }

            const genres = Array.from(genreToItems.keys()).sort((a, b) => a.localeCompare(b));
            const html = genres.map(genre => {
                const safeId = genre.replace(/\s+/g, '-').toLowerCase();
                const items = genreToItems.get(genre);
                return `
                    <section class="mb-5">
                        <h2>🎭 ${genre} Movies</h2>
                        <div class="content-slider-wrapper">
                            <button class="slider-btn slider-btn-left" id="${safeId}-left-btn">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="content-slider" id="${safeId}-slider">
                                <div id="${safeId}-container" class="content-row">
                                    ${items.map(item => createContentCard(item)).join('')}
                                </div>
                            </div>
                            <button class="slider-btn slider-btn-right" id="${safeId}-right-btn">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </section>
                `;
            }).join('');

            container.innerHTML = html || '<div class="text-white">No genre content available</div>';

            genres.forEach(genre => {
                const safeId = genre.replace(/\s+/g, '-').toLowerCase();
                setTimeout(() => new ContentSlider(`${safeId}-slider`, `${safeId}-left-btn`, `${safeId}-right-btn`), 50);
            });
        } catch (err) {
            console.error('Error rendering genre sliders:', err);
            container.innerHTML = '<div class="text-danger">Error loading genre sliders</div>';
        }
    }

    renderMovies(currentSort); // Initial render
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body && document.body.dataset && document.body.dataset.page === 'movies') {
        renderAllMoviesGroupedByGenre();
    }
});


