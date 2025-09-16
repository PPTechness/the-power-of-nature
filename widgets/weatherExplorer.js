/**
 * Weather Explorer Widget
 * Compare weather and climate between two places
 * Learning: Weather vs Climate, observation skills
 */

class WeatherExplorer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            placesA: options.placesA || ["Singapore", "London", "Cairo", "Stockholm"],
            placesB: options.placesB || ["Singapore", "London", "Cairo", "Stockholm"],
            ...options
        };
        
        this.selectedPlaceA = null;
        this.selectedPlaceB = null;
        this.facts = [];
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        console.log('🌤️ Weather Explorer initialized');
    }

    render() {
        this.container.innerHTML = `
            <div class="weather-explorer">
                <div class="widget-header">
                    <h3 class="widget-title">🌍 Weather & Climate Explorer</h3>
                    <div class="widget-controls">
                        <button class="btn btn-ghost btn-sm" onclick="this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display = this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display === 'none' ? 'block' : 'none'">
                            ❓ Help
                        </button>
                    </div>
                </div>
                
                <div class="instructions" style="display: none;">
                    <div class="instruction-panel">
                        <h4>🎯 Your Mission</h4>
                        <p>Compare weather and climate between two different places. Remember:</p>
                        <ul>
                            <li><strong>Weather</strong> = What it's like today (sun, rain, wind, temperature)</li>
                            <li><strong>Climate</strong> = What it's usually like over time in a place</li>
                        </ul>
                        <p><strong>Goal:</strong> Find one similarity and one difference between your chosen places!</p>
                    </div>
                </div>

                <div class="weather-comparison">
                    <div class="place-selector">
                        <div class="place-column">
                            <h4>📍 Place A</h4>
                            <select id="placeA" class="place-select">
                                <option value="">Choose a place...</option>
                                ${this.options.placesA.map(place => 
                                    `<option value="${place}">${place}</option>`
                                ).join('')}
                            </select>
                            <div class="place-display" id="displayA">
                                <div class="place-placeholder">
                                    Select a place to see its weather and climate
                                </div>
                            </div>
                        </div>

                        <div class="comparison-divider">
                            <div class="vs-badge">VS</div>
                        </div>

                        <div class="place-column">
                            <h4>📍 Place B</h4>
                            <select id="placeB" class="place-select">
                                <option value="">Choose a place...</option>
                                ${this.options.placesB.map(place => 
                                    `<option value="${place}">${place}</option>`
                                ).join('')}
                            </select>
                            <div class="place-display" id="displayB">
                                <div class="place-placeholder">
                                    Select a place to see its weather and climate
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="comparison-results" id="comparisonResults" style="display: none;">
                        <h4>🔍 What did you discover?</h4>
                        <div class="facts-input">
                            <div class="fact-group">
                                <label for="similarity">
                                    <strong>One Similarity:</strong>
                                    <span class="help-text">What's the same about both places?</span>
                                </label>
                                <input type="text" id="similarity" placeholder="e.g., Both places have hot summers...">
                            </div>
                            
                            <div class="fact-group">
                                <label for="difference">
                                    <strong>One Difference:</strong>
                                    <span class="help-text">What's different between the places?</span>
                                </label>
                                <input type="text" id="difference" placeholder="e.g., Singapore is tropical, London has seasons...">
                            </div>
                        </div>
                        
                        <div class="widget-actions">
                            <button class="btn btn-primary" id="saveToJournal" disabled>
                                📝 Save to Journal
                            </button>
                            <button class="btn btn-ghost" id="resetComparison">
                                🔄 Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const placeASelect = this.container.querySelector('#placeA');
        const placeBSelect = this.container.querySelector('#placeB');
        const similarityInput = this.container.querySelector('#similarity');
        const differenceInput = this.container.querySelector('#difference');
        const saveButton = this.container.querySelector('#saveToJournal');
        const resetButton = this.container.querySelector('#resetComparison');

        placeASelect.addEventListener('change', (e) => {
            this.selectedPlaceA = e.target.value;
            this.updatePlaceDisplay('A', e.target.value);
            this.checkComparisonReady();
        });

        placeBSelect.addEventListener('change', (e) => {
            this.selectedPlaceB = e.target.value;
            this.updatePlaceDisplay('B', e.target.value);
            this.checkComparisonReady();
        });

        [similarityInput, differenceInput].forEach(input => {
            input.addEventListener('input', () => {
                this.checkSaveReady();
            });
        });

        saveButton.addEventListener('click', () => {
            this.saveToJournal();
        });

        resetButton.addEventListener('click', () => {
            this.reset();
        });
    }

    updatePlaceDisplay(slot, placeName) {
        if (!placeName) return;
        
        const display = this.container.querySelector(`#display${slot}`);
        const placeData = this.getPlaceData(placeName);
        
        display.innerHTML = `
            <div class="place-card">
                <div class="place-name">${placeName}</div>
                
                <div class="weather-section">
                    <h5>🌤️ Today's Weather</h5>
                    <div class="weather-grid">
                        <div class="weather-item">
                            <span class="weather-icon">${placeData.weather.icon}</span>
                            <span class="weather-value">${placeData.weather.condition}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-icon">🌡️</span>
                            <span class="weather-value">${placeData.weather.temperature}</span>
                        </div>
                    </div>
                </div>

                <div class="climate-section">
                    <h5>📊 Climate Pattern</h5>
                    <div class="climate-chart">
                        ${this.generateClimateChart(placeData.climate)}
                    </div>
                    <div class="climate-description">
                        ${placeData.climate.description}
                    </div>
                </div>
            </div>
        `;
    }

    getPlaceData(placeName) {
        // Simplified climate data for educational purposes
        const places = {
            "Singapore": {
                weather: { icon: "☀️", condition: "Hot & Humid", temperature: "32°C" },
                climate: {
                    description: "Tropical climate - hot and wet all year round",
                    rainfall: [180, 120, 170, 180, 170, 160, 170, 180, 170, 200, 250, 200],
                    avgTemp: 27
                }
            },
            "London": {
                weather: { icon: "☁️", condition: "Cloudy", temperature: "15°C" },
                climate: {
                    description: "Temperate climate - mild summers, cool winters, rain throughout year",
                    rainfall: [55, 40, 45, 45, 50, 45, 45, 50, 50, 70, 60, 55],
                    avgTemp: 11
                }
            },
            "Cairo": {
                weather: { icon: "☀️", condition: "Hot & Dry", temperature: "35°C" },
                climate: {
                    description: "Desert climate - very hot and dry, almost no rain",
                    rainfall: [5, 5, 5, 1, 1, 0, 0, 0, 0, 1, 3, 5],
                    avgTemp: 22
                }
            },
            "Stockholm": {
                weather: { icon: "🌨️", condition: "Cold", temperature: "2°C" },
                climate: {
                    description: "Continental climate - warm summers, very cold winters",
                    rainfall: [40, 30, 25, 30, 30, 45, 60, 70, 55, 50, 55, 45],
                    avgTemp: 7
                }
            }
        };
        
        return places[placeName] || places["Singapore"];
    }

    generateClimateChart(climate) {
        const maxRainfall = Math.max(...climate.rainfall);
        const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
        
        return `
            <div class="climate-chart-container">
                <div class="chart-title">Monthly Rainfall (mm)</div>
                <div class="chart-bars">
                    ${climate.rainfall.map((rain, i) => {
                        const height = (rain / maxRainfall) * 60;
                        return `
                            <div class="chart-bar">
                                <div class="bar" style="height: ${height}px" title="${rain}mm"></div>
                                <div class="bar-label">${months[i]}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="chart-footer">Average Temperature: ${climate.avgTemp}°C</div>
            </div>
        `;
    }

    checkComparisonReady() {
        const resultsSection = this.container.querySelector('#comparisonResults');
        if (this.selectedPlaceA && this.selectedPlaceB && this.selectedPlaceA !== this.selectedPlaceB) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            resultsSection.style.display = 'none';
        }
    }

    checkSaveReady() {
        const similarity = this.container.querySelector('#similarity').value.trim();
        const difference = this.container.querySelector('#difference').value.trim();
        const saveButton = this.container.querySelector('#saveToJournal');
        
        if (similarity && difference) {
            saveButton.disabled = false;
        } else {
            saveButton.disabled = true;
        }
    }

    saveToJournal() {
        const similarity = this.container.querySelector('#similarity').value.trim();
        const difference = this.container.querySelector('#difference').value.trim();
        
        if (!similarity || !difference) {
            alert('Please complete both observations before saving!');
            return;
        }
        
        const facts = [
            `Similarity: ${similarity}`,
            `Difference: ${difference}`,
            `Compared: ${this.selectedPlaceA} vs ${this.selectedPlaceB}`
        ];
        
        const reflection = `I learned that weather is what's happening today, but climate is the long-term pattern. Different places around the world have very different climates!`;
        
        // Save to journal using the global journal system
        const entry = {
            id: `L1-${Date.now()}`,
            lessonId: 'L1',
            title: 'Wonder Launch: What is the power of nature?',
            facts: facts,
            reflection: reflection,
            timestamp: Date.now()
        };
        
        if (typeof saveEntry === 'function') {
            saveEntry(entry);
            this.showSuccess('Great observations saved to your journal! 🎉');
            
            // Award XP for widget completion
            if (typeof addXP === 'function') {
                addXP(10);
            }
        } else {
            console.warn('Journal system not available');
            this.showSuccess('Observations completed! 🎉');
        }
    }

    reset() {
        this.selectedPlaceA = null;
        this.selectedPlaceB = null;
        this.container.querySelector('#placeA').value = '';
        this.container.querySelector('#placeB').value = '';
        this.container.querySelector('#similarity').value = '';
        this.container.querySelector('#difference').value = '';
        this.container.querySelector('#comparisonResults').style.display = 'none';
        this.container.querySelector('#displayA').innerHTML = '<div class="place-placeholder">Select a place to see its weather and climate</div>';
        this.container.querySelector('#displayB').innerHTML = '<div class="place-placeholder">Select a place to see its weather and climate</div>';
    }

    showSuccess(message) {
        // Create a simple success notification
        const notification = document.createElement('div');
        notification.className = 'widget-notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
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
window.WeatherExplorer = WeatherExplorer;
