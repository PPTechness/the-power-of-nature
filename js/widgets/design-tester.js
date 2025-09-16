/**
 * Design Tester Widget
 * Interactive home design tool with real-time feedback
 */

class DesignTester {
  constructor(containerId = 'designTester') {
    this.container = document.getElementById(containerId);
    this.features = {
      shade: false,
      ventilation: false,
      insulation: false,
      'raised-floor': false,
      rainwater: false,
      solar: false
    };
    
    this.baselineMetrics = {
      heat: 50, // 0-100 scale (lower is cooler)
      water: 50  // 0-100 scale (higher is flood-safe)
    };
    
    this.featureEffects = {
      shade: { heat: -15, water: 0, feedback: "Shade added. Likely cooler at midday." },
      ventilation: { heat: -10, water: 0, feedback: "Vent added. Better airflow." },
      insulation: { heat: -8, water: 0, feedback: "Insulation added. Keeps inside temperature steadier." },
      'raised-floor': { heat: 0, water: 25, feedback: "Raised floor added. Safer from floods." },
      rainwater: { heat: 0, water: 15, feedback: "Rainwater tank added. Stores water for later." },
      solar: { heat: 2, water: 0, feedback: "Solar panels added. Makes clean electricity." }
    };
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.setupToggleListeners();
    this.setupExportButton();
    this.updateFeedback();
    this.updateMeters();
  }

  setupToggleListeners() {
    const toggles = this.container.querySelectorAll('.feature-toggle');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const feature = e.target.dataset.feature;
        this.features[feature] = e.target.checked;
        this.updateFeedback();
        this.updateMeters();
        this.announceChange(feature, e.target.checked);
      });

      // Add keyboard support
      toggle.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggle.checked = !toggle.checked;
          toggle.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  setupExportButton() {
    const exportBtn = this.container.querySelector('#exportDesignBtn') || 
                     document.querySelector('#exportDesignBtn');
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportDesign();
      });
    }
  }

  updateFeedback() {
    const feedbackContainer = this.container.querySelector('#designFeedback');
    if (!feedbackContainer) return;

    const activeFeedback = [];
    
    Object.keys(this.features).forEach(feature => {
      if (this.features[feature] && this.featureEffects[feature]) {
        activeFeedback.push(this.featureEffects[feature].feedback);
      }
    });

    if (activeFeedback.length === 0) {
      feedbackContainer.textContent = "Select features to see how they affect your home.";
      feedbackContainer.className = 'feedback-text';
    } else {
      feedbackContainer.innerHTML = activeFeedback.map(feedback => 
        `<div class="feedback-item">✓ ${feedback}</div>`
      ).join('');
      feedbackContainer.className = 'feedback-text active';
    }
  }

  updateMeters() {
    let currentHeat = this.baselineMetrics.heat;
    let currentWater = this.baselineMetrics.water;

    // Apply effects from active features
    Object.keys(this.features).forEach(feature => {
      if (this.features[feature] && this.featureEffects[feature]) {
        currentHeat += this.featureEffects[feature].heat;
        currentWater += this.featureEffects[feature].water;
      }
    });

    // Clamp values to 0-100 range
    currentHeat = Math.max(0, Math.min(100, currentHeat));
    currentWater = Math.max(0, Math.min(100, currentWater));

    // Update heat meter (inverted - lower heat is better)
    const heatMeter = this.container.querySelector('.heat-meter');
    if (heatMeter) {
      const heatPercentage = 100 - currentHeat; // Invert for display
      heatMeter.style.width = `${heatPercentage}%`;
      
      // Update color based on performance
      if (heatPercentage > 70) {
        heatMeter.style.background = 'var(--color-leaf-green)';
      } else if (heatPercentage > 40) {
        heatMeter.style.background = 'var(--color-sunrise-yellow)';
      } else {
        heatMeter.style.background = 'var(--color-coral)';
      }
    }

    // Update water meter
    const waterMeter = this.container.querySelector('.water-meter');
    if (waterMeter) {
      waterMeter.style.width = `${currentWater}%`;
      
      // Update color based on performance
      if (currentWater > 70) {
        waterMeter.style.background = 'var(--color-leaf-green)';
      } else if (currentWater > 40) {
        waterMeter.style.background = 'var(--color-sunrise-yellow)';
      } else {
        waterMeter.style.background = 'var(--color-coral)';
      }
    }

    // Store current metrics for export
    this.currentMetrics = {
      heat: currentHeat,
      water: currentWater,
      heatDisplay: heatPercentage,
      waterDisplay: currentWater
    };
  }

  announceChange(feature, enabled) {
    const action = enabled ? 'enabled' : 'disabled';
    const featureName = feature.replace('-', ' ');
    const message = `${featureName} ${action}`;
    
    // Announce to screen readers
    if (window.toast && window.toast.announce) {
      window.toast.announce(message);
    }
  }

  exportDesign() {
    const reasonTextarea = this.container.querySelector('#designReason');
    const reason = reasonTextarea ? reasonTextarea.value.trim() : '';
    
    if (!reason) {
      if (window.showToast) {
        window.showToast('Please explain your design choices before exporting.', 'warning');
      }
      reasonTextarea?.focus();
      return;
    }

    const activeFeatures = Object.keys(this.features).filter(f => this.features[f]);
    
    const designSummary = {
      title: 'My Future-Ready Home Design',
      features: activeFeatures,
      metrics: this.currentMetrics,
      reasoning: reason,
      timestamp: new Date().toISOString(),
      classCode: localStorage.getItem('classCode') || 'DEMO'
    };

    // Create design card as image/PDF
    this.generateDesignCard(designSummary);
    
    // Save to journal
    this.saveToJournal(designSummary);
    
    // Show success
    this.showExportSuccess();
  }

  generateDesignCard(summary) {
    // Create a printable design card
    const cardHTML = this.createDesignCardHTML(summary);
    
    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Design Summary - ${summary.title}</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              max-width: 600px; 
              margin: 20px auto; 
              padding: 20px;
              background: #F9FAFB;
            }
            .design-card {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .card-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #3A86FF;
              padding-bottom: 20px;
            }
            .card-title {
              color: #111827;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .card-meta {
              color: #6B7280;
              font-size: 14px;
            }
            .features-section, .metrics-section, .reasoning-section {
              margin-bottom: 25px;
            }
            .section-title {
              color: #111827;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .features-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .feature-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: #F0F9FF;
              border-radius: 6px;
              border-left: 4px solid #3A86FF;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .metric-item {
              text-align: center;
              padding: 15px;
              background: #F9FAFB;
              border-radius: 8px;
            }
            .metric-label {
              font-size: 14px;
              color: #6B7280;
              margin-bottom: 5px;
            }
            .metric-value {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
            }
            .reasoning-text {
              background: #FFFBEB;
              border: 1px solid #FCD34D;
              border-radius: 8px;
              padding: 15px;
              font-style: italic;
              line-height: 1.6;
            }
            @media print {
              body { margin: 0; background: white; }
              .design-card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${cardHTML}
          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  createDesignCardHTML(summary) {
    const featureNames = {
      'shade': '🌳 Shade (trees/awnings)',
      'ventilation': '💨 Ventilation',
      'insulation': '🧥 Insulation',
      'raised-floor': '🏠 Raised floor',
      'rainwater': '🌧️ Rainwater tank',
      'solar': '☀️ Solar panels'
    };

    return `
      <div class="design-card">
        <div class="card-header">
          <h1 class="card-title">${summary.title}</h1>
          <div class="card-meta">
            Created: ${new Date(summary.timestamp).toLocaleDateString()} | 
            Class: ${summary.classCode}
          </div>
        </div>
        
        <div class="features-section">
          <h2 class="section-title">🏗️ Selected Features</h2>
          <div class="features-grid">
            ${summary.features.map(f => `
              <div class="feature-item">
                ✓ ${featureNames[f] || f}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="metrics-section">
          <h2 class="section-title">📊 Performance Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-item">
              <div class="metric-label">Cooling Performance</div>
              <div class="metric-value">${summary.metrics.heatDisplay}%</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">Flood Safety</div>
              <div class="metric-value">${summary.metrics.waterDisplay}%</div>
            </div>
          </div>
        </div>
        
        <div class="reasoning-section">
          <h2 class="section-title">💭 My Reasoning</h2>
          <div class="reasoning-text">
            "${summary.reasoning}"
          </div>
        </div>
      </div>
    `;
  }

  saveToJournal(summary) {
    const journalEntry = {
      type: 'design_summary',
      step: 'design_tester',
      data: summary,
      content: `Design Summary: ${summary.features.length} features selected. Reasoning: ${summary.reasoning}`,
      tags: ['design', 'home', 'sustainability', ...summary.features]
    };

    if (window.saveToJournal) {
      window.saveToJournal(journalEntry);
    }
  }

  showExportSuccess() {
    const exportBtn = this.container.querySelector('#exportDesignBtn') || 
                     document.querySelector('#exportDesignBtn');
    
    if (exportBtn) {
      const originalText = exportBtn.textContent;
      const originalClass = exportBtn.className;
      
      exportBtn.textContent = '✓ Design exported!';
      exportBtn.classList.add('btn-success');
      exportBtn.disabled = true;
      
      setTimeout(() => {
        exportBtn.textContent = originalText;
        exportBtn.className = originalClass;
        exportBtn.disabled = false;
      }, 3000);
    }

    if (window.showToast) {
      window.showToast('Design summary exported successfully!', 'success');
    }
  }

  // Public methods
  setFeature(feature, enabled) {
    this.features[feature] = enabled;
    const toggle = this.container.querySelector(`[data-feature="${feature}"]`);
    if (toggle) {
      toggle.checked = enabled;
    }
    this.updateFeedback();
    this.updateMeters();
  }

  getDesignSummary() {
    const reasonTextarea = this.container.querySelector('#designReason');
    return {
      features: Object.keys(this.features).filter(f => this.features[f]),
      metrics: this.currentMetrics,
      reasoning: reasonTextarea ? reasonTextarea.value : ''
    };
  }

  reset() {
    // Reset all features
    Object.keys(this.features).forEach(feature => {
      this.features[feature] = false;
      const toggle = this.container.querySelector(`[data-feature="${feature}"]`);
      if (toggle) toggle.checked = false;
    });
    
    // Clear reasoning
    const reasonTextarea = this.container.querySelector('#designReason');
    if (reasonTextarea) reasonTextarea.value = '';
    
    // Update display
    this.updateFeedback();
    this.updateMeters();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('designTester')) {
    window.designTester = new DesignTester();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesignTester;
}
