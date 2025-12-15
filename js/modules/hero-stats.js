class HeroStatsModule {
    constructor() {
        this.stats = null;
    }

    async loadStats() {
        try {
            // Try to fetch from JSON file first (works with web server)
            const response = await fetch('data/hero-stats.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.stats = data.heroStats;
            return this.stats;
        } catch (error) {
            console.warn('Failed to load hero stats from JSON:', error.message);
            
            // Fallback to embedded JavaScript data (works with file:// protocol)
            if (window.HeroStatsData && window.HeroStatsData.heroStats) {
                this.stats = window.HeroStatsData.heroStats;
                return this.stats;
            }
            
            // If both methods fail, leave stats as null
            this.stats = null;
            return this.stats;
        }
    }

    renderStats(containerElement) {
        if (!this.stats || !containerElement) {
            return;
        }

        containerElement.innerHTML = this.stats.map(stat => `
            <div class="stat">
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label}</span>
            </div>
        `).join('');
    }

    async init() {
        await this.loadStats();
        
        // Find and populate all hero-stats containers
        const heroStatsContainers = document.querySelectorAll('.hero-stats');
        heroStatsContainers.forEach(container => {
            this.renderStats(container);
        });
    }
}

window.HeroStatsModule = HeroStatsModule;