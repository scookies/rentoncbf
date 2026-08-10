/**
 * Footer Component
 * Reusable footer component to eliminate duplication across pages
 */

class FooterComponent {
    constructor() {
        this.config = window.SiteConfig;
    }

    /**
     * Generate the complete footer HTML
     * @returns {string} - Complete footer HTML
     */
    render() {
        return `
            <div class="container">
                <div class="footer-content">
                    ${this.renderCompanySection()}
                    ${this.renderDiscoverSection()}
                    ${this.renderConnectSection()}
                    ${this.renderNewsletterSection()}
                </div>
                ${this.renderFooterBottom()}
            </div>
        `;
    }

    /**
     * Render company information section
     * @returns {string} - Company section HTML
     */
    renderCompanySection() {
        return `
            <div class="footer-section">
                <h3>Renton Children's Business Fair</h3>
                <p>Empowering the next generation of entrepreneurs through creativity, innovation, and real business experience.</p>
            </div>
        `;
    }

    /**
     * Render discover section with links
     * @returns {string} - Discover section HTML
     */
    renderDiscoverSection() {
        return `
            <div class="footer-section">
                <h4>Discover</h4>
                <ul>
                    <li><a href="fairs.html">Past Fairs</a></li>
                    <li><a href="sponsors.html">Sponsor Us</a></li>
                    <!-- <li><a href="learn.html">Learn</a></li> -->
                </ul>
            </div>
        `;
    }

    /**
     * Render connect section with social links
     * @returns {string} - Connect section HTML
     */
    renderConnectSection() {
        return `
            <div class="footer-section">
                <h4>Connect With Us</h4>
                <div class="social-links">
                    <a href="https://www.facebook.com/profile.php?id=61571426811079" class="social-link" target="_blank" rel="noopener">
                        <i class="fab fa-facebook"></i>
                    </a>
                    <a href="https://www.instagram.com/rentoncbf" class="social-link" target="_blank" rel="noopener">
                        <i class="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.childrensbusinessfair.org/wa-renton" class="social-link" target="_blank" rel="noopener">
                        <i class="fas fa-globe"></i>
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Render newsletter signup section
     * Markup comes from NewsletterModule so the footer and modal share one
     * form definition. Guarded because footer.js must not hard-depend on it.
     * @returns {string} - Newsletter section HTML
     */
    renderNewsletterSection() {
        const form = window.NewsletterModule
            ? window.NewsletterModule.renderForm('footer')
            : '';
        return `
            <div class="footer-section footer-newsletter">
                <h4>Stay in the Loop</h4>
                <p>Get notified when the next fair opens.</p>
                ${form}
            </div>
        `;
    }

    /**
     * Render footer bottom section with copyright
     * @returns {string} - Footer bottom HTML
     */
    renderFooterBottom() {
        const currentYear = new Date().getFullYear();
        return `
            <div class="footer-bottom">
                <p style="text-align: center; margin: 0 auto; max-width: none;">&copy; ${currentYear} Renton Children's Business Fair. All rights reserved.<br>A Project of CascadiaNow!</p>
            </div>
        `;
    }

    /**
     * Initialize footer functionality
     */
    init() {
        console.log('✅ FooterComponent initialized (rendering only)');
    }
}

// Export for use in other modules
window.FooterComponent = FooterComponent;
