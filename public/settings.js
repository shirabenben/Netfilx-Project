// Settings Page JavaScript for Profile Management

document.addEventListener('DOMContentLoaded', function() {
    // Get modal instances
    const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // Get DOM elements
    const addProfileCard = document.getElementById('add-profile-card');
    const profileForm = document.getElementById('profileForm');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const profilesGrid = document.getElementById('profiles-grid');
    const profileCountSpan = document.getElementById('profile-count');
    const limitWarning = document.getElementById('limit-warning');

    // Add Profile Click
    if (addProfileCard) {
        addProfileCard.addEventListener('click', function() {
            openProfileModal('create');
        });
    }

    // Edit Profile Buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-profile-btn') || 
            e.target.closest('.edit-profile-btn')) {
            const btn = e.target.classList.contains('edit-profile-btn') ? 
                        e.target : e.target.closest('.edit-profile-btn');
            const profileId = btn.dataset.profileId;
            const profileName = btn.dataset.profileName;
            openProfileModal('edit', profileId, profileName);
        }
    });

    // Delete Profile Buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-profile-btn') || 
            e.target.closest('.delete-profile-btn')) {
            const btn = e.target.classList.contains('delete-profile-btn') ? 
                        e.target : e.target.closest('.delete-profile-btn');
            if (!btn.disabled) {
                const profileId = btn.dataset.profileId;
                const profileName = btn.dataset.profileName;
                openDeleteModal(profileId, profileName);
            }
        }
    });

    // Save Profile
    saveProfileBtn.addEventListener('click', async function() {
        const profileId = document.getElementById('profileId').value;
        const profileName = document.getElementById('profileName').value.trim();
        
        if (!profileName) {
            showError('nameError', 'Profile name is required');
            return;
        }

        if (profileName.length > 50) {
            showError('nameError', 'Profile name must be 50 characters or less');
            return;
        }

        saveProfileBtn.disabled = true;
        saveProfileBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        try {
            if (profileId) {
                // Update existing profile
                await updateProfile(profileId, profileName);
            } else {
                // Create new profile
                await createProfile(profileName);
            }
            
            profileModal.hide();
            profileForm.reset();
            
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = 'Save Profile';
        }
    });

    // Confirm Delete
    confirmDeleteBtn.addEventListener('click', async function() {
        const profileId = document.getElementById('deleteProfileId').value;
        
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

        try {
            await deleteProfile(profileId);
            deleteModal.hide();
        } catch (error) {
            console.error('Error deleting profile:', error);
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Delete Profile';
        }
    });

    // Functions
    function openProfileModal(mode, profileId = '', profileName = '') {
        const modalTitle = document.getElementById('profileModalTitle');
        const profileIdInput = document.getElementById('profileId');
        const profileNameInput = document.getElementById('profileName');
        const nameError = document.getElementById('nameError');

        // Reset form
        profileForm.reset();
        nameError.textContent = '';
        profileNameInput.classList.remove('is-invalid');

        if (mode === 'create') {
            modalTitle.textContent = 'Add Profile';
            profileIdInput.value = '';
            profileNameInput.value = '';
        } else {
            modalTitle.textContent = 'Edit Profile';
            profileIdInput.value = profileId;
            profileNameInput.value = profileName;
        }

        profileModal.show();
        
        // Focus on name input
        setTimeout(() => profileNameInput.focus(), 500);
    }

    function openDeleteModal(profileId, profileName) {
        document.getElementById('deleteProfileId').value = profileId;
        document.getElementById('deleteProfileName').textContent = profileName;
        deleteModal.show();
    }

    async function createProfile(name) {
        try {
            const response = await fetch('/api/users/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('success', 'Profile created successfully!');
                setTimeout(() => location.reload(), 1000);
            } else {
                showAlert('danger', data.message || 'Failed to create profile');
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            showAlert('danger', 'An error occurred while creating the profile');
        }
    }

    async function updateProfile(profileId, name) {
        try {
            const response = await fetch(`/api/users/profiles/${profileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('success', 'Profile updated successfully!');
                
                // Update the profile card in the UI
                const profileCard = document.querySelector(`[data-profile-id="${profileId}"]`);
                if (profileCard) {
                    const nameElement = profileCard.querySelector('.profile-card-name');
                    if (nameElement) {
                        nameElement.textContent = name;
                    }
                    const editBtn = profileCard.querySelector('.edit-profile-btn');
                    if (editBtn) {
                        editBtn.dataset.profileName = name;
                    }
                    const deleteBtn = profileCard.querySelector('.delete-profile-btn');
                    if (deleteBtn) {
                        deleteBtn.dataset.profileName = name;
                    }
                }
            } else {
                showAlert('danger', data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showAlert('danger', 'An error occurred while updating the profile');
        }
    }

    async function deleteProfile(profileId) {
        try {
            const response = await fetch(`/api/users/profiles/${profileId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('success', 'Profile deleted successfully!');
                
                // Remove the profile card from UI
                const profileCard = document.querySelector(`[data-profile-id="${profileId}"]`);
                if (profileCard) {
                    profileCard.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        profileCard.remove();
                        updateProfileCount();
                    }, 300);
                }
            } else {
                showAlert('danger', data.message || 'Failed to delete profile');
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            showAlert('danger', 'An error occurred while deleting the profile');
        }
    }

    function updateProfileCount() {
        const profileCards = document.querySelectorAll('.profile-card:not(.add-profile-card)');
        const count = profileCards.length;
        
        if (profileCountSpan) {
            profileCountSpan.textContent = count;
        }

        // Show/hide add button and limit warning
        if (count >= 5) {
            if (addProfileCard) addProfileCard.style.display = 'none';
            if (limitWarning) limitWarning.style.display = 'block';
        } else {
            if (addProfileCard) addProfileCard.style.display = 'flex';
            if (limitWarning) limitWarning.style.display = 'none';
        }

        // Update delete buttons - disable if only one profile left
        if (count <= 1) {
            document.querySelectorAll('.delete-profile-btn').forEach(btn => {
                btn.disabled = true;
            });
        } else {
            document.querySelectorAll('.delete-profile-btn').forEach(btn => {
                btn.disabled = false;
            });
        }
    }

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 3000);
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        const inputElement = document.getElementById(elementId.replace('Error', ''));
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            inputElement.classList.add('is-invalid');
        }
    }
});

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(style);

