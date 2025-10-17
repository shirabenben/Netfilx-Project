// Search page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the search content slider
    const slider = new ContentSlider('search-slider', 'search-left-btn', 'search-right-btn');
    
    // Load search results if they exist
    loadSearchResults();
});

function loadSearchResults() {
    // Get the search results container from the ContentSlider
    const container = document.getElementById('search-results');
    if (!container) return;

    // Check if we have search results data in the page
    const searchDataElement = document.getElementById('searchResultsData');
    if (!searchDataElement) return;

    try {
        const searchResults = JSON.parse(searchDataElement.textContent);
        
        if (searchResults.length > 0) {
            // Get the content row inside the slider
            const contentRow = container.querySelector('.content-row');
            if (contentRow) {
                // Clear loading spinner
                contentRow.innerHTML = '';
                
                // Add each result as a content card
                searchResults.forEach(function(content) {
                    const cardHTML = createContentCard(content);
                    contentRow.innerHTML += cardHTML;
                });
            }
        }
    } catch (error) {
        console.error('Error loading search results:', error);
    }
}