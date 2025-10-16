// Statistics Page JavaScript

let dailyViewsChart = null;
let contentTypeChart = null;
let genrePopularityChart = null;
let currentDays = 7;

document.addEventListener('DOMContentLoaded', function() {
    // Check if migration is needed first
    checkMigrationStatus();
    
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

    // Migration button
    const migrateBtn = document.getElementById('migrate-btn');
    if (migrateBtn) {
        migrateBtn.addEventListener('click', async function() {
            if (!confirm('This will migrate your existing viewing history to enable statistics. Continue?')) {
                return;
            }

            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Migrating...';

            try {
                const response = await fetch('/api/users/migrate-viewing-history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    showAlert('success', data.message || 'Migration completed successfully!');
                    // Reload statistics after migration
                    setTimeout(() => location.reload(), 2000);
                } else {
                    showAlert('danger', data.message || 'Migration failed');
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Migrate Viewing History';
                }
            } catch (error) {
                console.error('Migration error:', error);
                showAlert('danger', 'An error occurred during migration');
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Migrate Viewing History';
            }
        });
    }
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

    // Create genre popularity chart
    createGenrePopularityChart(stats.contentByGenre);

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

function createGenrePopularityChart(contentByGenre) {
    const ctx = document.getElementById('genrePopularityChart');
    
    if (!ctx || !contentByGenre || contentByGenre.length === 0) return;

    // Destroy existing chart if it exists
    if (genrePopularityChart) {
        genrePopularityChart.destroy();
    }

    // Color palette for genres
    const colors = [
        'rgba(229, 9, 20, 0.8)',     // Netflix red
        'rgba(249, 115, 22, 0.8)',   // Orange
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(34, 197, 94, 0.8)',    // Green
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(234, 179, 8, 0.8)',    // Yellow
        'rgba(14, 165, 233, 0.8)',   // Sky blue
        'rgba(220, 38, 38, 0.8)',    // Red
        'rgba(168, 85, 247, 0.8)'    // Violet
    ];

    const borderColors = colors.map(color => color.replace('0.8', '1'));

    genrePopularityChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: contentByGenre.map(g => g.genre),
            datasets: [{
                data: contentByGenre.map(g => g.totalViews),
                backgroundColor: colors.slice(0, contentByGenre.length),
                borderColor: borderColors.slice(0, contentByGenre.length),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: 'white',
                        font: {
                            size: 13
                        },
                        padding: 15,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} - ${value} views (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#e50914',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const genreData = contentByGenre[context.dataIndex];
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((genreData.totalViews / total) * 100).toFixed(1);
                            return [
                                `Genre: ${genreData.genre}`,
                                `Total Views: ${genreData.totalViews} (${percentage}%)`,
                                `Content Items: ${genreData.content.length}`
                            ];
                        }
                    }
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
    showAlert('danger', message);
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
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

async function checkMigrationStatus() {
    try {
        const response = await fetch('/api/users/check-migration');
        const data = await response.json();
        
        if (data.success) {
            console.log('Migration Status:', data.data);
            
            if (data.needsMigration && data.data.viewingHabits > 0) {
                showAlert('info', 
                    `You have ${data.data.viewingHabits} viewing records that can be migrated. ` +
                    `Click "Migrate Viewing History" to see your statistics.`
                );
            } else if (data.data.watchedContent === 0 && data.data.viewingHabits === 0) {
                console.log('No viewing history found');
            }
        }
    } catch (error) {
        console.error('Error checking migration status:', error);
    }
}

