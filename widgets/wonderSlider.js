/**
 * Wonder Slider Widget
 * Predict → Test → Reflect pattern for scientific thinking
 * Learning: Hypothesis testing, observation, reflection
 */

class WonderSlider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            question: options.question || "What happens when we change this?",
            variable: options.variable || "Amount",
            minValue: options.minValue || 0,
            maxValue: options.maxValue || 100,
            unit: options.unit || "",
            scenarios: options.scenarios || [],
            ...options
        };
        
        this.currentValue = Math.round((this.options.minValue + this.options.maxValue) / 2);
        this.prediction = null;
        this.observations = [];
        this.reflection = '';
        this.phase = 'predict'; // predict, test, reflect
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        console.log('🔬 Wonder Slider initialized');
    }

    render() {
        this.container.innerHTML = `
            <div class="wonder-slider">
                <div class="widget-header">
                    <h3 class="widget-title">🔬 Science Wonder Slider</h3>
                    <div class="widget-controls">
                        <button class="btn btn-ghost btn-sm" onclick="this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display = this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display === 'none' ? 'block' : 'none'">
                            ❓ Help
                        </button>
                    </div>
                </div>
                
                <div class="instructions" style="display: none;">
                    <div class="instruction-panel">
                        <h4>🎯 Your Mission</h4>
                        <p>Be a scientist! Follow these steps:</p>
                        <ol>
                            <li><strong>Predict:</strong> Guess what will happen when you change the setting</li>
                            <li><strong>Test:</strong> Move the slider and observe what actually happens</li>
                            <li><strong>Reflect:</strong> Compare your prediction with what you observed</li>
                        </ol>
                        <p><strong>Remember:</strong> It's okay if your prediction is wrong - that's how we learn!</p>
                    </div>
                </div>

                <div class="wonder-content">
                    <div class="question-section">
                        <h4 class="wonder-question">${this.options.question}</h4>
                        <div class="phase-indicator">
                            <div class="phase-step ${this.phase === 'predict' ? 'active' : 'completed'}">
                                <span class="step-number">1</span>
                                <span class="step-label">Predict</span>
                            </div>
                            <div class="phase-arrow">→</div>
                            <div class="phase-step ${this.phase === 'test' ? 'active' : this.phase === 'reflect' ? 'completed' : ''}">
                                <span class="step-number">2</span>
                                <span class="step-label">Test</span>
                            </div>
                            <div class="phase-arrow">→</div>
                            <div class="phase-step ${this.phase === 'reflect' ? 'active' : ''}">
                                <span class="step-number">3</span>
                                <span class="step-label">Reflect</span>
                            </div>
                        </div>
                    </div>

                    <div class="prediction-section" id="predictionSection" style="display: ${this.phase === 'predict' ? 'block' : 'none'}">
                        <h5>🤔 Step 1: Make Your Prediction</h5>
                        <p>Before you test, what do you think will happen?</p>
                        <div class="prediction-options">
                            <label class="prediction-option">
                                <input type="radio" name="prediction" value="increase">
                                <span class="option-content">
                                    <span class="option-icon">📈</span>
                                    <span class="option-text">The result will increase</span>
                                </span>
                            </label>
                            <label class="prediction-option">
                                <input type="radio" name="prediction" value="decrease">
                                <span class="option-content">
                                    <span class="option-icon">📉</span>
                                    <span class="option-text">The result will decrease</span>
                                </span>
                            </label>
                            <label class="prediction-option">
                                <input type="radio" name="prediction" value="nochange">
                                <span class="option-content">
                                    <span class="option-icon">➡️</span>
                                    <span class="option-text">Nothing will change</span>
                                </span>
                            </label>
                            <label class="prediction-option">
                                <input type="radio" name="prediction" value="surprise">
                                <span class="option-content">
                                    <span class="option-icon">🎲</span>
                                    <span class="option-text">Something surprising will happen</span>
                                </span>
                            </label>
                        </div>
                        <button class="btn btn-primary" id="startTesting" disabled>
                            🧪 Start Testing
                        </button>
                    </div>

                    <div class="testing-section" id="testingSection" style="display: ${this.phase === 'test' ? 'block' : 'none'}">
                        <h5>🧪 Step 2: Test Your Idea</h5>
                        <p>Move the slider and watch what happens. You can test multiple settings!</p>
                        
                        <div class="slider-container">
                            <div class="slider-header">
                                <label for="wonderSlider">${this.options.variable}:</label>
                                <span class="slider-value" id="sliderValue">${this.currentValue}${this.options.unit}</span>
                            </div>
                            <input type="range" 
                                   id="wonderSlider" 
                                   class="slider"
                                   min="${this.options.minValue}" 
                                   max="${this.options.maxValue}" 
                                   value="${this.currentValue}">
                            <div class="slider-labels">
                                <span>Less</span>
                                <span>More</span>
                            </div>
                        </div>

                        <div class="result-display" id="resultDisplay">
                            <div class="result-content">
                                <div class="result-icon">⚡</div>
                                <div class="result-text">Move the slider to see what happens!</div>
                            </div>
                        </div>

                        <div class="observation-log">
                            <h6>📝 Your Observations</h6>
                            <div class="observations-list" id="observationsList">
                                <p class="empty-observations">No observations yet. Try moving the slider!</p>
                            </div>
                            <button class="btn btn-success" id="startReflecting" disabled>
                                💭 Reflect on Results
                            </button>
                        </div>
                    </div>

                    <div class="reflection-section" id="reflectionSection" style="display: ${this.phase === 'reflect' ? 'block' : 'none'}">
                        <h5>💭 Step 3: Reflect on What You Learned</h5>
                        
                        <div class="comparison-display">
                            <div class="comparison-item">
                                <h6>🤔 Your Prediction</h6>
                                <div class="prediction-display" id="predictionDisplay">
                                    Loading...
                                </div>
                            </div>
                            <div class="comparison-vs">VS</div>
                            <div class="comparison-item">
                                <h6>🧪 What Actually Happened</h6>
                                <div class="observation-summary" id="observationSummary">
                                    Loading...
                                </div>
                            </div>
                        </div>

                        <div class="reflection-input">
                            <label for="reflectionText">
                                <strong>What did you learn? Was your prediction correct?</strong>
                            </label>
                            <textarea id="reflectionText" 
                                     placeholder="e.g., I predicted it would increase, and it did! I learned that when you add more heat, water evaporates faster..."></textarea>
                        </div>

                        <div class="reflection-actions">
                            <button class="btn btn-primary" id="saveWonder" disabled>
                                📚 Save to Journal
                            </button>
                            <button class="btn btn-ghost" id="tryAgain">
                                🔄 Try Another Wonder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Prediction phase
        const predictionInputs = this.container.querySelectorAll('input[name="prediction"]');
        predictionInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.prediction = e.target.value;
                this.container.querySelector('#startTesting').disabled = false;
            });
        });

        this.container.querySelector('#startTesting').addEventListener('click', () => {
            this.startTesting();
        });

        // Testing phase
        const slider = this.container.querySelector('#wonderSlider');
        slider.addEventListener('input', (e) => {
            this.currentValue = parseInt(e.target.value);
            this.updateSliderDisplay();
            this.showResult();
            this.logObservation();
        });

        this.container.querySelector('#startReflecting').addEventListener('click', () => {
            this.startReflecting();
        });

        // Reflection phase
        const reflectionText = this.container.querySelector('#reflectionText');
        reflectionText.addEventListener('input', () => {
            this.reflection = reflectionText.value.trim();
            this.container.querySelector('#saveWonder').disabled = !this.reflection;
        });

        this.container.querySelector('#saveWonder').addEventListener('click', () => {
            this.saveToJournal();
        });

        this.container.querySelector('#tryAgain').addEventListener('click', () => {
            this.reset();
        });
    }

    startTesting() {
        this.phase = 'test';
        this.container.querySelector('#predictionSection').style.display = 'none';
        this.container.querySelector('#testingSection').style.display = 'block';
        this.updatePhaseIndicator();
    }

    startReflecting() {
        this.phase = 'reflect';
        this.container.querySelector('#testingSection').style.display = 'none';
        this.container.querySelector('#reflectionSection').style.display = 'block';
        this.updatePhaseIndicator();
        this.showComparison();
    }

    updateSliderDisplay() {
        this.container.querySelector('#sliderValue').textContent = `${this.currentValue}${this.options.unit}`;
    }

    showResult() {
        const resultDisplay = this.container.querySelector('#resultDisplay');
        const result = this.calculateResult(this.currentValue);
        
        resultDisplay.innerHTML = `
            <div class="result-content">
                <div class="result-icon">${result.icon}</div>
                <div class="result-text">${result.text}</div>
                <div class="result-value">${result.value}</div>
            </div>
        `;
    }

    calculateResult(value) {
        // Simple example - can be customized for different scenarios
        const normalizedValue = value / this.options.maxValue;
        
        if (normalizedValue < 0.3) {
            return {
                icon: '🟢',
                text: 'Low impact',
                value: `${Math.round(normalizedValue * 10)}/10`
            };
        } else if (normalizedValue < 0.7) {
            return {
                icon: '🟡',
                text: 'Medium impact',
                value: `${Math.round(normalizedValue * 10)}/10`
            };
        } else {
            return {
                icon: '🔴',
                text: 'High impact',
                value: `${Math.round(normalizedValue * 10)}/10`
            };
        }
    }

    logObservation() {
        const result = this.calculateResult(this.currentValue);
        const observation = {
            value: this.currentValue,
            result: result.text,
            timestamp: Date.now()
        };
        
        this.observations.push(observation);
        this.updateObservationsList();
        
        // Enable reflection button after at least 2 observations
        if (this.observations.length >= 2) {
            this.container.querySelector('#startReflecting').disabled = false;
        }
    }

    updateObservationsList() {
        const observationsList = this.container.querySelector('#observationsList');
        
        if (this.observations.length === 0) {
            observationsList.innerHTML = '<p class="empty-observations">No observations yet. Try moving the slider!</p>';
            return;
        }
        
        const uniqueObservations = this.observations.filter((obs, index, self) => 
            index === self.findIndex(o => o.value === obs.value)
        );
        
        observationsList.innerHTML = uniqueObservations.map(obs => `
            <div class="observation-item">
                <span class="obs-value">${obs.value}${this.options.unit}:</span>
                <span class="obs-result">${obs.result}</span>
            </div>
        `).join('');
    }

    showComparison() {
        const predictionDisplay = this.container.querySelector('#predictionDisplay');
        const observationSummary = this.container.querySelector('#observationSummary');
        
        const predictionTexts = {
            increase: '📈 You predicted the result would increase',
            decrease: '📉 You predicted the result would decrease', 
            nochange: '➡️ You predicted nothing would change',
            surprise: '🎲 You predicted something surprising would happen'
        };
        
        predictionDisplay.textContent = predictionTexts[this.prediction];
        
        const trend = this.analyzeObservationTrend();
        observationSummary.innerHTML = `
            <div class="trend-analysis">
                <div class="trend-icon">${trend.icon}</div>
                <div class="trend-text">${trend.description}</div>
            </div>
        `;
    }

    analyzeObservationTrend() {
        if (this.observations.length < 2) {
            return { icon: '❓', description: 'Not enough data to analyze trend' };
        }
        
        const firstObs = this.observations[0];
        const lastObs = this.observations[this.observations.length - 1];
        
        if (lastObs.value > firstObs.value && lastObs.result !== firstObs.result) {
            return { icon: '📈', description: 'As the value increased, the result changed' };
        } else if (lastObs.value < firstObs.value && lastObs.result !== firstObs.result) {
            return { icon: '📉', description: 'As the value decreased, the result changed' };
        } else {
            return { icon: '➡️', description: 'The result stayed similar despite changes' };
        }
    }

    updatePhaseIndicator() {
        const steps = this.container.querySelectorAll('.phase-step');
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (this.phase === 'predict' && index === 0) {
                step.classList.add('active');
            } else if (this.phase === 'test' && index === 1) {
                step.classList.add('active');
                if (index === 0) step.classList.add('completed');
            } else if (this.phase === 'reflect' && index === 2) {
                step.classList.add('active');
                if (index < 2) step.classList.add('completed');
            } else if ((this.phase === 'test' && index === 0) || (this.phase === 'reflect' && index < 2)) {
                step.classList.add('completed');
            }
        });
    }

    saveToJournal() {
        if (!this.reflection) {
            alert('Please write your reflection before saving!');
            return;
        }
        
        const trend = this.analyzeObservationTrend();
        const predictionTexts = {
            increase: 'result would increase',
            decrease: 'result would decrease', 
            nochange: 'nothing would change',
            surprise: 'something surprising would happen'
        };
        
        const facts = [
            `Question explored: ${this.options.question}`,
            `Prediction: I thought ${predictionTexts[this.prediction]}`,
            `Observations: Tested ${this.observations.length} different settings`,
            `Pattern found: ${trend.description}`
        ];
        
        const entry = {
            id: `wonder-${Date.now()}`,
            lessonId: 'L1', // Can be customized
            title: 'Wonder Investigation',
            facts: facts,
            reflection: this.reflection,
            timestamp: Date.now()
        };
        
        if (typeof saveEntry === 'function') {
            saveEntry(entry);
            this.showNotification('Wonder investigation saved to journal! 🎉', 'success');
            
            // Award XP
            if (typeof addXP === 'function') {
                addXP(10);
            }
        } else {
            console.warn('Journal system not available');
            this.showNotification('Wonder investigation completed! 🎉', 'success');
        }
    }

    reset() {
        this.phase = 'predict';
        this.prediction = null;
        this.observations = [];
        this.reflection = '';
        this.currentValue = Math.round((this.options.minValue + this.options.maxValue) / 2);
        
        this.render();
        this.setupEventListeners();
        
        this.showNotification('Ready for a new wonder investigation! 🔬', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `widget-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Export for use in other scripts
window.WonderSlider = WonderSlider;
