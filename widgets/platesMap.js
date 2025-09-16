/**
 * Plates Map Widget
 * Explore earthquake patterns and tectonic plates
 * Learning: Geography, cause-effect, risk reduction
 */

class PlatesMap {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            showRingOfFire: options.showRingOfFire || false,
            magnitude: options.magnitude || 5,
            ...options
        };
        
        this.currentMagnitude = this.options.magnitude;
        this.showRingOfFire = this.options.showRingOfFire;
        this.selectedCities = [];
        this.discoveredFacts = [];
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.updateMap();
        console.log('🌍 Plates Map initialized');
    }

    render() {
        this.container.innerHTML = `
            <div class="plates-map">
                <div class="widget-header">
                    <h3 class="widget-title">🌍 Earthquake & Tectonic Plates Explorer</h3>
                    <div class="widget-controls">
                        <button class="btn btn-ghost btn-sm" onclick="this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display = this.parentElement.parentElement.parentElement.querySelector('.instructions').style.display === 'none' ? 'block' : 'none'">
                            ❓ Help
                        </button>
                    </div>
                </div>
                
                <div class="instructions" style="display: none;">
                    <div class="instruction-panel">
                        <h4>🎯 Your Mission</h4>
                        <p>Explore where earthquakes happen and why:</p>
                        <ul>
                            <li><strong>Ring of Fire:</strong> Toggle to see the earthquake danger zone</li>
                            <li><strong>City Markers:</strong> Click cities to learn about earthquake risk</li>
                            <li><strong>Magnitude Slider:</strong> See how earthquake strength affects damage</li>
                        </ul>
                        <p><strong>Goal:</strong> Find one city near a plate boundary and learn why it's at risk!</p>
                    </div>
                </div>

                <div class="map-interface">
                    <div class="map-controls">
                        <div class="control-group">
                            <label class="toggle-control">
                                <input type="checkbox" id="ringOfFireToggle" ${this.showRingOfFire ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                                <span class="toggle-label">🌋 Show Ring of Fire</span>
                            </label>
                        </div>
                        
                        <div class="control-group">
                            <label for="magnitudeSlider">🌊 Earthquake Magnitude: <span id="magnitudeValue">${this.currentMagnitude}</span></label>
                            <input type="range" id="magnitudeSlider" min="3" max="8" step="0.5" value="${this.currentMagnitude}">
                            <div class="magnitude-labels">
                                <span>Weak (3)</span>
                                <span>Strong (8)</span>
                            </div>
                        </div>
                    </div>

                    <div class="world-map-container">
                        <div class="world-map" id="worldMap">
                            <div class="map-background">
                                <!-- Simplified world map representation -->
                                <div class="continent" id="asia" style="top: 30%; left: 60%; width: 25%; height: 20%;">
                                    <span class="continent-label">Asia</span>
                                </div>
                                <div class="continent" id="europe" style="top: 25%; left: 45%; width: 15%; height: 15%;">
                                    <span class="continent-label">Europe</span>
                                </div>
                                <div class="continent" id="africa" style="top: 40%; left: 48%; width: 12%; height: 25%;">
                                    <span class="continent-label">Africa</span>
                                </div>
                                <div class="continent" id="northamerica" style="top: 25%; left: 15%; width: 20%; height: 25%;">
                                    <span class="continent-label">N. America</span>
                                </div>
                                <div class="continent" id="southamerica" style="top: 50%; left: 25%; width: 10%; height: 25%;">
                                    <span class="continent-label">S. America</span>
                                </div>
                                <div class="continent" id="australia" style="top: 65%; left: 75%; width: 12%; height: 10%;">
                                    <span class="continent-label">Australia</span>
                                </div>
                            </div>

                            <!-- Ring of Fire overlay -->
                            <div class="ring-of-fire" id="ringOfFire" style="display: ${this.showRingOfFire ? 'block' : 'none'};">
                                <div class="fire-zone pacific-ring"></div>
                            </div>

                            <!-- City markers -->
                            <div class="city-markers">
                                <div class="city-marker" data-city="tokyo" style="top: 35%; left: 72%;">
                                    <div class="marker-dot"></div>
                                    <div class="marker-label">Tokyo</div>
                                </div>
                                <div class="city-marker" data-city="sanfrancisco" style="top: 32%; left: 8%;">
                                    <div class="marker-dot"></div>
                                    <div class="marker-label">San Francisco</div>
                                </div>
                                <div class="city-marker" data-city="christchurch" style="top: 85%; left: 85%;">
                                    <div class="marker-dot"></div>
                                    <div class="marker-label">Christchurch</div>
                                </div>
                                <div class="city-marker" data-city="london" style="top: 28%; left: 48%;">
                                    <div class="marker-dot"></div>
                                    <div class="marker-label">London</div>
                                </div>
                                <div class="city-marker" data-city="singapore" style="top: 52%; left: 70%;">
                                    <div class="marker-dot"></div>
                                    <div class="marker-label">Singapore</div>
                                </div>
                                <div class="city-marker" data-city="losangeles" style="top: 38%; left: 10%;">
                                    <div class="marker-dot"></div>
                                    <div class="marker-label">Los Angeles</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="earthquake-info" id="earthquakeInfo">
                        <h4>🌊 Earthquake Impact at Magnitude ${this.currentMagnitude}</h4>
                        <div class="impact-description" id="impactDescription">
                            ${this.getEarthquakeDescription(this.currentMagnitude)}
                        </div>
                    </div>

                    <div class="city-info" id="cityInfo" style="display: none;">
                        <h4>📍 City Information</h4>
                        <div class="city-details" id="cityDetails">
                            <!-- City information will be populated here -->
                        </div>
                        <button class="btn btn-sm btn-primary" id="addCityFact" style="display: none;">
                            ➕ Add to Facts
                        </button>
                    </div>

                    <div class="discovery-log">
                        <h4>🔍 Your Discoveries</h4>
                        <div class="facts-list" id="factsList">
                            <p class="empty-facts">Click on cities to discover earthquake facts!</p>
                        </div>
                        
                        <div class="reflection-input" style="display: none;" id="reflectionInput">
                            <label for="plateReflection">
                                <strong>What did you learn about where earthquakes happen?</strong>
                            </label>
                            <textarea id="plateReflection" placeholder="e.g., Most earthquakes happen around the Ring of Fire because..."></textarea>
                        </div>
                        
                        <div class="discovery-actions">
                            <button class="btn btn-primary" id="saveDiscoveries" disabled>
                                📚 Save to Journal
                            </button>
                            <button class="btn btn-ghost" id="resetExploration">
                                🔄 Start Over
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Ring of Fire toggle
        const ringToggle = this.container.querySelector('#ringOfFireToggle');
        ringToggle.addEventListener('change', (e) => {
            this.showRingOfFire = e.target.checked;
            this.updateMap();
        });

        // Magnitude slider
        const magnitudeSlider = this.container.querySelector('#magnitudeSlider');
        magnitudeSlider.addEventListener('input', (e) => {
            this.currentMagnitude = parseFloat(e.target.value);
            this.updateMagnitude();
        });

        // City markers
        const cityMarkers = this.container.querySelectorAll('.city-marker');
        cityMarkers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                const cityName = e.currentTarget.dataset.city;
                this.selectCity(cityName);
            });
        });

        // Add city fact button
        this.container.querySelector('#addCityFact').addEventListener('click', () => {
            this.addCurrentCityFact();
        });

        // Reflection input
        const reflectionInput = this.container.querySelector('#plateReflection');
        reflectionInput.addEventListener('input', () => {
            this.checkSaveReady();
        });

        // Action buttons
        this.container.querySelector('#saveDiscoveries').addEventListener('click', () => {
            this.saveToJournal();
        });

        this.container.querySelector('#resetExploration').addEventListener('click', () => {
            this.reset();
        });
    }

    updateMap() {
        const ringOfFire = this.container.querySelector('#ringOfFire');
        ringOfFire.style.display = this.showRingOfFire ? 'block' : 'none';
        
        // Update city marker styles based on Ring of Fire visibility
        const cityMarkers = this.container.querySelectorAll('.city-marker');
        cityMarkers.forEach(marker => {
            const cityName = marker.dataset.city;
            const cityData = this.getCityData(cityName);
            
            if (this.showRingOfFire && cityData.inRingOfFire) {
                marker.classList.add('in-danger-zone');
            } else {
                marker.classList.remove('in-danger-zone');
            }
        });
    }

    updateMagnitude() {
        this.container.querySelector('#magnitudeValue').textContent = this.currentMagnitude;
        this.container.querySelector('#impactDescription').innerHTML = this.getEarthquakeDescription(this.currentMagnitude);
    }

    selectCity(cityName) {
        // Remove previous selection
        this.container.querySelectorAll('.city-marker').forEach(m => m.classList.remove('selected'));
        
        // Select current city
        const marker = this.container.querySelector(`[data-city="${cityName}"]`);
        marker.classList.add('selected');
        
        // Show city information
        const cityData = this.getCityData(cityName);
        this.showCityInfo(cityData);
    }

    getCityData(cityName) {
        const cities = {
            tokyo: {
                name: "Tokyo, Japan",
                population: "14 million",
                inRingOfFire: true,
                earthquakeRisk: "Very High",
                lastMajorEarthquake: "2011 (Magnitude 9.0)",
                adaptations: ["Building codes require earthquake-resistant design", "Early warning systems", "Emergency drills in schools"],
                plateBoundary: "Pacific Plate meets Philippine Sea Plate",
                fact: "Tokyo is built on the meeting point of three tectonic plates"
            },
            sanfrancisco: {
                name: "San Francisco, USA",
                population: "880,000",
                inRingOfFire: true,
                earthquakeRisk: "High",
                lastMajorEarthquake: "1989 (Magnitude 6.9)",
                adaptations: ["Strict building codes", "Retrofitting old buildings", "Golden Gate Bridge designed to flex"],
                plateBoundary: "Pacific Plate meets North American Plate",
                fact: "San Francisco sits on the famous San Andreas Fault"
            },
            christchurch: {
                name: "Christchurch, New Zealand",
                population: "380,000",
                inRingOfFire: true,
                earthquakeRisk: "High", 
                lastMajorEarthquake: "2011 (Magnitude 6.3)",
                adaptations: ["New building standards after 2011", "Base isolation technology", "Community preparedness programs"],
                plateBoundary: "Pacific Plate meets Australian Plate",
                fact: "Christchurch rebuilt with earthquake-safe design after 2011"
            },
            london: {
                name: "London, UK",
                population: "9 million",
                inRingOfFire: false,
                earthquakeRisk: "Low",
                lastMajorEarthquake: "Very rare, small tremors only",
                adaptations: ["Not needed - stable continental location"],
                plateBoundary: "Far from plate boundaries",
                fact: "London is on stable continental crust, far from plate boundaries"
            },
            singapore: {
                name: "Singapore",
                population: "5.9 million",
                inRingOfFire: false,
                earthquakeRisk: "Very Low",
                lastMajorEarthquake: "None recorded",
                adaptations: ["Not needed - very stable location"],
                plateBoundary: "Far from major plate boundaries",
                fact: "Singapore is in a very stable part of the Eurasian Plate"
            },
            losangeles: {
                name: "Los Angeles, USA",
                population: "4 million",
                inRingOfFire: true,
                earthquakeRisk: "High",
                lastMajorEarthquake: "1994 (Magnitude 6.7)",
                adaptations: ["Seismic building codes", "Emergency response systems", "Earthquake drills"],
                plateBoundary: "Pacific Plate meets North American Plate",
                fact: "Los Angeles moves 2 inches closer to San Francisco each year due to plate movement"
            }
        };
        
        return cities[cityName] || cities.singapore;
    }

    showCityInfo(cityData) {
        const cityInfo = this.container.querySelector('#cityInfo');
        const cityDetails = this.container.querySelector('#cityDetails');
        const addButton = this.container.querySelector('#addCityFact');
        
        cityDetails.innerHTML = `
            <div class="city-card">
                <h5>${cityData.name}</h5>
                <div class="city-stats">
                    <div class="stat-item">
                        <span class="stat-label">Population:</span>
                        <span class="stat-value">${cityData.population}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Earthquake Risk:</span>
                        <span class="stat-value risk-${cityData.earthquakeRisk.toLowerCase().replace(' ', '')}">${cityData.earthquakeRisk}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Ring of Fire:</span>
                        <span class="stat-value">${cityData.inRingOfFire ? '✅ Yes' : '❌ No'}</span>
                    </div>
                </div>
                
                <div class="city-detail-section">
                    <h6>🧱 Plate Boundary</h6>
                    <p>${cityData.plateBoundary}</p>
                </div>
                
                <div class="city-detail-section">
                    <h6>🛡️ Safety Adaptations</h6>
                    <ul>
                        ${cityData.adaptations.map(adaptation => `<li>${adaptation}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="key-fact">
                    <strong>💡 Key Fact:</strong> ${cityData.fact}
                </div>
            </div>
        `;
        
        cityInfo.style.display = 'block';
        addButton.style.display = 'inline-flex';
        
        // Store current city data for adding to facts
        this.currentCityData = cityData;
    }

    addCurrentCityFact() {
        if (!this.currentCityData) return;
        
        const fact = `${this.currentCityData.name}: ${this.currentCityData.fact}`;
        
        if (!this.discoveredFacts.includes(fact)) {
            this.discoveredFacts.push(fact);
            this.updateFactsList();
            this.showNotification(`Added fact about ${this.currentCityData.name}! 📍`, 'success');
        } else {
            this.showNotification('You already discovered this fact!', 'info');
        }
    }

    updateFactsList() {
        const factsList = this.container.querySelector('#factsList');
        const reflectionInput = this.container.querySelector('#reflectionInput');
        
        if (this.discoveredFacts.length === 0) {
            factsList.innerHTML = '<p class="empty-facts">Click on cities to discover earthquake facts!</p>';
            reflectionInput.style.display = 'none';
        } else {
            factsList.innerHTML = this.discoveredFacts.map((fact, index) => `
                <div class="fact-item">
                    <span class="fact-number">${index + 1}.</span>
                    <span class="fact-text">${fact}</span>
                </div>
            `).join('');
            
            // Show reflection input after 3+ facts
            if (this.discoveredFacts.length >= 3) {
                reflectionInput.style.display = 'block';
            }
        }
        
        this.checkSaveReady();
    }

    getEarthquakeDescription(magnitude) {
        if (magnitude < 4) {
            return "🟢 <strong>Weak:</strong> Usually not felt, detected only by instruments.";
        } else if (magnitude < 5) {
            return "🟡 <strong>Light:</strong> Felt by many people, dishes may rattle.";
        } else if (magnitude < 6) {
            return "🟠 <strong>Moderate:</strong> Some damage to weak buildings, felt by everyone.";
        } else if (magnitude < 7) {
            return "🔴 <strong>Strong:</strong> Damage to well-built buildings, people have trouble walking.";
        } else {
            return "🟣 <strong>Major:</strong> Serious damage to buildings and infrastructure, ground cracks.";
        }
    }

    checkSaveReady() {
        const reflection = this.container.querySelector('#plateReflection').value.trim();
        const saveButton = this.container.querySelector('#saveDiscoveries');
        
        if (this.discoveredFacts.length >= 2 && reflection) {
            saveButton.disabled = false;
        } else {
            saveButton.disabled = true;
        }
    }

    saveToJournal() {
        const reflection = this.container.querySelector('#plateReflection').value.trim();
        
        if (this.discoveredFacts.length < 2) {
            alert('Please discover at least 2 city facts before saving!');
            return;
        }
        
        if (!reflection) {
            alert('Please write your reflection about earthquake patterns!');
            return;
        }
        
        const facts = [
            `Ring of Fire exploration: ${this.showRingOfFire ? 'Discovered dangerous zones' : 'Basic city comparison'}`,
            `Cities explored: ${this.discoveredFacts.length} facts collected`,
            ...this.discoveredFacts.slice(0, 3) // Include up to 3 key facts
        ];
        
        const entry = {
            id: `L7-${Date.now()}`,
            lessonId: 'L7',
            title: 'Earthquakes: Where and why?',
            facts: facts,
            reflection: reflection,
            timestamp: Date.now()
        };
        
        if (typeof saveEntry === 'function') {
            saveEntry(entry);
            this.showNotification('Earthquake discoveries saved to journal! 🌍', 'success');
            
            // Award XP
            if (typeof addXP === 'function') {
                addXP(15);
            }
        } else {
            console.warn('Journal system not available');
            this.showNotification('Earthquake exploration completed! 🌍', 'success');
        }
    }

    reset() {
        this.showRingOfFire = false;
        this.currentMagnitude = 5;
        this.selectedCities = [];
        this.discoveredFacts = [];
        this.currentCityData = null;
        
        this.render();
        this.setupEventListeners();
        this.updateMap();
        
        this.showNotification('Ready for a new earthquake exploration! 🔄', 'info');
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
window.PlatesMap = PlatesMap;
