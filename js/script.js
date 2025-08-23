// Application State
const appState = {
    currentSection: 'map',
    currentLocation: null,
    selectedIssueType: null,
    uploadedPhoto: null,
    reports: [],
    currentFilter: 'all'
};

// Sample data for demonstration
const sampleReports = [
    {
        id: 1001,
        type: 'pothole',
        location: { lat: -26.2041, lng: 28.0473, address: 'Main Road, Sandton' },
        description: 'Large pothole causing traffic issues',
        photo: null,
        upvotes: 45,
        status: 'new',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
        id: 1002,
        type: 'water',
        location: { lat: -26.1715, lng: 28.0693, address: 'Intersection, Rosebank' },
        description: 'Water leak at major intersection',
        photo: null,
        upvotes: 32,
        status: 'acknowledged',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
        id: 1003,
        type: 'traffic',
        location: { lat: -26.1886, lng: 28.0074, address: 'Traffic Light, Melville' },
        description: 'Traffic light not working properly',
        photo: null,
        upvotes: 28,
        status: 'new',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load sample data
    appState.reports = [...sampleReports];
    
    // Set up event listeners
    setupNavigationListeners();
    setupReportFormListeners();
    setupMapListeners();
    setupModalListeners();
    
    // Initialize location
    getCurrentLocation();
    
    // Show initial section and render markers
    showSection('map');
    
    console.log('SafeCity app initialized successfully');
}

// Navigation Functions
function setupNavigationListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active nav button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        appState.currentSection = sectionName;
        
        // Update section-specific content
        if (sectionName === 'map') {
            renderMapMarkers();
        } else if (sectionName === 'stats') {
            updateStatsView();
        }
    }
}

// ENHANCED: Dynamic Map Marker Rendering
function renderMapMarkers() {
    const markersContainer = document.querySelector('.sample-markers');
    if (!markersContainer) return;
    
    // Clear existing markers
    markersContainer.innerHTML = '';
    
    // Filter reports based on current filter
    const filteredReports = getFilteredReports();
    
    // Generate markers for each report
    filteredReports.forEach((report, index) => {
        const marker = createMarkerElement(report, index);
        markersContainer.appendChild(marker);
    });
    
    console.log(`Rendered ${filteredReports.length} markers for filter: ${appState.currentFilter}`);
}

function createMarkerElement(report, index) {
    const marker = document.createElement('div');
    marker.className = `marker ${report.type}`;
    marker.setAttribute('data-issue', report.type);
    marker.setAttribute('data-report-id', report.id);
    
    // Generate semi-random but consistent positioning based on report ID
    const position = generateMarkerPosition(report.id, index);
    marker.style.top = position.top;
    marker.style.left = position.left;
    
    // Create marker icon
    const icon = document.createElement('i');
    icon.className = getIssueTypeIcon(report.type);
    marker.appendChild(icon);
    
    // Create marker info popup
    const markerInfo = createMarkerInfo(report);
    marker.appendChild(markerInfo);
    
    // Add click event listener
    marker.addEventListener('click', function() {
        showIssueDetails(report);
    });
    
    // Add hover effects
    addMarkerHoverEffects(marker);
    
    return marker;
}

function createMarkerInfo(report) {
    const markerInfo = document.createElement('div');
    markerInfo.className = 'marker-info';
    
    const title = document.createElement('h4');
    title.textContent = formatReportTitle(report);
    markerInfo.appendChild(title);
    
    const timeAgo = document.createElement('p');
    timeAgo.textContent = `Reported ${formatDate(report.date)}`;
    markerInfo.appendChild(timeAgo);
    
    const upvotes = document.createElement('p');
    upvotes.innerHTML = `<i class="fas fa-arrow-up"></i> ${report.upvotes} upvotes`;
    markerInfo.appendChild(upvotes);
    
    const status = document.createElement('p');
    status.textContent = `Status: ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}`;
    status.style.color = getStatusColor(report.status);
    status.style.fontWeight = 'bold';
    markerInfo.appendChild(status);
    
    return markerInfo;
}

function generateMarkerPosition(reportId, index) {
    // Use report ID as seed for consistent positioning
    const seed = reportId % 1000;
    const baseTop = 20 + (seed % 60); // 20-80%
    const baseLeft = 15 + ((seed * 7) % 70); // 15-85%
    
    // Add slight offset based on index to prevent overlap
    const offsetTop = (index * 5) % 15;
    const offsetLeft = (index * 7) % 20;
    
    return {
        top: `${Math.min(baseTop + offsetTop, 85)}%`,
        left: `${Math.min(baseLeft + offsetLeft, 85)}%`
    };
}

function addMarkerHoverEffects(marker) {
    marker.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2)';
        this.style.zIndex = '100';
    });
    
    marker.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.zIndex = '10';
    });
}

function getFilteredReports() {
    return appState.reports.filter(report => {
        if (appState.currentFilter === 'all') return true;
        return report.type === appState.currentFilter;
    });
}

function formatReportTitle(report) {
    const typeNames = {
        pothole: 'Pothole',
        water: 'Water Leak',
        traffic: 'Traffic Light Issue',
        streetlight: 'Street Light Issue',
        drainage: 'Drainage Problem',
        other: 'Other Issue'
    };
    
    return typeNames[report.type] || 'Infrastructure Issue';
}

// Location Functions
function getCurrentLocation() {
    const locationDisplay = document.getElementById('current-location');
    
    if (navigator.geolocation) {
        locationDisplay.textContent = 'Getting your location...';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                appState.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // For demo purposes, use a Johannesburg address
                locationDisplay.textContent = 'Current Location: Sandton, Johannesburg';
            },
            function(error) {
                console.error('Error getting location:', error);
                locationDisplay.textContent = 'Location unavailable - Using default (Johannesburg)';
                appState.currentLocation = {
                    lat: -26.2041,
                    lng: 28.0473
                };
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        locationDisplay.textContent = 'Geolocation not supported - Using default location';
        appState.currentLocation = {
            lat: -26.2041,
            lng: 28.0473
        };
    }
}

// Report Form Functions
function setupReportFormListeners() {
    // Get location button
    const getLocationBtn = document.getElementById('get-location');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    // Issue type selection
    const issueTypes = document.querySelectorAll('.issue-type');
    issueTypes.forEach(button => {
        button.addEventListener('click', function() {
            // Remove previous selection
            issueTypes.forEach(btn => btn.classList.remove('selected'));
            
            // Add selection to clicked button
            this.classList.add('selected');
            appState.selectedIssueType = this.getAttribute('data-type');
        });
    });
    
    // Photo upload
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const previewImage = document.getElementById('preview-image');
    const removePhotoBtn = document.getElementById('remove-photo');
    
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    photoPreview.style.display = 'block';
                    appState.uploadedPhoto = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function() {
            photoPreview.style.display = 'none';
            photoInput.value = '';
            appState.uploadedPhoto = null;
        });
    }
    
    // Submit report
    const submitBtn = document.getElementById('submit-report');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleReportSubmission);
    }
}

function handleReportSubmission() {
    // Validate form
    if (!appState.selectedIssueType) {
        alert('Please select an issue type');
        return;
    }
    
    if (!appState.currentLocation) {
        alert('Location is required. Please wait for location to be detected or update manually.');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Create report object
    const newReport = {
        id: generateReportId(),
        type: appState.selectedIssueType,
        location: {
            ...appState.currentLocation,
            address: generateLocationAddress()
        },
        description: document.getElementById('description').value || `${formatReportTitle({type: appState.selectedIssueType})} reported by user`,
        photo: appState.uploadedPhoto,
        upvotes: 1,
        status: 'new',
        date: new Date()
    };
    
    // Simulate API call delay
    setTimeout(() => {
        // Add to reports
        appState.reports.push(newReport);
        
        // Reset form
        resetReportForm();
        
        // Hide loading and show success
        hideLoading();
        showSuccessModal(newReport.id);
        
        // Re-render markers to include the new report
        if (appState.currentSection === 'map') {
            renderMapMarkers();
        }
        
        // Update stats if on stats page
        if (appState.currentSection === 'stats') {
            updateStatsView();
        }
        
        console.log('New report added and markers updated:', newReport);
    }, 2000);
}

function generateLocationAddress() {
    const johannesburgAreas = [
        'Sandton',
        'Rosebank',
        'Melville',
        'Braamfontein',
        'Parktown',
        'Houghton',
        'Hyde Park',
        'Randburg',
        'Fourways',
        'Midrand'
    ];
    
    const randomArea = johannesburgAreas[Math.floor(Math.random() * johannesburgAreas.length)];
    return `Current Location, ${randomArea}, Johannesburg`;
}

function resetReportForm() {
    // Reset issue type selection
    const issueTypes = document.querySelectorAll('.issue-type');
    issueTypes.forEach(btn => btn.classList.remove('selected'));
    appState.selectedIssueType = null;
    
    // Reset photo
    const photoPreview = document.getElementById('photo-preview');
    const photoInput = document.getElementById('photo-input');
    photoPreview.style.display = 'none';
    photoInput.value = '';
    appState.uploadedPhoto = null;
    
    // Reset description
    document.getElementById('description').value = '';
}

// Map Functions
function setupMapListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active filter
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            appState.currentFilter = this.getAttribute('data-filter');
            
            // Re-render markers with new filter
            renderMapMarkers();
        });
    });
}

function showIssueDetails(report) {
    const details = `
Issue Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${formatReportTitle(report)}
Location: ${report.location.address}
Description: ${report.description}
Reported: ${formatDate(report.date)}
Upvotes: ${report.upvotes}
Status: ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
Report ID: #${report.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    alert(details);
    
    // In a real app, this would open a detailed modal
    // You could also implement upvoting here
}

// ENHANCED: Stats Functions with Dynamic Data
function updateStatsView() {
    const stats = calculateStats();
    
    // Update stat cards with real data
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        // Total Reports
        const totalReportsCard = statCards[0].querySelector('.stat-info h3');
        if (totalReportsCard) {
            totalReportsCard.textContent = stats.totalReports;
        }
        
        // Resolved Issues
        const resolvedCard = statCards[1].querySelector('.stat-info h3');
        if (resolvedCard) {
            resolvedCard.textContent = stats.resolvedReports;
        }
        
        // Average Fix Time (simulated)
        const avgTimeCard = statCards[2].querySelector('.stat-info h3');
        if (avgTimeCard) {
            avgTimeCard.textContent = stats.averageFixTime;
        }
        
        // Active Users (simulated)
        const activeUsersCard = statCards[3].querySelector('.stat-info h3');
        if (activeUsersCard) {
            activeUsersCard.textContent = stats.activeUsers;
        }
    }
    
    // Update top issues list
    updateTopIssuesList();
    
    console.log('Updated stats:', stats);
}

function updateTopIssuesList() {
    const issueList = document.querySelector('.issue-list');
    if (!issueList) return;
    
    // Get top 3 most upvoted recent reports
    const topReports = appState.reports
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 3);
    
    // Clear existing list
    issueList.innerHTML = '';
    
    // Add top reports
    topReports.forEach(report => {
        const issueItem = createIssueListItem(report);
        issueList.appendChild(issueItem);
    });
}

function createIssueListItem(report) {
    const issueItem = document.createElement('div');
    issueItem.className = 'issue-item';
    
    issueItem.innerHTML = `
        <div class="issue-details">
            <h4>${formatReportTitle(report)}</h4>
            <p>${report.location.address}</p>
            <span class="issue-type-badge ${report.type}">${formatReportTitle(report)}</span>
        </div>
        <div class="issue-stats">
            <span class="upvotes">
                <i class="fas fa-arrow-up"></i> ${report.upvotes}
            </span>
            <span class="status ${report.status}">${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
        </div>
    `;
    
    return issueItem;
}

function calculateStats() {
    const totalReports = appState.reports.length;
    const resolvedReports = appState.reports.filter(r => r.status === 'resolved').length;
    const averageFixTime = 12; // Simulated
    const activeUsers = Math.max(1234 + (totalReports * 5), 1234); // Grows with reports
    
    return {
        totalReports,
        resolvedReports,
        averageFixTime,
        activeUsers
    };
}

// Modal Functions
function setupModalListeners() {
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideSuccessModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideSuccessModal();
            }
        });
    }
}

function showSuccessModal(reportId) {
    const modal = document.getElementById('success-modal');
    const reportIdElement = document.getElementById('report-id');
    
    if (modal && reportIdElement) {
        reportIdElement.textContent = reportId;
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Loading Functions
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Utility Functions
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours === 0 ? 'Just now' : `${hours} hours ago`;
    } else if (days === 1) {
        return 'Yesterday';
    } else {
        return `${days} days ago`;
    }
}

function generateReportId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Issue type helpers
function getIssueTypeIcon(type) {
    const icons = {
        pothole: 'fas fa-road',
        water: 'fas fa-tint',
        traffic: 'fas fa-traffic-light',
        streetlight: 'fas fa-lightbulb',
        drainage: 'fas fa-drain',
        other: 'fas fa-tools'
    };
    return icons[type] || icons.other;
}

function getIssueTypeColor(type) {
    const colors = {
        pothole: '#ff6b6b',
        water: '#3742fa',
        traffic: '#ffa502',
        streetlight: '#f39c12',
        drainage: '#8e44ad',
        other: '#34495e'
    };
    return colors[type] || colors.other;
}

function getStatusColor(status) {
    const colors = {
        new: '#ff6b6b',
        acknowledged: '#ffa502',
        resolved: '#26de81'
    };
    return colors[status] || colors.new;
}

// Enhanced interaction features
function addUpvote(reportId) {
    const report = appState.reports.find(r => r.id === reportId);
    if (report) {
        report.upvotes += 1;
        
        // Re-render markers and stats
        if (appState.currentSection === 'map') {
            renderMapMarkers();
        }
        if (appState.currentSection === 'stats') {
            updateStatsView();
        }
        
        console.log(`Upvoted report ${reportId}, new total: ${report.upvotes}`);
    }
}

// Search and filter functionality
function searchReports(query) {
    return appState.reports.filter(report => 
        report.description.toLowerCase().includes(query.toLowerCase()) ||
        report.location.address.toLowerCase().includes(query.toLowerCase())
    );
}

// Export functions for potential integration
window.SafeCityApp = {
    state: appState,
    addReport: function(reportData) {
        const newReport = {
            id: generateReportId(),
            ...reportData,
            upvotes: 1,
            status: 'new',
            date: new Date()
        };
        
        appState.reports.push(newReport);
        
        // Re-render if on map view
        if (appState.currentSection === 'map') {
            renderMapMarkers();
        }
        
        return newReport;
    },
    getReports: function() {
        return appState.reports;
    },
    updateReport: function(reportId, updates) {
        const report = appState.reports.find(r => r.id === reportId);
        if (report) {
            Object.assign(report, updates);
            
            // Re-render affected views
            if (appState.currentSection === 'map') {
                renderMapMarkers();
            }
            if (appState.currentSection === 'stats') {
                updateStatsView();
            }
        }
    },
    renderMarkers: renderMapMarkers, // Expose for external use
    addUpvote: addUpvote
};

// Theme Management (keeping existing functionality)
const themeManager = {
    currentTheme: 'light',
    
    init() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('safecity-theme') || 'light';
        this.setTheme(savedTheme);
        this.setupThemeToggle();
    },
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('safecity-theme', theme);
        this.updateThemeElements();
    },
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    },
    
    updateThemeElements() {
        if (this.currentTheme === 'dark') {
            this.applyDarkModeSpecificStyles();
        } else {
            this.applyLightModeSpecificStyles();
        }
    },
    
    applyDarkModeSpecificStyles() {
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            mapPlaceholder.style.background = 'linear-gradient(45deg, #3a3a3a, #2d2d2d)';
        }
    },
    
    applyLightModeSpecificStyles() {
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            mapPlaceholder.style.background = 'linear-gradient(45deg, #f0f2f5, #e1e8ed)';
        }
    }
};

// Initialize theme management
document.addEventListener('DOMContentLoaded', function() {
    themeManager.init();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('map');
                break;
            case '2':
                e.preventDefault();
                showSection('report');
                break;
            case '3':
                e.preventDefault();
                showSection('stats');
                break;
        }
    }
    
    // Theme toggle shortcut
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        themeManager.toggleTheme();
    }
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('SafeCity App Error:', e.error);
});

console.log('SafeCity JavaScript with dynamic rendering loaded successfully');