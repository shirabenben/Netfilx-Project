// Basic functionality for Netflix clone
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    handleNavbarScroll();
});

// Initialize the application
async function initializeApp() {
    await loadContent();
}

// Load content from server
async function loadContent() {
    try {
        showLoading();
        const response = await fetch('/api/content/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
            displayContent(result.data);
        } else {
            throw new Error('Failed to load content');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error loading content. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Display content in grid
function displayContent(content) {
    const mainContainer = document.getElementById('main-content');
    if (!content || content.length === 0) {
        mainContainer.innerHTML = '<p class="text-center mt-5">No content available</p>';
        return;
    }

    mainContainer.innerHTML = `
        <div class="content-grid">
            ${content.map(item => createContentCard(item)).join('')}
        </div>
    `;
}

// Create a content card
function createContentCard(item) {
    return `
        <div class="content-card" data-id="${item._id}">
            <img src="https://picsum.photos/300/169" alt="${item.title}" class="content-thumbnail">
            <div class="content-info">
                <h3 class="content-title">${item.title}</h3>
            </div>
        </div>
    `;
}

// Handle navbar background on scroll
function handleNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        navbar.style.backgroundColor = window.scrollY > 10 ? 
            'rgb(20, 20, 20)' : 
            'rgba(20, 20, 20, 0.95)';
    });
}

// UI State Management
function showLoading() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) loading.remove();
}

function showError(message) {
    const main = document.getElementById('main-content');
    main.innerHTML = `<div class="error-message">${message}</div>`;
}
