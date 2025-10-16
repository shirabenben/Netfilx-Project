// Add Content Form JavaScript

// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    const form = document.getElementById('addContentForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingSpinner = submitBtn.querySelector('.spinner-border');

    // Clear error messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });

        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = '';
        }
    }

    // Show error message
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // Show success message
    function showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = message;
        }
    }

    // Set loading state for submit button
    function setLoading(loading) {
        submitBtn.disabled = loading;
        loadingSpinner.classList.toggle('d-none', !loading);
    }

    // Set loading state for search button
    function setSearchLoading(loading, button) {
        button.disabled = loading;
        const icon = button.querySelector('i');
        if (loading) {
            icon.className = 'fas fa-spinner fa-spin';
        } else {
            icon.className = 'fas fa-search';
        }
    }

    // Handle rating search
    const searchRatingBtn = document.getElementById('searchRatingBtn');
    const ratingResult = document.getElementById('ratingResult');

    searchRatingBtn.addEventListener('click', async function() {
        const titleInput = document.getElementById('title');
        const yearInput = document.getElementById('year');
        const ratingSelect = document.getElementById('rating');

        const title = titleInput.value.trim();
        const year = yearInput.value ? parseInt(yearInput.value) : null;

        if (!title) {
            showError('titleError', 'Please enter a title first to search for ratings');
            return;
        }

        clearErrors();
        setSearchLoading(true, searchRatingBtn);

        // Clear previous result
        ratingResult.textContent = '';

        try {
            const params = new URLSearchParams({
                title: title,
                ...(year && { year: year.toString() })
            });

            const response = await fetch(`/api/rating-lookup?${params}`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                // Set the suggested rating
                ratingSelect.value = result.suggestedRating;

                // Show success message under title with RT details
                ratingResult.textContent = `${result.title} (${result.year || 'N/A'}) - Rotten Tomatoes: ${result.rtRating}% → Suggested: ${result.suggestedRating}`;
                ratingResult.style.color = '#28a745'; // Success green
            } else {
                // Fallback to a default rating if not found
                ratingSelect.value = result.suggestedRating || 'TV-14';
                ratingResult.textContent = result.error || 'Could not find Rotten Tomatoes rating. Using default suggestion.';
                ratingResult.style.color = '#fd7e14'; // Warning orange
            }
        } catch (error) {
            console.error('Rating search error:', error);
            ratingResult.textContent = 'Network error while searching for rating';
            ratingResult.style.color = '#dc3545'; // Error red
            ratingSelect.value = 'TV-14'; // Default fallback
        } finally {
            setSearchLoading(false, searchRatingBtn);
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        setLoading(true);
        clearErrors();

        // Collect form data
        const formData = new FormData(form);
        const data = {};

        // Handle regular fields
        for (let [key, value] of formData.entries()) {
            if (key === 'genre') {
                if (!data.genre) data.genre = [];
                data.genre.push(value);
            } else if (key === 'cast') {
                data.cast = value ? value.split(',').map(name => name.trim()).filter(name => name) : [];
            } else {
                data[key] = value;
            }
        }

        // Validate required fields
        const requiredFields = ['title', 'description', 'genre', 'year', 'duration', 'rating', 'type'];
        for (const field of requiredFields) {
            if (field === 'genre' && (!data.genre || data.genre.length === 0)) {
                showError('generalError', 'Please select at least one genre');
                setLoading(false);
                return;
            }
            if (field !== 'genre' && !data[field]) {
                showError(field + 'Error', 'This field is required');
                setLoading(false);
                return;
            }
        }

        // Validate year and duration
        if (data.year < 1900 || data.year > 2030) {
            showError('yearError', 'Year must be between 1900 and 2030');
            setLoading(false);
            return;
        }

        if (data.duration < 1) {
            showError('durationError', 'Duration must be at least 1 minute');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include' // for session cookies
            });

            const result = await response.json();

            if (result.success) {
                showSuccess('Content created successfully!');
                setTimeout(() => {
                    window.location.href = '/homepage';
                }, 2000);
            } else {
                if (result.errors) {
                    showError('generalError', 'Validation errors: ' + result.errors.join(', '));
                } else {
                    showError('generalError', result.message || 'An error occurred while creating content');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showError('generalError', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    });
});
