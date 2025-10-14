// Netflix Project - Main Application JavaScript

// createContentCard is provided by shared.js

// Slider functionality
// ContentSlider is provided by shared.js

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
    // Store profile ID if present in URL
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
