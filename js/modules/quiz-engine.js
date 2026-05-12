/**
 * Quiz Engine Module
 * Handles the final quiz functionality with multiple questions and scoring
 */

class QuizEngine {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 3;
        this.score = 0;
        this.answers = {};
        this.quizCompleted = false;
        
        this.init();
    }

    init() {
        if (!document.querySelector('.final-quiz')) return;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Final quiz options
        document.querySelectorAll('.final-quiz .quiz-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleQuizAnswer(e.target);
            });
        });

        // Quiz navigation buttons
        const nextBtn = document.getElementById('quizNext');
        const finishBtn = document.getElementById('finishQuiz');
        const restartBtn = document.getElementById('restartQuiz');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                this.showResults();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartQuiz();
            });
        }
    }

    handleQuizAnswer(option) {
        const questionCard = option.closest('.quiz-question-card');
        const questionNum = parseInt(questionCard.dataset.question);
        
        // Prevent multiple selections
        if (this.answers[questionNum]) return;
        
        // Remove previous selections in this question
        questionCard.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected option
        option.classList.add('selected');
        
        // Check if correct
        const isCorrect = option.dataset.correct === 'true';
        option.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Show correct answer if wrong
        if (!isCorrect) {
            const correctOption = questionCard.querySelector('.quiz-option[data-correct="true"]');
            if (correctOption) {
                correctOption.classList.add('correct');
            }
        }
        
        // Store answer
        this.answers[questionNum] = {
            selected: option.dataset.answer,
            correct: isCorrect
        };
        
        if (isCorrect) {
            this.score++;
        }
        
        // Show feedback animation
        this.showAnswerFeedback(option, isCorrect);
        
        // Update navigation buttons
        setTimeout(() => {
            this.updateQuizNavigation();
        }, 1500);
    }

    showAnswerFeedback(option, isCorrect) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `quiz-feedback-animation ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = isCorrect ? 
            '<i class="fas fa-check-circle"></i>' : 
            '<i class="fas fa-times-circle"></i>';
        
        // Position it near the selected option
        option.appendChild(feedback);
        
        // Animate in
        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(-50%) scale(1)';
        });
        
        // Remove after animation
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 1500);
    }

    updateQuizNavigation() {
        const nextBtn = document.getElementById('quizNext');
        const finishBtn = document.getElementById('finishQuiz');
        
        if (this.currentQuestion < this.totalQuestions) {
            // Enable next button
            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.style.display = 'inline-flex';
            }
            if (finishBtn) {
                finishBtn.style.display = 'none';
            }
        } else {
            // Last question - show finish button
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }
            if (finishBtn) {
                finishBtn.disabled = false;
                finishBtn.style.display = 'inline-flex';
            }
        }
    }

    nextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) return;
        
        // Hide current question
        const currentCard = document.querySelector(`.quiz-question-card[data-question="${this.currentQuestion}"]`);
        if (currentCard) {
            currentCard.classList.remove('active');
        }
        
        // Show next question
        this.currentQuestion++;
        const nextCard = document.querySelector(`.quiz-question-card[data-question="${this.currentQuestion}"]`);
        if (nextCard) {
            nextCard.classList.add('active');
        }
        
        // Reset navigation buttons
        const nextBtn = document.getElementById('quizNext');
        if (nextBtn) {
            nextBtn.disabled = true;
        }
    }

    showResults() {
        // Hide all question cards
        document.querySelectorAll('.quiz-question-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Show results
        const resultsDiv = document.getElementById('quizResults');
        if (resultsDiv) {
            resultsDiv.style.display = 'block';
            
            // Calculate percentage
            const percentage = Math.round((this.score / this.totalQuestions) * 100);
            
            // Update score display
            const scoreElement = document.getElementById('scorePercentage');
            if (scoreElement) {
                scoreElement.textContent = `${percentage}%`;
            }
            
            // Update message based on score
            const messageElement = document.getElementById('resultsMessage');
            if (messageElement) {
                let message = '';
                if (percentage >= 90) {
                    message = "Outstanding! You're ready to price your products like a pro! 🌟";
                } else if (percentage >= 70) {
                    message = "Great job! You understand the basics of pricing. 👍";
                } else if (percentage >= 50) {
                    message = "Good effort! Consider reviewing the lesson and trying again. 📚";
                } else {
                    message = "Keep learning! Try reviewing the lesson content and take the quiz again. 💪";
                }
                messageElement.textContent = message;
            }
            
            // Add celebration animation for high scores
            if (percentage >= 80) {
                this.addCelebrationEffect();
            }
            
            // Save completion
            this.saveQuizCompletion(percentage);
        }
        
        this.quizCompleted = true;
    }

    addCelebrationEffect() {
        // Create confetti-like effect
        const celebration = document.createElement('div');
        celebration.className = 'celebration-container';
        celebration.innerHTML = `
            <div class="confetti">🎉</div>
            <div class="confetti">🎊</div>
            <div class="confetti">⭐</div>
            <div class="confetti">🏆</div>
            <div class="confetti">🎯</div>
        `;
        
        document.body.appendChild(celebration);
        
        // Animate confetti
        const confetti = celebration.querySelectorAll('.confetti');
        confetti.forEach((item, index) => {
            item.style.left = Math.random() * 100 + '%';
            item.style.animationDelay = index * 200 + 'ms';
        });
        
        // Remove after animation
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, 3000);
    }

    restartQuiz() {
        // Reset quiz state
        this.currentQuestion = 1;
        this.score = 0;
        this.answers = {};
        this.quizCompleted = false;
        
        // Reset UI
        document.querySelectorAll('.quiz-question-card').forEach(card => {
            card.classList.remove('active');
            
            // Reset options
            card.querySelectorAll('.quiz-option').forEach(option => {
                option.classList.remove('selected', 'correct', 'incorrect');
            });
        });
        
        // Show first question
        const firstCard = document.querySelector('.quiz-question-card[data-question="1"]');
        if (firstCard) {
            firstCard.classList.add('active');
        }
        
        // Hide results
        const resultsDiv = document.getElementById('quizResults');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }
        
        // Reset navigation buttons
        const nextBtn = document.getElementById('quizNext');
        const finishBtn = document.getElementById('finishQuiz');
        
        if (nextBtn) {
            nextBtn.disabled = true;
            nextBtn.style.display = 'inline-flex';
        }
        
        if (finishBtn) {
            finishBtn.disabled = true;
            finishBtn.style.display = 'none';
        }
    }

    saveQuizCompletion(score) {
        const completionData = {
            lesson: 'pricing',
            score: score,
            completed: true,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        let completedLessons = [];
        try {
            const saved = localStorage.getItem('completed-lessons');
            if (saved) {
                completedLessons = JSON.parse(saved);
            }
        } catch (e) {
            console.log('Could not load completed lessons');
        }
        
        // Update or add this lesson
        const existingIndex = completedLessons.findIndex(lesson => lesson.lesson === 'pricing');
        if (existingIndex >= 0) {
            // Update existing record if score is better
            if (score > completedLessons[existingIndex].score) {
                completedLessons[existingIndex] = completionData;
            }
        } else {
            // Add new completion
            completedLessons.push(completionData);
        }
        
        localStorage.setItem('completed-lessons', JSON.stringify(completedLessons));
    }

    getQuizProgress() {
        return {
            currentQuestion: this.currentQuestion,
            totalQuestions: this.totalQuestions,
            score: this.score,
            completed: this.quizCompleted
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizEngine = new QuizEngine();
});