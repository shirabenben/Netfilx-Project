// Series page logic: render all series grouped by genre

// ContentSlider provided by shared.js

async function renderAllSeriesGroupedByGenre() {
    const container = document.getElementById('genre-sliders');
    if (!container) return;

    // Add filter and sort controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container mb-3 d-flex gap-2 align-items-center flex-wrap';
    controlsContainer.innerHTML = `
        <div class="filter-container">
            <label class="text-white me-1 small"><i class="fas fa-filter"></i></label>
            <div class="btn-group btn-group-sm" role="group">
                <input type="radio" class="btn-check" name="filter-series" id="filter-all" value="all" checked>
                <label class="btn btn-outline-light btn-sm" for="filter-all" title="All Series"><i class="fas fa-list"></i> All</label>
                
                <input type="radio" class="btn-check" name="filter-series" id="filter-watched" value="watched">
                <label class="btn btn-outline-light btn-sm" for="filter-watched" title="Watched Series"><i class="fas fa-eye"></i> Watched</label>
                
                <input type="radio" class="btn-check" name="filter-series" id="filter-unwatched" value="unwatched">
                <label class="btn btn-outline-light btn-sm" for="filter-unwatched" title="Unwatched Series"><i class="fas fa-eye-slash"></i> Unwatched</label>
            </div>
        </div>
        <div class="sort-container">
            <label for="sort-series" class="text-white me-1 small"><i class="fas fa-sort"></i></label>
            <select id="sort-series" class="form-select form-select-sm bg-dark text-white w-auto d-inline-block">
                <option value="-popularity">Popularity (High to Low)</option>
                <option value="popularity">Popularity (Low to High)</option>
                <option value="-starRating">Rating (High to Low)</option>
                <option value="starRating">Rating (Low to High)</option>
            </select>
        </div>
    `;
    container.parentNode.insertBefore(controlsContainer, container);

    let currentSort = '-createdAt';
    let currentFilter = 'all';

    document.getElementById('sort-series').addEventListener('change', (event) => {
        currentSort = event.target.value;
        renderSeries(currentSort, currentFilter);
    });

    document.querySelectorAll('input[name="filter-series"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentFilter = event.target.value;
            renderSeries(currentSort, currentFilter);
        });
    });

    async function renderSeries(sortOrder, filter) {
        try {
            // Fetch config to get limit
            const configRes = await fetch('/api/config');
            const config = await configRes.json();
            const limit = config.contentFetchLimit || 1000;

            let seriesData = [];
            
            if (filter === 'watched' || filter === 'unwatched') {
                // Get current profile ID from session/cookie
                const profileId = localStorage.getItem('currentProfileId');
                if (!profileId) {
                    container.innerHTML = '<div class="text-white">Please select a profile first</div>';
                    return;
                }
                
                const endpoint = filter === 'watched' ? 'watched' : 'unwatched';
                const response = await fetch(`/api/users/profiles/${profileId}/${endpoint}`);
                const result = await response.json();
                
                if (!result.success || !Array.isArray(result.data)) {
                    container.innerHTML = `<div class="text-white">No ${filter} series available</div>`;
                    return;
                }
                
                // For watched content, extract the content object and filter only series
                if (filter === 'watched') {
                    seriesData = result.data
                        .map(item => item.content)
                        .filter(content => content && content.type === 'series');
                } else {
                    // For unwatched, data is already content objects
                    seriesData = result.data.filter(item => item.type === 'series');
                }
            } else {
                // Get all series
                const response = await fetch(`/api/content?type=series&limit=${limit}&sort=${sortOrder}`);
                const result = await response.json();
                if (!result.success || !Array.isArray(result.data)) {
                    container.innerHTML = '<div class="text-white">No series available</div>';
                    return;
                }
                seriesData = result.data;
            }

            const genreToItems = new Map();
            for (const item of seriesData) {
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
                        <h2>🎭 ${genre} Series</h2>
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

    renderSeries(currentSort, currentFilter); // Initial render
}

// Store profile ID from URL parameter
function storeProfileId() {
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('profile');
    
    if (profileId) {
        localStorage.setItem('currentProfileId', profileId);
        console.log('Profile ID stored:', profileId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body && document.body.dataset && document.body.dataset.page === 'series') {
        storeProfileId(); // Store profile ID if present in URL
        renderAllSeriesGroupedByGenre();
    }
});


