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
    user: null,
    userLocation: null
};

// City coordinates mapping
const cityCoordinates = {
    'johannesburg': { lat: -26.2041, lng: 28.0473, region: 'Gauteng', name: 'Johannesburg' },
    'cape-town': { lat: -33.9249, lng: 18.4241, region: 'Western Cape', name: 'Cape Town' },
    'durban': { lat: -29.8587, lng: 31.0218, region: 'KwaZulu-Natal', name: 'Durban' },
    'pretoria': { lat: -25.7479, lng: 28.2293, region: 'Gauteng', name: 'Pretoria' },
    'port-elizabeth': { lat: -33.9580, lng: 25.6056, region: 'Eastern Cape', name: 'Port Elizabeth' },
    'bloemfontein': { lat: -29.0852, lng: 26.1596, region: 'Free State', name: 'Bloemfontein' },
    'east-london': { lat: -33.0153, lng: 27.9116, region: 'Eastern Cape', name: 'East London' },
    'pietermaritzburg': { lat: -29.6147, lng: 30.3926, region: 'KwaZulu-Natal', name: 'Pietermaritzburg' },
    'polokwane': { lat: -23.9045, lng: 29.4689, region: 'Limpopo', name: 'Polokwane' },
    'kimberley': { lat: -28.7282, lng: 24.7499, region: 'Northern Cape', name: 'Kimberley' },
    'rustenburg': { lat: -25.6672, lng: 27.2424, region: 'North West', name: 'Rustenburg' },
    'nelspruit': { lat: -25.4753, lng: 30.9700, region: 'Mpumalanga', name: 'Nelspruit' },
    'upington': { lat: -28.4478, lng: 21.2561, region: 'Northern Cape', name: 'Upington' },
    'mahikeng': { lat: -25.8601, lng: 25.6406, region: 'North West', name: 'Mahikeng' }
};

// Authentication check and initialization
function checkAuthenticationAndInitialize() {
    console.log('Checking authentication status...');
    
    const rememberedUser = localStorage.getItem('safecity-user');
    const userLocationData = localStorage.getItem('safecity-user-location');
    
    if (!rememberedUser) {
        console.log('No authenticated user found, redirecting to login...');
        window.location.href = 'auth.html';
        return false;
    }
    
    try {
        appState.user = JSON.parse(rememberedUser);
        
        if (userLocationData) {
            appState.userLocation = JSON.parse(userLocationData);
        } else if (appState.user.city && cityCoordinates[appState.user.city]) {
            appState.userLocation = {
                city: appState.user.city,
                coordinates: cityCoordinates[appState.user.city],
                displayName: cityCoordinates[appState.user.city].name
            };
        }
        
        console.log('User authenticated:', appState.user.first_name, appState.user.last_name);
        console.log('User location:', appState.userLocation?.displayName || 'Unknown');
        
        // Update UI with user info
        updateUserInterface();
        
        return true;
        
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('safecity-user');
        localStorage.removeItem('safecity-user-location');
        window.location.href = 'auth.html';
        return false;
    }
}

// Update UI with user information
function updateUserInterface() {
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userCity = document.getElementById('user-city');
    
    if (userInfo && appState.user) {
        userInfo.style.display = 'flex';
        
        if (userName) {
            userName.textContent = `${appState.user.first_name} ${appState.user.last_name}`;
        }
        
        if (userCity && appState.userLocation) {
            userCity.textContent = appState.userLocation.displayName;
        }
    }
    
    // Update location displays throughout the app
    updateLocationDisplays();
    
    // Update profile section
    updateProfileSection();
}

// Update location displays throughout the app
function updateLocationDisplays() {
    const mapCityDisplay = document.getElementById('map-city-display');
    const statsCityDisplay = document.getElementById('stats-city-display');
    const currentLocationDisplay = document.getElementById('current-location');
    
    const cityName = appState.userLocation?.displayName || 'Unknown City';
    
    if (mapCityDisplay) {
        mapCityDisplay.textContent = cityName;
    }
    
    if (statsCityDisplay) {
        statsCityDisplay.textContent = `Showing data for ${cityName}`;
    }
    
    if (currentLocationDisplay) {
        currentLocationDisplay.textContent = `Current Location: ${cityName}`;
    }
}

// Update profile section
function updateProfileSection() {
    if (!appState.user) return;
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileCity = document.getElementById('profile-city');
    const userTotalReports = document.getElementById('user-total-reports');
    const userUpvotesReceived = document.getElementById('user-upvotes-received');
    const userMemberSince = document.getElementById('user-member-since');
    
    if (profileName) {
        profileName.textContent = `${appState.user.first_name} ${appState.user.last_name}`;
    }
    
    if (profileEmail) {
        profileEmail.textContent = appState.user.email;
    }
    
    if (profileCity && appState.userLocation) {
        profileCity.textContent = appState.userLocation.displayName;
    }
    
    // Calculate user stats
    const userReports = appState.reports.filter(report => 
        report.user_id === appState.user.id || report.user_email === appState.user.email
    );
    const totalUpvotes = userReports.reduce((sum, report) => sum + (report.upvotes || 0), 0);
    
    if (userTotalReports) {
        userTotalReports.textContent = userReports.length;
    }
    
    if (userUpvotesReceived) {
        userUpvotesReceived.textContent = totalUpvotes;
    }
    
    if (userMemberSince && appState.user.created_at) {
        const memberDate = new Date(appState.user.created_at);
        userMemberSince.textContent = memberDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    // Update user reports list
    updateUserReportsList(userReports);
}

// Update user reports list in profile
function updateUserReportsList(userReports) {
    const userReportsList = document.getElementById('user-reports-list');
    if (!userReportsList) return;
    
    if (userReports.length === 0) {
        userReportsList.innerHTML = `
            <div class="no-reports-message">
                <i class="fas fa-clipboard-list"></i>
                <p>You haven't submitted any reports yet.</p>
                <p>Help make your community better by reporting infrastructure issues!</p>
            </div>
        `;
        return;
    }
    
    userReportsList.innerHTML = '';
    
    // Sort by date, most recent first
    const sortedReports = userReports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedReports.slice(0, 5).forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'user-report-item';
        
        reportItem.innerHTML = `
            <div class="report-icon">
                <i class="${getIssueTypeIcon(report.type)}"></i>
            </div>
            <div class="report-details">
                <h4>${formatReportTitle(report)}</h4>
                <p>${report.location.address}</p>
                <div class="report-meta">
                    <span class="report-date">
                        <i class="fas fa-clock"></i> ${formatDate(report.date)}
                    </span>
                    <span class="report-upvotes">
                        <i class="fas fa-arrow-up"></i> ${report.upvotes}
                    </span>
                    <span class="report-status ${report.status}">
                        ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                </div>
            </div>
        `;
        
        userReportsList.appendChild(reportItem);
    });
    
    if (sortedReports.length > 5) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'btn-secondary show-more-reports';
        showMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Show ${sortedReports.length - 5} More Reports`;
        showMoreBtn.onclick = () => showAllUserReports(sortedReports);
        userReportsList.appendChild(showMoreBtn);
    }
}

// Show all user reports
function showAllUserReports(allReports) {
    const userReportsList = document.getElementById('user-reports-list');
    if (!userReportsList) return;
    
    userReportsList.innerHTML = '';
    
    allReports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'user-report-item';
        
        reportItem.innerHTML = `
            <div class="report-icon">
                <i class="${getIssueTypeIcon(report.type)}"></i>
            </div>
            <div class="report-details">
                <h4>${formatReportTitle(report)}</h4>
                <p>${report.location.address}</p>
                <div class="report-meta">
                    <span class="report-date">
                        <i class="fas fa-clock"></i> ${formatDate(report.date)}
                    </span>
                    <span class="report-upvotes">
                        <i class="fas fa-arrow-up"></i> ${report.upvotes}
                    </span>
                    <span class="report-status ${report.status}">
                        ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                </div>
            </div>
        `;
        
        userReportsList.appendChild(reportItem);
    });
    
    const showLessBtn = document.createElement('button');
    showLessBtn.className = 'btn-secondary show-less-reports';
    showLessBtn.innerHTML = `<i class="fas fa-minus"></i> Show Less`;
    showLessBtn.onclick = () => updateUserReportsList(allReports);
    userReportsList.appendChild(showLessBtn);
}

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

// Enhanced report submission with user data
async function handleReportSubmission() {
    if (!appState.selectedIssueType) {
        alert('Please select an issue type');
        return;
    }
    
    if (!appState.user) {
        alert('Please log in to submit reports');
        return;
    }
    
    const location = getCurrentUserLocation();
    if (!location) {
        alert('Location is required. Please wait for location to be detected or update manually.');
        return;
    }
    
    showLoading('Submitting your report...');
    
    try {
        const newReport = {
            id: generateReportId(),
            type: appState.selectedIssueType,
            location: location,
            description: document.getElementById('description').value || `${formatReportTitle({type: appState.selectedIssueType})} reported by ${appState.user.first_name}`,
            photo: appState.uploadedPhoto,
            upvotes: 1,
            status: 'new',
            date: new Date(),
            user_id: appState.user.id,
            user_email: appState.user.email,
            user_name: `${appState.user.first_name} ${appState.user.last_name}`,
            user_city: appState.user.city
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
        if (appState.currentSection === 'profile') {
            updateProfileSection();
        }
        
        console.log('New report submitted by user:', appState.user.email, newReport);
        
    } catch (error) {
        console.error('Error saving report:', error);
        hideLoading();
        alert('Error submitting report. Please try again.');
    }
}

// Get current user location based on their city
function getCurrentUserLocation() {
    if (appState.userLocation && appState.userLocation.coordinates) {
        return {
            lat: appState.userLocation.coordinates.lat,
            lng: appState.userLocation.coordinates.lng,
            address: generateLocationAddress()
        };
    }
    
    // Fallback to browser geolocation if available
    if (appState.currentLocation) {
        return {
            ...appState.currentLocation,
            address: generateLocationAddress()
        };
    }
    
    return null;
}

// Replace your saveReportWithBackup function with this version:
async function saveReportWithBackup(newReport) {
    try {
        if (supabase) {
            // Only include columns that exist in your current table structure
            const reportData = {
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
                // Removed user fields that don't exist in your table
            };
            
            const { data, error } = await supabase
                .from('reports')
                .insert([reportData]);
                
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

// Filter reports by city
function filterReportsByCity(reports, userCity) {
    const userCityData = cityCoordinates[userCity];
    if (!userCityData) return reports;
    
    // Filter reports within a reasonable distance of the user's city
    const cityRadius = 0.5; // degrees (~55km)
    
    return reports.filter(report => {
        // If report has user_city, use exact match
        if (report.user_city) {
            return report.user_city === userCity;
        }
        
        // Otherwise, use geographic proximity
        const distance = Math.sqrt(
            Math.pow(report.location.lat - userCityData.lat, 2) +
            Math.pow(report.location.lng - userCityData.lng, 2)
        );
        
        return distance <= cityRadius;
    });
}

// Load data from Supabase with city filtering
// Alternative: Load ALL reports (no city filtering)
async function loadFromSupabase() {
    try {
        if (!supabase) return [];
        
        // Remove city filtering to load all reports
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('date', { ascending: false }); // Order by newest first
            
        if (error) {
            console.error('Error loading data from Supabase:', error);
            return [];
        }
        
        console.log('Raw Supabase data:', data); // Debug log
        
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
            date: new Date(item.date),
            user_id: item.user_id,
            user_email: item.user_email,
            user_name: item.user_name,
            user_city: item.user_city
        }));
        
        console.log(`Loaded ${processedReports.length} total reports from Supabase`);
        return processedReports;
        
    } catch (error) {
        console.error('Error loading from Supabase:', error);
        return [];
    }
}


// Sample data fallback
function loadSampleData() {
    console.log('Loading sample data...');
    const sampleLocation = appState.userLocation?.coordinates || { lat: -26.2041, lng: 28.0473 };
    const cityName = appState.userLocation?.displayName || 'Johannesburg';
    
    return [
        {
            id: 1001,
            type: 'pothole',
            location: { 
                lat: sampleLocation.lat + 0.01, 
                lng: sampleLocation.lng + 0.01, 
                address: `Main Road, ${cityName}` 
            },
            description: 'Large pothole causing traffic issues',
            photo: null,
            upvotes: 45,
            status: 'new',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            user_city: appState.user?.city || 'johannesburg'
        },
        {
            id: 1002,
            type: 'water',
            location: { 
                lat: sampleLocation.lat - 0.01, 
                lng: sampleLocation.lng + 0.02, 
                address: `Intersection, ${cityName}` 
            },
            description: 'Water leak at major intersection',
            photo: null,
            upvotes: 32,
            status: 'acknowledged',
            date: new Date(Date.now() - 5 * 60 * 60 * 1000),
            user_city: appState.user?.city || 'johannesburg'
        },
        {
            id: 1003,
            type: 'traffic',
            location: { 
                lat: sampleLocation.lat + 0.005, 
                lng: sampleLocation.lng - 0.01, 
                address: `Traffic Light, ${cityName}` 
            },
            description: 'Traffic light not working properly',
            photo: null,
            upvotes: 28,
            status: 'new',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            user_city: appState.user?.city || 'johannesburg'
        }
    ];
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthenticationAndInitialize()) {
        return; // Exit if not authenticated
    }
    
    initializeApp();
    themeManager.init();
});

// Single app initialization function
async function initializeApp() {
    console.log('Initializing SafeCity app...');
    
    const supabaseInitialized = initializeSupabase();
    
    try {
        if (supabaseInitialized) {
            // Load data exclusively from Supabase
            console.log('Attempting to load data from Supabase...');
            appState.reports = await loadFromSupabase();
        } else {
            // If Supabase isn't available, notify the user and use sample data
            console.log('Supabase not available. Loading sample data as a fallback.');
            appState.reports = loadSampleData();
        }
    } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // If the Supabase fetch fails, fall back to sample data
        console.log('Falling back to sample data due to an error.');
        appState.reports = loadSampleData();
    }

    // If Supabase returned no reports, load sample data for demonstration
    if (!appState.reports || appState.reports.length === 0) {
        console.log('No reports found in Supabase. Loading sample data.');
        appState.reports = loadSampleData();
    }
    
    setupNavigationListeners();
    setupReportFormListeners();
    setupMapListeners();
    setupModalListeners();
    setupUserMenuListeners();
    
    getCurrentLocation();
    
    showSection('map');
    
    console.log('SafeCity app initialized successfully with', appState.reports.length, 'reports');
}

// Setup user menu listeners
function setupUserMenuListeners() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const viewProfileBtn = document.getElementById('view-profile');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLogoutBtn = document.getElementById('profile-logout-btn');
    const changeCityBtn = document.getElementById('change-city-btn');
    
    // Toggle user dropdown
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });
    }
    
    // View profile
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('profile');
            
            // Update nav buttons
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(btn => btn.classList.remove('active'));
            const profileBtn = document.querySelector('[data-section="profile"]');
            if (profileBtn) profileBtn.classList.add('active');
            
            userDropdown.classList.remove('show');
        });
    }
    
    // Logout buttons
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', handleLogout);
    }
    
    // Change city button
    if (changeCityBtn) {
        changeCityBtn.addEventListener('click', showCityChangeModal);
    }
    
    // City change modal listeners
    setupCityChangeModal();
}

// Handle user logout
function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        // Clear stored session
        localStorage.removeItem('safecity-user');
        localStorage.removeItem('safecity-session');
        localStorage.removeItem('safecity-user-city');
        localStorage.removeItem('safecity-user-location');
        
        console.log('User logged out');
        
        // Redirect to login page
        window.location.href = 'auth.html';
    }
}

// Show city change modal
function showCityChangeModal() {
    const modal = document.getElementById('city-change-modal');
    const select = document.getElementById('new-city-select');
    
    if (modal && select) {
        // Set current city as selected
        if (appState.user && appState.user.city) {
            select.value = appState.user.city;
        }
        
        modal.style.display = 'flex';
    }
}

// Setup city change modal
function setupCityChangeModal() {
    const modal = document.getElementById('city-change-modal');
    const cancelBtn = document.getElementById('cancel-city-change');
    const confirmBtn = document.getElementById('confirm-city-change');
    const selectElement = document.getElementById('new-city-select');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (confirmBtn && selectElement) {
        confirmBtn.addEventListener('click', async function() {
            const newCity = selectElement.value;
            
            if (!newCity) {
                alert('Please select a city');
                return;
            }
            
            if (newCity === appState.user.city) {
                modal.style.display = 'none';
                return;
            }
            
            showLoading('Updating your city...');
            
            try {
                // Update user data
                await updateUserCity(newCity);
                
                // Update app state
                appState.user.city = newCity;
                appState.userLocation = {
                    city: newCity,
                    coordinates: cityCoordinates[newCity],
                    displayName: cityCoordinates[newCity].name
                };
                
                // Update stored session
                localStorage.setItem('safecity-user', JSON.stringify(appState.user));
                localStorage.setItem('safecity-user-location', JSON.stringify(appState.userLocation));
                
                // Reload data for new city
                await loadDataWithBackup();
                
                // Update UI
                updateUserInterface();
                
                if (appState.currentSection === 'map') {
                    renderMapMarkers();
                }
                if (appState.currentSection === 'stats') {
                    updateStatsView();
                }
                
                hideLoading();
                modal.style.display = 'none';
                
                alert(`City updated to ${cityCoordinates[newCity].name}!`);
                
            } catch (error) {
                console.error('Error updating city:', error);
                hideLoading();
                alert('Error updating city. Please try again.');
            }
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Update user city in database
async function updateUserCity(newCity) {
    try {
        if (supabase && appState.user) {
            const { error } = await supabase
                .from('users')
                .update({ 
                    city: newCity,
                    updated_at: new Date().toISOString()
                })
                .eq('id', appState.user.id);
            
            if (error) {
                console.error('Error updating user city in Supabase:', error);
                throw error;
            }
            
            console.log('User city updated in Supabase');
        }
    } catch (error) {
        console.error('Error updating user city:', error);
        throw error;
    }
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
        } else if (sectionName === 'profile') {
            updateProfileSection();
        }
    }
}

// Location Functions
function getCurrentLocation() {
    const locationDisplay = document.getElementById('current-location');
    
    if (navigator.geolocation) {
        if (locationDisplay) {
            locationDisplay.textContent = 'Getting your location...';
        }
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                appState.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                const cityName = appState.userLocation?.displayName || 'your location';
                if (locationDisplay) {
                    locationDisplay.textContent = `Current Location: ${cityName}`;
                }
            },
            function(error) {
                console.error('Error getting location:', error);
                const cityName = appState.userLocation?.displayName || 'Johannesburg';
                
                if (locationDisplay) {
                    locationDisplay.textContent = `Location: ${cityName}`;
                }
                
                // Use user's city coordinates as fallback
                if (appState.userLocation?.coordinates) {
                    appState.currentLocation = {
                        lat: appState.userLocation.coordinates.lat,
                        lng: appState.userLocation.coordinates.lng
                    };
                } else {
                    appState.currentLocation = {
                        lat: -26.2041,
                        lng: 28.0473
                    };
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } else {
        const cityName = appState.userLocation?.displayName || 'your city';
        if (locationDisplay) {
            locationDisplay.textContent = `Location: ${cityName}`;
        }
        
        if (appState.userLocation?.coordinates) {
            appState.currentLocation = {
                lat: appState.userLocation.coordinates.lat,
                lng: appState.userLocation.coordinates.lng
            };
        } else {
            appState.currentLocation = {
                lat: -26.2041,
                lng: 28.0473
            };
        }
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
    const cityName = appState.userLocation?.displayName || 'Johannesburg';
    
    const areas = {
        'Johannesburg': ['Sandton', 'Rosebank', 'Melville', 'Braamfontein', 'Parktown'],
        'Cape Town': ['CBD', 'Camps Bay', 'Clifton', 'Green Point', 'Sea Point'],
        'Durban': ['CBD', 'Umhlanga', 'Glenwood', 'Morningside', 'Berea'],
        'Pretoria': ['CBD', 'Hatfield', 'Brooklyn', 'Menlyn', 'Centurion']
    };
    
    const cityAreas = areas[cityName] || areas['Johannesburg'];
    const randomArea = cityAreas[Math.floor(Math.random() * cityAreas.length)];
    
    return `Current Location, ${randomArea}, ${cityName}`;
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
    
    if (topReports.length === 0) {
        issueList.innerHTML = `
            <div class="no-issues-message">
                <i class="fas fa-clipboard-list"></i>
                <p>No reports found for ${appState.userLocation?.displayName || 'your city'}.</p>
                <p>Be the first to report an infrastructure issue!</p>
            </div>
        `;
        return;
    }
    
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

// Generate CSV content
function generateCSVContent(reports) {
    const headers = ['id', 'type', 'lat', 'lng', 'address', 'description', 'upvotes', 'status', 'date', 'photo', 'user_id', 'user_email', 'user_name', 'user_city'];
    
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
            report.photo || '',
            report.user_id || '',
            report.user_email || '',
            report.user_name || '',
            report.user_city || ''
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
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
function showLoading(message = 'Processing...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
    
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
        
        // Update in database if available
        updateReportUpvotes(reportId, report.upvotes);
        
        if (appState.currentSection === 'map') {
            renderMapMarkers();
        }
        if (appState.currentSection === 'stats') {
            updateStatsView();
        }
        
        console.log(`Upvoted report ${reportId}, new total: ${report.upvotes}`);
    }
}

// Update report upvotes in database
async function updateReportUpvotes(reportId, newUpvoteCount) {
    try {
        if (supabase) {
            const { error } = await supabase
                .from('reports')
                .update({ upvotes: newUpvoteCount })
                .eq('id', reportId);
            
            if (error) {
                console.error('Error updating upvotes in Supabase:', error);
            }
        }
        
        // Also update localStorage
        const localReports = JSON.parse(localStorage.getItem('safecity-reports') || '[]');
        const reportIndex = localReports.findIndex(r => r.id === reportId);
        if (reportIndex !== -1) {
            localReports[reportIndex].upvotes = newUpvoteCount;
            localStorage.setItem('safecity-reports', JSON.stringify(localReports));
        }
        
    } catch (error) {
        console.error('Error updating upvotes:', error);
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
    a.download = `safecity-reports-${appState.userLocation?.city || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
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
            date: new Date(),
            user_id: appState.user?.id,
            user_email: appState.user?.email,
            user_name: appState.user ? `${appState.user.first_name} ${appState.user.last_name}` : null,
            user_city: appState.user?.city
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
            if (appState.currentSection === 'profile') {
                updateProfileSection();
            }
        }
    },
    renderMarkers: renderMapMarkers,
    addUpvote: addUpvote,
    downloadCSV: downloadReportsAsCSV,
    getCurrentUser: function() {
        return appState.user;
    },
    getUserLocation: function() {
        return appState.userLocation;
    },
    logout: handleLogout
};

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('map');
                document.querySelector('[data-section="map"]').click();
                break;
            case '2':
                e.preventDefault();
                showSection('report');
                document.querySelector('[data-section="report"]').click();
                break;
            case '3':
                e.preventDefault();
                showSection('stats');
                document.querySelector('[data-section="stats"]').click();
                break;
            case '4':
                e.preventDefault();
                showSection('profile');
                document.querySelector('[data-section="profile"]').click();
                break;
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        themeManager.toggleTheme();
    }
    
    if (e.key === 'Escape') {
        hideMobileIssueModal();
        
        // Close any open modals
        const cityModal = document.getElementById('city-change-modal');
        if (cityModal && cityModal.style.display === 'flex') {
            cityModal.style.display = 'none';
        }
        
        const successModal = document.getElementById('success-modal');
        if (successModal && successModal.classList.contains('show')) {
            hideSuccessModal();
        }
        
        // Close user dropdown
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown && userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
        }
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

// Online/offline status handling
window.addEventListener('online', function() {
    console.log('Connection restored');
    // Attempt to sync any pending data when back online
    if (supabase && appState.reports.length > 0) {
        console.log('Attempting to sync data...');
        // You could implement sync logic here
    }
});

window.addEventListener('offline', function() {
    console.log('Connection lost - working in offline mode');
});

// Beforeunload handler to save any unsaved data
window.addEventListener('beforeunload', function(e) {
    // Save any unsaved form data
    const description = document.getElementById('description');
    const selectedIssueType = appState.selectedIssueType;
    
    if (description && description.value.trim() && selectedIssueType) {
        const unsavedData = {
            description: description.value,
            issueType: selectedIssueType,
            photo: appState.uploadedPhoto,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('safecity-unsaved-report', JSON.stringify(unsavedData));
    }
});

// Load any unsaved data on page load
function loadUnsavedReport() {
    try {
        const unsavedData = localStorage.getItem('safecity-unsaved-report');
        if (unsavedData) {
            const data = JSON.parse(unsavedData);
            const timeDiff = new Date().getTime() - data.timestamp;
            
            // Only restore if less than 1 hour old
            if (timeDiff < 60 * 60 * 1000) {
                const description = document.getElementById('description');
                if (description) {
                    description.value = data.description;
                }
                
                appState.selectedIssueType = data.issueType;
                const issueTypeBtn = document.querySelector(`[data-type="${data.issueType}"]`);
                if (issueTypeBtn) {
                    issueTypeBtn.classList.add('selected');
                }
                
                if (data.photo) {
                    appState.uploadedPhoto = data.photo;
                    const previewImage = document.getElementById('preview-image');
                    const photoPreview = document.getElementById('photo-preview');
                    if (previewImage && photoPreview) {
                        previewImage.src = data.photo;
                        photoPreview.style.display = 'block';
                    }
                }
                
                console.log('Restored unsaved report data');
            }
            
            localStorage.removeItem('safecity-unsaved-report');
        }
    } catch (error) {
        console.error('Error loading unsaved report:', error);
        localStorage.removeItem('safecity-unsaved-report');
    }
}

// Load unsaved data after initialization
setTimeout(loadUnsavedReport, 500);

// Utility Functions
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
        }
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
        return date.toLocaleDateString();
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

// Performance monitoring
function logPerformance(label) {
    if (performance && performance.now) {
        const timestamp = performance.now();
        console.log(`Performance: ${label} - ${timestamp.toFixed(2)}ms`);
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('SafeCity App Error:', e.error);
    
    // You could implement error reporting here
    if (e.error && e.error.message) {
        console.error('Error details:', {
            message: e.error.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            stack: e.error.stack
        });
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    e.preventDefault(); // Prevent the default browser behavior
});


// App version and update checking
const APP_VERSION = '1.2.0';
console.log(`SafeCity App v${APP_VERSION} loaded successfully`);

// Check for updates (simple version)
function checkForUpdates() {
    const lastVersion = localStorage.getItem('safecity-version');
    if (lastVersion && lastVersion !== APP_VERSION) {
        console.log(`App updated from ${lastVersion} to ${APP_VERSION}`);
        // You could show an update notification here
        
        // Clear old cache if needed
        if (lastVersion < '1.2.0') {
            console.log('Clearing old cache data');
            // Clear old localStorage keys if schema changed
        }
    }
    localStorage.setItem('safecity-version', APP_VERSION);
}

checkForUpdates();

console.log('SafeCity JavaScript with enhanced authentication, user management, and city filtering initialized successfully');