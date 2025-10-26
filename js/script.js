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

    // Check for persistent session (remember me)
    const rememberedUser = localStorage.getItem('safecity-user');
    const userLocationData = localStorage.getItem('safecity-user-location');

    // Check for temporary session (current session only)
    const tempUser = sessionStorage.getItem('safecity-temp-user');
    const tempSession = sessionStorage.getItem('safecity-temp-session');

    let userData = null;

    if (rememberedUser) {
        userData = rememberedUser;
        console.log('Found persistent user session');
    } else if (tempUser && tempSession) {
        userData = tempUser;
        console.log('Found temporary user session');
    } else {
        console.log('No authenticated user found, redirecting to login...');
        window.location.href = 'auth.html';
        return false;
    }

    try {
        appState.user = JSON.parse(userData);

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
        // Clear both persistent and temporary sessions
        localStorage.removeItem('safecity-user');
        localStorage.removeItem('safecity-user-location');
        sessionStorage.removeItem('safecity-temp-user');
        sessionStorage.removeItem('safecity-temp-session');
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
async function updateProfileSection() {
    if (!appState.user) return;

    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileCity = document.getElementById('profile-city');
    const userTotalReports = document.getElementById('user-total-reports');
    const userUpvotesReceived = document.getElementById('user-upvotes-received');
    const userMemberSince = document.getElementById('user-member-since');

    // Update basic profile info
    if (profileName) {
        profileName.textContent = `${appState.user.first_name} ${appState.user.last_name}`;
    }

    if (profileEmail) {
        profileEmail.textContent = appState.user.email;
    }

    if (profileCity && appState.userLocation) {
        profileCity.textContent = appState.userLocation.displayName;
    }

    // Show loading state
    if (userTotalReports) {
        userTotalReports.textContent = '...';
    }
    if (userUpvotesReceived) {
        userUpvotesReceived.textContent = '...';
    }

    try {
        // Only fetch from Supabase if it's available and initialized
        if (supabase && appState.user) {
            const userStats = await fetchUserStatistics();

            // Update stats with real data
            if (userTotalReports) {
                userTotalReports.textContent = userStats.totalReports;
            }

            if (userUpvotesReceived) {
                userUpvotesReceived.textContent = userStats.totalUpvotes;
            }

            if (userMemberSince) {
                if (userStats.memberSince) {
                    const memberDate = new Date(userStats.memberSince);
                    userMemberSince.textContent = memberDate.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });
                } else {
                    userMemberSince.textContent = 'Recently';
                }
            }

            // Update user reports list with real data
            updateUserReportsList(userStats.userReports);
            return; // Exit early if Supabase worked
        }
    } catch (error) {
        console.error('Error fetching user statistics:', error);

        // Fallback to local data if Supabase fails
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

        updateUserReportsList(userReports);
    }
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

        // TEMPORARY: Create sample reports for testing PDF export
        console.log('🧪 No reports found, creating sample data for testing');
        const sampleReports = [
            {
                id: 'sample-1',
                type: 'pothole',
                location: { address: 'Main Street, Your City' },
                description: 'Large pothole causing traffic issues',
                date: new Date().toISOString(),
                status: 'new',
                upvotes: 5
            },
            {
                id: 'sample-2',
                type: 'streetlight',
                location: { address: 'Park Avenue, Your City' },
                description: 'Street light not working',
                date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                status: 'acknowledged',
                upvotes: 3
            }
        ];

        // Add sample reports to the list for testing
        sampleReports.forEach(report => {
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

        updateExportButtonVisibility();
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

    // Update export button visibility
    updateExportButtonVisibility();
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

    // Update export button visibility
    updateExportButtonVisibility();
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

    marker.addEventListener('touchstart', function (e) {
        touchStartTime = Date.now();
        this.style.transform = 'scale(1.1)';
        this.style.zIndex = '100';
    });

    marker.addEventListener('touchend', function (e) {
        e.preventDefault();
        const touchDuration = Date.now() - touchStartTime;

        if (touchDuration < 300) {
            showMobileIssueDetails(report);
        }

        this.style.transform = 'scale(1)';
        this.style.zIndex = '10';
    });

    marker.addEventListener('click', function (e) {
        e.stopPropagation();
        showMobileIssueDetails(report);
    });

    marker.addEventListener('mouseenter', function () {
        if (window.innerWidth > 768) {
            this.style.transform = 'scale(1.2)';
            this.style.zIndex = '100';
        }
    });

    marker.addEventListener('mouseleave', function () {
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
            description: document.getElementById('description').value || `${formatReportTitle({ type: appState.selectedIssueType })} reported by ${appState.user.first_name}`,
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

        // Send notifications
        if (appState.user) {
            try {
                console.log('Sending notification for user:', appState.user.email);
                console.log('Report data:', newReport);
                const result = await sendNotification('report_submitted', appState.user, newReport, ['email']);
                console.log('Notification result:', result);

                if (result.email) {
                    console.log('✅ Email notification sent successfully!');
                } else {
                    console.log('❌ Email notification failed');
                }
            } catch (error) {
                console.error('Failed to send notification:', error);
            }
        } else {
            console.log('No user data available for notifications');
        }

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

// Save report with user data to Supabase
async function saveReportWithBackup(newReport) {
    try {
        if (supabase) {
            // Include user data fields that we added to the database
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
                date: newReport.date.toISOString(),
                // Add user data fields
                user_id: newReport.user_id,
                user_name: newReport.user_name,
                user_email: newReport.user_email
            };

            const { data, error } = await supabase
                .from('reports')
                .insert([reportData]);

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            console.log('Report saved to Supabase with user data:', data);
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

// Fetch user statistics from Supabase
async function fetchUserStatistics() {
    // This function should only be called when Supabase is confirmed available
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }
    if (!appState.user) {
        throw new Error('User not logged in');
    }

    try {
        // Fetch user's reports
        const { data: userReports, error: reportsError } = await supabase
            .from('reports')
            .select('*')
            .or(`user_id.eq.${appState.user.id},user_email.eq.${appState.user.email}`)
            .order('date', { ascending: false });

        if (reportsError) {
            console.error('Error fetching user reports:', reportsError);
        }

        // Fetch user's upvotes received (sum of upvotes on their reports)
        let totalUpvotes = 0;
        if (userReports && userReports.length > 0) {
            // Use the upvotes count from the reports table instead of querying upvotes table
            // This avoids the BIGINT/INTEGER type mismatch issue
            totalUpvotes = userReports.reduce((sum, report) => sum + (report.upvotes || 0), 0);
        }

        // Get member since date from user data or reports
        let memberSince = appState.user.created_at;
        if (!memberSince && userReports && userReports.length > 0) {
            // If no created_at in user, use earliest report date
            const sortedReports = userReports.sort((a, b) => new Date(a.date) - new Date(b.date));
            memberSince = sortedReports[0].date;
        }

        // Process reports for display
        const processedReports = userReports ? userReports.map(report => ({
            id: report.id,
            type: report.type,
            location: {
                lat: report.lat,
                lng: report.lng,
                address: report.address
            },
            description: report.description,
            photo: report.photo,
            upvotes: report.upvotes || 0,
            status: report.status,
            date: new Date(report.date),
            user_id: report.user_id,
            user_email: report.user_email,
            user_name: report.user_name,
            user_city: report.user_city
        })) : [];

        console.log(`Fetched ${processedReports.length} reports and ${totalUpvotes} upvotes for user`);

        return {
            totalReports: processedReports.length,
            totalUpvotes: totalUpvotes,
            memberSince: memberSince,
            userReports: processedReports
        };

    } catch (error) {
        console.error('Error in fetchUserStatistics:', error);
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

// Load data from Supabase with optimizations
async function loadFromSupabase() {
    try {
        if (!supabase) return [];

        console.time('Supabase Load Time');

        // Load only last 100 reports for speed
        const { data, error } = await supabase
            .from('reports')
            .select('id, type, lat, lng, address, description, upvotes, status, date, user_id, user_email, user_name, user_city')
            .order('date', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error loading data from Supabase:', error);
            return [];
        }

        console.timeEnd('Supabase Load Time');

        const processedReports = data.map(item => ({
            id: item.id,
            type: item.type,
            location: {
                lat: item.lat,
                lng: item.lng,
                address: item.address
            },
            description: item.description,
            photo: null, // Don't load photos initially for speed
            upvotes: item.upvotes,
            status: item.status,
            date: new Date(item.date),
            user_id: item.user_id,
            user_email: item.user_email,
            user_name: item.user_name,
            user_city: item.user_city
        }));

        console.log(`Loaded ${processedReports.length} reports from Supabase`);
        
        // Cache the data
        try {
            localStorage.setItem('safecity-reports-cache', JSON.stringify(processedReports));
            localStorage.setItem('safecity-cache-timestamp', Date.now().toString());
        } catch (e) {
            console.warn('Could not cache reports:', e);
        }

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
document.addEventListener('DOMContentLoaded', function () {
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
        // Check cache first (5 minute cache)
        const cachedData = localStorage.getItem('safecity-reports-cache');
        const cacheTimestamp = localStorage.getItem('safecity-cache-timestamp');
        const cacheAge = Date.now() - parseInt(cacheTimestamp || '0');
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        if (cachedData && cacheAge < CACHE_DURATION) {
            console.log('Loading from cache...');
            appState.reports = JSON.parse(cachedData);
            
            // Load fresh data in background
            if (supabaseInitialized) {
                loadFromSupabase().then(freshData => {
                    if (freshData.length > 0) {
                        appState.reports = freshData;
                        if (appState.currentSection === 'map') renderMapMarkers();
                        if (appState.currentSection === 'stats') updateStatsView();
                    }
                });
            }
        } else if (supabaseInitialized) {
            console.log('Loading from Supabase...');
            appState.reports = await loadFromSupabase();
        } else {
            console.log('Supabase not available. Loading sample data.');
            appState.reports = loadSampleData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        appState.reports = loadSampleData();
    }

    if (!appState.reports || appState.reports.length === 0) {
        console.log('No reports found. Loading sample data.');
        appState.reports = loadSampleData();
    }

    setupNavigationListeners();
    setupReportFormListeners();
    setupMapListeners();
    setupModalListeners();
    setupUserMenuListeners();
    initializeSearch();

    getCurrentLocation();

    showSection('map');

    console.log('SafeCity app initialized with', appState.reports.length, 'reports');
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
        userMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            userDropdown.classList.remove('show');
        });
    }

    // View profile
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function (e) {
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
        // Clear both persistent and temporary sessions
        localStorage.removeItem('safecity-user');
        localStorage.removeItem('safecity-session');
        localStorage.removeItem('safecity-user-city');
        localStorage.removeItem('safecity-user-location');
        sessionStorage.removeItem('safecity-temp-user');
        sessionStorage.removeItem('safecity-temp-session');

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
        cancelBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }

    if (confirmBtn && selectElement) {
        confirmBtn.addEventListener('click', async function () {
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
                appState.reports = await loadFromSupabase();

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
                alert(`Error updating city: ${error.message || error}. Please try again.`);
            }
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Update user city in database
async function updateUserCity(newCity) {
    try {
        if (!supabase) {
            throw new Error('Supabase not available');
        }

        if (!appState.user) {
            throw new Error('User not logged in');
        }

        if (!appState.user.id) {
            throw new Error('User ID not available');
        }

        console.log('Updating city for user:', appState.user.id, 'to:', newCity);

        const { error } = await supabase
            .from('users')
            .update({
                city: newCity
            })
            .eq('id', appState.user.id);

        if (error) {
            console.error('Supabase error updating user city:', error);
            throw new Error(`Database error: ${error.message}`);
        }

        console.log('User city updated successfully in Supabase');

    } catch (error) {
        console.error('Error in updateUserCity:', error);
        throw error;
    }
}

// Navigation Functions
function setupNavigationListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
        button.addEventListener('click', function () {
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
            function (position) {
                appState.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                const cityName = appState.userLocation?.displayName || 'your location';
                if (locationDisplay) {
                    locationDisplay.textContent = `Current Location: ${cityName}`;
                }
            },
            function (error) {
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
        button.addEventListener('click', function () {
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
        photoInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                    photoPreview.style.display = 'block';
                    appState.uploadedPhoto = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', function () {
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
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            appState.currentFilter = this.getAttribute('data-filter');
            renderMapMarkers();

            // Update list view if it's currently active
            updateListViewFilters();
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
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                hideSuccessModal();
            }
        });
    }
}

function showSuccessModal(reportId) {
    const modal = document.getElementById('success-modal');
    const reportIdElement = document.getElementById('report-id');
    const whatsappBtn = document.getElementById('notify-whatsapp');

    if (modal && reportIdElement) {
        reportIdElement.textContent = reportId;

        // Add WhatsApp notification handler
        if (whatsappBtn) {
            whatsappBtn.onclick = () => {
                console.log('📱 WhatsApp button clicked');
                const report = appState.reports.find(r => r.id == reportId);
                console.log('Found report:', report);
                console.log('User data:', appState.user);

                if (report && appState.user) {
                    sendWhatsAppNotification('report_submitted', appState.user, report);
                } else {
                    console.error('❌ Missing report or user data for WhatsApp');
                }
            };
        } else {
            console.log('❌ WhatsApp button not found');
        }

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
async function addUpvote(reportId) {
    try {
        if (!supabase) {
            console.error('Supabase not available for upvoting');
            return;
        }

        // Check if user already upvoted this report
        const { data: existingUpvote, error: checkError } = await supabase
            .from('upvotes')
            .select('id')
            .eq('report_id', String(reportId)) // Convert to string to handle BIGINT
            .eq('user_email', appState.user?.email || 'anonymous')
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error checking existing upvote:', checkError);
            return;
        }

        if (existingUpvote) {
            console.log('User already upvoted this report');
            return;
        }

        // Add new upvote
        const upvoteData = {
            report_id: String(reportId), // Convert to string to handle BIGINT
            user_id: appState.user?.id || null,
            user_email: appState.user?.email || 'anonymous',
            ip_address: null // Could be added for anonymous users
        };

        const { error: insertError } = await supabase
            .from('upvotes')
            .insert([upvoteData]);

        if (insertError) {
            console.error('Error adding upvote:', insertError);
            return;
        }

        console.log(`Successfully upvoted report ${reportId}`);

        // Refresh the current view to show updated counts
        if (appState.currentSection === 'map') {
            // Reload reports to get updated counts
            appState.reports = await loadFromSupabase();
            renderMapMarkers();
        }
        if (appState.currentSection === 'stats') {
            appState.reports = await loadFromSupabase();
            updateStatsView();
        }
        if (appState.currentSection === 'profile') {
            updateProfileSection();
        }

    } catch (error) {
        console.error('Error in addUpvote:', error);
    }
}

// Note: updateReportUpvotes function removed - upvote counts are now automatically 
// updated by database triggers when records are added/removed from the upvotes table

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
    addReport: function (reportData) {
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
    getReports: function () {
        return appState.reports;
    },
    updateReport: function (reportId, updates) {
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
    getCurrentUser: function () {
        return appState.user;
    },
    getUserLocation: function () {
        return appState.userLocation;
    },
    logout: handleLogout
};

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
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
window.addEventListener('resize', function () {
    if (appState.currentSection === 'map') {
        setTimeout(() => {
            renderMapMarkers();
        }, 100);
    }
});

// Online/offline status handling
window.addEventListener('online', function () {
    console.log('Connection restored');
    // Attempt to sync any pending data when back online
    if (supabase && appState.reports.length > 0) {
        console.log('Attempting to sync data...');
        // You could implement sync logic here
    }
});

window.addEventListener('offline', function () {
    console.log('Connection lost - working in offline mode');
});

// Beforeunload handler to save any unsaved data
window.addEventListener('beforeunload', function (e) {
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
    // Ensure date is a Date object
    let dateObj;
    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
    } else {
        console.warn('Invalid date format:', date);
        return 'Unknown date';
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
        return 'Invalid date';
    }
    
    const now = new Date();
    const diff = now - dateObj;
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
        return dateObj.toLocaleDateString();
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
window.addEventListener('error', function (e) {
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

window.addEventListener('unhandledrejection', function (e) {
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
// ===== NOTIFICATION SYSTEM =====

// Notification System Configuration
const NOTIFICATION_CONFIG = {
    emailjs: {
        publicKey: 'VNaptzurXMluqfUZq', // You'll get this from EmailJS
        serviceId: 'service_qny8g5b',
        templateId: 'template_429ng3j'
    },
    whatsapp: {
        enabled: true,
        businessNumber: '+27785002274' // Replace with your WhatsApp number
    }
};

// Initialize EmailJS
function initializeEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(NOTIFICATION_CONFIG.emailjs.publicKey);
        console.log('EmailJS initialized successfully');
        return true;
    }
    console.warn('EmailJS not loaded');
    return false;
}

// Email notification functions
async function sendEmailNotification(type, userData, reportData = null) {
    try {
        console.log('📧 Attempting to send email notification...');
        console.log('EmailJS available:', typeof emailjs !== 'undefined');
        console.log('User data:', userData);
        console.log('Report data:', reportData);

        if (!emailjs) {
            console.warn('❌ EmailJS not available');
            return false;
        }

        const templateParams = {
            to_email: userData.email,
            user_name: userData.first_name || 'User',
            notification_type: type,
            app_name: 'SafeCity',
            app_url: window.location.origin
        };

        console.log('📧 Template params:', templateParams);

        // Add report-specific data if provided
        if (reportData) {
            templateParams.report_id = reportData.id;
            templateParams.report_type = reportData.type;
            templateParams.report_location = reportData.location?.address || 'Unknown location';
            templateParams.report_status = reportData.status;
            templateParams.report_description = reportData.description;
        }

        const result = await emailjs.send(
            NOTIFICATION_CONFIG.emailjs.serviceId,
            NOTIFICATION_CONFIG.emailjs.templateId,
            templateParams
        );

        console.log('Email sent successfully:', result);
        return true;

    } catch (error) {
        console.error('Email notification failed:', error);
        return false;
    }
}

// WhatsApp notification functions
function sendWhatsAppNotification(type, userData, reportData = null) {
    try {
        if (!NOTIFICATION_CONFIG.whatsapp.enabled) {
            console.log('WhatsApp notifications disabled');
            return false;
        }

        let message = '';

        switch (type) {
            case 'report_submitted':
                message = `🏙️ *SafeCity Report Submitted*\n\nHi ${userData.first_name}!\n\nYour report has been successfully submitted:\n\n📍 *Location:* ${reportData?.location?.address}\n🔧 *Issue:* ${reportData?.type}\n📝 *Description:* ${reportData?.description}\n🆔 *Report ID:* #${reportData?.id}\n\nWe'll notify you when there are updates!\n\nThank you for helping improve our city! 🌟`;
                break;
            case 'report_updated':
                message = `🔄 *SafeCity Report Update*\n\nHi ${userData.first_name}!\n\nYour report #${reportData?.id} has been updated:\n\n📍 *Location:* ${reportData?.location?.address}\n🔧 *Issue:* ${reportData?.type}\n📊 *New Status:* ${reportData?.status}\n\nView your report: ${window.location.origin}\n\nThanks for using SafeCity! 🏙️`;
                break;
            case 'welcome':
                message = `🎉 *Welcome to SafeCity!*\n\nHi ${userData.first_name}!\n\nThank you for joining SafeCity - together we're making our communities better!\n\n✅ Report infrastructure issues\n✅ Track repair progress\n✅ Connect with your community\n\nStart reporting: ${window.location.origin}\n\nLet's build better cities together! 🌟`;
                break;
            default:
                message = `📱 *SafeCity Notification*\n\nHi ${userData.first_name}!\n\nYou have a new notification from SafeCity.\n\nVisit: ${window.location.origin}`;
        }

        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${NOTIFICATION_CONFIG.whatsapp.businessNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

        // Open WhatsApp (this will work on mobile and desktop)
        window.open(whatsappUrl, '_blank');

        console.log('WhatsApp notification opened');
        return true;

    } catch (error) {
        console.error('WhatsApp notification failed:', error);
        return false;
    }
}

// Combined notification function
async function sendNotification(type, userData, reportData = null, methods = ['email']) {
    const results = {};

    if (methods.includes('email')) {
        results.email = await sendEmailNotification(type, userData, reportData);
    }

    if (methods.includes('whatsapp')) {
        results.whatsapp = sendWhatsAppNotification(type, userData, reportData);
    }

    return results;
}

// Initialize notifications when app loads
document.addEventListener('DOMContentLoaded', function () {
    // Initialize EmailJS after a short delay to ensure it's loaded
    setTimeout(() => {
        initializeEmailJS();
    }, 1000);
});
// ===== TESTING FUNCTIONS =====

// Test email notification manually
window.testEmailNotification = async function () {
    console.log('🧪 Testing email notification...');

    if (!appState.user) {
        console.error('❌ No user logged in. Please log in first.');
        return;
    }

    const testReport = {
        id: 'TEST123',
        type: 'pothole',
        location: { address: 'Test Street, Test City' },
        description: 'This is a test report',
        status: 'new'
    };

    try {
        const result = await sendEmailNotification('report_submitted', appState.user, testReport);
        if (result) {
            console.log('✅ Test email sent successfully!');
            alert('✅ Test email sent! Check your inbox.');
        } else {
            console.log('❌ Test email failed');
            alert('❌ Test email failed. Check console for details.');
        }
    } catch (error) {
        console.error('❌ Test email error:', error);
        alert('❌ Test email error: ' + error.message);
    }
};

// Test WhatsApp notification manually
window.testWhatsAppNotification = function () {
    console.log('🧪 Testing WhatsApp notification...');

    if (!appState.user) {
        console.error('❌ No user logged in. Please log in first.');
        return;
    }

    const testReport = {
        id: 'TEST123',
        type: 'pothole',
        location: { address: 'Test Street, Test City' },
        description: 'This is a test report',
        status: 'new'
    };

    try {
        const result = sendWhatsAppNotification('report_submitted', appState.user, testReport);
        if (result) {
            console.log('✅ WhatsApp test opened successfully!');
        } else {
            console.log('❌ WhatsApp test failed');
        }
    } catch (error) {
        console.error('❌ WhatsApp test error:', error);
    }
};

// Check notification configuration
window.checkNotificationConfig = function () {
    console.log('🔧 Notification Configuration:');
    console.log('EmailJS Public Key:', NOTIFICATION_CONFIG.emailjs.publicKey);
    console.log('EmailJS Service ID:', NOTIFICATION_CONFIG.emailjs.serviceId);
    console.log('EmailJS Template ID:', NOTIFICATION_CONFIG.emailjs.templateId);
    console.log('WhatsApp Number:', NOTIFICATION_CONFIG.whatsapp.businessNumber);
    console.log('EmailJS Available:', typeof emailjs !== 'undefined');
    console.log('Current User:', appState.user);

    if (NOTIFICATION_CONFIG.emailjs.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
        console.warn('⚠️ EmailJS not configured yet! Update the config in js/script.js');
    }

    if (NOTIFICATION_CONFIG.whatsapp.businessNumber === '+27123456789') {
        console.warn('⚠️ WhatsApp number not updated! Update the config in js/script.js');
    }
};
// ===== SEARCH FUNCTIONALITY =====

let searchTimeout;
let currentSearchResults = [];

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('report-search');
    const clearButton = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput) return;

    // Search input event listener
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim();

        // Show/hide clear button
        if (clearButton) {
            clearButton.style.display = query ? 'flex' : 'none';
        }

        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.length >= 2) {
                performSearch(query);
            } else {
                hideSearchResults();
                showAllMarkers();
            }

            // Update list view if active
            updateListViewFilters();
        }, 300);
    });

    // Clear search
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.style.display = 'none';
            hideSearchResults();
            showAllMarkers();
            searchInput.focus();

            // Update list view if active
            updateListViewFilters();
        });
    }

    // Hide search results when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.search-container')) {
            hideSearchResults();
        }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            hideSearchResults();
            searchInput.blur();
        }
    });
}

// Perform search
function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    const results = searchReports(query);
    currentSearchResults = results;

    if (results.length > 0) {
        displaySearchResults(results);
        highlightSearchResults(results);
    } else {
        displayNoResults(query);
        showAllMarkers();
    }
}

// Search through reports
function searchReports(query) {
    const searchTerm = query.toLowerCase();

    return appState.reports.filter(report => {
        // Search in description
        const descriptionMatch = report.description.toLowerCase().includes(searchTerm);

        // Search in location
        const locationMatch = report.location?.address?.toLowerCase().includes(searchTerm);

        // Search in type
        const typeMatch = report.type.toLowerCase().includes(searchTerm);

        // Search in status
        const statusMatch = report.status.toLowerCase().includes(searchTerm);

        // Search in report ID
        const idMatch = report.id.toString().includes(searchTerm);

        return descriptionMatch || locationMatch || typeMatch || statusMatch || idMatch;
    });
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    searchResults.innerHTML = '';

    results.slice(0, 8).forEach(report => { // Limit to 8 results
        const resultItem = createSearchResultItem(report);
        searchResults.appendChild(resultItem);
    });

    if (results.length > 8) {
        const moreResults = document.createElement('div');
        moreResults.className = 'search-result-item';
        moreResults.style.fontStyle = 'italic';
        moreResults.style.color = '#666';
        moreResults.innerHTML = `<i class="fas fa-ellipsis-h"></i> ${results.length - 8} more results...`;
        searchResults.appendChild(moreResults);
    }

    searchResults.style.display = 'block';
}

// Create search result item
function createSearchResultItem(report) {
    const item = document.createElement('div');
    item.className = 'search-result-item';

    const icon = document.createElement('div');
    icon.className = `search-result-icon ${report.type}`;
    icon.innerHTML = `<i class="${getIssueTypeIcon(report.type)}"></i>`;

    const details = document.createElement('div');
    details.className = 'search-result-details';

    const title = document.createElement('div');
    title.className = 'search-result-title';
    title.textContent = formatReportTitle(report);

    const location = document.createElement('div');
    location.className = 'search-result-location';
    location.textContent = report.location?.address || 'Unknown location';

    const meta = document.createElement('div');
    meta.className = 'search-result-meta';
    meta.innerHTML = `
        <span><i class="fas fa-calendar"></i> ${formatDate(report.date)}</span>
        <span><i class="fas fa-arrow-up"></i> ${report.upvotes}</span>
        <span class="status ${report.status}">${report.status}</span>
    `;

    details.appendChild(title);
    details.appendChild(location);
    details.appendChild(meta);

    item.appendChild(icon);
    item.appendChild(details);

    // Click handler
    item.addEventListener('click', () => {
        selectSearchResult(report);
    });

    return item;
}

// Display no results message
function displayNoResults(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    searchResults.innerHTML = `
        <div class="search-no-results">
            <i class="fas fa-search"></i>
            <p>No reports found for "${query}"</p>
            <small>Try searching by location, issue type, or description</small>
        </div>
    `;

    searchResults.style.display = 'block';
}

// Hide search results
function hideSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Highlight search results on map
function highlightSearchResults(results) {
    const markers = document.querySelectorAll('.marker');

    // Hide all markers first
    markers.forEach(marker => {
        marker.style.display = 'none';
    });

    // Show only matching markers
    results.forEach(report => {
        const marker = document.querySelector(`[data-report-id="${report.id}"]`);
        if (marker) {
            marker.style.display = 'flex';
            marker.classList.add('search-highlight');
        }
    });
}

// Show all markers
function showAllMarkers() {
    const markers = document.querySelectorAll('.marker');
    markers.forEach(marker => {
        marker.style.display = 'flex';
        marker.classList.remove('search-highlight');
    });
}

// Select search result
function selectSearchResult(report) {
    hideSearchResults();

    // Find and highlight the marker
    const marker = document.querySelector(`[data-report-id="${report.id}"]`);
    if (marker) {
        // Scroll marker into view
        marker.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight the marker
        marker.style.transform = 'scale(1.3)';
        marker.style.zIndex = '1000';
        marker.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8)';

        // Show marker info
        const markerInfo = marker.querySelector('.marker-info');
        if (markerInfo) {
            markerInfo.style.opacity = '1';
            markerInfo.style.visibility = 'visible';
        }

        // Reset highlight after 3 seconds
        setTimeout(() => {
            marker.style.transform = 'scale(1)';
            marker.style.zIndex = '10';
            marker.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            if (markerInfo) {
                markerInfo.style.opacity = '0';
                markerInfo.style.visibility = 'hidden';
            }
        }, 3000);
    }

    // Clear search
    const searchInput = document.getElementById('report-search');
    const clearButton = document.getElementById('clear-search');
    if (searchInput) searchInput.value = '';
    if (clearButton) clearButton.style.display = 'none';
}

// Add search highlight styles
const searchHighlightStyles = `
    .marker.search-highlight {
        animation: searchPulse 2s ease-in-out infinite;
        border: 2px solid #667eea;
    }
    
    @keyframes searchPulse {
        0%, 100% { 
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        50% { 
            box-shadow: 0 4px 25px rgba(102, 126, 234, 0.6);
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = searchHighlightStyles;
document.head.appendChild(styleSheet);// ===== PWA FUNCTIONALITY =====

let deferredPrompt;
let isInstalled = false;

// Initialize PWA features
function initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SafeCity PWA: Service Worker registered');

                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateAvailable();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('SafeCity PWA: Service Worker registration failed', error);
            });
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('SafeCity PWA: Install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
        console.log('SafeCity PWA: App installed successfully');
        isInstalled = true;
        hideInstallButton();
        showInstallSuccess();
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        isInstalled = true;
        console.log('SafeCity PWA: Running as installed app');
    }

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'SYNC_COMPLETE') {
                showSyncComplete();
            }
        });
    }

    // Handle offline/online status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show initial connection status
    updateConnectionStatus();
}

// Show install button
function showInstallButton() {
    // Create install button if it doesn't exist
    let installBtn = document.getElementById('pwa-install-btn');
    if (!installBtn) {
        installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'pwa-install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Install App';
        installBtn.onclick = installPWA;

        // Add to header
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            headerRight.insertBefore(installBtn, headerRight.firstChild);
        }
    }

    installBtn.style.display = 'flex';
}

// Hide install button
function hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

// Install PWA
async function installPWA() {
    if (!deferredPrompt) {
        console.log('SafeCity PWA: No install prompt available');
        return;
    }

    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('SafeCity PWA: User accepted install');
        } else {
            console.log('SafeCity PWA: User dismissed install');
        }

        deferredPrompt = null;
        hideInstallButton();

    } catch (error) {
        console.error('SafeCity PWA: Install failed', error);
    }
}

// Show update available notification
function showUpdateAvailable() {
    const notification = document.createElement('div');
    notification.className = 'pwa-notification update-available';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-sync-alt"></i>
            <span>New version available!</span>
            <button onclick="reloadApp()" class="btn-small">Update</button>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-small btn-secondary">Later</button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

// Show install success
function showInstallSuccess() {
    const notification = document.createElement('div');
    notification.className = 'pwa-notification install-success';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>SafeCity installed successfully!</span>
            <button onclick="this.parentElement.parentElement.remove()" class="btn-small">Great!</button>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Show sync complete notification
function showSyncComplete() {
    const notification = document.createElement('div');
    notification.className = 'pwa-notification sync-complete';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Offline reports synced!</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle online status
function handleOnline() {
    console.log('SafeCity PWA: Back online');
    updateConnectionStatus();

    // Trigger background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
            return registration.sync.register('background-sync-reports');
        });
    }
}

// Handle offline status
function handleOffline() {
    console.log('SafeCity PWA: Gone offline');
    updateConnectionStatus();
}

// Update connection status indicator
function updateConnectionStatus() {
    let statusIndicator = document.getElementById('connection-status');

    if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'connection-status';
        statusIndicator.className = 'connection-status';
        document.body.appendChild(statusIndicator);
    }

    if (navigator.onLine) {
        statusIndicator.className = 'connection-status online';
        statusIndicator.innerHTML = '<i class="fas fa-wifi"></i> Online';
    } else {
        statusIndicator.className = 'connection-status offline';
        statusIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
    }

    // Auto-hide online status after 3 seconds
    if (navigator.onLine) {
        setTimeout(() => {
            statusIndicator.style.opacity = '0';
        }, 3000);
    } else {
        statusIndicator.style.opacity = '1';
    }
}

// Reload app for updates
function reloadApp() {
    window.location.reload();
}

// Save report offline
function saveReportOffline(report) {
    try {
        const offlineReports = JSON.parse(localStorage.getItem('safecity-offline-reports') || '[]');
        offlineReports.push({
            ...report,
            offline: true,
            timestamp: Date.now()
        });
        localStorage.setItem('safecity-offline-reports', JSON.stringify(offlineReports));
        console.log('SafeCity PWA: Report saved offline');
        return true;
    } catch (error) {
        console.error('SafeCity PWA: Failed to save report offline', error);
        return false;
    }
}

// Get offline reports count
function getOfflineReportsCount() {
    try {
        const offlineReports = JSON.parse(localStorage.getItem('safecity-offline-reports') || '[]');
        return offlineReports.length;
    } catch (error) {
        return 0;
    }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initializePWA();
    }, 1000);
});// =====PDF EXPORT FUNCTIONALITY =====

// Check if jsPDF is available, with fallback to browser print
function checkPDFLibrary() {
    console.log('🔍 Checking PDF library availability...');
    console.log('window.jsPDF type:', typeof window.jsPDF);

    if (window.jsPDF && typeof window.jsPDF === 'function') {
        console.log('✅ jsPDF library is available');
        return Promise.resolve(true);
    } else {
        console.log('⚠️ jsPDF not available, will use browser print fallback');
        return Promise.resolve(false);
    }
}

// Initialize PDF export functionality
function initializePDFExport() {
    const exportBtn = document.getElementById('export-reports-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportUserReportsToPDF);
    }
}

// Export user reports to PDF
async function exportUserReportsToPDF() {
    try {
        // Check if PDF library is available
        const isLibraryReady = await checkPDFLibrary();
        if (!isLibraryReady) {
            // Fallback to browser print method
            console.log('📄 Using browser print fallback for PDF export');
            console.log('📄 Checking if exportReportsUsingPrint function exists:', typeof exportReportsUsingPrint);
            if (typeof exportReportsUsingPrint === 'function') {
                exportReportsUsingPrint();
            } else {
                console.error('❌ exportReportsUsingPrint function not found');
                alert('PDF export is not available. The print fallback function is missing.');
            }
            return;
        }

        if (!appState.user) {
            alert('Please log in to export your reports.');
            return;
        }

        const exportBtn = document.getElementById('export-reports-btn');
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        }

        // Get user's reports
        let userReports = [];
        try {
            const userStats = await fetchUserStatistics();
            userReports = userStats.userReports || [];
        } catch (error) {
            console.error('Error fetching user reports:', error);
            // Fallback to local reports
            userReports = appState.reports.filter(report =>
                report.user_id === appState.user.id || report.user_email === appState.user.email
            );
        }

        if (userReports.length === 0) {
            alert('No reports found to export.');
            return;
        }

        // Generate PDF
        await generateReportsPDF(userReports);

    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    } finally {
        const exportBtn = document.getElementById('export-reports-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export PDF';
        }
    }
}

// Generate PDF document
async function generateReportsPDF(reports) {
    // Use jsPDF directly from window
    const doc = new window.jsPDF();

    // PDF Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Colors
    const primaryColor = [102, 126, 234]; // #667eea
    const secondaryColor = [118, 75, 162]; // #764ba2
    const textColor = [51, 51, 51]; // #333
    const lightGray = [128, 128, 128]; // #808080

    // Helper function to add new page if needed
    function checkPageBreak(requiredHeight) {
        if (yPosition + requiredHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    }

    // Helper function to wrap text
    function wrapText(text, maxWidth, fontSize = 10) {
        doc.setFontSize(fontSize);
        return doc.splitTextToSize(text, maxWidth);
    }

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SafeCity', margin, 25);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Infrastructure Report Summary', margin, 35);

    yPosition = 60;

    // User Information
    doc.setTextColor(...textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Summary', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated for: ${appState.user.first_name} ${appState.user.last_name}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Email: ${appState.user.email}`, margin, yPosition);
    yPosition += 8;
    doc.text(`City: ${appState.userLocation?.displayName || 'Unknown'}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`, margin, yPosition);
    yPosition += 20;

    // Statistics Summary
    const totalReports = reports.length;
    const totalUpvotes = reports.reduce((sum, report) => sum + (report.upvotes || 0), 0);
    const statusCounts = reports.reduce((counts, report) => {
        counts[report.status] = (counts[report.status] || 0) + 1;
        return counts;
    }, {});

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistics Overview', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Reports: ${totalReports}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Total Upvotes Received: ${totalUpvotes}`, margin, yPosition);
    yPosition += 8;

    // Status breakdown
    Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, margin + 20, yPosition);
        yPosition += 8;
    });

    yPosition += 10;

    // Reports List
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Reports', margin, yPosition);
    yPosition += 15;

    // Sort reports by date (newest first)
    const sortedReports = reports.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedReports.forEach((report, index) => {
        checkPageBreak(60); // Minimum space needed for a report

        // Report header
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');

        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Report #${report.id}`, margin + 5, yPosition + 5);

        doc.setTextColor(...textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(formatReportTitle(report), margin + 5, yPosition + 15);

        yPosition += 30;

        // Report details
        doc.setFontSize(9);
        doc.text(`Date: ${formatDate(report.date)}`, margin + 5, yPosition);
        yPosition += 7;

        doc.text(`Location: ${report.location?.address || 'Unknown location'}`, margin + 5, yPosition);
        yPosition += 7;

        doc.text(`Status: ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}`, margin + 5, yPosition);
        yPosition += 7;

        doc.text(`Upvotes: ${report.upvotes || 0}`, margin + 5, yPosition);
        yPosition += 7;

        // Description
        if (report.description && report.description.trim()) {
            doc.text('Description:', margin + 5, yPosition);
            yPosition += 7;

            const wrappedDescription = wrapText(report.description, contentWidth - 20, 9);
            wrappedDescription.forEach(line => {
                checkPageBreak(10);
                doc.text(line, margin + 10, yPosition);
                yPosition += 7;
            });
        }

        yPosition += 10;

        // Add separator line
        if (index < sortedReports.length - 1) {
            doc.setDrawColor(...lightGray);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;
        }
    });

    // Footer on last page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(...lightGray);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
        doc.text('Generated by SafeCity', margin, pageHeight - 10);
    }

    // Generate filename
    const fileName = `SafeCity_Reports_${appState.user.first_name}_${appState.user.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Save the PDF
    doc.save(fileName);

    console.log(`PDF exported: ${fileName}`);
}

// Show/hide export button based on reports availability
function updateExportButtonVisibility() {
    const exportBtn = document.getElementById('export-reports-btn');
    const userReportsList = document.getElementById('user-reports-list');

    console.log('🔍 Export button visibility check:');
    console.log('Export button found:', !!exportBtn);
    console.log('User reports list found:', !!userReportsList);

    if (exportBtn && userReportsList) {
        // Check if there are actual report items (not just loading message)
        const reportItems = userReportsList.querySelectorAll('.user-report-item');
        const hasReports = reportItems.length > 0;

        console.log('Report items found:', reportItems.length);
        console.log('Has reports:', hasReports);
        console.log('Button display will be:', hasReports ? 'flex' : 'none');

        // TEMPORARY: Always show export button for testing
        exportBtn.style.display = 'flex';
        console.log('🧪 TESTING MODE: Export button forced to show');
    } else {
        console.log('❌ Missing elements for export button visibility');
    }
}

// Initialize PDF export when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initializePDFExport();
    }, 1000);
});// ===== DEBUGGING FUNCTIONS =====

// Test export button visibility
window.testExportButton = function () {
    console.log('🧪 Testing export button...');

    const exportBtn = document.getElementById('export-reports-btn');
    const userReportsList = document.getElementById('user-reports-list');

    console.log('Export button element:', exportBtn);
    console.log('User reports list element:', userReportsList);

    if (exportBtn) {
        console.log('Export button current display:', exportBtn.style.display);
        console.log('Export button computed display:', window.getComputedStyle(exportBtn).display);

        // Force show the button for testing
        exportBtn.style.display = 'flex';
        console.log('✅ Export button forced to show');
    } else {
        console.log('❌ Export button not found');
    }

    if (userReportsList) {
        const reportItems = userReportsList.querySelectorAll('.user-report-item');
        console.log('Report items in list:', reportItems.length);

        reportItems.forEach((item, index) => {
            console.log(`Report ${index + 1}:`, item.textContent.substring(0, 50) + '...');
        });
    }

    // Test the visibility function
    updateExportButtonVisibility();
};

// Force show export button
window.showExportButton = function () {
    const exportBtn = document.getElementById('export-reports-btn');
    if (exportBtn) {
        exportBtn.style.display = 'flex';
        console.log('✅ Export button is now visible');
    } else {
        console.log('❌ Export button not found');
    }
};
// Fallback PDF export using browser print functionality
function exportReportsUsingPrint() {
    console.log('📄 Creating printable report page...');

    // Get user reports
    const userReportsList = document.getElementById('user-reports-list');
    const reportItems = userReportsList ? userReportsList.querySelectorAll('.user-report-item') : [];

    if (reportItems.length === 0) {
        alert('No reports found to export.');
        return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Get user info
    const userName = document.getElementById('profile-name')?.textContent || 'User';
    const userEmail = document.getElementById('profile-email')?.textContent || '';
    const userCity = document.getElementById('profile-city')?.textContent || '';
    const totalReports = document.getElementById('user-total-reports')?.textContent || '0';
    const totalUpvotes = document.getElementById('user-upvotes-received')?.textContent || '0';

    // Create HTML content for printing
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>SafeCity Reports - ${userName}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 10px;
                }
                .user-info {
                    background: #f8f9ff;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .stats {
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                    text-align: center;
                }
                .stat {
                    padding: 10px;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #667eea;
                }
                .reports-section {
                    margin-top: 30px;
                }
                .report-item {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    background: #fff;
                }
                .report-header {
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 10px;
                }
                .report-details {
                    margin-bottom: 10px;
                }
                .report-meta {
                    font-size: 12px;
                    color: #666;
                    display: flex;
                    gap: 15px;
                }
                .status {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    text-transform: uppercase;
                }
                .status.new { background: #fff3cd; color: #856404; }
                .status.acknowledged { background: #d1ecf1; color: #0c5460; }
                .status.resolved { background: #d4edda; color: #155724; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🛣️ SafeCity Report</div>
                <h1>User Reports Export</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="user-info">
                <h2>User Information</h2>
                <p><strong>Name:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>City:</strong> ${userCity}</p>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">${totalReports}</div>
                        <div>Total Reports</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${totalUpvotes}</div>
                        <div>Upvotes Received</div>
                    </div>
                </div>
            </div>
            
            <div class="reports-section">
                <h2>Recent Reports</h2>
                ${Array.from(reportItems).map((item, index) => {
        const title = item.querySelector('h4')?.textContent || `Report ${index + 1}`;
        const location = item.querySelector('p')?.textContent || 'Location not specified';
        const date = item.querySelector('.report-date')?.textContent || '';
        const upvotes = item.querySelector('.report-upvotes')?.textContent || '0';
        const status = item.querySelector('.report-status')?.textContent || 'Unknown';
        const statusClass = item.querySelector('.report-status')?.className.split(' ').find(c => ['new', 'acknowledged', 'resolved'].includes(c)) || 'new';

        return `
                        <div class="report-item">
                            <div class="report-header">${title}</div>
                            <div class="report-details">
                                <p><strong>Location:</strong> ${location}</p>
                                <div class="report-meta">
                                    <span>${date}</span>
                                    <span>${upvotes}</span>
                                    <span class="status ${statusClass}">${status}</span>
                                </div>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Print/Save as PDF</button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
        printWindow.print();
    }, 500);

    console.log('✅ Print window opened successfully');
}// View Toggle Functionality
let currentView = 'map';
let currentListSort = 'date-desc';

// Initialize view toggle
function initializeViewToggle() {
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const mapContainer = document.getElementById('map');
    const listView = document.getElementById('list-view');
    const listSortSelect = document.getElementById('list-sort-select');

    // View toggle event listeners
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Sort change event listener
    if (listSortSelect) {
        listSortSelect.addEventListener('change', (e) => {
            currentListSort = e.target.value;
            if (currentView === 'list') {
                updateListView();
            }
        });
    }
}

// Switch between map and list view
function switchView(view) {
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const mapContainer = document.getElementById('map');
    const listView = document.getElementById('list-view');

    // Update button states
    viewToggleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Show/hide views
    if (view === 'map') {
        mapContainer.style.display = 'block';
        listView.style.display = 'none';
        currentView = 'map';
    } else {
        mapContainer.style.display = 'none';
        listView.style.display = 'block';
        currentView = 'list';
        updateListView();
    }
}

// Update list view with current reports
function updateListView() {
    const issuesList = document.getElementById('issues-list');
    const listCount = document.getElementById('list-count');
    const listFilterInfo = document.getElementById('list-filter-info');

    if (!issuesList) return;

    // Get current filter
    const activeFilter = document.querySelector('.filter-btn.active');
    const currentFilter = activeFilter ? activeFilter.dataset.filter : 'all';

    // Filter reports
    let filteredReports = appState.reports;
    if (currentFilter !== 'all') {
        filteredReports = appState.reports.filter(report => report.type === currentFilter);
    }

    // Apply search filter if active
    const searchTerm = document.getElementById('report-search')?.value.toLowerCase();
    if (searchTerm) {
        filteredReports = filteredReports.filter(report =>
            report.location.address.toLowerCase().includes(searchTerm) ||
            report.description.toLowerCase().includes(searchTerm) ||
            report.type.toLowerCase().includes(searchTerm)
        );
    }

    // Sort reports
    filteredReports = sortReports(filteredReports, currentListSort);

    // Update count and filter info
    if (listCount) {
        listCount.textContent = `${filteredReports.length} issue${filteredReports.length !== 1 ? 's' : ''} found`;
    }

    if (listFilterInfo) {
        let filterText = currentFilter === 'all' ? 'All Issues' :
            currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1) + 's';
        if (searchTerm) {
            filterText += ` matching "${searchTerm}"`;
        }
        listFilterInfo.textContent = filterText;
    }

    // Clear and populate list
    issuesList.innerHTML = '';

    if (filteredReports.length === 0) {
        issuesList.innerHTML = `
            <div class="no-issues-message">
                <i class="fas fa-search"></i>
                <p>No issues found matching your criteria.</p>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }

    // Create issue items
    filteredReports.forEach(report => {
        const issueItem = createIssueListItem(report);
        issuesList.appendChild(issueItem);
    });
}

// Create individual issue list item
function createIssueListItem(report) {
    const item = document.createElement('div');
    item.className = `issue-item ${report.status}`;
    item.dataset.reportId = report.id;

    const issueTypeIcon = getIssueTypeIcon(report.type);
    const formattedDate = formatDate(report.date);
    const truncatedDescription = report.description ?
        (report.description.length > 100 ?
            report.description.substring(0, 100) + '...' :
            report.description) :
        'No description provided';

    item.innerHTML = `
        <div class="issue-icon">
            <i class="${issueTypeIcon}"></i>
        </div>
        <div class="issue-content">
            <h4 class="issue-title">${formatReportTitle(report)}</h4>
            <div class="issue-location">
                <i class="fas fa-map-marker-alt"></i>
                ${report.location.address}
            </div>
            <div class="issue-description">${truncatedDescription}</div>
        </div>
        <div class="issue-meta">
            <div class="issue-date">
                <i class="fas fa-clock"></i>
                ${formattedDate}
            </div>
            <div class="issue-upvotes" onclick="upvoteReport(${report.id})">
                <i class="fas fa-arrow-up"></i>
                ${report.upvotes}
            </div>
            <span class="issue-status ${report.status}">
                ${report.status}
            </span>
        </div>
    `;

    // Add click event to show issue details
    item.addEventListener('click', (e) => {
        // Don't trigger if clicking on upvote button
        if (!e.target.closest('.issue-upvotes')) {
            showIssueDetails(report);
        }
    });

    return item;
}

// Sort reports based on selected criteria
function sortReports(reports, sortBy) {
    const sortedReports = [...reports];

    switch (sortBy) {
        case 'date-desc':
            return sortedReports.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return sortedReports.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'upvotes-desc':
            return sortedReports.sort((a, b) => b.upvotes - a.upvotes);
        case 'upvotes-asc':
            return sortedReports.sort((a, b) => a.upvotes - b.upvotes);
        case 'status':
            const statusOrder = { 'new': 0, 'acknowledged': 1, 'resolved': 2 };
            return sortedReports.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        default:
            return sortedReports;
    }
}

// Show detailed issue information in a modal
function showIssueDetails(report) {
    // Create modal for issue details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    const issueTypeIcon = getIssueTypeIcon(report.type);
    const formattedDate = formatDate(report.date);

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="issue-icon">
                    <i class="${issueTypeIcon}"></i>
                </div>
                <h2>${formatReportTitle(report)}</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="issue-detail-section">
                    <h3><i class="fas fa-map-marker-alt"></i> Location</h3>
                    <p>${report.location.address}</p>
                </div>
                
                ${report.description ? `
                    <div class="issue-detail-section">
                        <h3><i class="fas fa-file-text"></i> Description</h3>
                        <p>${report.description}</p>
                    </div>
                ` : ''}
                
                <div class="issue-detail-section">
                    <h3><i class="fas fa-info-circle"></i> Details</h3>
                    <div class="issue-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="issue-status ${report.status}">${report.status}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Reported:</span>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Upvotes:</span>
                            <span>${report.upvotes}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Report ID:</span>
                            <span>#${report.id}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="upvoteReport(${report.id}); this.closest('.modal').remove();">
                    <i class="fas fa-arrow-up"></i> Upvote Issue
                </button>
                <button class="btn-primary" onclick="this.closest('.modal').remove()">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Update list view when filters change
function updateListViewFilters() {
    if (currentView === 'list') {
        updateListView();
    }
}

// Initialize view toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        initializeViewToggle();
    }, 100);
});