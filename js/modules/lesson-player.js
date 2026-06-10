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

        // Marketing game scenarios
        document.querySelectorAll('.scenario-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleMarketingGame(e.currentTarget);
            });
        });

        // Method matcher options
        document.querySelectorAll('.method-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleMethodMatcher(e.target);
            });
        });

        // Detective game interactions
        this.initializeDetectiveGame();

        // Message builder
        document.querySelectorAll('.message-input').forEach(input => {
            input.addEventListener('change', () => {
                this.updateMessagePreview();
            });
        });

        // Practice pitch button
        const practicePitchBtn = document.getElementById('practice-pitch');
        if (practicePitchBtn) {
            practicePitchBtn.addEventListener('click', () => {
                this.showPitchPractice();
            });
        }

        // Response options in pitch practice
        document.querySelectorAll('.response-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handlePitchResponse(e.target);
            });
        });

        // Checklist items
        document.querySelectorAll('.checklist-input, .toolkit-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateProgress();
            });
        });

        // Check detective answers button
        const checkAnswersBtn = document.getElementById('check-detective-answers');
        if (checkAnswersBtn) {
            checkAnswersBtn.addEventListener('click', () => {
                this.showDetectiveResults();
            });
        }
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
            },
            // Marketing lesson quiz feedback
            'marketing-1-quiz': {
                correct: `
                    <div class="feedback correct">
                        <i class="fas fa-check-circle"></i>
                        <span>Exactly right! Good marketing helps people discover products that will genuinely make them happy. It's about being helpful, not manipulative.</span>
                    </div>
                `,
                incorrect: {
                    'true': `
                        <div class="feedback incorrect">
                            <i class="fas fa-times-circle"></i>
                            <span>Not at all! Good marketing is about helping people find products they'll love. It's about being honest and helpful, not tricky or pushy.</span>
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

    // Marketing-specific interaction handlers
    handleMarketingGame(item) {
        const isMarketing = item.dataset.marketing === 'true';
        const feedback = item.querySelector('.scenario-feedback');
        
        // Mark as selected
        item.classList.add('selected');
        
        // Show feedback
        if (isMarketing) {
            feedback.innerHTML = `
                <div class="feedback correct">
                    <i class="fas fa-check-circle"></i>
                    <span>Yes! This is marketing.</span>
                </div>
            `;
            item.classList.add('correct');
        } else {
            feedback.innerHTML = `
                <div class="feedback neutral">
                    <i class="fas fa-info-circle"></i>
                    <span>Not marketing - just a regular activity.</span>
                </div>
            `;
            item.classList.add('neutral');
        }
        
        // Update game progress
        this.updateMarketingGameProgress();
    }

    updateMarketingGameProgress() {
        const totalScenarios = document.querySelectorAll('.scenario-item').length;
        const completedScenarios = document.querySelectorAll('.scenario-item.selected').length;
        
        const scoreElement = document.getElementById('marketing-game-score');
        if (scoreElement) {
            scoreElement.textContent = completedScenarios;
        }
        
        // Enable next button when all scenarios are completed
        if (completedScenarios === totalScenarios) {
            const nextBtn = document.getElementById('step1-next');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        }
    }

    handleMethodMatcher(option) {
        const scenario = option.closest('.matcher-scenario');
        const feedback = scenario.querySelector('.matcher-feedback');
        const isCorrect = option.dataset.correct === 'true';
        
        // Clear previous selections
        scenario.querySelectorAll('.method-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected option
        option.classList.add('selected');
        option.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Show feedback
        const scenarioNum = scenario.dataset.scenario;
        const feedbackMessages = {
            '1': {
                correct: 'Perfect! Letting people taste your brownies is the best way to show how delicious they are.',
                incorrect: 'Good thinking, but taste is what sells food products best. Sample marketing would work better here.'
            },
            '2': {
                correct: 'Exactly! Bright colors and eye-catching displays will draw people to your booth.',
                incorrect: 'Good idea, but when people are walking past, you need to catch their eye first with visual marketing.'
            },
            '3': {
                correct: 'Yes! Telling the story of why your handmade jewelry is special makes it more valuable.',
                incorrect: 'Nice try, but when someone asks what makes you different, sharing your story is most powerful.'
            }
        };
        
        const messages = feedbackMessages[scenarioNum];
        feedback.innerHTML = `
            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <i class="fas fa-${isCorrect ? 'check-circle' : 'info-circle'}"></i>
                <span>${isCorrect ? messages.correct : messages.incorrect}</span>
            </div>
        `;
    }

    initializeDetectiveGame() {
        // This would implement drag and drop functionality
        // For now, using a simplified click-to-match approach
        const products = document.querySelectorAll('.product-item');
        const dropzones = document.querySelectorAll('.customer-dropzone');
        
        let selectedProduct = null;
        
        products.forEach(product => {
            product.addEventListener('click', () => {
                // Clear previous selections
                products.forEach(p => p.classList.remove('selected'));
                product.classList.add('selected');
                selectedProduct = product;
                
                // Show instruction
                this.showDetectiveInstruction();
            });
        });
        
        dropzones.forEach(zone => {
            zone.addEventListener('click', () => {
                if (selectedProduct) {
                    this.matchProductToCustomer(selectedProduct, zone);
                    selectedProduct = null;
                }
            });
        });
    }

    showDetectiveInstruction() {
        const feedback = document.getElementById('detective-feedback');
        feedback.innerHTML = `
            <div class="instruction">
                <i class="fas fa-hand-pointer"></i>
                Now click on the customer type who would most likely buy this product!
            </div>
        `;
    }

    matchProductToCustomer(product, zone) {
        const productType = product.dataset.product;
        const customerType = zone.dataset.customer;
        
        // Check if this zone already has a product
        if (zone.dataset.product) {
            // Find the original product that was placed here and restore it
            const originalProductType = zone.dataset.product;
            const originalProduct = document.querySelector(`.product-item[data-product="${originalProductType}"]`);
            if (originalProduct) {
                originalProduct.style.opacity = '1';
                originalProduct.classList.remove('used');
            }
        }
        
        // Define correct matches
        const correctMatches = {
            'slime': 'kids',
            'coffee': 'parents',
            'bookmarks': 'teachers', 
            'photo': 'grandparents'
        };
        
        const isCorrect = correctMatches[productType] === customerType;
        
        // Move product to zone
        const dropArea = zone.querySelector('.dropzone-area');
        const productClone = product.cloneNode(true);
        productClone.classList.remove('selected');
        productClone.classList.add(isCorrect ? 'correct-match' : 'incorrect-match');
        
        dropArea.innerHTML = '';
        dropArea.appendChild(productClone);
        product.style.opacity = '0.5';
        product.classList.add('used');
        
        // Store the match for checking later
        zone.dataset.product = productType;
        zone.dataset.correct = isCorrect;
        
        this.checkDetectiveProgress();
    }

    checkDetectiveProgress() {
        const zones = document.querySelectorAll('.customer-dropzone[data-product]');
        const totalProducts = document.querySelectorAll('.product-item').length;
        
        if (zones.length === totalProducts) {
            const checkBtn = document.getElementById('check-detective-answers');
            if (checkBtn) {
                checkBtn.disabled = false;
            }
        }
    }

    showDetectiveResults() {
        const zones = document.querySelectorAll('.customer-dropzone[data-product]');
        let correctCount = 0;
        let totalCount = zones.length;

        // Count correct matches
        zones.forEach(zone => {
            if (zone.dataset.correct === 'true') {
                correctCount++;
            }
        });

        // Show results in the feedback area
        const feedback = document.getElementById('detective-feedback');
        if (feedback) {
            let resultMessage = '';
            let resultClass = '';
            
            if (correctCount === totalCount) {
                resultMessage = `Perfect! You got all ${correctCount} matches correct! 🎉 You really understand which customers prefer different products.`;
                resultClass = 'correct';
            } else if (correctCount >= totalCount * 0.75) {
                resultMessage = `Great job! You got ${correctCount} out of ${totalCount} correct! 👍 You understand most customer preferences.`;
                resultClass = 'correct';
            } else if (correctCount >= totalCount * 0.5) {
                resultMessage = `Good try! You got ${correctCount} out of ${totalCount} correct. 🤔 Think about what each customer type would really want to buy.`;
                resultClass = 'neutral';
            } else {
                resultMessage = `Keep trying! You got ${correctCount} out of ${totalCount} correct. 💪 Remember: kids love fun stuff, parents buy practical items, teachers need classroom supplies, and grandparents love memory keepsakes.`;
                resultClass = 'incorrect';
            }

            feedback.innerHTML = `
                <div class="feedback ${resultClass}">
                    <i class="fas fa-${resultClass === 'correct' ? 'check-circle' : resultClass === 'incorrect' ? 'times-circle' : 'info-circle'}"></i>
                    <span>${resultMessage}</span>
                </div>
            `;

            // Enable next step if they did reasonably well
            if (correctCount >= totalCount * 0.5) {
                const nextBtn = document.getElementById('step2-next');
                if (nextBtn) {
                    nextBtn.disabled = false;
                }
            }
        }

        // Disable the check button so it can't be clicked again
        const checkBtn = document.getElementById('check-detective-answers');
        if (checkBtn) {
            checkBtn.disabled = true;
            checkBtn.textContent = 'Results Shown';
        }
    }

    updateMessagePreview() {
        const entrepreneur = document.querySelector('.entrepreneur[data-entrepreneur="emma"]');
        if (!entrepreneur) return;
        
        const inputs = entrepreneur.querySelectorAll('.message-input');
        const preview = document.getElementById('emma-preview');
        
        let allSelected = true;
        const values = {};
        
        inputs.forEach(input => {
            const part = input.dataset.part;
            const value = input.value;
            if (value) {
                values[part] = input.options[input.selectedIndex].text;
            } else {
                allSelected = false;
            }
        });
        
        if (allSelected) {
            preview.innerHTML = `"Hi! I make ${values.what} ${values.why}. They're ${values.who}. ${values.action}"`;
            
            const practiceBtn = document.getElementById('practice-pitch');
            if (practiceBtn) {
                practiceBtn.disabled = false;
            }
        } else {
            preview.innerHTML = 'Fill in the blanks above to see Emma\'s pitch!';
        }
    }

    showPitchPractice() {
        const practiceSection = document.getElementById('pitch-practice');
        if (practiceSection) {
            practiceSection.style.display = 'block';
            practiceSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handlePitchResponse(option) {
        const scenario = option.closest('.practice-scenario');
        const feedback = scenario.querySelector('.practice-feedback');
        const isCorrect = option.dataset.correct === 'true';
        
        // Clear previous selections
        scenario.querySelectorAll('.response-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected option
        option.classList.add('selected');
        option.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Show feedback
        const responseType = option.dataset.response;
        const feedbackMessages = {
            'confident': 'Perfect! You sound excited and confident about your product. This makes customers want to learn more!',
            'shy': 'This sounds unsure and doesn\'t make your product sound appealing. Try to be more enthusiastic!',
            'pushy': 'This is too aggressive and might scare customers away. Good marketing is helpful, not pushy.'
        };
        
        feedback.innerHTML = `
            <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <i class="fas fa-${isCorrect ? 'check-circle' : 'info-circle'}"></i>
                <span>${feedbackMessages[responseType]}</span>
            </div>
        `;
        
        // Enable next button
        const nextBtn = document.getElementById('step4-next');
        if (nextBtn) {
            nextBtn.disabled = false;
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