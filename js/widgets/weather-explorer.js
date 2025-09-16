/**
 * Weather Explorer Widget
 * Allows students to compare weather and climate data between different locations
 */

class WeatherExplorer {
  constructor(containerId = 'weatherExplorer') {
    this.container = document.getElementById(containerId);
    this.place1Select = null;
    this.place2Select = null;
    this.chartsContainer = null;
    this.fact1Input = null;
    this.fact2Input = null;
    this.saveBtn = null;
    
    // Sample weather data for different locations
    this.weatherData = {
      singapore: {
        name: 'Singapore',
        climate: 'Tropical',
        avgTemp: [26, 27, 28, 28, 28, 28, 28, 28, 27, 27, 26, 26],
        rainfall: [159, 112, 171, 154, 171, 132, 158, 176, 170, 193, 231, 287],
        humidity: [84, 81, 82, 84, 84, 83, 83, 83, 84, 85, 86, 85],
        description: 'Hot and humid all year with two monsoon seasons'
      },
      london: {
        name: 'London, UK',
        climate: 'Temperate',
        avgTemp: [4, 5, 7, 10, 14, 17, 19, 19, 16, 12, 7, 5],
        rainfall: [55, 40, 42, 44, 49, 45, 57, 59, 49, 69, 59, 55],
        humidity: [86, 83, 79, 75, 74, 75, 76, 78, 81, 85, 87, 87],
        description: 'Mild summers, cool winters with regular rainfall'
      },
      cairo: {
        name: 'Cairo, Egypt',
        climate: 'Desert',
        avgTemp: [14, 16, 20, 25, 29, 32, 34, 33, 30, 26, 21, 16],
        rainfall: [5, 3, 3, 1, 0, 0, 0, 0, 0, 1, 2, 5],
        humidity: [59, 54, 50, 45, 43, 48, 52, 55, 56, 58, 61, 61],
        description: 'Very hot, dry summers and mild winters'
      },
      stockholm: {
        name: 'Stockholm, Sweden',
        climate: 'Continental',
        avgTemp: [-3, -2, 1, 6, 12, 17, 19, 18, 13, 8, 3, -1],
        rainfall: [43, 30, 26, 30, 30, 45, 72, 66, 55, 50, 53, 46],
        humidity: [86, 83, 78, 71, 65, 68, 72, 76, 79, 83, 86, 87],
        description: 'Cold winters with snow, warm summers'
      }
    };

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.setupElements();
    this.setupEventListeners();
    this.setupGlossary();
  }

  setupElements() {
    this.place1Select = this.container.querySelector('#place1');
    this.place2Select = this.container.querySelector('#place2');
    this.chartsContainer = this.container.querySelector('#weatherCharts');
    this.fact1Input = this.container.querySelector('#fact1');
    this.fact2Input = this.container.querySelector('#fact2');
    this.saveBtn = this.container.querySelector('#saveFactsBtn') || 
                   document.querySelector('#saveFactsBtn');

    if (!this.place1Select || !this.place2Select || !this.chartsContainer) {
      console.warn('Weather Explorer: Required elements not found');
      return;
    }
  }

  setupEventListeners() {
    this.place1Select.addEventListener('change', () => {
      this.updateComparison();
    });

    this.place2Select.addEventListener('change', () => {
      this.updateComparison();
    });

    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', () => {
        this.saveToJournal();
      });
    }

    // Prevent selecting the same place twice
    this.place1Select.addEventListener('change', () => {
      this.updateSelectOptions();
    });

    this.place2Select.addEventListener('change', () => {
      this.updateSelectOptions();
    });
  }

  setupGlossary() {
    const glossaryBtns = this.container.querySelectorAll('.glossary-btn');
    
    glossaryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const term = btn.dataset.term;
        this.showGlossary(term);
      });
    });
  }

  updateSelectOptions() {
    const selected1 = this.place1Select.value;
    const selected2 = this.place2Select.value;

    // Update place2 options
    Array.from(this.place2Select.options).forEach(option => {
      if (option.value && option.value === selected1) {
        option.disabled = true;
        option.style.color = '#999';
      } else {
        option.disabled = false;
        option.style.color = '';
      }
    });

    // Update place1 options
    Array.from(this.place1Select.options).forEach(option => {
      if (option.value && option.value === selected2) {
        option.disabled = true;
        option.style.color = '#999';
      } else {
        option.disabled = false;
        option.style.color = '';
      }
    });
  }

  updateComparison() {
    const place1 = this.place1Select.value;
    const place2 = this.place2Select.value;

    if (!place1 || !place2) {
      this.showSelectPrompt();
      return;
    }

    if (place1 === place2) {
      this.showSamePlaceWarning();
      return;
    }

    this.renderComparison(place1, place2);
  }

  showSelectPrompt() {
    this.chartsContainer.innerHTML = `
      <div class="chart-prompt">
        <div class="prompt-icon">📊</div>
        <p>Select two different places to compare their weather and climate.</p>
        <div class="prompt-hint">💡 Try comparing places from different continents!</div>
      </div>
    `;
  }

  showSamePlaceWarning() {
    this.chartsContainer.innerHTML = `
      <div class="chart-warning">
        <div class="warning-icon">⚠️</div>
        <p>Please choose two different places to compare.</p>
      </div>
    `;
  }

  renderComparison(place1Key, place2Key) {
    const data1 = this.weatherData[place1Key];
    const data2 = this.weatherData[place2Key];

    if (!data1 || !data2) return;

    this.chartsContainer.innerHTML = `
      <div class="comparison-layout">
        <div class="place-comparison">
          <div class="place-data" data-place="${place1Key}">
            <h4>${data1.name}</h4>
            <div class="climate-type">${data1.climate} Climate</div>
            <div class="climate-description">${data1.description}</div>
            
            <div class="data-charts">
              <div class="mini-chart">
                <h5>Temperature (°C)</h5>
                <div class="chart-visual">
                  ${this.createTemperatureChart(data1.avgTemp, place1Key)}
                </div>
                <div class="chart-summary">
                  Range: ${Math.min(...data1.avgTemp)}° to ${Math.max(...data1.avgTemp)}°
                </div>
              </div>
              
              <div class="mini-chart">
                <h5>Rainfall (mm)</h5>
                <div class="chart-visual">
                  ${this.createRainfallChart(data1.rainfall, place1Key)}
                </div>
                <div class="chart-summary">
                  Total: ${data1.rainfall.reduce((a, b) => a + b, 0)}mm/year
                </div>
              </div>
            </div>
          </div>

          <div class="vs-divider">
            <div class="vs-text">VS</div>
          </div>

          <div class="place-data" data-place="${place2Key}">
            <h4>${data2.name}</h4>
            <div class="climate-type">${data2.climate} Climate</div>
            <div class="climate-description">${data2.description}</div>
            
            <div class="data-charts">
              <div class="mini-chart">
                <h5>Temperature (°C)</h5>
                <div class="chart-visual">
                  ${this.createTemperatureChart(data2.avgTemp, place2Key)}
                </div>
                <div class="chart-summary">
                  Range: ${Math.min(...data2.avgTemp)}° to ${Math.max(...data2.avgTemp)}°
                </div>
              </div>
              
              <div class="mini-chart">
                <h5>Rainfall (mm)</h5>
                <div class="chart-visual">
                  ${this.createRainfallChart(data2.rainfall, place2Key)}
                </div>
                <div class="chart-summary">
                  Total: ${data2.rainfall.reduce((a, b) => a + b, 0)}mm/year
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="comparison-insights">
          <h4>Key Differences</h4>
          <div class="insights-list">
            ${this.generateInsights(data1, data2)}
          </div>
        </div>
      </div>
    `;

    // Animate charts
    this.animateCharts();
  }

  createTemperatureChart(temps, placeKey) {
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const maxTemp = Math.max(...Object.values(this.weatherData).flatMap(d => d.avgTemp));
    const minTemp = Math.min(...Object.values(this.weatherData).flatMap(d => d.avgTemp));
    const range = maxTemp - minTemp;

    return `
      <div class="simple-line-chart">
        ${temps.map((temp, index) => {
          const height = ((temp - minTemp) / range) * 60 + 10; // 10-70% height
          const color = this.getTemperatureColor(temp);
          return `
            <div class="chart-bar" style="height: ${height}%; background: ${color}" 
                 title="${months[index]}: ${temp}°C">
              <span class="bar-label">${months[index]}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  createRainfallChart(rainfall, placeKey) {
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const maxRain = Math.max(...Object.values(this.weatherData).flatMap(d => d.rainfall));

    return `
      <div class="simple-line-chart">
        ${rainfall.map((rain, index) => {
          const height = (rain / maxRain) * 60 + 10; // 10-70% height
          return `
            <div class="chart-bar rainfall" style="height: ${height}%" 
                 title="${months[index]}: ${rain}mm">
              <span class="bar-label">${months[index]}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  getTemperatureColor(temp) {
    if (temp < 5) return '#4F83CC'; // Blue (cold)
    if (temp < 15) return '#81C784'; // Green (cool)
    if (temp < 25) return '#FFB74D'; // Orange (warm)
    return '#E57373'; // Red (hot)
  }

  generateInsights(data1, data2) {
    const insights = [];

    // Temperature comparison
    const avg1 = data1.avgTemp.reduce((a, b) => a + b) / 12;
    const avg2 = data2.avgTemp.reduce((a, b) => a + b) / 12;
    const tempDiff = Math.abs(avg1 - avg2);

    if (tempDiff > 10) {
      insights.push(`<li><strong>Temperature:</strong> ${data1.name} is ${avg1 > avg2 ? 'much warmer' : 'much cooler'} on average (${tempDiff.toFixed(1)}°C difference)</li>`);
    } else if (tempDiff > 5) {
      insights.push(`<li><strong>Temperature:</strong> ${data1.name} is ${avg1 > avg2 ? 'warmer' : 'cooler'} than ${data2.name}</li>`);
    }

    // Rainfall comparison
    const rain1 = data1.rainfall.reduce((a, b) => a + b);
    const rain2 = data2.rainfall.reduce((a, b) => a + b);
    const rainDiff = Math.abs(rain1 - rain2);

    if (rainDiff > 500) {
      insights.push(`<li><strong>Rainfall:</strong> ${rain1 > rain2 ? data1.name : data2.name} gets much more rain (${rainDiff}mm more per year)</li>`);
    }

    // Climate type differences
    if (data1.climate !== data2.climate) {
      insights.push(`<li><strong>Climate types:</strong> ${data1.climate} vs ${data2.climate}</li>`);
    }

    // Seasonal patterns
    const range1 = Math.max(...data1.avgTemp) - Math.min(...data1.avgTemp);
    const range2 = Math.max(...data2.avgTemp) - Math.min(...data2.avgTemp);

    if (Math.abs(range1 - range2) > 10) {
      insights.push(`<li><strong>Seasons:</strong> ${range1 > range2 ? data1.name : data2.name} has bigger temperature changes between seasons</li>`);
    }

    return insights.length > 0 ? insights.join('') : '<li>Both places have similar weather patterns</li>';
  }

  animateCharts() {
    const bars = this.chartsContainer.querySelectorAll('.chart-bar');
    bars.forEach((bar, index) => {
      bar.style.transform = 'scaleY(0)';
      bar.style.transformOrigin = 'bottom';
      bar.style.transition = 'transform 0.5s ease-out';
      
      setTimeout(() => {
        bar.style.transform = 'scaleY(1)';
      }, index * 50);
    });
  }

  showGlossary(term) {
    const definitions = {
      weather: "What it's like today (sun, rain, wind, temperature).",
      climate: "What it's usually like in a place (long-term patterns).",
      precipitation: "Water that falls from the sky — rain, snow, hail."
    };

    const modal = document.getElementById('glossaryModal') || this.createGlossaryModal();
    const termElement = modal.querySelector('#glossaryTerm');
    const definitionElement = modal.querySelector('#glossaryDefinition');

    if (termElement && definitionElement) {
      termElement.textContent = term.charAt(0).toUpperCase() + term.slice(1);
      definitionElement.textContent = definitions[term] || 'Definition not found.';
      
      modal.classList.add('active');
    }
  }

  createGlossaryModal() {
    const modal = document.createElement('div');
    modal.id = 'glossaryModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h3 id="glossaryTerm"></h3>
        <p id="glossaryDefinition"></p>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup close functionality
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        modal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });

    return modal;
  }

  saveToJournal() {
    const place1 = this.place1Select.value;
    const place2 = this.place2Select.value;
    const fact1 = this.fact1Input?.value.trim() || '';
    const fact2 = this.fact2Input?.value.trim() || '';

    if (!place1 || !place2) {
      if (window.showToast) {
        window.showToast('Please select two places to compare first.', 'warning');
      }
      return;
    }

    if (!fact1 || !fact2) {
      if (window.showToast) {
        window.showToast('Please write your two facts before saving.', 'warning');
      }
      return;
    }

    const journalEntry = {
      type: 'weather_climate_comparison',
      step: 'weather_explorer',
      data: {
        place1: this.weatherData[place1].name,
        place2: this.weatherData[place2].name,
        fact1: fact1,
        fact2: fact2,
        comparison_date: new Date().toISOString()
      },
      content: `Weather vs Climate Comparison: ${this.weatherData[place1].name} and ${this.weatherData[place2].name}. Fact 1: ${fact1}. Fact 2: ${fact2}`,
      tags: ['weather', 'climate', 'comparison', place1, place2]
    };

    // Save to journal
    if (window.saveToJournal) {
      window.saveToJournal(journalEntry);
    }

    // Show success feedback
    this.showSaveSuccess();
  }

  showSaveSuccess() {
    if (this.saveBtn) {
      const originalText = this.saveBtn.textContent;
      const originalClass = this.saveBtn.className;
      
      this.saveBtn.textContent = '✓ Facts saved!';
      this.saveBtn.classList.add('btn-success');
      this.saveBtn.disabled = true;
      
      setTimeout(() => {
        this.saveBtn.textContent = originalText;
        this.saveBtn.className = originalClass;
        this.saveBtn.disabled = false;
      }, 2000);
    }

    if (window.showToast) {
      window.showToast('Weather facts saved to journal!', 'success');
    }
  }

  // Public methods for external control
  setPlaces(place1, place2) {
    if (this.place1Select && this.place2Select) {
      this.place1Select.value = place1;
      this.place2Select.value = place2;
      this.updateComparison();
    }
  }

  getComparison() {
    return {
      place1: this.place1Select?.value,
      place2: this.place2Select?.value,
      fact1: this.fact1Input?.value,
      fact2: this.fact2Input?.value
    };
  }

  reset() {
    if (this.place1Select) this.place1Select.value = '';
    if (this.place2Select) this.place2Select.value = '';
    if (this.fact1Input) this.fact1Input.value = '';
    if (this.fact2Input) this.fact2Input.value = '';
    this.showSelectPrompt();
    this.updateSelectOptions();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('weatherExplorer')) {
    window.weatherExplorer = new WeatherExplorer();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherExplorer;
}
