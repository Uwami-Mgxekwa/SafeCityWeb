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
    
    // Show initial section
    showSection('map');
    
    console.log('iGodi app initialized successfully');
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
            updateMapView();
        } else if (sectionName === 'stats') {
            updateStatsView();
        }
    }
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
        id: Date.now(),
        type: appState.selectedIssueType,
        location: {
            ...appState.currentLocation,
            address: 'Current Location, Johannesburg'
        },
        description: document.getElementById('description').value || '',
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
        
        // Update map if visible
        if (appState.currentSection === 'map') {
            updateMapView();
        }
    }, 2000);
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
            updateMapView();
        });
    });
    
    // Marker interactions
    setupMarkerListeners();
}

function setupMarkerListeners() {
    const markers = document.querySelectorAll('.marker');
    markers.forEach(marker => {
        marker.addEventListener('click', function() {
            const issueType = this.getAttribute('data-issue');
            showIssueDetails(issueType);
        });
    });
}

function updateMapView() {
    // Filter reports based on current filter
    const filteredReports = appState.reports.filter(report => {
        if (appState.currentFilter === 'all') return true;
        return report.type === appState.currentFilter;
    });
    
    // Update map markers (in a real app, this would update the actual map)
    console.log(`Updating map view with ${filteredReports.length} reports for filter: ${appState.currentFilter}`);
    
    // Update marker visibility
    const markers = document.querySelectorAll('.marker');
    markers.forEach(marker => {
        const markerType = marker.getAttribute('data-issue');
        if (appState.currentFilter === 'all' || appState.currentFilter === markerType) {
            marker.style.display = 'flex';
        } else {
            marker.style.display = 'none';
        }
    });
}

function showIssueDetails(issueType) {
    // Find report by type (simplified for demo)
    const report = appState.reports.find(r => r.type === issueType);
    if (report) {
        alert(`Issue Details:\nType: ${report.type}\nLocation: ${report.location.address}\nUpvotes: ${report.upvotes}\nStatus: ${report.status}`);
    }
}

// Stats Functions
function updateStatsView() {
    const stats = calculateStats();
    
    // Update stat cards (simplified - in real app would update actual DOM elements)
    console.log('Updated stats:', stats);
}

function calculateStats() {
    const totalReports = appState.reports.length;
    const resolvedReports = appState.reports.filter(r => r.status === 'resolved').length;
    const averageFixTime = 12; // Simulated
    const activeUsers = 1234; // Simulated
    
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
        updateMapView();
        updateStatsView();
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
window.iGodiApp = {
    state: appState,
    addReport: function(reportData) {
        appState.reports.push({
            id: generateReportId(),
            ...reportData,
            upvotes: 1,
            status: 'new',
            date: new Date()
        });
        updateMapView();
    },
    getReports: function() {
        return appState.reports;
    },
    updateReport: function(reportId, updates) {
        const report = appState.reports.find(r => r.id === reportId);
        if (report) {
            Object.assign(report, updates);
            updateMapView();
        }
    }
};

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker would be implemented for offline functionality
        console.log('Service Worker support detected');
    });
}

// Analytics and reporting (placeholder)
function trackEvent(eventName, data) {
    console.log(`Analytics: ${eventName}`, data);
    // In production, would send to analytics service
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('iGodi App Error:', e.error);
    // In production, would report to error tracking service
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
});



// Theme Management
const themeManager = {
    currentTheme: 'light',
    
    init() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('igodi-theme') || 'light';
        this.setTheme(savedTheme);
        this.setupThemeToggle();
    },
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('igodi-theme', theme);
        
        // Update any theme-dependent elements
        this.updateThemeElements();
    },
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Track theme change
        trackEvent('theme_changed', { theme: newTheme });
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
        // Update any elements that need special handling in dark mode
        // This could include updating map markers, chart colors, etc.
        if (this.currentTheme === 'dark') {
            this.applyDarkModeSpecificStyles();
        } else {
            this.applyLightModeSpecificStyles();
        }
    },
    
    applyDarkModeSpecificStyles() {
        // Apply any JavaScript-controlled dark mode styles
        // For example, updating chart colors if you have any
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            mapPlaceholder.style.background = 'linear-gradient(45deg, #3a3a3a, #2d2d2d)';
        }
    },
    
    applyLightModeSpecificStyles() {
        // Apply any JavaScript-controlled light mode styles
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            mapPlaceholder.style.background = 'linear-gradient(45deg, #f0f2f5, #e1e8ed)';
        }
    }
};

// Add theme initialization to your existing initializeApp function
// Add this line inside your initializeApp() function:
// themeManager.init();

// Or if you prefer to initialize separately, add this to your DOMContentLoaded event:
document.addEventListener('DOMContentLoaded', function() {
    // ... your existing initialization code ...
    themeManager.init();
});

// Keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + T)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        themeManager.toggleTheme();
    }
});

// Update your existing window.iGodiApp object to include theme management
if (typeof window.iGodiApp !== 'undefined') {
    window.iGodiApp.themeManager = themeManager;
}

console.log('iGodi JavaScript loaded successfully');