// Supabase configuration
let supabase;
const SUPABASE_URL = 'https://cifsceqaulhzhkvlgsla.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZnNjZXFhdWxoemhrdmxnc2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NDQxMzMsImV4cCI6MjA3MTUyMDEzM30.ywt4tUbKXMemF1FjJwKh4td46RqayaK4wJKYRfEw3RQ';

// Authentication state
const authState = {
    isLoading: false,
    currentView: 'login', // 'login' or 'register'
    validationErrors: {},
    rememberMe: false,
    userData: null
};

// City coordinates mapping
const cityCoordinates = {
    'johannesburg': { lat: -26.2041, lng: 28.0473, region: 'Gauteng' },
    'cape-town': { lat: -33.9249, lng: 18.4241, region: 'Western Cape' },
    'durban': { lat: -29.8587, lng: 31.0218, region: 'KwaZulu-Natal' },
    'pretoria': { lat: -25.7479, lng: 28.2293, region: 'Gauteng' },
    'port-elizabeth': { lat: -33.9580, lng: 25.6056, region: 'Eastern Cape' },
    'bloemfontein': { lat: -29.0852, lng: 26.1596, region: 'Free State' },
    'east-london': { lat: -33.0153, lng: 27.9116, region: 'Eastern Cape' },
    'pietermaritzburg': { lat: -29.6147, lng: 30.3926, region: 'KwaZulu-Natal' },
    'polokwane': { lat: -23.9045, lng: 29.4689, region: 'Limpopo' },
    'kimberley': { lat: -28.7282, lng: 24.7499, region: 'Northern Cape' },
    'rustenburg': { lat: -25.6672, lng: 27.2424, region: 'North West' },
    'nelspruit': { lat: -25.4753, lng: 30.9700, region: 'Mpumalanga' },
    'upington': { lat: -28.4478, lng: 21.2561, region: 'Northern Cape' },
    'mahikeng': { lat: -25.8601, lng: 25.6406, region: 'North West' }
};

// Initialize Supabase
function initializeSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase initialized successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return false;
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function () {
    initializeAuth();
});

async function initializeAuth() {
    console.log('Initializing SafeCity Authentication...');

    // Initialize Supabase
    const supabaseReady = initializeSupabase();
    if (!supabaseReady) {
        showAlert('error', 'Database connection unavailable. Please try again later.');
        return;
    }

    // Check if user is already logged in
    await checkExistingSession();

    // Setup event listeners
    setupEventListeners();

    // Initialize theme
    themeManager.init();

    console.log('Authentication system initialized');
}

// Check for existing user session
async function checkExistingSession() {
    // Check for persistent session (remember me)
    const rememberedUser = localStorage.getItem('safecity-user');
    const sessionToken = localStorage.getItem('safecity-session');

    // Check for temporary session (current session only)
    const tempUser = sessionStorage.getItem('safecity-temp-user');
    const tempSession = sessionStorage.getItem('safecity-temp-session');

    if (rememberedUser && sessionToken) {
        try {
            authState.userData = JSON.parse(rememberedUser);
            console.log('Found remembered user session');
            // Optionally validate session with server here
            redirectToMain();
            return;
        } catch (error) {
            console.error('Error parsing remembered user:', error);
            clearStoredSession();
        }
    }

    if (tempUser && tempSession) {
        try {
            authState.userData = JSON.parse(tempUser);
            console.log('Found temporary user session');
            redirectToMain();
            return;
        } catch (error) {
            console.error('Error parsing temporary user:', error);
            clearTempSession();
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Form switch buttons
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => switchToRegister());
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => switchToLogin());
    }

    // Form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Password toggles
    setupPasswordToggles();

    // Real-time validation
    setupValidation();

    // Remember me checkbox
    const rememberMeCheckbox = document.getElementById('remember-me');
    if (rememberMeCheckbox) {
        rememberMeCheckbox.addEventListener('change', (e) => {
            authState.rememberMe = e.target.checked;
        });
    }

    // Alert modal close
    const alertClose = document.getElementById('alert-close');
    if (alertClose) {
        alertClose.addEventListener('click', hideAlert);
    }

    // Close alert on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAlert();
        }
    });
}

// Password toggle functionality
function setupPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');

    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Real-time form validation
function setupValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => validateEmail(input));
        input.addEventListener('input', () => clearFieldError(input));
    });

    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('blur', () => validatePassword(input));
        input.addEventListener('input', () => clearFieldError(input));
    });

    // Name validation
    const nameInputs = document.querySelectorAll('#register-firstname, #register-lastname');
    nameInputs.forEach(input => {
        input.addEventListener('blur', () => validateName(input));
        input.addEventListener('input', () => clearFieldError(input));
    });

    // City validation
    const citySelect = document.getElementById('register-city');
    if (citySelect) {
        citySelect.addEventListener('change', () => validateCity(citySelect));
    }

    // Confirm password validation
    const confirmPassword = document.getElementById('register-confirm-password');
    const registerPassword = document.getElementById('register-password');

    if (confirmPassword && registerPassword) {
        confirmPassword.addEventListener('blur', () => {
            validatePasswordConfirm(registerPassword, confirmPassword);
        });
    }
}

// Form switching functions
function switchToRegister() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    if (loginCard && registerCard) {
        loginCard.classList.add('hidden');
        registerCard.classList.remove('hidden');
        authState.currentView = 'register';

        // Clear any existing errors
        clearAllErrors();

        console.log('Switched to registration view');
    }
}

function switchToLogin() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    if (loginCard && registerCard) {
        registerCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
        authState.currentView = 'login';

        // Clear any existing errors
        clearAllErrors();

        console.log('Switched to login view');
    }
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();

    if (authState.isLoading) return;

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Validate inputs
    if (!validateLoginForm(email, password)) {
        return;
    }

    try {
        authState.isLoading = true;
        showLoading('Signing you in...');

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Authenticate with database
        const user = await authenticateUser(email, password);

        if (user) {
            // Store user data
            authState.userData = user;

            // Always store session data for the current session
            // Only persist to localStorage if remember me is checked
            if (authState.rememberMe) {
                storeUserSession(user);
            } else {
                // Store temporary session data for current session only
                sessionStorage.setItem('safecity-temp-user', JSON.stringify(user));
                sessionStorage.setItem('safecity-temp-session', Date.now().toString());
            }

            // Update last login
            await updateLastLogin(user.id);

            hideLoading();
            showAlert('success', `Welcome back, ${user.first_name}!`);

            // Always redirect after successful login
            setTimeout(() => {
                redirectToMain();
            }, 1500);

        } else {
            hideLoading();
            showAlert('error', 'Invalid email or password. Please try again.');
        }

    } catch (error) {
        console.error('Login error:', error);
        hideLoading();
        showAlert('error', 'Login failed. Please check your connection and try again.');
    } finally {
        authState.isLoading = false;
    }
}

// Registration handler
async function handleRegister(e) {
    e.preventDefault();

    if (authState.isLoading) return;

    const formData = {
        firstName: document.getElementById('register-firstname').value.trim(),
        lastName: document.getElementById('register-lastname').value.trim(),
        email: document.getElementById('register-email').value.trim().toLowerCase(),
        city: document.getElementById('register-city').value,
        password: document.getElementById('register-password').value,
        confirmPassword: document.getElementById('register-confirm-password').value,
        termsAccept: document.getElementById('terms-accept').checked
    };

    // Validate registration form
    if (!validateRegistrationForm(formData)) {
        return;
    }

    try {
        authState.isLoading = true;
        showLoading('Creating your account...');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if user already exists
        const existingUser = await checkUserExists(formData.email);
        if (existingUser) {
            hideLoading();
            showAlert('error', 'An account with this email already exists. Please sign in instead.');
            return;
        }

        // Hash password (in production, this should be done server-side)
        const passwordHash = await hashPassword(formData.password);

        // Create user account
        const newUser = await createUserAccount({
            email: formData.email,
            password_hash: passwordHash,
            first_name: formData.firstName,
            last_name: formData.lastName,
            city: formData.city
        });

        if (newUser) {
            hideLoading();

            // Show success message and switch to login
            showAlert('success', `Account created successfully, ${newUser.first_name}! Please sign in with your new account.`);

            setTimeout(() => {
                // Clear the registration form
                document.getElementById('register-form').reset();

                // Switch to login form
                switchToLogin();

                // Pre-fill the email in login form for convenience
                document.getElementById('login-email').value = formData.email;

            }, 2000);

        } else {
            hideLoading();
            showAlert('error', 'Failed to create account. Please try again.');
        }

    } catch (error) {
        console.error('Registration error:', error);
        hideLoading();
        showAlert('error', 'Registration failed. Please check your connection and try again.');
    } finally {
        authState.isLoading = false;
    }
}

// Database functions
async function authenticateUser(email, password) {
    try {
        if (!supabase) return null;

        // Get user by email
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !users) {
            console.log('User not found');
            return null;
        }

        // Verify password (in production, use proper password hashing)
        const isValid = await verifyPassword(password, users.password_hash);

        if (isValid) {
            // Don't return sensitive data
            const { password_hash, ...userWithoutPassword } = users;
            return userWithoutPassword;
        }

        return null;

    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

async function checkUserExists(email) {
    try {
        if (!supabase) return false;

        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        return !error && data;

    } catch (error) {
        console.error('Check user exists error:', error);
        return false;
    }
}

async function createUserAccount(userData) {
    try {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (error) {
            console.error('Create user error:', error);
            return null;
        }

        // Don't return sensitive data
        const { password_hash, ...userWithoutPassword } = data;
        return userWithoutPassword;

    } catch (error) {
        console.error('Create user account error:', error);
        return null;
    }
}

async function updateLastLogin(userId) {
    try {
        if (!supabase) return;

        const { error } = await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            console.error('Update last login error:', error);
        }

    } catch (error) {
        console.error('Update last login error:', error);
    }
}

// Password hashing functions (simple implementation - use proper library in production)
async function hashPassword(password) {
    // In production, use a proper password hashing library like bcrypt
    // This is a simplified version for demonstration
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'safecity-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
    // In production, use proper password verification
    const testHash = await hashPassword(password);
    return testHash === hash;
}

// Validation functions
function validateLoginForm(email, password) {
    let isValid = true;

    if (!email) {
        setFieldError('login-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        setFieldError('login-email', 'Please enter a valid email address');
        isValid = false;
    }

    if (!password) {
        setFieldError('login-password', 'Password is required');
        isValid = false;
    }

    return isValid;
}

function validateRegistrationForm(formData) {
    let isValid = true;

    // Validate first name
    if (!formData.firstName) {
        setFieldError('register-firstname', 'First name is required');
        isValid = false;
    } else if (formData.firstName.length < 2) {
        setFieldError('register-firstname', 'First name must be at least 2 characters');
        isValid = false;
    }

    // Validate last name
    if (!formData.lastName) {
        setFieldError('register-lastname', 'Last name is required');
        isValid = false;
    } else if (formData.lastName.length < 2) {
        setFieldError('register-lastname', 'Last name must be at least 2 characters');
        isValid = false;
    }

    // Validate email
    if (!formData.email) {
        setFieldError('register-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(formData.email)) {
        setFieldError('register-email', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate city
    if (!formData.city) {
        setFieldError('register-city', 'Please select your city');
        isValid = false;
    }

    // Validate password
    if (!formData.password) {
        setFieldError('register-password', 'Password is required');
        isValid = false;
    } else if (formData.password.length < 8) {
        setFieldError('register-password', 'Password must be at least 8 characters long');
        isValid = false;
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
        setFieldError('register-confirm-password', 'Please confirm your password');
        isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
        setFieldError('register-confirm-password', 'Passwords do not match');
        isValid = false;
    }

    // Validate terms acceptance
    if (!formData.termsAccept) {
        showAlert('warning', 'Please accept the Terms of Service and Privacy Policy to continue.');
        isValid = false;
    }

    return isValid;
}

// Individual field validation functions
function validateEmail(input) {
    const email = input.value.trim();

    if (!email) {
        setFieldError(input.id, 'Email is required');
        return false;
    }

    if (!isValidEmail(email)) {
        setFieldError(input.id, 'Please enter a valid email address');
        return false;
    }

    setFieldSuccess(input.id);
    return true;
}

function validatePassword(input) {
    const password = input.value;

    if (!password) {
        setFieldError(input.id, 'Password is required');
        return false;
    }

    if (input.id === 'register-password' && password.length < 8) {
        setFieldError(input.id, 'Password must be at least 8 characters long');
        return false;
    }

    setFieldSuccess(input.id);
    return true;
}

function validateName(input) {
    const name = input.value.trim();

    if (!name) {
        setFieldError(input.id, 'This field is required');
        return false;
    }

    if (name.length < 2) {
        setFieldError(input.id, 'Must be at least 2 characters');
        return false;
    }

    setFieldSuccess(input.id);
    return true;
}

function validateCity(select) {
    if (!select.value) {
        setFieldError(select.id, 'Please select your city');
        return false;
    }

    setFieldSuccess(select.id);
    return true;
}

function validatePasswordConfirm(passwordInput, confirmInput) {
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!confirmPassword) {
        setFieldError(confirmInput.id, 'Please confirm your password');
        return false;
    }

    if (password !== confirmPassword) {
        setFieldError(confirmInput.id, 'Passwords do not match');
        return false;
    }

    setFieldSuccess(confirmInput.id);
    return true;
}

// Utility validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// UI feedback functions
function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    // Remove existing success state
    formGroup.classList.remove('success');
    formGroup.classList.add('error');

    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    formGroup.appendChild(errorDiv);

    authState.validationErrors[fieldId] = message;
}

function setFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    // Remove error state
    formGroup.classList.remove('error');
    formGroup.classList.add('success');

    // Remove error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    delete authState.validationErrors[fieldId];
}

function clearFieldError(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    formGroup.classList.remove('error', 'success');

    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }

    delete authState.validationErrors[input.id];
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());

    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
    });

    authState.validationErrors = {};
}

// Session management
function storeUserSession(user) {
    try {
        localStorage.setItem('safecity-user', JSON.stringify(user));
        localStorage.setItem('safecity-session', Date.now().toString());
        localStorage.setItem('safecity-user-city', user.city);
        console.log('User session stored');
    } catch (error) {
        console.error('Error storing user session:', error);
    }
}

function clearStoredSession() {
    localStorage.removeItem('safecity-user');
    localStorage.removeItem('safecity-session');
    localStorage.removeItem('safecity-user-city');
    clearTempSession();
    console.log('User session cleared');
}

function clearTempSession() {
    sessionStorage.removeItem('safecity-temp-user');
    sessionStorage.removeItem('safecity-temp-session');
    console.log('Temporary session cleared');
}

function redirectToMain() {
    // Store user city for the main app
    if (authState.userData && authState.userData.city) {
        const cityData = cityCoordinates[authState.userData.city];
        if (cityData) {
            localStorage.setItem('safecity-user-location', JSON.stringify({
                city: authState.userData.city,
                coordinates: cityData,
                displayName: getCityDisplayName(authState.userData.city)
            }));
        }
    }

    // Actually redirect after successful login
    window.location.href = '../pages/dashboard.html';
}

function getCityDisplayName(cityKey) {
    const cityNames = {
        'johannesburg': 'Johannesburg',
        'cape-town': 'Cape Town',
        'durban': 'Durban',
        'pretoria': 'Pretoria',
        'port-elizabeth': 'Port Elizabeth',
        'bloemfontein': 'Bloemfontein',
        'east-london': 'East London',
        'pietermaritzburg': 'Pietermaritzburg',
        'polokwane': 'Polokwane',
        'kimberley': 'Kimberley',
        'rustenburg': 'Rustenburg',
        'nelspruit': 'Nelspruit',
        'upington': 'Upington',
        'mahikeng': 'Mahikeng'
    };

    return cityNames[cityKey] || cityKey;
}

// Loading and alert functions
function showLoading(message = 'Please wait...') {
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

function showAlert(type, message) {
    const alertModal = document.getElementById('alert-modal');
    const alertIcon = document.getElementById('alert-icon');
    const alertMessage = document.getElementById('alert-message');

    if (!alertModal || !alertIcon || !alertMessage) return;

    // Set icon based on type
    const iconClasses = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-triangle',
        'warning': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle'
    };

    alertIcon.className = `alert-icon ${type}`;
    alertIcon.querySelector('i').className = iconClasses[type] || iconClasses.info;
    alertMessage.textContent = message;

    alertModal.style.display = 'flex';
}

function hideAlert() {
    const alertModal = document.getElementById('alert-modal');
    if (alertModal) {
        alertModal.style.display = 'none';
    }
}

// Theme management
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
    }
};

// Export for integration with main app
window.SafeCityAuth = {
    getCurrentUser: () => authState.userData,
    isAuthenticated: () => !!authState.userData,
    logout: () => {
        clearStoredSession();
        authState.userData = null;
        window.location.reload();
    },
    getCityData: (city) => cityCoordinates[city] || null
};

console.log('SafeCity Authentication system loaded successfully');