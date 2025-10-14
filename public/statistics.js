// Statistics Page JavaScript

let dailyViewsChart = null;
let contentTypeChart = null;
let currentDays = 7;

document.addEventListener('DOMContentLoaded', function() {
    loadStatistics(currentDays);

    // Date range selector
    document.querySelectorAll('.date-range-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.date-range-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentDays = parseInt(this.dataset.days);
            loadStatistics(currentDays);
        });
    });
});

async function loadStatistics(days) {
    try {
        showLoading();

        const response = await fetch(`/api/users/statistics?days=${days}`);
        
        if (!response.ok) {
            throw new Error('Failed to load statistics');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load statistics');
        }

        if (data.data.totalViews === 0) {
            showNoData();
            return;
        }

        displayStatistics(data.data);
        hideLoading();

    } catch (error) {
        console.error('Error loading statistics:', error);
        showError('Failed to load statistics. Please try again later.');
        hideLoading();
    }
}

function displayStatistics(stats) {
    // Update overview cards
    document.getElementById('total-views').textContent = stats.totalViews;
    document.getElementById('unique-content').textContent = stats.uniqueContent;
    document.getElementById('total-hours').textContent = stats.totalHours.toFixed(1);
    document.getElementById('liked-content').textContent = stats.likedContent;

    // Create daily views chart
    createDailyViewsChart(stats.dailyViews, stats.profiles);

    // Create content type chart
    createContentTypeChart(stats.contentTypes);

    // Display profile stats
    displayProfileStats(stats.profileStats);
}

function createDailyViewsChart(dailyViews, profiles) {
    const ctx = document.getElementById('dailyViewsChart');
    
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (dailyViewsChart) {
        dailyViewsChart.destroy();
    }

    // Generate colors for each profile
    const colors = [
        'rgba(229, 9, 20, 0.8)',    // Netflix red
        'rgba(54, 162, 235, 0.8)',   // Blue
        'rgba(255, 206, 86, 0.8)',   // Yellow
        'rgba(75, 192, 192, 0.8)',   // Teal
        'rgba(153, 102, 255, 0.8)'   // Purple
    ];

    // Prepare datasets for each profile
    const datasets = profiles.map((profile, index) => ({
        label: profile.name,
        data: dailyViews.map(day => {
            const profileData = day.profiles.find(p => p.profileId === profile.id);
            return profileData ? profileData.count : 0;
        }),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
        borderWidth: 2,
        tension: 0.4,
        fill: true
    }));

    dailyViewsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailyViews.map(day => day.date),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'white',
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#e50914',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Number of Views',
                        color: 'white'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function createContentTypeChart(contentTypes) {
    const ctx = document.getElementById('contentTypeChart');
    
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (contentTypeChart) {
        contentTypeChart.destroy();
    }

    const data = {
        labels: contentTypes.map(ct => ct.type),
        datasets: [{
            data: contentTypes.map(ct => ct.count),
            backgroundColor: [
                'rgba(229, 9, 20, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)'
            ],
            borderColor: [
                'rgba(229, 9, 20, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 2
        }]
    };

    contentTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: 'white',
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#e50914',
                    borderWidth: 1
                }
            }
        }
    });
}

function displayProfileStats(profileStats) {
    const container = document.getElementById('profile-stats');
    if (!container) return;

    container.innerHTML = '';

    profileStats.forEach(profile => {
        const statCard = document.createElement('div');
        statCard.className = 'profile-stat-card';
        statCard.innerHTML = `
            <div class="profile-stat-header">
                <div class="profile-stat-icon">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-stat-name">${profile.name}</div>
            </div>
            <div class="profile-stat-details">
                <div class="profile-stat-item">
                    <div class="profile-stat-value">${profile.views}</div>
                    <div class="profile-stat-label">Views</div>
                </div>
                <div class="profile-stat-item">
                    <div class="profile-stat-value">${profile.hours.toFixed(1)}</div>
                    <div class="profile-stat-label">Hours</div>
                </div>
                <div class="profile-stat-item">
                    <div class="profile-stat-value">${profile.favorites}</div>
                    <div class="profile-stat-label">Favorites</div>
                </div>
            </div>
        `;
        container.appendChild(statCard);
    });
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('statistics-content').style.display = 'none';
    document.getElementById('no-data').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('statistics-content').style.display = 'block';
}

function showNoData() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('statistics-content').style.display = 'none';
    document.getElementById('no-data').style.display = 'block';
}

function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '80px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

