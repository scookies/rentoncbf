// Main JavaScript for Renton Children's Business Fair Website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initCarousel();
    initVendorFilters();
    initVideoModal();
    initScrollAnimations();
    initScrollEffects();
});

// Navigation Functions
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking on links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });
    }
}

// Carousel Functions
function initCarousel() {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
        const carouselId = carousel.dataset.carousel;
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = document.querySelector(`.carousel-btn.prev[data-carousel="${carouselId}"]`);
        const nextBtn = document.querySelector(`.carousel-btn.next[data-carousel="${carouselId}"]`);
        const dots = document.querySelectorAll(`.carousel-dots[data-carousel="${carouselId}"] .dot`);
        
        let currentSlide = 0;
        
        function showSlide(index) {
            // Remove active class from all slides and dots
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Add active class to current slide and dot
            if (slides[index]) {
                slides[index].classList.add('active');
            }
            if (dots[index]) {
                dots[index].classList.add('active');
            }
            
            // Move carousel track
            const translateX = -index * 100;
            carousel.style.transform = `translateX(${translateX}%)`;
            
            currentSlide = index;
        }
        
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                const prevIndex = currentSlide > 0 ? currentSlide - 1 : slides.length - 1;
                showSlide(prevIndex);
            });
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                const nextIndex = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
                showSlide(nextIndex);
            });
        }
        
        // Dots navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                showSlide(index);
            });
        });
        
        // Auto-play carousel (optional)
        setInterval(() => {
            const nextIndex = currentSlide < slides.length - 1 ? currentSlide + 1 : 0;
            showSlide(nextIndex);
        }, 5000); // Change slide every 5 seconds
        
        // Initialize first slide
        showSlide(0);
    });
}

// Vendor Filter Functions
function initVendorFilters() {
    const categoryFilters = document.querySelectorAll('.category-filter');
    const vendorCards = document.querySelectorAll('.vendor-card');
    
    if (categoryFilters.length === 0) return;
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active filter
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Filter vendor cards
            vendorCards.forEach(card => {
                const cardCategory = card.dataset.category;
                
                if (category === 'all' || cardCategory === category) {
                    card.classList.remove('hidden');
                    // Add animation delay for staggered effect
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.classList.add('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                }
            });
        });
    });
}

// Video Modal Functions
function initVideoModal() {
    const playButtons = document.querySelectorAll('.play-button');
    const videoModal = document.getElementById('video-modal');
    const modalClose = document.getElementById('modal-close');
    
    if (!videoModal) return;
    
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoId = this.dataset.video;
            openVideoModal(videoId);
        });
    });
    
    if (modalClose) {
        modalClose.addEventListener('click', closeVideoModal);
    }
    
    // Close modal when clicking outside
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
    
    function openVideoModal(videoId) {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // In a real implementation, you would load the actual video here
        console.log(`Opening video: ${videoId}`);
        
        // Example of how you might load a video:
        // const videoPlayer = videoModal.querySelector('.video-player');
        // videoPlayer.innerHTML = `<iframe src="path-to-video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }
    
    function closeVideoModal() {
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear video content to stop playback
        const videoPlayer = videoModal.querySelector('.video-player');
        if (videoPlayer) {
            // Reset to placeholder
            videoPlayer.innerHTML = `
                <div class="video-placeholder-modal">
                    <i class="fas fa-play-circle"></i>
                    <p>Video content would play here</p>
                    <small>In a real implementation, this would connect to your video hosting service</small>
                </div>
            `;
        }
    }
}

// Scroll Animation Functions
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.testimonial, .gallery-item, .fair-card, .timeline-item, .pillar, .value-card, .vendor-card, .stat-item');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        animatedElements.forEach(element => {
            element.classList.add('animate');
        });
    }
}

// Scroll Effects
function initScrollEffects() {
    // Parallax effect for hero sections
    const heroSections = document.querySelectorAll('.hero');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        heroSections.forEach(hero => {
            const rate = scrolled * -0.5;
            const heroBackground = hero.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${rate}px)`;
            }
        });
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization: debounced scroll handler
const debouncedScrollHandler = debounce(() => {
    // Additional scroll-based functionality can be added here
}, 16); // ~60fps

window.addEventListener('scroll', debouncedScrollHandler);

// Form handling (if forms are added later)
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation and submission logic
            const formData = new FormData(this);
            
            // Example: Send form data to server
            console.log('Form submitted:', Object.fromEntries(formData));
            
            // Show success message
            showNotification('Thank you! Your form has been submitted.', 'success');
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-white);
        color: var(--color-deep-navy);
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: var(--z-tooltip);
        transform: translateX(400px);
        transition: transform var(--transition-normal);
    `;
    
    if (type === 'success') {
        notification.style.borderLeft = `4px solid var(--color-growth-green)`;
    } else if (type === 'error') {
        notification.style.borderLeft = `4px solid var(--color-warning-amber)`;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Initialize form handling when DOM is ready
document.addEventListener('DOMContentLoaded', initFormHandling);