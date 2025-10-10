/**
 * Header Component
 * Reusable header component to eliminate duplication across pages
 */

class HeaderComponent {
    constructor() {
        this.config = window.SiteConfig;
        this.isHomePage = this.isCurrentPage('index.html');
    }

    /**
     * Generate the complete header HTML
     * @param {Object} options - Configuration options for this specific page
     * @returns {string} - Complete header HTML
     */
    render(options = {}) {
        const { showAsH1 = false } = options;
        
        return `
            <header class="header">
                <nav class="nav">
                    <div class="nav-container">
                        <div class="nav-brand">
                            ${this.renderLogo()}
                            ${this.renderBrandTitle(showAsH1)}
                        </div>
                        ${this.renderNavigation()}
                        ${this.renderMobileToggle()}
                    </div>
                </nav>
            </header>
        `;
    }

    /**
     * Render logo component
     * @returns {string} - Logo HTML
     */
    renderLogo() {
        return `
            <div class="logo">
                <img src="${this.config.site.logo}" alt="${this.config.site.logoAlt}" />
            </div>
        `;
    }

    /**
     * Render brand title (H1 on home page, link on others)
     * @param {boolean} showAsH1 - Whether to render as H1 tag
     * @returns {string} - Brand title HTML
     */
    renderBrandTitle(showAsH1) {
        if (showAsH1) {
            return `<h1 class="brand-title">${this.config.site.name}</h1>`;
        }
        return `<a href="index.html" class="brand-title">${this.config.site.name}</a>`;
    }

    /**
     * Render navigation menu
     * @returns {string} - Navigation HTML
     */
    renderNavigation() {
        const navItems = this.config.navigation.primary.map(item => {
            const href = item.page ? item.page + item.href : item.href;
            return `<li><a href="${href}" class="nav-link">${item.label}</a></li>`;
        }).join('');

        return `
            <div class="nav-menu" id="nav-menu">
                <ul class="nav-list">
                    ${navItems}
                </ul>
            </div>
        `;
    }

    /**
     * Render mobile toggle button
     * @returns {string} - Mobile toggle HTML
     */
    renderMobileToggle() {
        return `
            <div class="nav-toggle" id="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    }

    /**
     * Initialize header functionality
     */
    init() {
        this.initNavigation();
        this.initScrollEffects();
    }

    /**
     * Initialize navigation functionality
     */
    initNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) return;

        // Toggle mobile menu
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking on links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    /**
     * Initialize scroll effects for header
     */
    initScrollEffects() {
        const header = document.querySelector('.header');
        if (!header) return;

        const { scrollThreshold, transparentBg, scrolledBg } = this.config.ui.header;

        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                header.style.background = scrolledBg;
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = transparentBg;
                header.style.boxShadow = 'none';
            }
        });
    }

    /**
     * Check if current page matches the given page name
     * @param {string} pageName - Name of the page to check
     * @returns {boolean} - Whether current page matches
     */
    isCurrentPage(pageName) {
        const currentPath = window.location.pathname;
        return currentPath.endsWith(pageName) || 
               (pageName === 'index.html' && currentPath.endsWith('/'));
    }

    /**
     * Inject header into the DOM
     * @param {string} selector - CSS selector where to inject the header
     * @param {Object} options - Options for rendering
     */
    inject(selector = 'body', options = {}) {
        const target = document.querySelector(selector);
        if (target) {
            const isHomePage = this.isCurrentPage('index.html');
            const headerHTML = this.render({ showAsH1: isHomePage, ...options });
            target.insertAdjacentHTML('afterbegin', headerHTML);
            this.init();
        }
    }
}

// Export for use in other modules
window.HeaderComponent = HeaderComponent;