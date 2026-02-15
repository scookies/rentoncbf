class VideoCarousel {
    constructor() {
        this.videosPath = 'currentVendorVideos/';
        this.currentIndex = 0;
        this.videos = [];
        this.videoElements = [];
        this.isPlaying = false;
        this.autoPlayTimer = null;
        this.autoPlayDelay = 10000; // 10 seconds

        // DOM elements
        this.track = null;
        this.prevBtn = null;
        this.nextBtn = null;

        this.init();
    }

    async init() {
        try {
            this.track = document.getElementById('video-track');
            this.prevBtn = document.getElementById('prevBtn');
            this.nextBtn = document.getElementById('nextBtn');

            if (!this.track) {
                console.log('Video carousel elements not found on this page - skipping initialization');
                return;
            }

            await this.loadVideos();
            
            if (this.videos.length === 0) {
                console.warn('No videos loaded for carousel');
                return;
            }
            
            this.render();
            this.setupEventListeners();
            this.startAutoPlay();

        } catch (error) {
            console.error('Error initializing video carousel:', error);
            // Don't throw the error to prevent breaking other scripts
        }
    }

    async loadVideos() {
        // Since we can't directly list directory contents in a browser,
        // we'll define the known video files from the ls command output
        const knownVideos = [
            "Armando's Balloon Animals.mov",
            "AryaBakeLab.mov",
            "Emma's Mexican Treats.mp4",
            "JJ's Crafts.mp4"
        ];

        for (const filename of knownVideos) {
            if (await this.checkVideoExists(`${this.videosPath}${filename}`)) {
                this.videos.push({
                    filename: filename,
                    path: `${this.videosPath}${filename}`,
                    title: this.generateTitle(filename)
                });
            }
        }

    }

    async checkVideoExists(videoPath) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const timeout = setTimeout(() => {
                resolve(false);
            }, 5000); // 5 second timeout

            video.onloadedmetadata = () => {
                clearTimeout(timeout);
                resolve(true);
            };
            
            video.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            
            video.onabort = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            
            video.src = videoPath;
            video.preload = 'metadata';
            video.load(); // Explicitly trigger load
        });
    }

    generateTitle(filename) {
        // Extract business name from filename
        const nameWithoutExt = filename.replace(/\.(mov|mp4|webm)$/i, '');
        return nameWithoutExt.replace(/['"]/g, ''); // Remove quotes if any
    }


    render() {
        if (!this.track || this.videos.length === 0) return;

        // Clear existing content
        this.track.innerHTML = '';
        this.videoElements = [];

        // Create video elements
        this.videos.forEach((video, index) => {
            const videoSlide = this.createVideoSlide(video, index);
            this.track.appendChild(videoSlide);
        });

        // Set initial state
        this.updateCarousel();
    }

    createVideoSlide(video, index) {
        const slide = document.createElement('div');
        slide.className = 'video-slide';
        slide.setAttribute('data-index', index);

        const videoType = this.getVideoType(video.filename);
        const mimeType = this.getMimeType(video.filename);
        
        slide.innerHTML = `
            <div class="video-container">
                <video
                    preload="metadata"
                    controls
                    playsinline
                    controlsList="nodownload"
                    aria-label="${video.title} - Vendor showcase video"
                    poster=""
                >
                    <source src="${video.path}" type="${mimeType}">
                    ${videoType === 'mov' ? `<source src="${video.path}" type="video/mp4">` : ''}
                    <p>Your browser doesn't support video playback. <a href="${video.path}" download>Download the video</a></p>
                </video>
            </div>
        `;

        const videoElement = slide.querySelector('video');
        this.videoElements.push(videoElement);

        // Add video event listeners
        this.setupVideoEvents(videoElement, index);

        return slide;
    }


    setupVideoEvents(videoElement, index) {
        videoElement.addEventListener('play', () => {
            this.pauseOtherVideos(index);
            this.isPlaying = true;
            this.stopAutoPlay();
        });

        videoElement.addEventListener('pause', () => {
            this.isPlaying = false;
            this.startAutoPlay();
        });

        videoElement.addEventListener('ended', () => {
            this.isPlaying = false;
            this.next();
        });

        videoElement.addEventListener('loadstart', () => {
            videoElement.parentElement.classList.add('loading');
        });

        videoElement.addEventListener('loadeddata', () => {
            videoElement.parentElement.classList.remove('loading');
        });

        videoElement.addEventListener('error', () => {
            videoElement.parentElement.classList.remove('loading');
            
            // Add error overlay
            const errorOverlay = document.createElement('div');
            errorOverlay.className = 'video-error';
            errorOverlay.innerHTML = `
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Video format not supported</p>
                    <a href="${this.videos[index].path}" download>Download Video</a>
                </div>
            `;
            videoElement.parentElement.appendChild(errorOverlay);
        });
    }

    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prev();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.next();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.track.contains(document.activeElement)) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prev();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.next();
                    break;
            }
        });

        // Intersection Observer for auto-pause when out of view
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        this.pauseCurrentVideo();
                        this.stopAutoPlay();
                    } else {
                        this.startAutoPlay();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(this.track);
        }
    }

    getVideoType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        return extension;
    }

    getMimeType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const mimeMap = {
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'avi': 'video/avi',
            'm4v': 'video/mp4'
        };
        return mimeMap[extension] || 'video/mp4';
    }

    goToSlide(index) {
        if (index < 0 || index >= this.videos.length) return;
        
        this.pauseCurrentVideo();
        this.currentIndex = index;
        this.updateCarousel();
        this.startAutoPlay();
    }

    prev() {
        const newIndex = this.currentIndex === 0 ? this.videos.length - 1 : this.currentIndex - 1;
        this.goToSlide(newIndex);
    }

    next() {
        const newIndex = this.currentIndex === this.videos.length - 1 ? 0 : this.currentIndex + 1;
        this.goToSlide(newIndex);
    }

    updateCarousel() {
        if (!this.track) return;

        const translateX = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${translateX}%)`;

        // Update ARIA attributes
        const slides = this.track.querySelectorAll('.video-slide');
        slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== this.currentIndex);
        });
    }


    pauseCurrentVideo() {
        const currentVideo = this.videoElements[this.currentIndex];
        if (currentVideo && !currentVideo.paused) {
            currentVideo.pause();
        }
    }

    pauseOtherVideos(excludeIndex) {
        this.videoElements.forEach((video, index) => {
            if (index !== excludeIndex && !video.paused) {
                video.pause();
            }
        });
    }

    startAutoPlay() {
        if (this.isPlaying) return;
        
        this.stopAutoPlay();
        this.autoPlayTimer = setTimeout(() => {
            if (!this.isPlaying) {
                this.next();
            }
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    destroy() {
        this.stopAutoPlay();
        this.videoElements.forEach(video => {
            video.pause();
            video.src = '';
        });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoCarousel);
} else {
    initVideoCarousel();
}

function initVideoCarousel() {
    try {
        if (window.VideoCarousel) {
            return;
        }
        window.VideoCarousel = new VideoCarousel();
    } catch (error) {
        console.error('Failed to initialize VideoCarousel:', error);
    }
}