/**
 * Carousel Module
 * Handles all carousel/slider functionality
 */

class CarouselModule {
    constructor() {
        this.config = window.SiteConfig.animations.carousel;
        this.carousels = new Map();
    }

    /**
     * Initialize all carousels on the page
     */
    init() {
        const carouselElements = document.querySelectorAll('[data-carousel]');
        
        carouselElements.forEach(element => {
            const carouselId = element.dataset.carousel;
            const carousel = new Carousel(element, this.config);
            this.carousels.set(carouselId, carousel);
        });
    }

    /**
     * Get carousel instance by ID
     * @param {string} id - Carousel ID
     * @returns {Carousel|null} - Carousel instance or null
     */
    getCarousel(id) {
        return this.carousels.get(id) || null;
    }

    /**
     * Destroy all carousels
     */
    destroy() {
        this.carousels.forEach(carousel => {
            carousel.destroy();
        });
        this.carousels.clear();
    }
}

/**
 * Individual Carousel Class
 */
class Carousel {
    constructor(element, config) {
        this.element = element;
        this.config = config;
        this.carouselId = element.dataset.carousel;
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        
        this.slides = element.querySelectorAll('.carousel-slide');
        this.prevBtn = document.querySelector(`.carousel-btn.prev[data-carousel="${this.carouselId}"]`);
        this.nextBtn = document.querySelector(`.carousel-btn.next[data-carousel="${this.carouselId}"]`);
        this.dots = document.querySelectorAll(`.carousel-dots[data-carousel="${this.carouselId}"] .dot`);
        
        this.init();
    }

    /**
     * Initialize carousel
     */
    init() {
        if (this.slides.length === 0) return;

        this.bindEvents();
        this.showSlide(0);
        
        if (this.config.autoPlay) {
            this.startAutoPlay();
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Previous button
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSlide());
        }

        // Next button
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Dots navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.showSlide(index));
        });

        // Pause auto-play on hover
        if (this.config.autoPlay) {
            this.element.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.element.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        // Handle touch/swipe events for mobile
        this.bindTouchEvents();
    }

    /**
     * Bind touch events for mobile swipe
     */
    bindTouchEvents() {
        let startX = 0;
        let endX = 0;
        const threshold = 50; // Minimum swipe distance

        this.element.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });

        this.element.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            const difference = startX - endX;

            if (Math.abs(difference) > threshold) {
                if (difference > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    }

    /**
     * Show specific slide
     * @param {number} index - Slide index
     */
    showSlide(index) {
        if (index < 0 || index >= this.slides.length) return;

        // Remove active class from all slides and dots
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));

        // Add active class to current slide and dot
        this.slides[index].classList.add('active');
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }

        // Move carousel track
        const translateX = -index * 100;
        this.element.style.transform = `translateX(${translateX}%)`;

        this.currentSlide = index;
        
        // Trigger custom event
        this.element.dispatchEvent(new CustomEvent('slideChanged', {
            detail: { index, slide: this.slides[index] }
        }));
    }

    /**
     * Go to next slide
     */
    nextSlide() {
        const nextIndex = this.currentSlide < this.slides.length - 1 
            ? this.currentSlide + 1 
            : 0;
        this.showSlide(nextIndex);
    }

    /**
     * Go to previous slide
     */
    previousSlide() {
        const prevIndex = this.currentSlide > 0 
            ? this.currentSlide - 1 
            : this.slides.length - 1;
        this.showSlide(prevIndex);
    }

    /**
     * Start auto-play
     */
    startAutoPlay() {
        if (!this.config.autoPlay) return;
        
        this.pauseAutoPlay(); // Clear existing interval
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.config.interval);
    }

    /**
     * Pause auto-play
     */
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    /**
     * Destroy carousel
     */
    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners and reset styles if needed
    }
}

// Export for use in other modules
window.CarouselModule = CarouselModule;