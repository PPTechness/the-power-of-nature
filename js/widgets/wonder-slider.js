/**
 * Wonder Slider Widget
 * Interactive slider for exploring shade and temperature relationship
 */

class WonderSlider {
  constructor(containerId) {
    this.container = document.getElementById(containerId) || document.querySelector('.wonder-widget');
    this.slider = null;
    this.output = null;
    this.saveBtn = null;
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.slider = this.container.querySelector('#shadeSlider');
    this.output = this.container.querySelector('#tempChange');
    this.saveBtn = this.container.querySelector('#saveWonderBtn');
    
    if (!this.slider || !this.output || !this.saveBtn) {
      console.warn('Wonder slider elements not found');
      return;
    }

    this.setupSlider();
    this.setupSaveButton();
    this.updateOutput(0); // Initial value
  }

  setupSlider() {
    this.slider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.updateOutput(value);
      this.updateSliderVisuals(value);
    });

    this.slider.addEventListener('change', (e) => {
      const value = parseInt(e.target.value);
      this.announceChange(value);
    });

    // Add keyboard support for better accessibility
    this.slider.addEventListener('keydown', (e) => {
      let newValue = parseInt(this.slider.value);
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(0, newValue - 5);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(100, newValue + 5);
          break;
        case 'Home':
          newValue = 0;
          break;
        case 'End':
          newValue = 100;
          break;
        default:
          return;
      }
      
      e.preventDefault();
      this.slider.value = newValue;
      this.updateOutput(newValue);
      this.updateSliderVisuals(newValue);
    });

    // Initialize slider track styling
    this.updateSliderVisuals(0);
  }

  setupSaveButton() {
    this.saveBtn.addEventListener('click', () => {
      this.saveToJournal();
    });

    // Add keyboard activation
    this.saveBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.saveToJournal();
      }
    });
  }

  updateOutput(shadeValue) {
    // Calculate temperature change based on shade percentage
    // More shade = greater temperature reduction
    const tempChange = this.calculateTemperatureChange(shadeValue);
    
    if (this.output) {
      this.output.textContent = tempChange;
      
      // Add visual feedback based on temperature change
      const outputContainer = this.output.closest('.slider-output');
      if (outputContainer) {
        outputContainer.className = 'slider-output';
        
        if (tempChange < -5) {
          outputContainer.classList.add('very-cool');
        } else if (tempChange < -2) {
          outputContainer.classList.add('cool');
        } else if (tempChange < 0) {
          outputContainer.classList.add('slightly-cool');
        }
      }
    }
  }

  calculateTemperatureChange(shadePercentage) {
    // Realistic temperature change calculation
    // Full shade can reduce surface temperature by 10-15°C
    const maxReduction = 12; // Maximum temperature reduction in Celsius
    const reduction = (shadePercentage / 100) * maxReduction;
    
    // Add some realistic non-linearity
    const nonLinearFactor = 1 - Math.exp(-shadePercentage / 40);
    const finalReduction = reduction * nonLinearFactor;
    
    return Math.round(-finalReduction * 10) / 10; // Round to 1 decimal place
  }

  updateSliderVisuals(value) {
    // Update slider track to show progress
    const percentage = value;
    const slider = this.slider;
    
    // Create gradient background to show progress
    const gradient = `linear-gradient(to right, 
      var(--color-sunrise-yellow) 0%, 
      var(--color-leaf-green) ${percentage}%, 
      #E5E7EB ${percentage}%, 
      #E5E7EB 100%)`;
    
    slider.style.background = gradient;
    
    // Add CSS class for additional styling
    slider.classList.toggle('high-shade', value > 70);
    slider.classList.toggle('medium-shade', value > 30 && value <= 70);
    slider.classList.toggle('low-shade', value <= 30);
  }

  announceChange(value) {
    const tempChange = this.calculateTemperatureChange(value);
    const message = `Shade level ${value}%. Temperature change ${tempChange} degrees Celsius.`;
    
    // Announce to screen readers
    this.announceToScreenReader(message);
  }

  saveToJournal() {
    const shadeValue = parseInt(this.slider.value);
    const tempChange = this.calculateTemperatureChange(shadeValue);
    
    const journalEntry = {
      type: 'wonder_finding',
      step: 'wonder_slider',
      data: {
        shade_level: shadeValue,
        temperature_change: tempChange,
        finding: `Adding ${shadeValue}% shade reduces roof temperature by ${Math.abs(tempChange)}°C`
      },
      content: `My wonder finding: ${shadeValue}% shade changes roof temperature by ${tempChange}°C`
    };

    // Save to journal using global function
    if (window.saveToJournal) {
      window.saveToJournal(journalEntry);
    } else {
      // Fallback to localStorage
      const journal = JSON.parse(localStorage.getItem('journal') || '[]');
      journal.push({
        ...journalEntry,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      localStorage.setItem('journal', JSON.stringify(journal));
    }

    // Show feedback
    this.showSaveConfirmation();
    
    // Announce success
    this.announceToScreenReader('Finding saved to journal');
  }

  showSaveConfirmation() {
    // Change button temporarily to show success
    const originalText = this.saveBtn.textContent;
    const originalClass = this.saveBtn.className;
    
    this.saveBtn.textContent = '✓ Saved!';
    this.saveBtn.classList.add('btn-success');
    this.saveBtn.disabled = true;
    
    // Show toast notification if available
    if (window.showToast) {
      window.showToast('Wonder finding saved to journal!', 'success');
    }
    
    // Reset button after 2 seconds
    setTimeout(() => {
      this.saveBtn.textContent = originalText;
      this.saveBtn.className = originalClass;
      this.saveBtn.disabled = false;
    }, 2000);
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  // Public methods for external control
  setValue(value) {
    const clampedValue = Math.max(0, Math.min(100, value));
    this.slider.value = clampedValue;
    this.updateOutput(clampedValue);
    this.updateSliderVisuals(clampedValue);
  }

  getValue() {
    return parseInt(this.slider.value);
  }

  getTemperatureChange() {
    return this.calculateTemperatureChange(this.getValue());
  }

  reset() {
    this.setValue(0);
  }
}

// Initialize wonder slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a page with the wonder slider
  if (document.querySelector('.wonder-widget') || document.getElementById('shadeSlider')) {
    window.wonderSlider = new WonderSlider();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WonderSlider;
}
