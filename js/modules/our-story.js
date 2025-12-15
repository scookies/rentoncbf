class OurStoryModule {
    constructor() {
        this.storyData = null;
        this.modalElement = null;
    }

    async loadStoryData() {
        try {
            const response = await fetch('data/our-story.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.storyData = data.ourStory;
            return this.storyData;
        } catch (error) {
            console.error('Failed to load our story data:', error);
            // Fallback data if file fails to load
            this.storyData = {
                title: "Our Story",
                introduction: [
                    "The Renton Children's Business Fair was born from a simple belief: every child has the potential to be an entrepreneur. We create safe, supportive environments where young minds can explore business concepts, develop leadership skills, and build confidence through real-world experience.",
                    "Our one-day markets aren't just events – they're launching pads for dreams. We've watched shy children transform into confident business owners, seen creative ideas bloom into sustainable ventures, and witnessed the spark of innovation ignite in young hearts."
                ],
                timeline: [
                    {
                        icon: "fas fa-lightbulb",
                        title: "The Beginning (2024)",
                        description: "After watching my kids grow through other Children's Business Fairs in Washington, I saw how much they learned each time. But most fairs only happened in summer — and we wanted that spark to continue all year long. So we stepped up to create more opportunities for young entrepreneurs to learn, grow, and shine — no matter the season. 🌟"
                    }
                ]
            };
            return this.storyData;
        }
    }

    createModalHTML() {
        if (!this.storyData) return '';

        const introductionHTML = this.storyData.introduction.map(paragraph => 
            `<p>${paragraph}</p>`
        ).join('');

        const timelineHTML = this.storyData.timeline.map(item => `
            <div class="timeline-item-modal">
                <div class="timeline-icon-modal">
                    <i class="${item.icon}"></i>
                </div>
                <div class="timeline-content-modal">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');

        return `
            <div id="our-story-modal" class="modal">
                <div class="our-story-modal-content">
                    <button class="modal-close" data-modal-close>
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="our-story-modal-header">
                        <h2>${this.storyData.title}</h2>
                    </div>
                    
                    <div class="our-story-modal-body">
                        <div class="story-introduction">
                            ${introductionHTML}
                        </div>
                        <div class="story-timeline-modal">
                            ${timelineHTML}
                        </div>
                        <div class="modal-buttons">
                            <button class="button-secondary" data-modal-close>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    injectModal() {
        if (!this.storyData) return;

        // Remove existing modal if it exists
        const existingModal = document.getElementById('our-story-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create and inject new modal
        const modalHTML = this.createModalHTML();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        this.modalElement = document.getElementById('our-story-modal');
        this.setupModalEvents();
    }

    setupModalEvents() {
        if (!this.modalElement) return;

        // Close button events
        const closeButtons = this.modalElement.querySelectorAll('[data-modal-close]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Click outside to close
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalElement.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal() {
        if (this.modalElement) {
            this.modalElement.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        if (this.modalElement) {
            this.modalElement.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupNavigationTrigger() {
        // Handle navigation links with modal attribute
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[data-modal="our-story-modal"]');
            if (target) {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    async init() {
        await this.loadStoryData();
        this.injectModal();
        this.setupNavigationTrigger();
        
        console.log('✅ Our Story module initialized');
    }

    destroy() {
        if (this.modalElement) {
            this.modalElement.remove();
        }
        document.body.style.overflow = '';
    }
}

window.OurStoryModule = OurStoryModule;