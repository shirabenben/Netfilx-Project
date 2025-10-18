// Registration form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('registerBtn');
    const loadingSpinner = submitBtn.querySelector('.loading-spinner');
    
    // Form validation
    function validateForm() {
        clearErrors();
        let isValid = true;
        
        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const profileName = document.getElementById('profileName').value.trim();
        
        // Validate first name
        if (!firstName) {
            showError('firstNameError', 'First name is required');
            isValid = false;
        } else if (firstName.length > 50) {
            showError('firstNameError', 'First name must be less than 50 characters');
            isValid = false;
        }
        
        // Validate last name
        if (!lastName) {
            showError('lastNameError', 'Last name is required');
            isValid = false;
        } else if (lastName.length > 50) {
            showError('lastNameError', 'Last name must be less than 50 characters');
            isValid = false;
        }
        
        // Validate username
        if (!username) {
            showError('usernameError', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            showError('usernameError', 'Username must be at least 3 characters');
            isValid = false;
        } else if (username.length > 50) {
            showError('usernameError', 'Username must be less than 50 characters');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!email) {
            showError('emailError', 'Email is required');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            showError('passwordError', 'Password is required');
            isValid = false;
        } else if (password.length < 5) {
            showError('passwordError', 'Password must be at least 5 characters');
            isValid = false;
        }
        
        // Validate confirm password
        if (!confirmPassword) {
            showError('confirmPasswordError', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate profile name
        if (!profileName) {
            showError('profileNameError', 'Profile name is required');
            isValid = false;
        } else if (profileName.length > 50) {
            showError('profileNameError', 'Profile name must be less than 50 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show error message
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    // Clear all error messages
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
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account...';
        } else {
            submitBtn.disabled = false;
            loadingSpinner.style.display = 'none';
            submitBtn.innerHTML = 'Create Account';
        }
    }
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        clearErrors();
        
        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            profileName: document.getElementById('profileName').value.trim()
        };
        
        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccess('Account created successfully! Redirecting to login...');
                form.reset();
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                // Handle validation errors
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        if (error.includes('username')) {
                            showError('usernameError', error);
                        } else if (error.includes('email')) {
                            showError('emailError', error);
                        } else if (error.includes('password')) {
                            showError('passwordError', error);
                        } else if (error.includes('firstName')) {
                            showError('firstNameError', error);
                        } else if (error.includes('lastName')) {
                            showError('lastNameError', error);
                        } else {
                            showError('usernameError', error);
                        }
                    });
                } else {
                    // Handle general error message
                    if (result.message.includes('username')) {
                        showError('usernameError', result.message);
                    } else if (result.message.includes('email')) {
                        showError('emailError', result.message);
                    } else {
                        showError('usernameError', result.message);
                    }
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('usernameError', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    });
    
    // Real-time validation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;
        const errorElement = document.getElementById('confirmPasswordError');
        
        if (confirmPassword && password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
        } else {
            errorElement.textContent = '';
        }
    });
    
    // Auto-fill profile name based on first name
    document.getElementById('firstName').addEventListener('input', function() {
        const profileNameField = document.getElementById('profileName');
        if (!profileNameField.value && this.value) {
            profileNameField.value = `${this.value}'s Profile`;
        }
    });
});