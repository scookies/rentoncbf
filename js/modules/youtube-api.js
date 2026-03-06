class YouTubeAPIManager {
    constructor() {
        this.apiKey = null; // To be set by user
        this.videoIds = []; // To be set by user - array of video IDs
        this.videos = [];
        this.modal = null;
        this.currentVideoId = null;
        this.initialized = false;
        
        // Don't auto-initialize, wait for configuration
    }

    init() {
        try {
            console.log('🚀 Initializing YouTube API Manager...');
            const videoGrid = document.getElementById('video-grid');
            
            if (!videoGrid) {
                console.log('YouTube API video grid not found on this page - skipping initialization');
                return;
            }

            console.log('✅ Video grid found');
            console.log('🔑 API Key configured:', this.apiKey ? 'Yes' : 'No');
            console.log('📹 Video IDs configured:', this.videoIds.length, 'videos');

            // Check if API key and video IDs are configured
            if (!this.apiKey) {
                console.log('❌ No API key configured');
                this.showConfigurationMessage();
                return;
            }

            if (this.videoIds.length === 0) {
                console.log('❌ No video IDs configured');
                this.showNoVideosMessage();
                return;
            }

            console.log('🎬 Loading videos...');
            this.loadVideos();
            this.createModal();
            
        } catch (error) {
            console.error('❌ Error initializing YouTube API:', error);
            this.showErrorMessage('Failed to initialize video player');
        }
    }

    // Configuration methods - to be called by user
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.checkAndInitialize();
        return this;
    }

    setVideoIds(videoIds) {
        this.videoIds = Array.isArray(videoIds) ? videoIds : [videoIds];
        this.checkAndInitialize();
        return this;
    }

    checkAndInitialize() {
        // Only initialize once we have both API key and video IDs
        if (!this.initialized && this.apiKey && this.videoIds.length > 0) {
            this.initialized = true;
            this.init();
        }
    }

    async loadVideos() {
        const videoGrid = document.getElementById('video-grid');
        
        try {
            // Clear loading spinner
            videoGrid.innerHTML = '';

            // Fetch video details from YouTube API
            const videoDetails = await this.fetchVideoDetails();
            
            if (videoDetails.length === 0) {
                this.showNoVideosMessage();
                return;
            }

            this.videos = videoDetails;
            this.renderVideos();
            
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showErrorMessage('Failed to load videos. Please check your API key and video IDs.');
        }
    }

    async fetchVideoDetails() {
        if (!this.apiKey || this.videoIds.length === 0) {
            throw new Error('API key or video IDs not configured');
        }

        const videoIdsString = this.videoIds.join(',');
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIdsString}&key=${this.apiKey}`;
        
        console.log('🔍 Fetching videos from URL:', url);
        console.log('📹 Video IDs:', this.videoIds);
        
        const response = await fetch(url);
        
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`YouTube API request failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response data:', data);
        
        if (data.error) {
            console.error('❌ YouTube API Error:', data.error);
            throw new Error(`YouTube API error: ${data.error.message}`);
        }
        
        console.log('✅ Found videos:', data.items?.length || 0);
        return data.items || [];
    }

    renderVideos() {
        const videoGrid = document.getElementById('video-grid');
        
        videoGrid.innerHTML = this.videos.map(video => 
            this.createVideoHTML(video)
        ).join('');
        
        // Add click event listeners
        this.setupVideoClickHandlers();
        
        // Setup carousel navigation
        this.setupCarouselNavigation();
    }

    createVideoHTML(video) {
        const snippet = video.snippet;
        const videoId = video.id;
        const thumbnail = snippet.thumbnails.high || snippet.thumbnails.medium || snippet.thumbnails.default;
        
        return `
            <div class="video-item" data-video-id="${videoId}">
                <div class="video-thumbnail">
                    <img src="${thumbnail.url}" alt="${snippet.title}" loading="lazy">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <h3 class="video-title">${this.escapeHtml(snippet.title)}</h3>
                <p class="video-description">${this.escapeHtml(this.truncateDescription(snippet.description))}</p>
            </div>
        `;
    }

    setupVideoClickHandlers() {
        const videoItems = document.querySelectorAll('.video-item');
        
        videoItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const videoId = item.getAttribute('data-video-id');
                this.openVideoModal(videoId);
            });
        });
    }

    setupCarouselNavigation() {
        const carousel = document.getElementById('video-grid');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        
        if (!carousel || !prevBtn || !nextBtn) return;
        
        const itemWidth = 320 + 24; // Item width + gap
        let currentPosition = 0;
        
        const updateButtons = () => {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            prevBtn.disabled = carousel.scrollLeft <= 0;
            nextBtn.disabled = carousel.scrollLeft >= maxScroll;
        };
        
        const scrollToPosition = (position) => {
            carousel.scrollTo({
                left: position,
                behavior: 'smooth'
            });
        };
        
        prevBtn.addEventListener('click', () => {
            currentPosition = Math.max(0, carousel.scrollLeft - itemWidth);
            scrollToPosition(currentPosition);
        });
        
        nextBtn.addEventListener('click', () => {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            currentPosition = Math.min(maxScroll, carousel.scrollLeft + itemWidth);
            scrollToPosition(currentPosition);
        });
        
        // Update buttons on scroll
        carousel.addEventListener('scroll', updateButtons);
        
        // Initial button state
        updateButtons();
        
        // Update on resize
        window.addEventListener('resize', updateButtons);
    }

    createModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('video-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" aria-label="Close video">
                    <i class="fas fa-times"></i>
                </button>
                <iframe 
                    id="modal-video-iframe"
                    src="" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
        
        // Setup modal event listeners
        this.setupModalEvents();
    }

    setupModalEvents() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.modal-close');
        const iframe = this.modal.querySelector('#modal-video-iframe');

        // Close button
        closeBtn.addEventListener('click', () => this.closeVideoModal());

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeVideoModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeVideoModal();
            }
        });
    }

    openVideoModal(videoId) {
        if (!this.modal || !videoId) return;

        const iframe = this.modal.querySelector('#modal-video-iframe');
        
        // Try different embed parameters to handle restricted videos
        const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&origin=${window.location.origin}`;
        
        console.log('🎬 Opening video modal for:', videoId);
        console.log('🔗 Video URL:', videoUrl);
        
        iframe.src = videoUrl;
        this.modal.classList.add('active');
        this.currentVideoId = videoId;
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        // Add error handling for iframe load
        iframe.onload = () => {
            console.log('✅ Video iframe loaded successfully');
        };
        
        iframe.onerror = (error) => {
            console.error('❌ Video iframe load error:', error);
            this.showVideoError(videoId);
        };
    }

    closeVideoModal() {
        if (!this.modal) return;

        const iframe = this.modal.querySelector('#modal-video-iframe');
        
        iframe.src = ''; // Stop video playback
        this.modal.classList.remove('active');
        this.currentVideoId = null;
        
        // Restore body scrolling
        document.body.style.overflow = '';
    }

    showConfigurationMessage() {
        const videoGrid = document.getElementById('video-grid');
        videoGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-cog"></i>
                <h3>Configuration Required</h3>
                <p>Please configure your YouTube API key and video IDs to display videos.</p>
                <p>Check the console for setup instructions.</p>
            </div>
        `;
        
        console.group('🎬 YouTube API Setup Instructions');
        console.log('1. Get a YouTube API key from Google Cloud Console');
        console.log('2. Enable YouTube Data API v3');
        console.log('3. Configure the API manager:');
        console.log('   window.youtubeManager.setApiKey("YOUR_API_KEY").setVideoIds(["VIDEO_ID1", "VIDEO_ID2"])');
        console.groupEnd();
    }

    showNoVideosMessage() {
        const videoGrid = document.getElementById('video-grid');
        videoGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-video-slash"></i>
                <h3>No Videos Found</h3>
                <p>No video IDs have been configured.</p>
            </div>
        `;
    }

    showErrorMessage(message) {
        const videoGrid = document.getElementById('video-grid');
        videoGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Videos</h3>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    showVideoError(videoId) {
        // Replace the iframe with an error message and direct link
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <button class="modal-close" aria-label="Close video">
                <i class="fas fa-times"></i>
            </button>
            <div class="video-error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Video Unavailable</h3>
                <p>This video cannot be embedded, but you can watch it directly on YouTube.</p>
                <a href="https://www.youtube.com/watch?v=${videoId}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="button-primary">
                    Watch on YouTube
                </a>
            </div>
        `;
        
        // Re-setup close button
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeVideoModal());
    }

    // Utility methods
    truncateDescription(description, maxLength = 100) {
        if (!description) return '';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength).trim() + '...';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        this.closeVideoModal();
        if (this.modal) {
            this.modal.remove();
        }
        document.body.style.overflow = '';
        console.log('YouTube API manager destroyed');
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYouTubeAPI);
} else {
    initYouTubeAPI();
}

function initYouTubeAPI() {
    try {
        if (window.youtubeManager) {
            return;
        }
        window.youtubeManager = new YouTubeAPIManager();
        
        // Example configuration (user should replace these)
        // window.youtubeManager
        //     .setApiKey('YOUR_YOUTUBE_API_KEY_HERE')
        //     .setVideoIds(['VIDEO_ID_1', 'VIDEO_ID_2']);
        
    } catch (error) {
        console.error('Failed to initialize YouTube API manager:', error);
    }
}