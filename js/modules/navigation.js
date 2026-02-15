/**
 * Navigation Module
 * Handles all navigation-related functionality
 */

class NavigationModule {
    constructor() {
        this.config = window.SiteConfig;
    }

    /**
     * Initialize all navigation functionality
     */
    init() {
        this.initMobileMenu();
        this.initSmoothScrolling();
        this.initActiveStates();
        this.handlePageLoadAnchors();
    }

    /**
     * Initialize mobile menu functionality
     */
    initMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => {
            this.toggleMobileMenu(navToggle, navMenu);
        });

        // Close menu when clicking on links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu(navToggle, navMenu);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                this.closeMobileMenu(navToggle, navMenu);
            }
        });
    }

    /**
     * Toggle mobile menu state
     * @param {HTMLElement} toggle - Toggle button element
     * @param {HTMLElement} menu - Menu element
     */
    toggleMobileMenu(toggle, menu) {
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
    }

    /**
     * Close mobile menu
     * @param {HTMLElement} toggle - Toggle button element
     * @param {HTMLElement} menu - Menu element
     */
    closeMobileMenu(toggle, menu) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
    }

    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollTo(link.getAttribute('href'));
            });
        });
    }

    /**
     * Smooth scroll to target element
     * @param {string} targetId - Target element ID
     */
    smoothScrollTo(targetId) {
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const header = document.querySelector('.header');
            let headerHeight = 140; // Default fallback
            
            if (header) {
                headerHeight = header.offsetHeight;
            }
            
            
            const additionalOffset = 40; // Extra space to ensure title is clearly visible
            const targetPosition = targetSection.offsetTop - headerHeight - additionalOffset;
            
            
            window.scrollTo({
                top: Math.max(0, targetPosition), // Ensure we don't scroll above the page
                behavior: 'smooth'
            });
        }
    }

    /**
     * Initialize active navigation states
     */
    initActiveStates() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Check if link matches current page
            if (this.isLinkActive(href, currentPath)) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Check if navigation link should be active
     * @param {string} href - Link href attribute
     * @param {string} currentPath - Current page path
     * @returns {boolean} - Whether link should be active
     */
    isLinkActive(href, currentPath) {
        if (href.startsWith('#')) {
            return false; // Handle hash links separately if needed
        }
        
        const fileName = href.split('/').pop();
        return currentPath.endsWith(fileName);
    }

    /**
     * Handle page load with anchors (for cross-page navigation)
     */
    handlePageLoadAnchors() {
        // Check if page was loaded with an anchor
        if (window.location.hash) {
            // If page is already loaded, scroll immediately
            if (document.readyState === 'complete') {
                setTimeout(() => {
                    this.smoothScrollTo(window.location.hash);
                }, 500); // Longer delay to ensure layout is complete
            } else {
                // Wait for page to fully load, then scroll with proper offset
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        this.smoothScrollTo(window.location.hash);
                    }, 500); // Longer delay to ensure all elements are rendered and styled
                });
            }
        }
    }
}

// Export for use in other modules
window.NavigationModule = NavigationModule;