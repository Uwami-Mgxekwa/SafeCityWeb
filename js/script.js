let supabase; 

// Function to initialize Supabase
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        const SUPABASE_URL = 'https://cifsceqaulhzhkvlgsla.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZnNjZXFhdWxoemhrdmxnc2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NDQxMzMsImV4cCI6MjA3MTUyMDEzM30.ywt4tUbKXMemF1FjJwKh4td46RqayaK4wJKYRfEw3RQ';
        
        if (!supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase initialized successfully');
        }
        return true;
    }
    return false;
}

// Application State
const appState = {
    currentSection: 'map',
    currentLocation: null,
    selectedIssueType: null,
    uploadedPhoto: null,
    reports: [],
    currentFilter: 'all',
    dataSource: 'csv'
};

// Enhanced marker positioning
function generateMarkerPosition(reportId, index) {
    const mapWidth = 100;
    const mapHeight = 100;
    const seed = reportId % 10000;
    const gridSize = Math.ceil(Math.sqrt(appState.reports.length)) || 1;
    const gridX = (index % gridSize) * (mapWidth / gridSize);
    const gridY = Math.floor(index / gridSize) * (mapHeight / gridSize);
    const randomOffsetX = (seed % 20) - 10;
    const randomOffsetY = ((seed * 7) % 20) - 10;
    const finalX = Math.max(5, Math.min(85, gridX + randomOffsetX));
    const finalY = Math.max(5, Math.min(85, gridY + randomOffsetY));
    
    return { top: `${finalY}%`, left: `${finalX}%` };
}

// Enhanced marker creation
function createMarkerElement(report, index) {
    const marker = document.createElement('div');
    marker.className = `marker ${report.type}`;
    marker.setAttribute('data-issue', report.type);
    marker.setAttribute('data-report-id', report.id);
    
    const position = generateMarkerPosition(report.id, index);
    marker.style.top = position.top;
    marker.style.left = position.left;
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        marker.style.width = '35px';
        marker.style.height = '35px';
        marker.style.fontSize = '14px';
    }
    
    const icon = document.createElement('i');
    icon.className = getIssueTypeIcon(report.type);
    marker.appendChild(icon);
    
    const markerInfo = createMobileOptimizedMarkerInfo(report);
    marker.appendChild(markerInfo);
    
    addMobileInteractions(marker, report);
    
    return marker;
}

// Mobile-optimized marker info
function createMobileOptimizedMarkerInfo(report) {
    const markerInfo = document.createElement('div');
    markerInfo.className = 'marker-info';
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        markerInfo.style.minWidth = '180px';
        markerInfo.style.fontSize = '12px';
        markerInfo.style.bottom = '45px';
    }
    
    const title = document.createElement('h4');
    title.textContent = formatReportTitle(report);
    title.style.fontSize = isMobile ? '13px' : '14px';
    markerInfo.appendChild(title);
    
    const timeAgo = document.createElement('p');
    timeAgo.textContent = formatDate(report.date);
    markerInfo.appendChild(timeAgo);
    
    const upvotes = document.createElement('p');
    upvotes.innerHTML = `<i class="fas fa-arrow-up"></i> ${report.upvotes}`;
    markerInfo.appendChild(upvotes);
    
    const status = document.createElement('p');
    status.textContent = report.status.charAt(0).toUpperCase() + report.status.slice(1);
    status.style.color = getStatusColor(report.status);
    status.style.fontWeight = 'bold';
    markerInfo.appendChild(status);
    
    if (isMobile) {
        const tapHint = document.createElement('p');
        tapHint.textContent = 'Tap for details';
        tapHint.style.fontSize = '10px';
        tapHint.style.fontStyle = 'italic';
        tapHint.style.color = '#999';
        markerInfo.appendChild(tapHint);
    }
    
    return markerInfo;
}

// Enhanced mobile interactions
function addMobileInteractions(marker, report) {
    let touchStartTime = 0;
    
    marker.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        this.style.transform = 'scale(1.1)';
        this.style.zIndex = '100';
    });
    
    marker.addEventListener('touchend', function(e) {
        e.preventDefault();
        const touchDuration = Date.now() - touchStartTime;
        
        if (touchDuration < 300) {
            showMobileIssueDetails(report);
        }
        
        this.style.transform = 'scale(1)';
        this.style.zIndex = '10';
    });
    
    marker.addEventListener('click', function(e) {
        e.stopPropagation();
        showMobileIssueDetails(report);
    });
    
    marker.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
            this.style.transform = 'scale(1.2)';
            this.style.zIndex = '100';
        }
    });
    
    marker.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            this.style.transform = 'scale(1)';
            this.style.zIndex = '10';
        }
    });
}

// Mobile-optimized issue details
function showMobileIssueDetails(report) {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        showMobileIssueModal(report);
    } else {
        const details = `
Issue: ${formatReportTitle(report)}
Location: ${report.location.address}
Description: ${report.description}
Reported: ${formatDate(report.date)}
Upvotes: ${report.upvotes}
Status: ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
Report ID: #${report.id}`;
        alert(details);
    }
}

// Mobile modal
function showMobileIssueModal(report) {
    const existingModal = document.getElementById('mobile-issue-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'mobile-issue-modal';
    modal.className = 'mobile-issue-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'mobile-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'mobile-modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'mobile-modal-title';
    modalTitle.textContent = formatReportTitle(report);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'mobile-modal-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.onclick = () => hideMobileIssueModal();
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'mobile-modal-body';
    
    const locationSection = document.createElement('div');
    locationSection.className = 'mobile-modal-section';
    locationSection.innerHTML = `
        <h4>Location</h4>
        <p><i class="fas fa-map-marker-alt"></i> ${report.location.address}</p>
    `;
    
    const descriptionSection = document.createElement('div');
    descriptionSection.className = 'mobile-modal-section';
    descriptionSection.innerHTML = `
        <h4>Description</h4>
        <p>${report.description}</p>
    `;
    
    const statusSection = document.createElement('div');
    statusSection.className = 'mobile-modal-section';
    const statusBadge = document.createElement('span');
    statusBadge.className = `mobile-status-badge ${report.status}`;
    statusBadge.textContent = report.status.charAt(0).toUpperCase() + report.status.slice(1);
    
    statusSection.innerHTML = '<h4>Status</h4>';
    statusSection.appendChild(statusBadge);
    
    const timeSection = document.createElement('div');
    timeSection.className = 'mobile-modal-section';
    timeSection.innerHTML = `
        <h4>Reported</h4>
        <p><i class="fas fa-clock"></i> ${formatDate(report.date)}</p>
    `;
    
    const upvoteSection = document.createElement('div');
    upvoteSection.className = 'mobile-upvote-section';
    
    const upvoteCount = document.createElement('div');
    upvoteCount.className = 'mobile-upvote-count';
    upvoteCount.textContent = `${report.upvotes} upvotes`;
    
    const upvoteButton = document.createElement('button');
    upvoteButton.className = 'mobile-upvote-btn';
    upvoteButton.innerHTML = '<i class="fas fa-arrow-up"></i> Upvote This Issue';
    upvoteButton.onclick = () => {
        addUpvote(report.id);
        upvoteCount.textContent = `${report.upvotes} upvotes`;
    };
    
    upvoteSection.appendChild(upvoteCount);
    upvoteSection.appendChild(upvoteButton);
    
    const reportIdSection = document.createElement('div');
    reportIdSection.className = 'mobile-modal-section';
    reportIdSection.innerHTML = `
        <h4>Report ID</h4>
        <p>#${report.id}</p>
    `;
    
    modalBody.appendChild(locationSection);
    modalBody.appendChild(descriptionSection);
    modalBody.appendChild(statusSection);
    modalBody.appendChild(timeSection);
    modalBody.appendChild(upvoteSection);
    modalBody.appendChild(reportIdSection);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideMobileIssueModal();
        }
    });
}

function hideMobileIssueModal() {
    const modal = document.getElementById('mobile-issue-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Enhanced report submission
async function handleReportSubmission() {
    if (!appState.selectedIssueType) {
        alert('Please select an issue type');
        return;
    }
    
    if (!appState.currentLocation) {
        alert('Location is required. Please wait for location to be detected or update manually.');
        return;
    }
    
    showLoading();
    
    try {
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
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await saveReportWithBackup(newReport);
        
        appState.reports.push(newReport);
        
        resetReportForm();
        
        hideLoading();
        showSuccessModal(newReport.id);
        
        if (appState.currentSection === 'map') {
            renderMapMarkers();
        }
        if (appState.currentSection === 'stats') {
            updateStatsView();
        }
        
        console.log('New report submitted:', newReport);
        
    } catch (error) {
        console.error('Error saving report:', error);
        hideLoading();
        alert('Error submitting report. Please try again.');
    }
}

// Enhanced save function with Supabase support
async function saveReportWithBackup(newReport) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('reports')
                .insert([
                    {
                        id: newReport.id,
                        type: newReport.type,
                        lat: newReport.location.lat,
                        lng: newReport.location.lng,
                        address: newReport.location.address,
                        description: newReport.description,
                        photo: newReport.photo,
                        upvotes: newReport.upvotes,
                        status: newReport.status,
                        date: newReport.date.toISOString()
                    }
                ]);
                
            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }
            
            console.log('Report saved to Supabase:', data);
            return newReport;
        }
        
        // Fallback to localStorage if Supabase not available
        const reportForStorage = {
            ...newReport,
            date: newReport.date.toISOString()
        };
        
        const existingReports = JSON.parse(localStorage.getItem('safecity-reports') || '[]');
        existingReports.push(reportForStorage);
        localStorage.setItem('safecity-reports', JSON.stringify(existingReports));
        
        console.log('Report saved to localStorage');
        return newReport;
        
    } catch (error) {
        console.error('Error saving report:', error);
        throw error;
    }
}

// Generate CSV content
function generateCSVContent(reports) {
    const headers = ['id', 'type', 'lat', 'lng', 'address', 'description', 'upvotes', 'status', 'date', 'photo'];
    
    const csvRows = [headers.join(',')];
    
    reports.forEach(report => {
        let dateValue;
        if (report.date instanceof Date) {
            dateValue = report.date.toISOString();
        } else if (typeof report.date === 'string') {
            dateValue = report.date;
        } else {
            dateValue = new Date().toISOString();
        }
        
        const row = [
            report.id,
            report.type,
            report.location.lat,
            report.location.lng,
            `"${report.location.address.replace(/"/g, '""')}"`,
            `"${report.description.replace(/"/g, '""')}"`,
            report.upvotes,
            report.status,
            dateValue,
            report.photo || ''
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Load data with fallback
async function loadDataWithBackup() {
    try {
        console.log('Loading data from CSV...');
        const response = await fetch('data/issues_data.csv');
        
        if (response.ok) {
            const csvText = await response.text();
            const csvReports = parseCSVData(csvText);
            
            const localReports = JSON.parse(localStorage.getItem('safecity-reports') || '[]');
            
            localReports.forEach(localReport => {
                localReport.date = new Date(localReport.date);
            });
            
            const allReports = [...csvReports];
            localReports.forEach(localReport => {
                if (!allReports.find(r => r.id === localReport.id)) {
                    allReports.push(localReport);
                }
            });
            
            appState.reports = allReports;
            console.log(`Loaded ${allReports.length} reports (${csvReports.length} from CSV, ${localReports.length} from localStorage)`);
            
            return allReports;
        }
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
    
    try {
        const localReports = JSON.parse(localStorage.getItem('safecity-reports') || '[]');
        localReports.forEach(report => {
            report.date = new Date(report.date);
        });
        
        if (localReports.length > 0) {
            appState.reports = localReports;
            console.log(`Loaded ${localReports.length} reports from localStorage`);
            return localReports;
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    
    return loadSampleData();
}

// Render map markers
function renderMapMarkers() {
    const markersContainer = document.querySelector('.sample-markers');
    if (!markersContainer) return;
    
    markersContainer.innerHTML = '';
    
    const filteredReports = getFilteredReports();
    
    filteredReports.sort((a, b) => b.upvotes - a.upvotes);
    
    filteredReports.forEach((report, index) => {
        const marker = createMarkerElement(report, index);
        markersContainer.appendChild(marker);
    });
    
    console.log(`Rendered ${filteredReports.length} markers for filter: ${appState.currentFilter}`);
}

// Load data from Supabase
async function loadFromSupabase() {
    try {
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('reports')
            .select('*');
            
        if (error) {
            console.error('Error loading data from Supabase:', error);
            return [];
        }
        
        const processedReports = data.map(item => ({
            id: item.id,
            type: item.type,
            location: {
                lat: item.lat,
                lng: item.lng,
                address: item.address
            },
            description: item.description,
            photo: item.photo,
            upvotes: item.upvotes,
            status: item.status,
            date: new Date(item.date)
        }));
        
        console.log(`Loaded ${processedReports.length} reports from Supabase`);
        return processedReports;
        
    } catch (error) {
        console.error('Error loading from Supabase:', error);
        return [];
    }
}

// Parse CSV data
function parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const reports = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = parseCSVLine(lines[i]);
        
        if (values.length >= 8) {
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
            
            reports.push(report);
        }
    }
    
    return reports;
}

// Helper functions for CSV parsing
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

function cleanString(str) {
    if (!str) return '';
    return str.replace(/^["']|["']$/g, '').trim();
}

function parseDate(dateStr) {
    if (!dateStr) return new Date();
    
    const parsed = new Date(cleanString(dateStr));
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

// Sample data fallback
function loadSampleData() {
    console.log('Loading sample data...');
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
    themeManager.init();
});

// Single app initialization function
async function initializeApp() {
    console.log('Initializing SafeCity app...');
    
    const supabaseInitialized = initializeSupabase();
    
    try {
        if (supabaseInitialized) {
            const supabaseReports = await loadFromSupabase();
            if (supabaseReports.length > 0) {
                appState.reports = supabaseReports;
            } else {
                await loadDataWithBackup();
            }
        } else {
            console.log('Supabase not available, using fallback data source');
            await loadDataWithBackup();
        }
    } catch (error) {
        console.error('Error initializing data:', error);
        appState.reports = loadSampleData();
    }
    
    setupNavigationListeners();
    setupReportFormListeners();
    setupMapListeners();
    setupModalListeners();
    
    getCurrentLocation();
    
    showSection('map');
    
    console.log('SafeCity app initialized successfully with', appState.reports.length, 'reports');
}

// Navigation Functions
function setupNavigationListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        appState.currentSection = sectionName;
        
        if (sectionName === 'map') {
            renderMapMarkers();
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
    if (photoPreview) photoPreview.style.display = 'none';
    if (photoInput) photoInput.value = '';
    appState.uploadedPhoto = null;
    
    const descriptionField = document.getElementById('description');
    if (descriptionField) descriptionField.value = '';
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

// Export function to download reports as CSV
function downloadReportsAsCSV() {
    const csvContent = generateCSVContent(appState.reports);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `safecity-reports-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Export functions for integration
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
            
            if (appState.currentSection === 'map') {
                renderMapMarkers();
            }
            if (appState.currentSection === 'stats') {
                updateStatsView();
            }
        }
    },
    renderMarkers: renderMapMarkers,
    addUpvote: addUpvote,
    downloadCSV: downloadReportsAsCSV
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
    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        themeManager.toggleTheme();
    }
    
    if (e.key === 'Escape') {
        hideMobileIssueModal();
    }
});

// Window resize handler
window.addEventListener('resize', function() {
    if (appState.currentSection === 'map') {
        setTimeout(() => {
            renderMapMarkers();
        }, 100);
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
        drainage: 'fas fa-water',
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

console.log('SafeCity JavaScript with enhanced mobile UX, CSV persistence, and theme management initialized successfully');