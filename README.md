# 🌟 SafeCity Infrastructure Reporter

![Logo](assets/logo-6.jpeg)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

> **Report. Track. Fix.** - A Progressive Web App for reporting and tracking infrastructure issues with real-time database, user authentication, and comprehensive reporting features.

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🚀 Demo](#-demo)
- [🛠️ Technology Stack](#️-technology-stack)
- [📦 Installation](#-installation)
- [🎮 Usage Guide](#-usage-guide)
- [🗺️ Project Structure](#️-project-structure)
- [🎨 Design Features](#-design-features)
- [📱 Responsive Design](#-responsive-design)
- [♿ Accessibility](#-accessibility)
- [🌙 Dark Mode](#-dark-mode)
- [🔧 API Integration](#-api-integration)
- [🤝 Contributing](#-contributing)
- [👥 Contributors](#-contributors)
- [📄 License](#-license)
- [💥 Contact](#-contact)

---

## 🎯 Overview

**SafeCity** is a modern, responsive web application designed to empower citizens to report infrastructure issues in their communities. Built specifically for Johannesburg (but adaptable to any city), this platform bridges the gap between citizens and local authorities by providing an intuitive interface for reporting potholes, water leaks, traffic light malfunctions, and other public infrastructure problems.

### 🎯 Mission
To create safer, better-maintained cities through community engagement and transparent issue tracking.

### 🏆 Key Benefits
- **Community Empowerment**: Give citizens a voice in city maintenance
- **Transparency**: Track the status of reported issues from submission to resolution
- **Efficiency**: Help authorities prioritize and address infrastructure problems
- **Data-Driven**: Provide insights through comprehensive statistics and reporting

---

## ✨ Features

### 🗺️ **Interactive Issue Map**
- **Real-time visualization** of reported infrastructure issues
- **Smart filtering** by issue type (Potholes, Water Leaks, Traffic Lights, etc.)
- **Status-based color coding** (New, Acknowledged, Resolved)
- **Interactive markers** with detailed issue information
- **🔍 Real-time search** with instant filtering and visual feedback
- **Hover effects** showing upvotes, report date, and descriptions

### 📝 **Comprehensive Reporting System**
- **�  GPS Location Detection**: Automatic location capture with manual override option
- **📸 Photo Upload**: Take photos directly from device camera
- **🏷️ Issue Categories**: 
  - � ️ Potholes
  - �  Water Leaks
  - � STraffic Lights
  - �️ Street Lights
  - �️ Drainange Issues
  - � Othaer Infrastructure
- **📝 Detailed Descriptions**: Optional text descriptions for additional context
- **✅ Instant Feedback**: Success confirmation with unique report ID
- **� Emaoil Notifications**: Automated email alerts via EmailJS
- **� WhatstApp Integration**: Share reports directly to WhatsApp

### 👤 **User Authentication & Profiles**
- **🔐 Secure Authentication**: Email/password login with Supabase Auth
- **👤 User Profiles**: Personal dashboard with statistics and report history
- **� Userd Statistics**: Track your reports, upvotes received, and member status
- **� PDF Enxport**: Generate professional PDF reports of your submissions
- **🏙️ Multi-city Support**: Switch between different cities

### 📊 **Community Impact Dashboard**
- **📈 Real-time Statistics**:
  - Total reports submitted
  - Issues resolved
  - Average resolution time
  - Active user count
- **🔥 Trending Issues**: Most reported problems by location and type
- **👍 Community Voting**: Upvote system for issue prioritization
- **📋 Status Tracking**: Monitor progress from report to resolution
- **🗃️ Database Integration**: Real-time data with Supabase backend

### 📱 **Progressive Web App (PWA)**
- **📲 App Installation**: Install on mobile devices and desktop
- **🔄 Offline Functionality**: Work without internet connection
- **🔄 Background Sync**: Sync data when connection is restored
- **📱 Native App Experience**: Full-screen mode and app-like navigation
- **🔔 Push Notifications**: Real-time updates (ready for implementation)

### 🌙 **Advanced UI/UX Features**
- **🎨 Modern Design**: Gradient backgrounds and smooth animations
- **🌓 Dark/Light Mode Toggle**: Complete theme switching with system preference detection
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **♿ Accessibility Compliant**: WCAG guidelines adherence
- **🔍 Advanced Search**: Real-time search with debouncing and visual feedback

---

## 🚀 Demo

### Live Features Showcase

#### 🗺️ Map View
```
┌─────────────────────────────────────────┐
│  🗺️ Live Infrastructure Issues Map      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ All │ │🛣️  │ │💧  │ │🚦  │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│         🔴 ← Pothole (45 votes)         │
│    💧 ← Water Leak (32 votes)           │
│              🚦 ← Traffic Light (28)    │
│                                         │
│  Legend: 🔴 New  🟡 In Progress  🟢 Fixed│
└─────────────────────────────────────────┘
```

#### 📝 Report Form
```
┌─────────────────────────────────────────┐
│  📍 Current Location: Sandton, JHB     │
│                                         │
│  Select Issue Type:                     │
│  ┌─────┐ ┌─────┐ ┌─────┐                │
│  │🛣️  │ │💧  │ │🚦  │                │
│  │Hole │ │Leak│ │Light│                │
│  └─────┘ └─────┘ └─────┘                │
│                                         │
│  📸 [Take Photo]                        │
│  📝 [Description...]                    │
│                                         │
│     🚀 [Submit Report]                  │
└─────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Purpose | Badge |
|------------|---------|-------|
| **HTML5** | Structure & Semantics | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) |
| **CSS3** | Styling & Animations | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **JavaScript (ES6+)** | Interactive Functionality | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) |
| **Font Awesome 6.0** | Icons & UI Elements | ![Font Awesome](https://img.shields.io/badge/Font_Awesome-339AF0?style=flat-square&logo=fontawesome&logoColor=white) |

### Backend & Services
| Technology | Purpose | Badge |
|------------|---------|-------|
| **Supabase** | Database & Authentication | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) |
| **EmailJS** | Email Notifications | ![EmailJS](https://img.shields.io/badge/EmailJS-FF6B6B?style=flat-square&logo=gmail&logoColor=white) |
| **Service Worker** | PWA & Offline Support | ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white) |

### Key Features & APIs Used
- **📍 Geolocation API**: GPS location detection
- **📸 MediaDevices API**: Camera access for photo capture
- **💾 Local Storage**: Data persistence and theme preferences
- **🎨 CSS Custom Properties**: Dynamic theming system
- **📱 Responsive Design**: CSS Grid & Flexbox
- **📄 Service Worker**: PWA functionality and offline support
- **🗃️ Supabase Database**: Real-time data storage and retrieval
- **🔐 Supabase Auth**: User authentication and session management
- **📧 EmailJS**: Automated email notifications
- **📄 Browser Print API**: PDF export functionality

---

## 📦 Installation

### Prerequisites
- 🌐 Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- 📱 Device with camera capability (optional, for photo reports)
- 📍 Location services enabled (optional, for GPS detection)
- 🌐 Internet connection (for database features, offline mode available)

### Quick Start

1. **📥 Clone the Repository**
   ```bash
   git clone https://github.com/Uwami-Mgxekwa/SafeCityWeb.git
   cd SafeCityWeb
   ```

2. **🚀 Launch the Application**
   ```bash
   # Option 1: Simple HTTP Server (Python)
   python -m http.server 8000
   
   # Option 2: Node.js HTTP Server
   npx http-server
   
   # Option 3: Live Server (VS Code Extension)
   # Right-click index.html → "Open with Live Server"
   ```

3. **🌐 Open in Browser**
   ```
   http://localhost:8000
   ```

### 🗃️ Local Development Setup

1. **📁 Project Structure Setup**
   ```bash
   SafeCityWeb/
   ├── 📄 index.html          # Landing page
   ├── 📁 pages/
   │   ├── 📄 dashboard.html  # Main application
   │   └── 📄 offline.html    # PWA offline page
   ├── � Rcss/
   │   └── 🎨 styles.css      # Complete styling system
   ├── 📁 js/
   │   ├── ⚡ script.js       # Main application logic
   │   └── 🔐 auth.js         # Authentication system
   ├── 📁 assets/
   │   └── 🖼️ logo-6.jpeg     # Application logo
   ├── 📄 manifest.json       # PWA manifest
   ├── 📄 sw.js              # Service worker
   └── 📖 README.md           # This documentation
   ```

2. **🔧 Development Tools** (Optional)
   - **Live Reload**: Use Live Server extension for auto-refresh
   - **CSS Preprocessing**: Sass/Less setup (optional)
   - **Code Formatting**: Prettier configuration
   - **Linting**: ESLint for JavaScript validation

---

## 🎮 Usage Guide

### 🗺️ **Viewing the Issue Map**

1. **📍 Navigate to Map Section**
   - Click the "🗺️ Map" button in the navigation
   - View all reported issues on the interactive map

2. **🎛️ Filter Issues**
   - Use filter buttons: `All Issues` | `🛣️ Potholes` | `💧 Water` | `🚦 Traffic` | `🔧 Other`
   - Issues update in real-time based on selected filter

3. **💬 Interact with Markers**
   - **Hover** over markers to see issue details
   - **Click** markers for detailed information popup
   - Color coding: 🔴 New → 🟡 Acknowledged → 🟢 Resolved

### 📝 **Reporting New Issues**

1. **�  Login/Register**
   ```
   �  Email: your@email.com
   🔒 Password: ********
   🚀 [Login] or [Register]
   ```

2. **📍 Set Your Location**
   ```
   📍 Current Location: Getting your location...
   🎯 [Update Location] ← Click if location is incorrect
   ```

3. **🏷️ Select Issue Type**
   - Choose from 6 categories:
     - 🛣️ **Pothole**: Road surface damage
     - 💧 **Water Leak**: Pipe bursts or leaks
     - � * *Traffic Light**: Malfunctioning signals
     - 💡 **Street Light**: Broken or dim lighting
     - 🕳️ **Drainage**: Blocked drains or flooding
     - 🔧 **Other**: Miscellaneous infrastructure issues

4. **📸 Add Evidence**
   ```
   📸 [Take Photo] ← Direct camera access
   🖼️ Photo preview with ❌ remove option
   ```

5. **📝 Provide Details** (Optional)
   ```
   💬 Description: "Large pothole causing vehicle damage..."
   ```

6. **🚀 Submit Report**
   ```
   ✅ Report Submitted!
   📋 Report ID: #1234567890
   📧 Email notification sent
   📱 [Share on WhatsApp]
   ```

### 📊 **Community Dashboard**

1. **📈 View Statistics**
   - **📊 Total Reports**: Community engagement metrics
   - **✅ Resolved Issues**: Success rate tracking
   - **⏱️ Average Fix Time**: Response efficiency
   - **👥 Active Users**: Community size

2. **🔥 Trending Issues**
   - Most upvoted reports
   - Recent submissions
   - Status progression tracking

3. **🔍 Search & Filter**
   ```
   🔍 Search: "pothole main street"
   📍 Real-time filtering with visual feedback
   🎯 Instant results with highlighted matches
   ```

### 👤 **User Profile Management**

1. **📊 Personal Statistics**
   ```
   📋 Reports Submitted: 15
   👍 Upvotes Received: 47
   📅 Member Since: January 2024
   ```

2. **📄 Export Reports**
   ```
   📄 [Export PDF] ← Generate professional report
   🖨️ Print-friendly format with all your data
   ```

3. **🏙️ City Management**
   ```
   📍 Current City: Johannesburg
   🔄 [Change City] ← Switch to different location
   ```

### 🌙 **Theme Customization**

1. **🔄 Toggle Theme**
   ```
   🌞🌙 [Toggle Switch] ← Click to switch Dark/Light mode
   ```

2. **💾 Automatic Saving**
   - Theme preference saved locally
   - Restored on next visit
   - System theme detection

---

## 🗺️ Project Structure

```
📁 SafeCityWeb/
│
├── 📄 index.html                 # 🏠 Landing Page
│   ├── 🎯 Hero Section          # Welcome and app introduction
│   ├── ✨ Features Overview     # Key functionality highlights
│   └── � Get St arted Button    # Navigate to main app
│
├── �  pages/
│   ├── 📄 dashboard.html        # 🏠 Main Application
│   │   ├── 🎯 Header Navigation # Logo, menu, theme toggle, user info
│   │   ├── 🗺️ Map Section      # Interactive issue visualization
│   │   ├── � Reeport Section   # Issue submission form
│   │   ├── 📊 Stats Section    # Community dashboard
│   │   ├── 👤 Profile Section  # User dashboard and PDF export
│   │   ├── ✅ Success Modal    # Report confirmation
│   │   ├── �️ Citny Modal       # City selection
│   │   └── ⏳ Loading Overlay  # User feedback during operations
│   └── 📄 offline.html         # 📱 PWA offline page
│
├── 📁 css/
│   └── 🎨 styles.css           # 💄 Complete Styling System
│       ├── 📄 CSS Reset & Base # Normalize browser defaults
│       ├── 🎨 Theme Variables  # Light/Dark mode color schemes
│       ├── �  Responsive Design# Mobile-first approach
│       ├── 🎭 Component Styles # Modular CSS architecture
│       ├── 🎬 Animations       # Smooth transitions & interactions
│       ├── 👤 Profile Styles   # User dashboard styling
│       └── ♿ Accessibility    # Focus states & ARIA support
│
├── 📁 js/
│   ├── ⚡ script.js            # 🧠 Main Application Logic
│   │   ├── �️ Apop State       # Centralized data handling
│   │   ├── 🧭 Navigation       # Section switching logic
│   │   ├── 📍 Geolocation      # GPS & location services
│   │   ├── � Pchoto Upload     # Camera integration
│   │   ├── 💾 Data Persistence # Database & local storage
│   │   ├── 🗺️ Map Interactions # Marker management & filtering
│   │   ├── 🔍 Search System    # Real-time search functionality
│   │   ├── 📊 Statistics       # Real-time metrics
│   │   ├── 🌙 Theme Management # Dark/Light mode controller
│   │   ├── 📄 PDF Export       # Report generation
│   │   ├── 📧 Notifications    # Email & WhatsApp integration
│   │   ├── 📱 PWA Features     # Service worker integration
│   │   └── ⚠️ Error Handling   # Graceful failure management
│   └── 🔐 auth.js              # 🔒 Authentication System
│       ├── 👤 User Management  # Login/register functionality
│       ├── 🔑 Session Handling # Token management
│       └── 🗃️ Supabase Integration # Database authentication
│
├── 📁 assets/
│   └── 🖼️ logo-6.jpeg          # 🎨 Application Branding
│
├── 📄 manifest.json            # 📱 PWA Configuration
│   ├── 📱 App Metadata         # Name, description, icons
│   ├── 🎨 Theme Colors         # Status bar and theme colors
│   └── 📲 Installation Config  # Display mode and orientation
│
├── 📄 sw.js                    # 🔄 Service Worker
│   ├── 📦 Cache Management     # Offline resource caching
│   ├── 🔄 Background Sync      # Data synchronization
│   └── 📱 PWA Functionality    # App-like behavior
│
└── 📖 README.md                # 📚 Complete Documentation
    └── 📋 This comprehensive guide
```

### 📁 **Code Architecture Details**

#### 📄 **index.html Structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    🎯 Meta & SEO Configuration
    🎨 External Dependencies (Font Awesome)
    📱 Viewport & Responsive Setup
</head>
<body>
    📋 Header (Navigation & Branding)
    🎮 Main Content Area
        🗺️ Map Section (Issue Visualization)
        📝 Report Section (Form Interface)  
        📊 Stats Section (Analytics Dashboard)
    💬 Modal Components (Success/Error Messages)
    ⚡ JavaScript Integration
</body>
</html>
```

#### 🎨 **styles.css Organization**
```css
/* 🔧 Foundation */
CSS Reset & Variables
Typography System
Layout Grid

/* 🎨 Components */
Header & Navigation
Interactive Map
Form Elements  
Statistics Cards
Modal Systems

/* 📱 Responsive */
Mobile Breakpoints
Tablet Adaptations
Desktop Enhancements

/* 🌙 Theming */
Light Mode Palette
Dark Mode Variations
Transition Animations
```

#### ⚡ **script.js Modules**
```javascript
// 🗃️ Core Architecture
const appState = { /* Centralized State */ };

// 🎯 Feature Modules
function navigationManager() { /* Section Switching */ }
function locationServices() { /* GPS Integration */ }
function photoHandler() { /* Camera Access */ }
function dataManager() { /* CRUD Operations */ }
function uiController() { /* DOM Interactions */ }
function themeManager() { /* Appearance Control */ }

// 🚀 Initialization
document.addEventListener('DOMContentLoaded', initializeApp);
```

---

## 🎨 Design Features

### 🌈 **Visual Design System**

#### **🎨 Color Palette**
| Purpose | Light Mode | Dark Mode | Usage |
|---------|------------|-----------|-------|
| **Primary** | `#667eea` → `#764ba2` | `#2c3e50` → `#34495e` | Buttons, accents |
| **Background** | `#ffffff` | `#1a1a1a` | Main content areas |
| **Text Primary** | `#333333` | `#e0e0e0` | Headings, important text |
| **Text Secondary** | `#666666` | `#b0b0b0` | Descriptions, metadata |
| **Success** | `#26de81` | `#20bf6b` | Completed actions |
| **Warning** | `#ffa502` | `#ff6348` | In-progress items |
| **Error** | `#ff6b6b` | `#ee5a24` | New/urgent issues |

#### **📐 Layout System**
- **🗃️ CSS Grid**: Statistics dashboard, issue type selector
- **📦 Flexbox**: Navigation, form layout, card components
- **📱 Mobile-First**: Breakpoints at 480px, 768px, 1024px
- **⚡ Fluid Typography**: `clamp()` functions for responsive text

#### **🎭 Interactive Elements**
- **⭐ Hover Effects**: Scale transforms, shadow elevation
- **🔄 Smooth Transitions**: 0.3s ease-in-out for state changes
- **💫 Loading States**: Spinner animations, progress indicators
- **🎪 Micro-interactions**: Button press feedback, form validation

### 🎬 **Animation System**

```css
/* 📍 Map Marker Pulse */
@keyframes markerPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* ✨ Modal Slide-in */
@keyframes modalSlideIn {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* 🌊 Button Hover Shimmer */
.issue-type::before {
    background: linear-gradient(90deg, 
        transparent, 
        rgba(102, 126, 234, 0.2), 
        transparent);
    transform: translateX(-100%);
    transition: transform 0.5s;
}
```

---

## 📱 Responsive Design

### 📐 **Breakpoint Strategy**

#### **📱 Mobile (≤ 480px)**
```css
📄 Single column layout
📝 Stacked form elements  
🗺️ Compact map view (350px height)
🎯 Touch-optimized buttons (min 44px)
📋 Simplified navigation
```

#### **📟 Tablet (481px - 768px)**
```css
📊 2-column statistics grid
🗺️ Standard map view (500px height)
📱 Responsive image galleries
🎨 Maintained visual hierarchy
```

#### **💻 Desktop (769px+)**
```css
🗃️ Multi-column layouts
🗺️ Full-featured map interface
📊 4-column statistics dashboard
🎨 Enhanced hover interactions
```

### 🎯 **Touch & Accessibility Optimization**

- **👆 Touch Targets**: Minimum 44x44px click areas
- **📱 Gesture Support**: Swipe navigation preparation
- **📍 Zoom Compatibility**: Pinch-to-zoom friendly layouts
- **⌨️ Keyboard Navigation**: Tab order, focus management
- **📊 Screen Reader**: ARIA labels, semantic HTML structure

---

## ♿ Accessibility

### 🎯 **WCAG 2.1 AA Compliance**

#### **📍 Visual Accessibility**
- **🌈 Color Contrast**: 4.5:1 minimum ratio for all text
- **🎨 Color Independence**: Information not conveyed by color alone
- **📝 Focus Indicators**: 2px solid outlines on interactive elements
- **📱 Scalable Interface**: Supports 200% zoom without horizontal scrolling

#### **⌨️ Keyboard Navigation**
```javascript
// 🎯 Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1': showSection('map'); break;      // Ctrl+1: Map
            case '2': showSection('report'); break;   // Ctrl+2: Report
            case '3': showSection('stats'); break;    // Ctrl+3: Statistics
        }
    }
    // 🌙 Theme Toggle: Ctrl+Shift+T
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 't') {
        themeManager.toggleTheme();
    }
});
```

#### **📊 Screen Reader Support**
```html
<!-- 🏷️ ARIA Labels -->
<button aria-label="Toggle between light and dark theme">
<input aria-describedby="location-help" placeholder="Enter location">
<div role="alert" aria-live="polite" id="status-messages">

<!-- 📋 Semantic Structure -->
<main role="main">
<nav role="navigation">
<section aria-labelledby="map-heading">
```

#### **⚡ Performance Accessibility**
- **🚀 Fast Loading**: Under 3 seconds on 3G connections
- **📱 Progressive Enhancement**: Works without JavaScript
- **💾 Offline Capability**: Service Worker integration ready
- **📄 Graceful Degradation**: Fallbacks for all interactive features

---

## 🌙 Dark Mode

### 🎨 **Complete Theme System**

#### **📄 Automatic Detection**
```javascript
// 🌐 System Preference Detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('safecity-theme') || 
    (prefersDark.matches ? 'dark' : 'light');
```

#### **💾 Theme Persistence**
```javascript
// 💽 Local Storage Integration  
const themeManager = {
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('safecity-theme', theme);
        this.updateThemeElements();
    }
};
```

#### **🎯 Dynamic Theme Variables**
```css
/* 🌅 Light Mode */
:root {
    --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --text-primary: #333333;
    --card-bg: #ffffff;
}

/* 🌙 Dark Mode */
[data-theme="dark"] {
    --bg-primary: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    --text-primary: #e0e0e0;
    --card-bg: #2d2d2d;
}
```

#### **🎚️ Theme Toggle Component**
```html
<button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
    <div class="toggle-track">
        <div class="toggle-thumb">
            <i class="fas fa-sun sun-icon"></i>      <!-- ☀️ Light Mode -->
            <i class="fas fa-moon moon-icon"></i>    <!-- 🌙 Dark Mode -->
        </div>
    </div>
</button>
```

### 🎨 **Visual Adaptations**

| Component | Light Mode | Dark Mode |
|-----------|------------|-----------|
| **🗺️ Map Background** | `#f0f2f5` → `#e1e8ed` | `#3a3a3a` → `#2d2d2d` |
| **📋 Form Inputs** | `#ffffff` border `#ddd` | `#3a3a3a` border `#444` |
| **📊 Statistics Cards** | `#f8f9fa` → `#e9ecef` | `#3a3a3a` gradients |
| **💬 Modal Overlay** | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.8)` |

---

## 🔧 API Integration

### �️ *C*Database Integration**

The application uses **Supabase** as the backend database with real-time functionality and user authentication.

#### **📊 Database Schema**
```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE auth.users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE,
    created_at TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR,
    type VARCHAR NOT NULL,
    location JSONB NOT NULL,
    description TEXT,
    photo_url TEXT,
    upvotes INTEGER DEFAULT 0,
    status VARCHAR DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
);

-- User statistics view
CREATE VIEW user_stats AS
SELECT 
    user_id,
    COUNT(*) as total_reports,
    SUM(upvotes) as total_upvotes,
    MIN(created_at) as member_since
FROM reports 
GROUP BY user_id;
```

### � **Cururent API Implementation**

#### **🗃️ Supabase Integration**
```javascript
// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 📤 Submit New Report
async function submitReport(reportData) {
    const { data, error } = await supabase
        .from('reports')
        .insert([{
            user_id: user.id,
            user_email: user.email,
            type: reportData.type,
            location: reportData.location,
            description: reportData.description,
            photo_url: reportData.photo
        }]);
    return { data, error };
}

// � Fetch nReports with Real-time Updates
async function getReports() {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
    return { data, error };
}

// 👍 Update Report Upvotes
async function upvoteReport(reportId) {
    const { data, error } = await supabase
        .rpc('increment_upvotes', { report_id: reportId });
    return { data, error };
}

// � Get  User Statistics
async function fetchUserStatistics() {
    const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
    return { data, error };
}
```

#### **🔐 Authentication System**
```javascript
// 🔑 User Registration
async function registerUser(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: userData.firstName,
                last_name: userData.lastName,
                city: userData.city
            }
        }
    });
    return { data, error };
}

// 🔓 User Login
async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

// 📊 Session Management
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        handleUserLogin(session.user);
    } else if (event === 'SIGNED_OUT') {
        handleUserLogout();
    }
});
```

### � ***Notification Systems**

#### **📧 EmailJS Integration**
```javascript
// Initialize EmailJS
emailjs.init("YOUR_PUBLIC_KEY");

// Send notification email
async function sendNotificationEmail(reportData) {
    const templateParams = {
        user_name: user.name,
        user_email: user.email,
        report_type: reportData.type,
        report_location: reportData.location.address,
        report_description: reportData.description,
        report_id: reportData.id
    };
    
    return await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        templateParams
    );
}
```

#### **📱 WhatsApp Integration**
```javascript
// Generate WhatsApp share link
function generateWhatsAppLink(reportData) {
    const message = `🚨 New Infrastructure Issue Reported!
    
📍 Location: ${reportData.location.address}
🏷️ Type: ${reportData.type}
📝 Description: ${reportData.description}
🆔 Report ID: #${reportData.id}

Help make our community better! 🌟`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
}
```

### 🛠️ **Technology Stack Summary**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **🗃️ Database** | Supabase PostgreSQL | Real-time data storage |
| **🔐 Authentication** | Supabase Auth | User management |
| **📧 Email** | EmailJS | Automated notifications |
| **📱 PWA** | Service Worker | Offline functionality |
| **📄 PDF Export** | Browser Print API | Report generation |
| **🔍 Search** | JavaScript | Real-time filtering |

---

## 🤝 Contributing

### 🎯 **How to Contribute**

We welcome contributions from developers, designers, and community members! Here's how you can help improve SafeCity:

#### **🚀 Getting Started**

1. **🍴 Fork the Repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/SafeCityWeb.git
   cd SafeCityWeb
   git remote add upstream https://github.com/Uwami-Mgxekwa/SafeCityWeb.git
   ```

2. **🌿 Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   # or
   git checkout -b bugfix/fix-important-bug
   # or  
   git checkout -b docs/improve-documentation
   ```

3. **💻 Make Your Changes**
   - Follow existing code style and conventions
   - Add comments for complex functionality
   - Test your changes across different devices and browsers

4. **✅ Commit Your Changes**
   ```bash
   git add .
   git commit -m "✨ Add amazing new feature
   
   - Detailed description of changes
   - Impact on user experience  
   - Any breaking changes noted"
   ```

5. **📤 Push and Create Pull Request**
   ```bash
   git push origin feature/amazing-new-feature
   ```
   Then create a Pull Request on GitHub with:
   - Clear description of changes
   - Screenshots for UI changes
   - Testing instructions

#### **🎨 Areas for Contribution**

| Area | Difficulty | Examples |
|------|------------|----------|
| **🐛 Bug Fixes** | ⭐ Beginner | Form validation, responsive issues |
| **🎨 UI/UX Improvements** | ⭐⭐ Intermediate | New animations, better accessibility |
| **⚡ Performance** | ⭐⭐ Intermediate | Code optimization, loading improvements |
| **🚀 New Features** | ⭐⭐⭐ Advanced | Real-time updates, advanced filtering |
| **🔧 Backend Integration** | ⭐⭐⭐ Advanced | API development, database design |

#### **📋 Contribution Guidelines**

##### **💻 Code Standards**
- **📝 JavaScript**: Use ES6+ features, meaningful variable names
- **🎨 CSS**: Follow BEM methodology, mobile-first approach  
- **📄 HTML**: Semantic markup, accessibility attributes
- **📖 Documentation**: Update README for new features

##### **🧪 Testing Requirements**
- **📱 Cross-browser**: Chrome, Firefox, Safari, Edge
- **📱 Mobile Testing**: iOS Safari, Chrome Mobile, Samsung Internet
- **♿ Accessibility**: Screen reader compatibility, keyboard navigation
- **🌙 Theme Testing**: Both light and dark modes

##### **📝 Pull Request Template**
```markdown
## 🎯 Description
Brief description of changes

## 📱 Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💄 UI/Style update
- [ ] ♿ Accessibility improvement
- [ ] 📖 Documentation update

## 🧪 Testing
- [ ] Desktop browsers tested
- [ ] Mobile devices tested  
- [ ] Accessibility validated
- [ ] Dark mode verified

## 📸 Screenshots
Add screenshots for UI changes
```

### 🌟 **Feature Requests & Ideas**

We're always looking for ways to improve SafeCity! Here are some areas where we'd love community input:

#### **✅ Recently Implemented Features**
- **🗃️ Database Integration**: Full Supabase backend with real-time updates
- **� Uoser Authentication**: Secure login/register system
- **👤 User Profiles**: Personal dashboards with statistics
- **� PDF yExport**: Professional report generation
- **� Rueal-time Search**: Instant filtering with visual feedback
- **📧 Email Notifications**: Automated alerts via EmailJS
- **📱 WhatsApp Integration**: Social sharing functionality
- **� PWA iSupport**: Offline mode and app installation
- **🏙️ Multi-city Support**: Switch between different locations

#### **🔮 Upcoming Features**
- **🌍 Multi-language Support**: Zulu, Afrikaans, Sotho translations
- **📱 Native Mobile Apps**: iOS/Android applications
- **🤖 AI Classification**: Automatic issue categorization from photos
- **📊 Analytics Dashboard**: Advanced reporting for city officials
- **🔔 Push Notifications**: Real-time status updates
- **🎮 Gamification**: Points and badges for active community members
- **🤝 Government Integration**: Connect with City of Johannesburg systems
- **📍 Enhanced Offline Mode**: Full offline report creation

#### **🎯 Community Initiatives**
- **🏫 Educational Outreach**: School and community workshops
- **🏛️ Government Partnership**: Official city endorsement
- **📱 Social Media Integration**: Share reports on social platforms
- **🌱 Environmental Impact**: Carbon footprint tracking for fixes
- **📈 Impact Metrics**: Measure community improvement over time

---

## 👥 Contributors

### 🚀 **Core Development Team**

<table>
<tr>
    <td align="center">
        <a href="https://github.com/Uwami-Mgxekwa">
            <img src="https://github.com/Uwami-Mgxekwa.png" width="100px;" alt="Uwami Mgxekwa"/>
            <br />
            <sub><b>Uwami Mgxekwa</b></sub>
        </a>
        <br />
        <sub>💻 Lead Developer & Creator</sub>
        <br />
        <sub>🎨 UI/UX Design | ⚡ Full-Stack Development</sub>
    </td>
</tr>
</table>

### 🌟 **Project Leadership**

**Uwami Mgxekwa** is the visionary behind SafeCity, bringing together technical expertise and community passion to create meaningful infrastructure solutions. With a focus on user-centered design and social impact, Uwami has developed SafeCity as a comprehensive platform that empowers citizens to actively participate in improving their communities.

#### **🛠️ Technical Contributions**
- **🏗️ Architecture Design**: Complete application structure and data flow
- **💻 Frontend Development**: Responsive HTML5, CSS3, and JavaScript implementation
- **🎨 UI/UX Design**: Modern, accessible interface with dark/light mode support
- **📱 Mobile Optimization**: Cross-device compatibility and touch interactions
- **♿ Accessibility**: WCAG 2.1 compliance and inclusive design principles
- **🌙 Theme System**: Dynamic theming with user preference persistence
- **📍 Geolocation Integration**: GPS-based location services and mapping
- **📸 Media Handling**: Camera integration and photo upload functionality

#### **🌍 Community Impact**
- **📋 Requirements Gathering**: Community research and user needs analysis
- **🎯 Product Vision**: Strategic roadmap for infrastructure reporting solutions
- **📖 Documentation**: Comprehensive guides and technical documentation
- **🤝 Open Source**: Making SafeCity freely available for community benefit

### 🤝 **How to Become a Contributor**

We welcome contributors of all skill levels! Here are ways you can get involved:

#### **👩‍💻 For Developers**
- **🐛 Bug Fixes**: Help identify and resolve issues
- **✨ Feature Development**: Build new capabilities
- **⚡ Performance**: Optimize loading and responsiveness
- **🔧 Backend Development**: API and database design
- **📱 Mobile Apps**: Native iOS/Android development

#### **🎨 For Designers**
- **🖼️ Visual Design**: Icons, graphics, and branding
- **🎪 UX Research**: User experience testing and feedback
- **♿ Accessibility**: Design inclusive interfaces
- **📱 Mobile Design**: Touch-first interaction patterns

#### **🌍 For Community Members**
- **🗣️ Translation**: Multi-language support
- **📝 Content**: Help text, tutorials, and guides
- **🧪 Testing**: Cross-browser and device testing
- **📢 Advocacy**: Spread awareness about SafeCity

#### **🏛️ For Organizations**
- **🤝 Partnerships**: Government and NGO collaboration
- **💰 Sponsorship**: Support ongoing development
- **📊 Data**: Provide real infrastructure data
- **🎓 Education**: Workshop and training partnerships

### 🙏 **Acknowledgments**

Special thanks to:

- **🏛️ City of Johannesburg**: Inspiration for civic engagement
- **🌍 Open Source Community**: Tools and libraries that make SafeCity possible
- **👥 Beta Testers**: Early users who provided valuable feedback
- **🎓 Academic Partners**: Research and development support
- **💻 Font Awesome**: Beautiful icons for enhanced user experience
- **📱 Web API Standards**: Enabling modern browser capabilities

---

## 📄 License

### 📜 **MIT License**

```
MIT License

Copyright (c) 2024 Uwami Mgxekwa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 🌟 **Open Source Philosophy**

SafeCity is built on the belief that community infrastructure tools should be:

- **🆓 Free**: No cost barriers to access or improvement
- **📖 Transparent**: Open source code for community review
- **🤝 Collaborative**: Built with and for the community
- **🌍 Inclusive**: Accessible to all users regardless of ability
- **🚀 Innovative**: Encouraging experimentation and improvement

### 📋 **Usage Rights**

You are free to:
- **✅ Use**: Run SafeCity for any purpose
- **✅ Study**: Examine how SafeCity works
- **✅ Modify**: Adapt SafeCity to your needs
- **✅ Distribute**: Share SafeCity with others
- **✅ Improve**: Contribute back to the community

---

## 💥 Contact

### 📞 **Get in Touch**

We'd love to hear from you! Whether you have questions, suggestions, or want to collaborate:

#### **👨‍💻 Developer Contact**
- **📧 Email**: [Contact via GitHub](https://github.com/Uwami-Mgxekwa)
- **💻 GitHub**: [@Uwami-Mgxekwa](https://github.com/Uwami-Mgxekwa)
- **📱 LinkedIn**: [Connect on LinkedIn](https://linkedin.com/in/uwami-mgxekwa)
- **🐦 Twitter**: Follow for updates and announcements

#### **🔗 Project Links**
- **🌐 Live Demo**: [View SafeCity in Action](https://uwami-mgxekwa.github.io/SafeCityWeb/)
- **📂 Source Code**: [GitHub Repository](https://github.com/Uwami-Mgxekwa/SafeCityWeb)
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Uwami-Mgxekwa/SafeCityWeb/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/Uwami-Mgxekwa/SafeCityWeb/discussions)

#### **🤝 Collaboration Opportunities**

Interested in partnering with SafeCity? We're open to:

- **🏛️ Government Partnerships**: Official adoption and integration
- **🎓 Academic Collaboration**: Research and development projects  
- **💼 Corporate Sponsorship**: Supporting ongoing development
- **🌍 NGO Partnerships**: Community outreach and education
- **👥 Community Groups**: Local implementation and feedback

#### **📧 Contact Form**

For detailed inquiries, please include:
- **📝 Subject**: Brief description of your inquiry
- **🏢 Organization**: Your company, government, or group (if applicable)
- **📍 Location**: City or region of interest
- **💭 Message**: Detailed description of how you'd like to engage

#### **⚡ Quick Response Times**

We aim to respond to:
- **🐛 Bug Reports**: Within 48 hours
- **💡 Feature Requests**: Within 1 week  
- **🤝 Partnership Inquiries**: Within 3-5 business days
- **❓ General Questions**: Within 24-48 hours

---

## 🎯 **Final Words**

SafeCity represents more than just a web application – it's a vision of empowered communities working together to create better, safer cities for everyone. By combining modern web technologies with citizen engagement, we're building a platform that bridges the gap between community needs and government action.

### 🌟 **Our Vision for the Future**

- **🏙️ Smart Cities**: Integration with IoT sensors and city management systems
- **🌍 Global Expansion**: Adapting SafeCity for cities worldwide
- **🤖 AI Enhancement**: Machine learning for predictive maintenance
- **📱 Mobile-First**: Native apps with offline capabilities
- **🎮 Gamification**: Making civic engagement fun and rewarding

### 🙏 **Thank You**

Thank you for your interest in SafeCity. Together, we can build stronger, more responsive communities where every citizen has a voice in shaping their environment.

**Let's make our cities safer, one report at a time.** 🚀

---

<div align="center">

**🌟 Star this repository if you find SafeCity useful! 🌟**

[![GitHub Stars](https://img.shields.io/github/stars/Uwami-Mgxekwa/SafeCityWeb?style=social)](https://github.com/Uwami-Mgxekwa/SafeCityWeb/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Uwami-Mgxekwa/SafeCityWeb?style=social)](https://github.com/Uwami-Mgxekwa/SafeCityWeb/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Uwami-Mgxekwa/SafeCityWeb)](https://github.com/Uwami-Mgxekwa/SafeCityWeb/issues)
[![GitHub Contributors](https://img.shields.io/github/contributors/Uwami-Mgxekwa/SafeCityWeb)](https://github.com/Uwami-Mgxekwa/SafeCityWeb/graphs/contributors)

Made with ❤️ for the community by [Uwami Mgxekwa](https://github.com/Uwami-Mgxekwa)

</div>- 