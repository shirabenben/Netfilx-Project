// Netflix Project - Main Application JavaScript

// Function to create content card HTML
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
                        ${content.genre.map(g => `<span class="badge bg-secondary me-1">${g}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Slider functionality
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

// Generic function to load content
async function loadContent(endpoint, containerId, sliderId, leftBtnId, rightBtnId, showViewCount = false) {
    try {
        const response = await fetch(`/api/content/${endpoint}`);
        const result = await response.json();
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        if (result.success && result.data.length > 0) {
            container.innerHTML = result.data.map(content => createContentCard(content, showViewCount)).join('');
            setTimeout(() => new ContentSlider(sliderId, leftBtnId, rightBtnId), 100);
        } else {
            container.innerHTML = '<div class="content-item loading"><div class="text-center text-white">No content available</div></div>';
        }
    } catch (error) {
        console.error(`Error loading ${endpoint}:`, error);
        document.getElementById(containerId).innerHTML = 
            '<div class="content-item loading"><div class="text-center text-danger">Error loading content</div></div>';
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
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

// Initialize homepage
function initializeHomepage() {
    storeProfileId();
    if (document.getElementById('popular-content')) {
        loadContent('popular', 'popular-content', 'popular-slider', 'popular-left-btn', 'popular-right-btn', true);
    }
    if (document.getElementById('newest-movies')) {
        loadContent('newest-movies', 'newest-movies', 'movies-slider', 'movies-left-btn', 'movies-right-btn');
    }
    if (document.getElementById('newest-series')) {
        loadContent('newest-series', 'newest-series', 'series-slider', 'series-left-btn', 'series-right-btn');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeHomepage);
