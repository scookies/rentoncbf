class UpcomingFairModule {
    constructor() {
        this.fairData = null;
        this.modalElement = null;
    }

    async loadFairData() {
        try {
            const response = await fetch('data/upcoming-fair.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.fairData = data.upcomingFair;
            return this.fairData;
        } catch (error) {
            console.error('Failed to load upcoming fair data:', error);
            // Fallback data if file fails to load
            this.fairData = {
                date: "March 7, 2026",
                time: "12:00 PM - 3:00 PM",
                location: "Renton",
                title: "Pre-FIFA Market",
                description: "Join us for our first fair of 2026! Young entrepreneurs will showcase their creative businesses, from handmade crafts to balloon arts. Experience the energy of tomorrow's leaders.",
                registerUrl: "https://www.childrensbusinessfair.org/wa-renton"
            };
            return this.fairData;
        }
    }

    createModalHTML() {
        if (!this.fairData) return '';

        return `
            <div id="upcoming-fair-modal" class="modal">
                <div class="upcoming-fair-modal-content">
                    <button class="modal-close" data-modal-close>
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="upcoming-fair-modal-header">
                        <h2>${this.fairData.title}</h2>
                    </div>
                    
                    <div class="upcoming-fair-modal-body">
                        <div class="fair-card-modal-vertical">
                            <div class="fair-info-modal">
                                <div class="fair-detail-modal">
                                    <i class="far fa-calendar"></i>
                                    <span>${this.fairData.date}</span>
                                </div>
                                <div class="fair-detail-modal">
                                    <i class="far fa-clock"></i>
                                    <span>${this.fairData.time}</span>
                                </div>
                                <div class="fair-detail-modal">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${this.fairData.location}</span>
                                </div>
                            </div>
                            <div class="fair-description-modal">
                                <p>${this.fairData.description}</p>
                                <div class="modal-buttons">
                                    <a href="${this.fairData.registerUrl}" class="button-primary" target="_blank" rel="noopener">Register Now</a>
                                    <button class="button-secondary" data-modal-close>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    injectModal() {
        if (!this.fairData) return;

        // Remove existing modal if it exists
        const existingModal = document.getElementById('upcoming-fair-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create and inject new modal
        const modalHTML = this.createModalHTML();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        this.modalElement = document.getElementById('upcoming-fair-modal');
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
        // Handle navigation links with modal attribute (both nav-link and nav-dropdown-item)
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[data-modal="upcoming-fair-modal"]');
            if (target) {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    async init() {
        await this.loadFairData();
        this.injectModal();
        this.setupNavigationTrigger();
        
        console.log('✅ Upcoming Fair module initialized');
    }

    destroy() {
        if (this.modalElement) {
            this.modalElement.remove();
        }
        document.body.style.overflow = '';
    }
}

window.UpcomingFairModule = UpcomingFairModule;