// Search page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load search results first
    loadSearchResults();
    
    // Initialize the search content slider after content is loaded
    new ContentSlider('search-slider', 'search-left-btn', 'search-right-btn');
});

function loadSearchResults() {
    // Get the content row directly (search-results is the content-row itself)
    const contentRow = document.getElementById('search-results');
    if (!contentRow) return;

    // Check if we have search results data in the page
    const searchDataElement = document.getElementById('searchResultsData');
    if (!searchDataElement) return;

    try {
        const searchResults = JSON.parse(searchDataElement.textContent);
        
        if (searchResults.length > 0) {
            // Clear loading spinner
            contentRow.innerHTML = '';
            
            // Add each result as a content card
            searchResults.forEach(function(content) {
                const cardHTML = createContentCard(content);
                contentRow.innerHTML += cardHTML;
            });
        }
    } catch (error) {
        console.error('Error loading search results:', error);
    }
}