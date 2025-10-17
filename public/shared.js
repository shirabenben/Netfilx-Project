// Shared UI helpers used across pages

function createContentCard(content, showViewCount = false) {
    const defaultImage = '/images/default-poster.jpg';
    const imageUrl = content.imageUrl || defaultImage;
    const viewCountBadge = showViewCount && content.viewCount ? 
        `<span class="badge bg-danger position-absolute top-0 end-0 m-2">${content.viewCount} views</span>` : '';
    
    // Add star rating display
    const starRatingDisplay = content.starRating ? 
        `<div class="star-rating-badge position-absolute bottom-0 end-0 m-2 badge bg-warning text-dark">
            <i class="fas fa-star"></i> ${content.starRating}
        </div>` : '';

    return `
        <div class="content-item">
            <div class="content-card position-relative" 
                 onclick="navigateToContent('${content._id}')" 
                 style="cursor: pointer;">
                ${viewCountBadge}
                ${starRatingDisplay}
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

// Navigate to content detail page
function navigateToContent(contentId) {
    window.location.href = `/api/content/view/${contentId}`;
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