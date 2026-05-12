/**
 * Lesson Player Module
 * Handles lesson navigation, progress tracking, and interactive elements
 */

class LessonPlayer {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.stepStates = {};
        this.quizAnswers = {};
        
        this.init();
    }

    init() {
        if (!document.querySelector('.lesson-body')) return;
        
        this.setupEventListeners();
        this.updateProgress();
        this.initializeInteractiveElements();
        this.loadProgress();
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.next-btn, .prev-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stepId = e.target.id;
                if (stepId.includes('next')) {
                    this.nextStep();
                } else if (stepId.includes('prev')) {
                    this.previousStep();
                }
            });
        });

        // Quiz options
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleQuizAnswer(e.target);
            });
        });

        // Business card clicks for cost explorer
        document.querySelectorAll('.business-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.showBusinessCosts(e.currentTarget.dataset.business);
            });
        });

        // Cost calculator inputs
        document.querySelectorAll('#materials-string, #materials-beads, #time-minutes, #hourly-rate').forEach(input => {
            input.addEventListener('input', () => {
                this.updateCostCalculation();
            });
        });

        // Scenario options
        document.querySelectorAll('.scenario-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleScenarioAnswer(e.target);
            });
        });
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Hide current step
            document.querySelector(`.lesson-step[data-step="${this.currentStep}"]`).classList.remove('active');
            
            // Show next step
            this.currentStep++;
            document.querySelector(`.lesson-step[data-step="${this.currentStep}"]`).classList.add('active');
            
            // Update progress
            this.updateProgress();
            
            // Save progress
            this.saveProgress();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            // Hide current step
            document.querySelector(`.lesson-step[data-step="${this.currentStep}"]`).classList.remove('active');
            
            // Show previous step
            this.currentStep--;
            document.querySelector(`.lesson-step[data-step="${this.currentStep}"]`).classList.add('active');
            
            // Update progress
            this.updateProgress();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && progressText) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }
    }

    handleQuizAnswer(option) {
        const quizCard = option.closest('.quiz-card');
        const questionId = quizCard.querySelector('.quiz-question').dataset.questionId || 
                          quizCard.closest('.lesson-step').dataset.step + '-quiz';
        
        // Remove previous selections
        quizCard.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected option
        option.classList.add('selected');
        
        // Check if correct
        const isCorrect = option.dataset.correct === 'true';
        option.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Show feedback
        const feedback = quizCard.querySelector('.quiz-feedback');
        if (feedback) {
            // Get specific feedback based on question
            const feedbackText = this.getQuizFeedback(questionId, isCorrect, option);
            feedback.innerHTML = feedbackText;
        }
        
        // Store answer
        this.quizAnswers[questionId] = {
            selected: option.dataset.answer,
            correct: isCorrect
        };
        
        // Enable next button if this was required
        const nextBtn = quizCard.closest('.lesson-step').querySelector('.next-btn');
        if (nextBtn && nextBtn.disabled) {
            nextBtn.disabled = false;
        }
    }

    getQuizFeedback(questionId, isCorrect, selectedOption) {
        const quizFeedbacks = {
            '1-quiz': {
                correct: `
                    <div class="feedback correct">
                        <i class="fas fa-check-circle"></i>
                        <span>Exactly right! Different businesses should charge different prices based on their costs, quality, and what makes them special.</span>
                    </div>
                `,
                incorrect: {
                    'true': `
                        <div class="feedback incorrect">
                            <i class="fas fa-times-circle"></i>
                            <span>Not quite! Each business has different costs and offers different value. A handmade bracelet should cost more than a mass-produced one because it takes more time and skill to make.</span>
                        </div>
                    `
                }
            },
            '3-quiz': {
                correct: `
                    <div class="feedback correct">
                        <i class="fas fa-check-circle"></i>
                        <span>Perfect! You must charge at least your costs to avoid losing money. Anything less means you're paying to give away your products!</span>
                    </div>
                `,
                incorrect: {
                    '5.00': `
                        <div class="feedback incorrect">
                            <i class="fas fa-times-circle"></i>
                            <span>Too low! If Sarah charges $5.00 but her costs are $6.50, she loses $1.50 on every bracelet. She'd be paying customers to take her products!</span>
                        </div>
                    `,
                    '3.00': `
                        <div class="feedback incorrect">
                            <i class="fas fa-times-circle"></i>
                            <span>Way too low! At $3.00, Sarah would lose $3.50 on every bracelet. She needs to charge at least $6.50 to break even (cover her costs).</span>
                        </div>
                    `
                }
            }
        };

        const feedback = quizFeedbacks[questionId];
        if (!feedback) {
            // Default fallback feedback
            if (isCorrect) {
                return `
                    <div class="feedback correct">
                        <i class="fas fa-check-circle"></i>
                        <span>Correct! Great job!</span>
                    </div>
                `;
            } else {
                return `
                    <div class="feedback incorrect">
                        <i class="fas fa-times-circle"></i>
                        <span>Not quite right. Try thinking about what we just learned!</span>
                    </div>
                `;
            }
        }

        if (isCorrect) {
            return feedback.correct;
        } else {
            const selectedAnswer = selectedOption.dataset.answer;
            return feedback.incorrect[selectedAnswer] || feedback.incorrect['default'] || `
                <div class="feedback incorrect">
                    <i class="fas fa-times-circle"></i>
                    <span>Not quite right. Try thinking about what we just learned!</span>
                </div>
            `;
        }
    }

    showBusinessCosts(businessType) {
        const explorer = document.getElementById('costExplorer');
        if (!explorer) return;

        const costData = {
            farmer: {
                icon: '🌱',
                title: 'Farmer Costs',
                costs: [
                    { item: 'Seeds', cost: '$2.00' },
                    { item: 'Soil/Fertilizer', cost: '$1.50' },
                    { item: 'Water', cost: '$0.50' },
                    { item: 'Time to grow & harvest', cost: '$5.00' },
                    { item: 'Packaging', cost: '$1.00' }
                ],
                total: '$10.00'
            },
            artisan: {
                icon: '🎨',
                title: 'Artisan/Crafter Costs',
                costs: [
                    { item: 'Craft materials', cost: '$3.00' },
                    { item: 'Tools & supplies', cost: '$1.00' },
                    { item: 'Time to create', cost: '$8.00' },
                    { item: 'Packaging', cost: '$0.50' }
                ],
                total: '$12.50'
            },
            food: {
                icon: '🍪',
                title: 'Food Vendor Costs',
                costs: [
                    { item: 'Ingredients', cost: '$4.00' },
                    { item: 'Baking time', cost: '$6.00' },
                    { item: 'Packaging', cost: '$1.50' },
                    { item: 'Kitchen supplies', cost: '$0.50' }
                ],
                total: '$12.00'
            }
        };

        const data = costData[businessType];
        if (!data) return;

        explorer.innerHTML = `
            <div class="cost-breakdown">
                <div class="breakdown-header">
                    <span class="breakdown-icon">${data.icon}</span>
                    <h4>${data.title}</h4>
                </div>
                <div class="breakdown-items">
                    ${data.costs.map(cost => `
                        <div class="breakdown-item">
                            <span class="item-name">${cost.item}</span>
                            <span class="item-cost">${cost.cost}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="breakdown-total">
                    <strong>Total Cost per item: ${data.total}</strong>
                </div>
            </div>
        `;

        // Highlight selected business card
        document.querySelectorAll('.business-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-business="${businessType}"]`).classList.add('selected');
    }

    updateCostCalculation() {
        const materialsString = parseFloat(document.getElementById('materials-string').value) || 0;
        const materialsBeads = parseFloat(document.getElementById('materials-beads').value) || 0;
        const timeMinutes = parseInt(document.getElementById('time-minutes').value) || 0;
        const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 0;

        const totalMaterials = materialsString + materialsBeads;
        const totalTime = (timeMinutes / 60) * hourlyRate;
        const totalCost = totalMaterials + totalTime;

        // Update display
        document.getElementById('total-materials').textContent = `$${totalMaterials.toFixed(2)}`;
        document.getElementById('total-time').textContent = `$${totalTime.toFixed(2)}`;
        document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)}`;
    }

    handleScenarioAnswer(option) {
        const scenarioCard = option.closest('.scenario-card');
        const feedback = scenarioCard.querySelector('.scenario-feedback');
        
        // Remove previous selections
        scenarioCard.querySelectorAll('.scenario-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected option
        option.classList.add('selected');
        
        // Check if correct
        const isCorrect = option.dataset.correct === 'true';
        option.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Show feedback
        if (isCorrect) {
            feedback.innerHTML = `
                <div class="feedback correct">
                    <i class="fas fa-check-circle"></i>
                    <span>Excellent! At $4.50, Maya covers her $2 cost, stays competitive with store prices ($4-5), and earns a healthy $2.50 profit per cupcake.</span>
                </div>
            `;
        } else {
            const price = parseFloat(option.dataset.answer);
            let message = '';
            if (price <= 3) {
                message = 'Too low! At $3.00, Maya only makes $1 profit on her $2 cost. That barely covers her time and effort, and gives no room for business expenses.';
            } else if (price >= 8) {
                message = 'Too high! At $8.00, Maya\'s cupcakes cost much more than store cupcakes ($4-5). Customers will likely choose the cheaper option instead.';
            }
            
            feedback.innerHTML = `
                <div class="feedback incorrect">
                    <i class="fas fa-times-circle"></i>
                    <span>${message}</span>
                </div>
            `;
        }
        
        // Enable next button
        const nextBtn = document.getElementById('step4-next');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    initializeInteractiveElements() {
        // Initialize cost calculator with default values
        this.updateCostCalculation();
        
        // Set up any default states
        this.stepStates[1] = { completed: false };
        this.stepStates[2] = { completed: false };
        this.stepStates[3] = { completed: false };
        this.stepStates[4] = { completed: false };
        this.stepStates[5] = { completed: false };
    }

    saveProgress() {
        const progressData = {
            currentStep: this.currentStep,
            stepStates: this.stepStates,
            quizAnswers: this.quizAnswers,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('lesson-pricing-progress', JSON.stringify(progressData));
    }

    loadProgress() {
        const saved = localStorage.getItem('lesson-pricing-progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                // Only load if saved within last 7 days
                const savedTime = new Date(data.timestamp);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                
                if (savedTime > weekAgo) {
                    this.stepStates = data.stepStates || {};
                    this.quizAnswers = data.quizAnswers || {};
                }
            } catch (e) {
                console.log('Could not load lesson progress');
            }
        }
    }

    resetProgress() {
        localStorage.removeItem('lesson-pricing-progress');
        this.currentStep = 1;
        this.stepStates = {};
        this.quizAnswers = {};
        
        // Reset UI
        document.querySelectorAll('.lesson-step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector('.lesson-step[data-step="1"]').classList.add('active');
        this.updateProgress();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lessonPlayer = new LessonPlayer();
});