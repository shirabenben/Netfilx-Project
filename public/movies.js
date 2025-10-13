// Movies page logic: render all movies grouped by genre

// ContentSlider provided by shared.js

async function renderAllMoviesGroupedByGenre() {
    const container = document.getElementById('genre-sliders');
    if (!container) return;

    try {
        const response = await fetch('/api/content?type=movie&limit=1000&sort=-createdAt');
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.body && document.body.dataset && document.body.dataset.page === 'movies') {
        renderAllMoviesGroupedByGenre();
    }
});


