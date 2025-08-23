// Application State
const appState = {
    currentSection: 'map',
    currentLocation: null,
    selectedIssueType: null,
    uploadedPhoto: null,
    reports: [],
    currentFilter: 'all',
    dataSource: 'csv' // 'csv', 'firebase', 'supabase', etc.
};

// Data loading functions
async function loadDataFromCSV() {
    try {
        console.log('Loading data from CSV...');
        const response = await fetch('data/issues_data.csv');
        const csvText = await response.text();
        
        const reports = parseCSVData(csvText);
        appState.reports = reports;
        
        console.log(`Loaded ${reports.length} reports from CSV`);
        return reports;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        // Fallback to sample data
        return loadSampleData();
    }
}

function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const reports = [];
    
    console.log('CSV Headers:', headers); // Debug log
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = parseCSVLine(lines[i]);
        
        if (values.length >= 8) { // At least 8 required columns
            const report = {
                id: parseInt(values[0]) || Date.now() + i,
                type: (values[1] || '').toLowerCase().trim(),
                location: {
                    lat: parseFloat(values[2]) || -26.2041,
                    lng: parseFloat(values[3]) || 28.0473,
                    address: cleanString(values[4]) || 'Unknown Location'
                },
                description: cleanString(values[5]) || 'No description provided',
                upvotes: parseInt(values[6]) || 0,
                status: (values[7] || 'new').toLowerCase().trim(),
                date: parseDate(values[8]) || new Date(),
                photo: values[9] || null
            };
            
            console.log(`Parsed report ${i}:`, { 
                id: report.id, 
                type: report.type, 
                upvotes: report.upvotes,
                rawUpvotes: values[6]
            }); // Debug log
            reports.push(report);
        } else {
            console.warn(`Row ${i} has insufficient columns (${values.length}):`, values);
        }
    }
    
    return reports;
}

// Helper function to properly parse CSV lines with quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Helper function to clean strings (remove quotes, trim)
function cleanString(str) {
    if (!str) return '';
    return str.replace(/^["']|["']$/g, '').trim();
}

// Helper function to parse dates with fallback
function parseDate(dateStr) {
    if (!dateStr) return new Date();
    
    const parsed = new Date(cleanString(dateStr));
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function saveReportToCSV(newReport) {
    // Note: Direct CSV saving from browser requires server-side support
    // For now, we'll just add to memory and log for server implementation
    console.log('New report to save to CSV:', newReport);
    
    // In a real implementation, you'd send this to your server:
    // await fetch('/api/save-report', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newReport)
    // });
    
    // For demo, just add to current session
    appState.reports.push(newReport);
    
    return newReport;
}

// Sample data fallback
function loadSampleData() {
    return [
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    themeManager.init(); // Initialize theme management
});

async function initializeApp() {
    console.log('Initializing SafeCity app...');
    
    // Load data based on configuration
    try {
        if (appState.dataSource === 'csv') {
            await loadDataFromCSV();
        } else {
            // Fallback to sample data
            appState.reports = loadSampleData();
        }
    } catch (error) {
        console.error('Error initializing data:', error);
        appState.reports = loadSampleData();
    }
    
    // Set up event listeners
    setupNavigationListeners();
    setupReportFormListeners();
    setupMapListeners();
    setupModalListeners();
    
    // Initialize location
    getCurrentLocation();
    
    // Show initial section and render markers
    showSection('map');
    
    console.log('SafeCity app initialized successfully with', appState.reports.length, 'reports');
}

// Enhanced report submission with data persistence
async function handleReportSubmission() {
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
    
    try {
        // Save report (this will depend on your chosen backend)
        await saveReportToCSV(newReport);
        
        // Reset form
        resetReportForm();
        
        // Hide loading and show success
        hideLoading();
        showSuccessModal(newReport.id);
        
        // Refresh the map with new data
        await refreshMapData();
        
        // Update stats if on stats page
        if (appState.currentSection === 'stats') {
            updateStatsView();
        }
        
        console.log('New report submitted and saved:', newReport);
    } catch (error) {
        console.error('Error saving report:', error);
        hideLoading();
        alert('Error submitting report. Please try again.');
    }
}

// Function to refresh map data after new submission
async function refreshMapData() {
    if (appState.dataSource === 'csv') {
        // Reload from CSV file to get any new data
        await loadDataFromCSV();
    }
    
    // Re-render markers with updated data
    if (appState.currentSection === 'map') {
        renderMapMarkers();
    }
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

// Map marker rendering
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
    const seed = reportId % 1000;
    const baseTop = 20 + (seed % 60);
    const baseLeft = 15 + ((seed * 7) % 70);
    
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
    const getLocationBtn = document.getElementById('get-location');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    const issueTypes = document.querySelectorAll('.issue-type');
    issueTypes.forEach(button => {
        button.addEventListener('click', function() {
            issueTypes.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            appState.selectedIssueType = this.getAttribute('data-type');
        });
    });
    
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
    
    const submitBtn = document.getElementById('submit-report');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleReportSubmission);
    }
}

function generateLocationAddress() {
    const johannesburgAreas = [
        'Sandton', 'Rosebank', 'Melville', 'Braamfontein', 'Parktown',
        'Houghton', 'Hyde Park', 'Randburg', 'Fourways', 'Midrand'
    ];
    
    const randomArea = johannesburgAreas[Math.floor(Math.random() * johannesburgAreas.length)];
    return `Current Location, ${randomArea}, Johannesburg`;
}

function resetReportForm() {
    const issueTypes = document.querySelectorAll('.issue-type');
    issueTypes.forEach(btn => btn.classList.remove('selected'));
    appState.selectedIssueType = null;
    
    const photoPreview = document.getElementById('photo-preview');
    const photoInput = document.getElementById('photo-input');
    photoPreview.style.display = 'none';
    photoInput.value = '';
    appState.uploadedPhoto = null;
    
    document.getElementById('description').value = '';
}

// Map Functions
function setupMapListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            appState.currentFilter = this.getAttribute('data-filter');
            renderMapMarkers();
        });
    });
}

function showIssueDetails(report) {
    const details = `
Issue Details:
────────────────────────────────────────
Type: ${formatReportTitle(report)}
Location: ${report.location.address}
Description: ${report.description}
Reported: ${formatDate(report.date)}
Upvotes: ${report.upvotes}
Status: ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
Report ID: #${report.id}
────────────────────────────────────────`;
    
    alert(details);
}

// Stats Functions
function updateStatsView() {
    const stats = calculateStats();
    
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        const totalReportsCard = statCards[0].querySelector('.stat-info h3');
        if (totalReportsCard) {
            totalReportsCard.textContent = stats.totalReports;
        }
        
        const resolvedCard = statCards[1].querySelector('.stat-info h3');
        if (resolvedCard) {
            resolvedCard.textContent = stats.resolvedReports;
        }
        
        const avgTimeCard = statCards[2].querySelector('.stat-info h3');
        if (avgTimeCard) {
            avgTimeCard.textContent = stats.averageFixTime;
        }
        
        const activeUsersCard = statCards[3].querySelector('.stat-info h3');
        if (activeUsersCard) {
            activeUsersCard.textContent = stats.activeUsers;
        }
    }
    
    updateTopIssuesList();
    console.log('Updated stats:', stats);
}

function updateTopIssuesList() {
    const issueList = document.querySelector('.issue-list');
    if (!issueList) return;
    
    const topReports = appState.reports
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 3);
    
    issueList.innerHTML = '';
    
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
    const averageFixTime = 12;
    const activeUsers = Math.max(1234 + (totalReports * 5), 1234);
    
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

// Theme Management
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
    renderMarkers: renderMapMarkers,
    addUpvote: addUpvote
};

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

// Error handling
window.addEventListener('error', function(e) {
    console.error('SafeCity App Error:', e.error);
});

console.log('SafeCity JavaScript with CSV data loading and theme management initialized successfully');