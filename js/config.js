/**
 * Site Configuration
 * Centralized configuration for easy maintenance and customization
 */

window.SiteConfig = {
    // Site Information
    site: {
        name: "Renton Children's Business Fair",
        tagline: "Youth Empowerment Through Entrepreneurship",
        logo: "images/RentonCBFLogo.png",
        logoAlt: "Renton Children's Business Fair Logo"
    },

    // Navigation
    navigation: {
        primary: [
            { text: 'Home', href: 'index.html', external: false },
            { text: 'Our Story', href: 'index.html#our-story', external: false },
            { text: 'Success Stories', href: 'index.html#success-stories', external: false },
            { text: 'Learn', href: 'learn.html', external: false },
            { 
                text: 'Fairs', 
                dropdown: [
                    { text: 'Upcoming Fair', href: '#', external: false, modal: 'upcoming-fair-modal' },
                    { text: 'Register', href: 'register.html', external: false },
                    { text: 'Past Fairs', href: 'fairs.html', external: false }
                ]
            },
            { text: 'Sponsor Us', href: 'sponsors.html', external: false }
        ]
    },

    // Animation Settings
    animations: {
        carousel: {
            autoPlay: true,
            interval: 5000,
            transition: 'ease-in-out'
        },
        scrollAnimations: {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        },
        parallax: {
            enabled: true,
            rate: -0.5
        }
    },

    // UI Settings
    ui: {
        header: {
            scrollThreshold: 100,
            transparentBg: '#FFFFFF',
            scrolledBg: '#FFFFFF'
        },
        notifications: {
            duration: 4000,
            position: 'top-right'
        }
    },

    // Registration Form
    registration: {
        // Paste your deployed Google Apps Script Web App URL here (see apps-script/SETUP.md).
        // While empty, the form runs in simulation mode (logs data, shows success, does not send).
        endpoint: 'https://script.google.com/macros/s/AKfycbwr_WkF4jrlKvdzX0Usf75QUHA2EjTGIweLyaSOog3Z0zceLRaZdNX9LLeiSkmEo7hH/exec',
        maxChildren: 3,
        ageMin: 7,
        ageMax: 17
    },

    // Contact Information
    contact: {
        email: '',
        phone: '',
        address: ''
    },

    // Social Media
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    }
};
