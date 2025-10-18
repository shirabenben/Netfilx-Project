// Movies page logic: render all movies grouped by genre

// ContentSlider provided by shared.js
async function renderAllMoviesGroupedByGenre() {
    const container = document.getElementById('genre-sliders');
    if (!container) return;

    // Add filter and sort controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container mb-3 d-flex gap-2 align-items-center flex-wrap';
    controlsContainer.innerHTML = `
        <div class="filter-container">
            <label class="text-white me-1 small"><i class="fas fa-filter"></i></label>
            <div class="btn-group btn-group-sm" role="group">
                <input type="radio" class="btn-check" name="filter-movies" id="filter-all" value="all" checked>
                <label class="btn btn-outline-light btn-sm" for="filter-all" title="All Movies"><i class="fas fa-list"></i> All</label>
                
                <input type="radio" class="btn-check" name="filter-movies" id="filter-watched" value="watched">
                <label class="btn btn-outline-light btn-sm" for="filter-watched" title="Watched Movies"><i class="fas fa-eye"></i> Watched</label>
                
                <input type="radio" class="btn-check" name="filter-movies" id="filter-unwatched" value="unwatched">
                <label class="btn btn-outline-light btn-sm" for="filter-unwatched" title="Unwatched Movies"><i class="fas fa-eye-slash"></i> Unwatched</label>
            </div>
        </div>
        <div class="sort-container">
            <label for="sort-movies" class="text-white me-1 small"><i class="fas fa-sort"></i></label>
            <select id="sort-movies" class="form-select form-select-sm bg-dark text-white w-auto d-inline-block">
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

    document.getElementById('sort-movies').addEventListener('change', (event) => {
        currentSort = event.target.value;
        renderMovies(currentSort, currentFilter);
    });

    document.querySelectorAll('input[name="filter-movies"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentFilter = event.target.value;
            renderMovies(currentSort, currentFilter);
        });
    });

    async function renderMovies(sortOrder, filter) {
        try {
            const configRes = await fetch('/api/config');
            const config = await configRes.json();
            const limit = config.contentFetchLimit || 1000;

            let movieData = [];
            
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
                
                console.log(`Movies ${filter} API response:`, result);
                
                if (!result.success || !Array.isArray(result.data)) {
                    container.innerHTML = `<div class="text-white">No ${filter} movies available</div>`;
                    return;
                }
                
                // For watched content, extract the content object and filter only movies
                if (filter === 'watched') {
                    movieData = result.data
                        .map(item => item.contentId)  // Changed from item.content to item.contentId
                        .filter(content => content && content.type === 'movie');
                    console.log(`Filtered watched movies:`, movieData);
                } else {
                    // For unwatched, data is already content objects
                    movieData = result.data.filter(item => item.type === 'movie');
                    console.log(`Filtered unwatched movies:`, movieData);
                }
            } else {
                // Get all movies
                const response = await fetch(`/api/content?type=movie&limit=${limit}&sort=${sortOrder}`);
                const result = await response.json();
                if (!result.success || !Array.isArray(result.data)) {
                    container.innerHTML = '<div class="text-white">No movies available</div>';
                    return;
                }
                movieData = result.data;
            }

            if (movieData.length === 0) {
                container.innerHTML = `<div class="text-white">No ${filter} movies found</div>`;
                return;
            }

            // Apply sorting to the data
            const sortField = sortOrder.replace(/^-/, ''); // Remove '-' prefix
            const isDescending = sortOrder.startsWith('-');
            
            movieData.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                // Handle undefined/null values
                if (aVal === undefined || aVal === null) aVal = 0;
                if (bVal === undefined || bVal === null) bVal = 0;
                
                // Convert to numbers for numeric fields
                if (sortField === 'popularity' || sortField === 'starRating') {
                    aVal = Number(aVal) || 0;
                    bVal = Number(bVal) || 0;
                }
                
                if (aVal < bVal) return isDescending ? 1 : -1;
                if (aVal > bVal) return isDescending ? -1 : 1;
                return 0;
            });

            const genreToItems = new Map();
            for (const item of movieData) {
                const genres = Array.isArray(item.genre) ? item.genre : [];
                for (const g of genres) {
                    const key = (g || '').trim();
                    if (!key) continue;
                    if (!genreToItems.has(key)) genreToItems.set(key, []);
                    genreToItems.get(key).push(item);
                }
            }
            
            console.log(`Genre distribution for ${filter} movies:`, Array.from(genreToItems.keys()));

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

    renderMovies(currentSort, currentFilter); // Initial render
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
    if (document.body && document.body.dataset && document.body.dataset.page === 'movies') {
        storeProfileId(); // Store profile ID if present in URL
        renderAllMoviesGroupedByGenre();
    }
});