class FairCarouselModule {
    constructor() {
        this.fairFolders = new Map([
            ['Mid Winter Fair', 'midWinterFair'],
            ['Summer Fair', 'summerFair'],
            ['Pre-Holiday Market', 'preHolidayMarket']
        ]);
        this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp'];
    }

    async loadImagesFromFolder(folderName) {
        try {
            // Try to fetch from JSON file first (works with web server)
            const response = await fetch('data/fair-images.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.fairImages[folderName] || [];
        } catch (error) {
            console.warn('Failed to load fair images from JSON:', error.message);
            
            // Fallback to embedded JavaScript data (works with file:// protocol)
            if (window.FairImagesData && window.FairImagesData.fairImages) {
                return window.FairImagesData.fairImages[folderName] || [];
            }
            
            // Final fallback to hardcoded data
            return await this.getExistingImages(folderName);
        }
    }

    async getExistingImages(folderName) {
        // Final fallback - hardcoded image map
        const imageMap = {
            'midWinterFair': ['images/midWinterFair/Children.jpg'],
            'summerFair': [
                'images/summerFair/macaron-hero-1.png',
                'images/summerFair/Vendor (2).png'
            ],
            'preHolidayMarket': ['images/preHolidayMarket/PST_3098.jpeg']
        };

        return imageMap[folderName] || [];
    }

    generateCarouselHTML(images, fairName, carouselId) {
        if (!images || images.length === 0) {
            return '<p>No images available for this fair.</p>';
        }

        const slidesHTML = images.map((imagePath, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                <img src="${imagePath}" alt="${fairName} - Image ${index + 1}" class="carousel-image">
            </div>
        `).join('');

        const dotsHTML = images.map((_, index) => `
            <button class="dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
        `).join('');

        const prevNextButtons = images.length > 1 ? `
            <button class="carousel-btn prev" data-carousel="${carouselId}">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-btn next" data-carousel="${carouselId}">
                <i class="fas fa-chevron-right"></i>
            </button>
        ` : '';

        return `
            <div class="carousel-container">
                <div class="carousel-track" data-carousel="${carouselId}">
                    ${slidesHTML}
                </div>
                ${prevNextButtons}
                <div class="carousel-dots" data-carousel="${carouselId}">
                    ${dotsHTML}
                </div>
            </div>
        `;
    }

    async initializeCarousels() {
        const fairItems = document.querySelectorAll('.fair-item');

        for (const fairItem of fairItems) {
            const fairNameElement = fairItem.querySelector('h3');
            if (!fairNameElement) continue;

            const fairName = fairNameElement.textContent.trim();
            const folderName = this.fairFolders.get(fairName);
            
            if (!folderName) {
                console.warn(`No folder mapping found for fair: ${fairName}`);
                continue;
            }

            const carouselContainer = fairItem.querySelector('.fair-carousel');
            if (!carouselContainer) continue;

            try {
                const images = await this.loadImagesFromFolder(folderName);
                const carouselId = folderName.toLowerCase();
                const carouselHTML = this.generateCarouselHTML(images, fairName, carouselId);
                
                carouselContainer.innerHTML = carouselHTML;
                
                console.log(`Loaded ${images.length} images for ${fairName}`);
            } catch (error) {
                console.error(`Error loading images for ${fairName}:`, error);
                carouselContainer.innerHTML = '<p>Unable to load images for this fair.</p>';
            }
        }
    }

    async init() {
        await this.initializeCarousels();
        
        // Initialize carousel functionality after HTML is generated
        if (window.CarouselModule) {
            const carouselModule = new window.CarouselModule();
            carouselModule.init();
        }
    }
}

window.FairCarouselModule = FairCarouselModule;