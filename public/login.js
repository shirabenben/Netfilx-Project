// Login form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('loginBtn');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    
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
        if (loading) {
            submitBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing In...';
        } else {
            submitBtn.disabled = false;
            loadingSpinner.style.display = 'none';
            submitBtn.innerHTML = 'Sign In';
        }
    }
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        setLoading(true);
        clearErrors();
        
        // Collect form data
        const formData = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value
        };
        
        if (!formData.username || !formData.password) {
            showError('generalError', 'Please enter both username/email and password');
            setLoading(false);
            return;
        }
        
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess('Login successful! Redirecting...');
                
                // Redirect based on whether user has profiles
                setTimeout(() => {
                    if (result.data.hasProfiles) {
                        window.location.href = '/profiles';
                    } else {
                        window.location.href = '/create-profile';
                    }
                }, 1000);
            } else {
                showError('generalError', result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('generalError', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    });
});