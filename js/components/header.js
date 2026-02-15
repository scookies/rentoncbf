/**
 * Header Component
 * Reusable header component to eliminate duplication across pages
 */

class HeaderComponent {
    constructor() {
        this.config = window.SiteConfig;
    }

    /**
     * Generate the complete header HTML
     * @param {Object} options - Configuration options for this specific page
     * @returns {string} - Complete header HTML
     */
    render(options = {}) {
        const { showAsH1 = false } = options;
        
        return `
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
        `;
    }

    /**
     * Render logo component
     * @returns {string} - Logo HTML
     */
    renderLogo() {
        return `
            <a href="index.html" class="logo">
                <img src="${this.config.site.logo}" alt="${this.config.site.logoAlt}" />
            </a>
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
        // Use hardcoded navigation structure to maintain existing functionality
        return `
            <div class="nav-menu" id="nav-menu">
                <nav>
                    <ul class="nav-list">
                        <li><a href="index.html" class="nav-link">Home</a></li>
                        <li><a href="index.html#our-story" class="nav-link">Our Story</a></li>
                        <li><a href="index.html#success-stories" class="nav-link">Success Stories</a></li>
                        <li class="nav-item">
                            <a href="#" class="nav-link has-dropdown">Fairs</a>
                            <div class="nav-dropdown">
                                <a href="upcoming-fair.html" class="nav-dropdown-item">Upcoming Fair</a>
                                <a href="fairs.html" class="nav-dropdown-item">Past Fairs</a>
                            </div>
                        </li>
                        <li><a href="sponsors.html" class="nav-link">Sponsor Us</a></li>
                    </ul>
                </nav>
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
     * Initialize header functionality (scroll effects handled by NavigationModule)
     */
    init() {
        // HeaderComponent only handles rendering, NavigationModule handles all interactions
        console.log('✅ HeaderComponent initialized (rendering only)');
    }
}

// Export for use in other modules
window.HeaderComponent = HeaderComponent;