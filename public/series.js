// Series page logic: render all series grouped by genre

function createContentCard(content, showViewCount = false) {
    const defaultImage = '/images/default-poster.jpg';
    const imageUrl = content.imageUrl || defaultImage;
    const viewCountBadge = showViewCount && content.viewCount ? 
        `<span class="badge bg-danger position-absolute top-0 end-0 m-2">${content.viewCount} views</span>` : '';
    
    return `
        <div class="content-item">
            <div class="content-card position-relative">
                ${viewCountBadge}
                <img src="${imageUrl}" class="content-poster" alt="${content.title}">
                <div class="content-overlay">
                    <h6 class="content-title">${content.title}</h6>
                    <p class="content-year">${content.year}</p>
                    <div class="content-genres">
                        ${(Array.isArray(content.genre) ? content.genre : []).map(g => `<span class=\"badge bg-secondary me-1\">${g}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

class ContentSlider {
    constructor(sliderId, leftBtnId, rightBtnId) {
        this.slider = document.getElementById(sliderId);
        this.leftBtn = document.getElementById(leftBtnId);
        this.rightBtn = document.getElementById(rightBtnId);
        if (this.slider && this.leftBtn && this.rightBtn) {
            this.init();
        }
    }
    init() {
        this.leftBtn.addEventListener('click', () => this.scrollLeft());
        this.rightBtn.addEventListener('click', () => this.scrollRight());
        this.slider.addEventListener('scroll', () => this.updateButtons());
        this.updateButtons();
    }
    scrollLeft() {
        this.slider.scrollBy({ left: -this.getScrollAmount(), behavior: 'smooth' });
    }
    scrollRight() {
        this.slider.scrollBy({ left: this.getScrollAmount(), behavior: 'smooth' });
    }
    getScrollAmount() {
        const width = window.innerWidth;
        if (width < 576) return 160;
        if (width < 768) return 360;
        if (width < 1200) return 540;
        return 660;
    }
    updateButtons() {
        const { scrollLeft, scrollWidth, clientWidth } = this.slider;
        this.leftBtn.disabled = scrollLeft <= 0;
        this.rightBtn.disabled = scrollLeft >= scrollWidth - clientWidth - 1;
    }
}

async function renderAllSeriesGroupedByGenre() {
    const container = document.getElementById('genre-sliders');
    if (!container) return;

    try {
        const response = await fetch('/api/content?type=series&limit=1000&sort=-createdAt');
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) {
            container.innerHTML = '<div class="text-white">No series available</div>';
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.body && document.body.dataset && document.body.dataset.page === 'series') {
        renderAllSeriesGroupedByGenre();
    }
});


