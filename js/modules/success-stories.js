class SuccessStoriesModule {
    constructor() {
        this.storiesData = null;
        this.modalElement = null;
    }

    async loadStoriesData() {
        try {
            const response = await fetch('data/success-stories.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.storiesData = data.successStories;
            return this.storiesData;
        } catch (error) {
            console.error('Failed to load success stories data:', error);
            // Fallback data if file fails to load
            this.storiesData = {
                title: "Success Stories",
                description: "Hear from young entrepreneurs and parents about how the Children's Business Fair has transformed lives and built confidence.",
                testimonials: [
                    {
                        content: "The Business Fair gave me confidence. I learned so much about talking to customers and managing money!",
                        author: "Harrison, Age 11",
                        business: "Soaptastic"
                    },
                    {
                        content: "My daughter went from being shy to confidently pitching her business. Children's Business Fairs truly transform children.",
                        author: "Tricia L.",
                        business: "Parent"
                    },
                    {
                        content: "I am signing up my kids so that they will spend their time making physical products instead of online games.",
                        author: "Anna S.",
                        business: "Parent"
                    }
                ]
            };
            return this.storiesData;
        }
    }

    createModalHTML() {
        if (!this.storiesData) return '';

        const testimonialsHTML = this.storiesData.testimonials.map(testimonial => `
            <div class="testimonial-modal">
                <div class="testimonial-content">
                    <p>"${testimonial.content}"</p>
                </div>
                <div class="testimonial-author">
                    <strong>${testimonial.author}</strong>
                    <span>${testimonial.business}</span>
                </div>
            </div>
        `).join('');

        return `
            <div id="success-stories-modal" class="modal">
                <div class="success-stories-modal-content">
                    <button class="modal-close" data-modal-close>
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="success-stories-modal-header">
                        <h2>${this.storiesData.title}</h2>
                    </div>
                    
                    <div class="success-stories-modal-body">
                        <p class="modal-description">${this.storiesData.description}</p>
                        <div class="testimonials-grid-modal">
                            ${testimonialsHTML}
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
        if (!this.storiesData) return;

        // Remove existing modal if it exists
        const existingModal = document.getElementById('success-stories-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create and inject new modal
        const modalHTML = this.createModalHTML();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        this.modalElement = document.getElementById('success-stories-modal');
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
            const target = e.target.closest('a[data-modal="success-stories-modal"]');
            if (target) {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    async init() {
        await this.loadStoriesData();
        this.injectModal();
        this.setupNavigationTrigger();
        
        console.log('✅ Success Stories module initialized');
    }

    destroy() {
        if (this.modalElement) {
            this.modalElement.remove();
        }
        document.body.style.overflow = '';
    }
}

window.SuccessStoriesModule = SuccessStoriesModule;