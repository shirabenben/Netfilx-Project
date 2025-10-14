// Add Content Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
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

    // Set loading state
    function setLoading(loading) {
        submitBtn.disabled = loading;
        loadingSpinner.classList.toggle('d-none', !loading);
    }

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
