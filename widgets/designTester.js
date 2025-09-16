/**
 * Design Tester Widget
 * Test building features and see their impact on heat and water resistance
 * Learning: Variables, cause-effect, sustainable design
 */

class DesignTester {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = options;
        
        this.features = {
            shade: false,
            ventilation: false,
            insulation: false,
            raisedFloor: false,
            rainwaterTank: false,
            solarPanels: false
        };
        
        this.baselineHeat = 50; // 0-100 scale
        this.baselineWater = 50; // 0-100 scale
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.updateMeters();
        console.log('🏗️ Design Tester initialized');
    }

    render() {
        this.container.innerHTML = `
            <div class="design-tester">
                <div class="widget-header">
                    <h3 class="widget-title">🏗️ Future Home Design Tester</h3>
                    <div class="widget-controls">
                        <button class="btn btn-ghost btn-sm" onclick="this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display = this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display === 'none' ? 'block' : 'none'">
                            ❓ Help
                        </button>
                    </div>
                </div>
                
                <div class="instructions" style="display: none;">
                    <div class="instruction-panel">
                        <h4>🎯 Your Mission</h4>
                        <p>Design a climate-ready home by testing different features. Watch how each change affects:</p>
                        <ul>
                            <li><strong>Heat:</strong> How hot or cool the house feels</li>
                            <li><strong>Water:</strong> How well it handles rain and floods</li>
                        </ul>
                        <p><strong>Challenge:</strong> Try changing one feature at a time and predict what will happen before you click!</p>
                    </div>
                </div>

                <div class="design-interface">
                    <div class="features-panel">
                        <h4>🛠️ Building Features</h4>
                        <p class="panel-subtitle">Click to add or remove features from your house</p>
                        
                        <div class="features-grid">
                            <div class="feature-toggle" data-feature="shade">
                                <div class="feature-icon">🏛️</div>
                                <div class="feature-info">
                                    <div class="feature-name">Shade</div>
                                    <div class="feature-description">Overhangs & trees</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="toggle-shade">
                                    <label for="toggle-shade"></label>
                                </div>
                            </div>

                            <div class="feature-toggle" data-feature="ventilation">
                                <div class="feature-icon">🌪️</div>
                                <div class="feature-info">
                                    <div class="feature-name">Ventilation</div>
                                    <div class="feature-description">Cross-ventilation & vents</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="toggle-ventilation">
                                    <label for="toggle-ventilation"></label>
                                </div>
                            </div>

                            <div class="feature-toggle" data-feature="insulation">
                                <div class="feature-icon">🧥</div>
                                <div class="feature-info">
                                    <div class="feature-name">Insulation</div>
                                    <div class="feature-description">Thick walls & roof</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="toggle-insulation">
                                    <label for="toggle-insulation"></label>
                                </div>
                            </div>

                            <div class="feature-toggle" data-feature="raisedFloor">
                                <div class="feature-icon">⬆️</div>
                                <div class="feature-info">
                                    <div class="feature-name">Raised Floor</div>
                                    <div class="feature-description">House on stilts</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="toggle-raisedFloor">
                                    <label for="toggle-raisedFloor"></label>
                                </div>
                            </div>

                            <div class="feature-toggle" data-feature="rainwaterTank">
                                <div class="feature-icon">🪣</div>
                                <div class="feature-info">
                                    <div class="feature-name">Rainwater Tank</div>
                                    <div class="feature-description">Collect & store water</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="toggle-rainwaterTank">
                                    <label for="toggle-rainwaterTank"></label>
                                </div>
                            </div>

                            <div class="feature-toggle" data-feature="solarPanels">
                                <div class="feature-icon">☀️</div>
                                <div class="feature-info">
                                    <div class="feature-name">Solar Panels</div>
                                    <div class="feature-description">Clean electricity</div>
                                </div>
                                <div class="toggle-switch">
                                    <input type="checkbox" id="toggle-solarPanels">
                                    <label for="toggle-solarPanels"></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="results-panel">
                        <h4>📊 Impact Meters</h4>
                        <p class="panel-subtitle">See how your features affect the house</p>
                        
                        <div class="meters-container">
                            <div class="meter">
                                <div class="meter-header">
                                    <span class="meter-icon">🌡️</span>
                                    <span class="meter-label">Temperature</span>
                                </div>
                                <div class="meter-scale">
                                    <div class="scale-label left">😰 Hotter</div>
                                    <div class="meter-bar">
                                        <div class="meter-fill heat-meter" id="heatMeter"></div>
                                        <div class="meter-pointer" id="heatPointer"></div>
                                    </div>
                                    <div class="scale-label right">😎 Cooler</div>
                                </div>
                                <div class="meter-feedback" id="heatFeedback">
                                    Baseline temperature
                                </div>
                            </div>

                            <div class="meter">
                                <div class="meter-header">
                                    <span class="meter-icon">💧</span>
                                    <span class="meter-label">Water Management</span>
                                </div>
                                <div class="meter-scale">
                                    <div class="scale-label left">🌊 Flood Risk</div>
                                    <div class="meter-bar">
                                        <div class="meter-fill water-meter" id="waterMeter"></div>
                                        <div class="meter-pointer" id="waterPointer"></div>
                                    </div>
                                    <div class="scale-label right">🛡️ Flood Safe</div>
                                </div>
                                <div class="meter-feedback" id="waterFeedback">
                                    Baseline water management
                                </div>
                            </div>
                        </div>

                        <div class="design-summary" id="designSummary">
                            <h5>📝 My Design Summary</h5>
                            <div class="summary-input">
                                <label for="designReason">
                                    <strong>My design uses [feature] because [reason]:</strong>
                                </label>
                                <textarea id="designReason" placeholder="e.g., My design uses solar panels because they make clean electricity and help reduce pollution..."></textarea>
                            </div>
                            
                            <div class="summary-actions">
                                <button class="btn btn-success" id="saveDesign" disabled>
                                    💾 Save Design
                                </button>
                                <button class="btn btn-secondary" id="exportDesign" disabled>
                                    📤 Export Design Summary
                                </button>
                                <button class="btn btn-ghost" id="resetDesign">
                                    🔄 Start Over
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Feature toggles
        Object.keys(this.features).forEach(feature => {
            const toggle = this.container.querySelector(`#toggle-${feature}`);
            toggle.addEventListener('change', (e) => {
                this.features[feature] = e.target.checked;
                this.updateMeters();
                this.showFeatureFeedback(feature, e.target.checked);
            });
        });

        // Design summary input
        const reasonInput = this.container.querySelector('#designReason');
        reasonInput.addEventListener('input', () => {
            this.checkSaveReady();
        });

        // Action buttons
        this.container.querySelector('#saveDesign').addEventListener('click', () => {
            this.saveToJournal();
        });

        this.container.querySelector('#exportDesign').addEventListener('click', () => {
            this.exportDesignSummary();
        });

        this.container.querySelector('#resetDesign').addEventListener('click', () => {
            this.reset();
        });
    }

    updateMeters() {
        const heatScore = this.calculateHeatScore();
        const waterScore = this.calculateWaterScore();
        
        // Update heat meter (lower is better - cooler)
        const heatMeter = this.container.querySelector('#heatMeter');
        const heatPointer = this.container.querySelector('#heatPointer');
        const heatFeedback = this.container.querySelector('#heatFeedback');
        
        const heatPercent = (100 - heatScore); // Invert so right side is better
        heatMeter.style.width = `${heatPercent}%`;
        heatPointer.style.left = `${heatPercent}%`;
        
        if (heatScore < 40) {
            heatMeter.className = 'meter-fill heat-meter excellent';
            heatFeedback.textContent = '❄️ Excellent cooling! Very comfortable.';
        } else if (heatScore < 60) {
            heatMeter.className = 'meter-fill heat-meter good';
            heatFeedback.textContent = '😊 Good temperature control.';
        } else {
            heatMeter.className = 'meter-fill heat-meter poor';
            heatFeedback.textContent = '🥵 Too hot! Needs more cooling features.';
        }
        
        // Update water meter (higher is better - more protection)
        const waterMeter = this.container.querySelector('#waterMeter');
        const waterPointer = this.container.querySelector('#waterPointer');
        const waterFeedback = this.container.querySelector('#waterFeedback');
        
        waterMeter.style.width = `${waterScore}%`;
        waterPointer.style.left = `${waterScore}%`;
        
        if (waterScore > 70) {
            waterMeter.className = 'meter-fill water-meter excellent';
            waterFeedback.textContent = '🛡️ Excellent flood protection!';
        } else if (waterScore > 50) {
            waterMeter.className = 'meter-fill water-meter good';
            waterFeedback.textContent = '💧 Good water management.';
        } else {
            waterMeter.className = 'meter-fill water-meter poor';
            waterFeedback.textContent = '🌊 Flood risk! Needs water features.';
        }
    }

    calculateHeatScore() {
        let score = this.baselineHeat;
        
        if (this.features.shade) score -= 15; // Shade reduces heat significantly
        if (this.features.ventilation) score -= 20; // Ventilation is very effective
        if (this.features.insulation) score -= 10; // Insulation helps maintain temperature
        if (this.features.solarPanels) score += 5; // Solar panels can add slight heat
        
        return Math.max(0, Math.min(100, score));
    }

    calculateWaterScore() {
        let score = this.baselineWater;
        
        if (this.features.raisedFloor) score += 25; // Raised floor is excellent for floods
        if (this.features.rainwaterTank) score += 15; // Tank helps manage water
        if (this.features.ventilation) score += 5; // Helps with humidity
        if (this.features.insulation) score += 5; // Prevents water damage
        
        return Math.max(0, Math.min(100, score));
    }

    showFeatureFeedback(feature, enabled) {
        const feedbackMessages = {
            shade: enabled ? "Shade added. Likely cooler at midday." : "Shade removed. Might get hotter.",
            ventilation: enabled ? "Vent added. Better airflow." : "Vents closed. Less airflow.",
            insulation: enabled ? "Insulation added. Keeps inside temperature steadier." : "Insulation removed. Temperature less stable.",
            raisedFloor: enabled ? "Raised floor added. Safer from floods." : "Floor lowered. More flood risk.",
            rainwaterTank: enabled ? "Rainwater tank added. Stores water for later." : "Tank removed. Less water storage.",
            solarPanels: enabled ? "Solar panels added. Makes clean electricity." : "Solar panels removed. No clean power."
        };
        
        this.showNotification(feedbackMessages[feature], enabled ? 'success' : 'info');
    }

    checkSaveReady() {
        const reasonText = this.container.querySelector('#designReason').value.trim();
        const hasFeatures = Object.values(this.features).some(f => f);
        const saveButton = this.container.querySelector('#saveDesign');
        const exportButton = this.container.querySelector('#exportDesign');
        
        if (reasonText && hasFeatures) {
            saveButton.disabled = false;
            exportButton.disabled = false;
        } else {
            saveButton.disabled = true;
            exportButton.disabled = true;
        }
    }

    saveToJournal() {
        const reasonText = this.container.querySelector('#designReason').value.trim();
        
        if (!reasonText) {
            alert('Please explain your design choices before saving!');
            return;
        }
        
        const enabledFeatures = Object.keys(this.features).filter(f => this.features[f]);
        const heatScore = this.calculateHeatScore();
        const waterScore = this.calculateWaterScore();
        
        const facts = [
            `Features used: ${enabledFeatures.join(', ')}`,
            `Heat management: ${heatScore < 50 ? 'Good' : 'Needs improvement'}`,
            `Water protection: ${waterScore > 60 ? 'Good' : 'Needs improvement'}`,
            `Design reasoning: ${reasonText}`
        ];
        
        const reflection = `I tested how different building features affect temperature and flood safety. Each feature has a specific purpose and works better in certain conditions.`;
        
        // Save to journal
        const entry = {
            id: `L9-${Date.now()}`,
            lessonId: 'L9',
            title: 'Design a future-ready home (Plan & Prototype)',
            facts: facts,
            reflection: reflection,
            timestamp: Date.now()
        };
        
        if (typeof saveEntry === 'function') {
            saveEntry(entry);
            this.showNotification('Design saved to journal! 🎉', 'success');
            
            // Award XP
            if (typeof addXP === 'function') {
                addXP(15); // More XP for complex design work
            }
        } else {
            console.warn('Journal system not available');
            this.showNotification('Design completed! 🎉', 'success');
        }
    }

    exportDesignSummary() {
        const reasonText = this.container.querySelector('#designReason').value.trim();
        const enabledFeatures = Object.keys(this.features).filter(f => this.features[f]);
        const heatScore = this.calculateHeatScore();
        const waterScore = this.calculateWaterScore();
        
        const summary = {
            studentName: "Young Scientist",
            designDate: new Date().toLocaleDateString(),
            features: enabledFeatures,
            reasoning: reasonText,
            performance: {
                heatManagement: heatScore,
                waterProtection: waterScore,
                overallScore: Math.round((100 - heatScore + waterScore) / 2)
            },
            recommendations: this.generateRecommendations(heatScore, waterScore)
        };
        
        // Export as JSON
        const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `future-home-design-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Design summary exported! 📤', 'success');
    }

    generateRecommendations(heatScore, waterScore) {
        const recommendations = [];
        
        if (heatScore > 60) {
            recommendations.push("Add shade and ventilation to reduce heat");
        }
        if (waterScore < 50) {
            recommendations.push("Consider raised floor and rainwater collection for flood protection");
        }
        if (!this.features.solarPanels) {
            recommendations.push("Solar panels could provide clean energy");
        }
        
        return recommendations;
    }

    reset() {
        // Reset all features
        Object.keys(this.features).forEach(feature => {
            this.features[feature] = false;
            this.container.querySelector(`#toggle-${feature}`).checked = false;
        });
        
        // Clear design reason
        this.container.querySelector('#designReason').value = '';
        
        // Update meters
        this.updateMeters();
        this.checkSaveReady();
        
        this.showNotification('Design reset! Try a new combination. 🔄', 'info');
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
window.DesignTester = DesignTester;
