/**
 * Main Application Entry Point
 * Refactored for better maintainability and clean code principles
 * 
 * @author Renton Children's Business Fair Development Team
 * @version 2.0.0
 */

class RentonCBFApp {
    constructor() {
        this.modules = new Map();
        this.isInitialized = false;
        this.config = window.SiteConfig;
    }

    /**
     * Initialize the application
     * Entry point for all functionality
     */
    async init() {
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await this.waitForDOM();
            }

            console.log('🚀 Initializing Renton CBF Application...');
            
            // Initialize core modules in order
            await this.initializeModules();
            
            // Initialize page-specific functionality
            this.initializePageSpecific();
            
            // Set up global event handlers
            this.initializeGlobalEvents();
            
            this.isInitialized = true;
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Wait for DOM to be ready
     * @returns {Promise} Promise that resolves when DOM is ready
     */
    waitForDOM() {
        return new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }

    /**
     * Initialize all core modules
     */
    async initializeModules() {
        const moduleInitializers = [
            { name: 'navigation', class: NavigationModule, required: true },
            { name: 'heroStats', class: HeroStatsModule, required: false },
            { name: 'carousel', class: CarouselModule, required: false },
            { name: 'animations', initializer: () => this.initializeAnimations(), required: false },
            { name: 'forms', initializer: () => this.initializeForms(), required: false },
            { name: 'modal', initializer: () => this.initializeModals(), required: false }
        ];

        for (const moduleConfig of moduleInitializers) {
            try {
                let module;
                
                if (moduleConfig.class) {
                    module = new moduleConfig.class();
                    await module.init();
                } else if (moduleConfig.initializer) {
                    module = moduleConfig.initializer();
                }
                
                this.modules.set(moduleConfig.name, module);
                console.log(`✅ ${moduleConfig.name} module initialized`);
                
            } catch (error) {
                console.warn(`⚠️  ${moduleConfig.name} module failed to initialize:`, error);
                
                if (moduleConfig.required) {
                    throw new Error(`Required module ${moduleConfig.name} failed to initialize`);
                }
            }
        }
    }

    /**
     * Initialize page-specific functionality
     */
    initializePageSpecific() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.initializeHomePage();
                break;
            case 'fairs':
                this.initializeFairsPage();
                break;
            case 'about':
                this.initializeAboutPage();
                break;
        }
    }

    /**
     * Get current page identifier
     * @returns {string} Current page identifier
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop().split('.')[0];
        return fileName || 'index';
    }

    /**
     * Initialize home page specific features
     */
    initializeHomePage() {
        console.log('🏠 Initializing home page features');
        // Home page specific initialization
        this.initializeHeroEffects();
        this.initializeStatCounters();
    }


    /**
     * Initialize fairs page specific features
     */
    initializeFairsPage() {
        console.log('🎪 Initializing fairs page features');
        // Fairs page specific initialization
    }

    /**
     * Initialize about page specific features
     */
    initializeAboutPage() {
        console.log('ℹ️ Initializing about page features');
        // About page specific initialization
    }

    /**
     * Initialize hero section effects
     */
    initializeHeroEffects() {
        if (!this.config.animations.parallax.enabled) return;

        const heroSections = document.querySelectorAll('.hero');
        const scrollHandler = UtilityHelpers.throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = this.config.animations.parallax.rate;
            
            heroSections.forEach(hero => {
                const heroBackground = hero.querySelector('.hero-background');
                if (heroBackground) {
                    heroBackground.style.transform = `translateY(${scrolled * rate}px)`;
                }
            });
        }, 16); // ~60fps

        window.addEventListener('scroll', scrollHandler);
    }

    /**
     * Initialize stat counters animation
     */
    initializeStatCounters() {
        const statItems = document.querySelectorAll('.stat-item[data-count]');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateStatCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            });

            statItems.forEach(item => observer.observe(item));
        }
    }

    /**
     * Animate stat counter
     * @param {HTMLElement} element - Stat element to animate
     */
    animateStatCounter(element) {
        const targetValue = parseInt(element.dataset.count);
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Initialize scroll animations
     */
    initializeAnimations() {
        const animatedElements = document.querySelectorAll(
            '.testimonial, .gallery-item, .fair-card, .timeline-item, .pillar, .value-card, .vendor-card, .stat-item'
        );
        
        if ('IntersectionObserver' in window) {
            const observerOptions = this.config.animations.scrollAnimations;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                    }
                });
            }, observerOptions);
            
            animatedElements.forEach(element => {
                observer.observe(element);
            });
            
            return { observer, elements: animatedElements };
        } else {
            // Fallback for browsers without IntersectionObserver
            animatedElements.forEach(element => {
                element.classList.add('animate');
            });
            return null;
        }
    }



    /**
     * Initialize form handling
     */
    initializeForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.handleFormSubmission(e, form);
            });
        });
        
        return { count: forms.length };
    }

    /**
     * Handle form submission
     * @param {Event} event - Form submission event
     * @param {HTMLFormElement} form - Form element
     */
    handleFormSubmission(event, form) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!this.validateForm(form, data)) {
            return;
        }
        
        console.log('Form submitted:', data);
        UtilityHelpers.showNotification('Thank you! Your form has been submitted.', 'success');
        
        // Reset form
        form.reset();
    }

    /**
     * Validate form data
     * @param {HTMLFormElement} form - Form element
     * @param {Object} data - Form data
     * @returns {boolean} Whether form is valid
     */
    validateForm(form, data) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !UtilityHelpers.isValidEmail(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        });
        
        if (!isValid) {
            UtilityHelpers.showNotification('Please fill in all required fields correctly.', 'error');
        }
        
        return isValid;
    }

    /**
     * Initialize modal functionality
     */
    initializeModals() {
        const modals = document.querySelectorAll('.modal');
        const modalTriggers = document.querySelectorAll('[data-modal-target]');
        
        // Initialize modal triggers
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = trigger.dataset.modalTarget;
                const modal = document.getElementById(targetId);
                if (modal) {
                    this.openModal(modal);
                }
            });
        });
        
        // Initialize modal close buttons
        modals.forEach(modal => {
            const closeButton = modal.querySelector('.modal-close, [data-modal-close]');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.closeModal(modal));
            }
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal);
                }
            }
        });
        
        return { modals: modals.length, triggers: modalTriggers.length };
    }

    /**
     * Open modal
     * @param {HTMLElement} modal - Modal element to open
     */
    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        modal.dispatchEvent(new CustomEvent('modalOpened'));
    }

    /**
     * Close modal
     * @param {HTMLElement} modal - Modal element to close
     */
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modal.dispatchEvent(new CustomEvent('modalClosed'));
    }

    /**
     * Initialize global event handlers
     */
    initializeGlobalEvents() {
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('Global JavaScript error:', event.error);
        });

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('📊 Page load performance:', {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
                        fullyLoaded: perfData.loadEventEnd - perfData.fetchStart
                    });
                }, 0);
            });
        }
    }

    /**
     * Handle initialization errors
     * @param {Error} error - The initialization error
     */
    handleInitializationError(error) {
        // Log error for debugging
        console.error('Application failed to initialize:', error);
        
        // Show user-friendly message
        UtilityHelpers.showNotification(
            'Some features may not work properly. Please refresh the page.', 
            'warning', 
            8000
        );
    }

    /**
     * Get module instance
     * @param {string} name - Module name
     * @returns {Object|null} Module instance or null
     */
    getModule(name) {
        return this.modules.get(name) || null;
    }

    /**
     * Destroy the application and clean up
     */
    destroy() {
        this.modules.forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        this.modules.clear();
        this.isInitialized = false;
    }
}

// Initialize the application
const app = new RentonCBFApp();

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Make app available globally for debugging
window.RentonCBFApp = app;