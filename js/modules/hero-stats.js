class HeroStatsModule {
    constructor() {
        this.stats = null;
    }

    async loadStats() {
        try {
            const response = await fetch('data/hero-stats.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.stats = data.heroStats;
            return this.stats;
        } catch (error) {
            console.error('Failed to load hero stats:', error);
            // Fallback stats if file fails to load
            this.stats = [
                { number: "120+", label: "Young Entrepreneurs" },
                { number: "2", label: "Fairs Hosted in 2025" },
                { number: "$5,000+", label: "Youth Revenue" },
                { number: "100%", label: "Success Stories" }
            ];
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