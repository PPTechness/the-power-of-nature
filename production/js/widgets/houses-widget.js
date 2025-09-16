/**
 * Houses Around the World Widget
 * Drag and drop features to match house designs with their climate adaptations
 */

class HousesWidget {
  constructor(containerId = 'housesWidget') {
    this.container = document.getElementById(containerId);
    this.draggedElement = null;
    this.matchedPairs = new Set();
    
    this.houseData = {
      tropical: {
        name: 'Tropical House',
        climate: 'Hot and humid',
        correctFeature: 'ventilation',
        explanation: 'Open walls and raised floors allow air to flow freely, keeping the house cool and preventing moisture buildup. The steep roof quickly sheds heavy rainfall.'
      },
      arctic: {
        name: 'Arctic House',
        climate: 'Very cold',
        correctFeature: 'insulation',
        explanation: 'Thick walls and heavy insulation trap heat inside. Small windows reduce heat loss while still letting in precious sunlight during long winters.'
      },
      desert: {
        name: 'Desert House',
        climate: 'Hot and dry',
        correctFeature: 'thermal-mass',
        explanation: 'Thick adobe walls absorb heat during the day and release it slowly at night. The central courtyard creates cooling air circulation.'
      }
    };

    this.featureData = {
      ventilation: {
        name: 'Good Ventilation',
        icon: '💨',
        description: 'Allows air to flow through the building to cool it down'
      },
      insulation: {
        name: 'Heavy Insulation',
        icon: '🧥',
        description: 'Thick materials that keep heat in during cold weather'
      },
      'thermal-mass': {
        name: 'Thermal Mass',
        icon: '🧱',
        description: 'Heavy materials that store heat during day and release it at night'
      }
    };

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.setupDragAndDrop();
    this.setupRevealButton();
    this.setupAccessibility();
  }

  setupDragAndDrop() {
    // Setup draggable feature cards
    const featureCards = this.container.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      this.setupDraggable(card);
    });

    // Setup drop zones
    const dropZones = this.container.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
      this.setupDropZone(zone);
    });
  }

  setupDraggable(element) {
    element.draggable = true;
    
    element.addEventListener('dragstart', (e) => {
      this.draggedElement = element;
      element.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', element.dataset.feature);
      
      // Announce drag start to screen readers
      this.announceToScreenReader(`Started dragging ${this.featureData[element.dataset.feature]?.name}`);
    });

    element.addEventListener('dragend', (e) => {
      element.classList.remove('dragging');
      this.draggedElement = null;
    });

    // Keyboard support
    element.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.handleKeyboardSelection(element);
      }
    });

    // Touch support for mobile
    this.setupTouchSupport(element);
  }

  setupDropZone(zone) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('active');
    });

    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('active');
      }
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('active');
      
      const featureType = e.dataTransfer.getData('text/plain');
      const houseCard = zone.closest('.house-card');
      const houseType = houseCard?.dataset.house;
      
      this.handleDrop(featureType, houseType, zone);
    });

    // Keyboard support for drop zones
    zone.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedFeature) {
          const houseCard = zone.closest('.house-card');
          const houseType = houseCard?.dataset.house;
          this.handleDrop(this.selectedFeature, houseType, zone);
        }
      }
    });
  }

  setupTouchSupport(element) {
    let touchStartX, touchStartY;
    let isDragging = false;

    element.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isDragging = false;
    });

    element.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);
      
      if (deltaX > 10 || deltaY > 10) {
        isDragging = true;
        element.classList.add('dragging');
        
        // Create visual feedback for touch drag
        this.updateTouchFeedback(touch.clientX, touch.clientY, element);
      }
    });

    element.addEventListener('touchend', (e) => {
      if (isDragging) {
        const touch = e.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = dropTarget?.closest('.drop-zone');
        
        if (dropZone) {
          const houseCard = dropZone.closest('.house-card');
          const houseType = houseCard?.dataset.house;
          this.handleDrop(element.dataset.feature, houseType, dropZone);
        }
        
        element.classList.remove('dragging');
        this.clearTouchFeedback();
      }
      isDragging = false;
    });
  }

  updateTouchFeedback(x, y, element) {
    // Create or update touch feedback element
    let feedback = document.getElementById('touchDragFeedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = 'touchDragFeedback';
      feedback.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 1000;
        background: white;
        border: 2px solid var(--color-ocean-blue);
        border-radius: 8px;
        padding: 8px;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transform: translate(-50%, -100%);
      `;
      document.body.appendChild(feedback);
    }
    
    feedback.style.left = x + 'px';
    feedback.style.top = (y - 10) + 'px';
    feedback.textContent = this.featureData[element.dataset.feature]?.name || 'Feature';
  }

  clearTouchFeedback() {
    const feedback = document.getElementById('touchDragFeedback');
    if (feedback) {
      feedback.remove();
    }
  }

  handleKeyboardSelection(element) {
    // Clear previous selection
    document.querySelectorAll('.feature-card.selected').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Select current element
    element.classList.add('selected');
    this.selectedFeature = element.dataset.feature;
    
    // Announce selection
    this.announceToScreenReader(`Selected ${this.featureData[element.dataset.feature]?.name}. Use Tab to navigate to a house and press Enter to match.`);
  }

  handleDrop(featureType, houseType, dropZone) {
    if (!featureType || !houseType || !dropZone) return;

    const isCorrectMatch = this.houseData[houseType]?.correctFeature === featureType;
    const matchKey = `${houseType}-${featureType}`;

    if (isCorrectMatch) {
      // Correct match
      dropZone.classList.add('filled');
      dropZone.innerHTML = `
        <div class="matched-feature">
          <span class="feature-icon">${this.featureData[featureType].icon}</span>
          <span class="feature-name">${this.featureData[featureType].name}</span>
          <span class="match-indicator">✓</span>
        </div>
      `;
      
      // Hide the dragged feature card
      const featureCard = this.container.querySelector(`[data-feature="${featureType}"]`);
      if (featureCard) {
        featureCard.style.display = 'none';
      }
      
      this.matchedPairs.add(matchKey);
      this.showMatchFeedback(houseType, featureType, true);
      
      // Check if all matches are complete
      if (this.matchedPairs.size === 3) {
        this.showCompletionFeedback();
      }
      
    } else {
      // Incorrect match
      this.showMatchFeedback(houseType, featureType, false);
      this.animateIncorrectDrop(dropZone);
    }

    // Clear keyboard selection
    this.selectedFeature = null;
    document.querySelectorAll('.feature-card.selected').forEach(card => {
      card.classList.remove('selected');
    });
  }

  showMatchFeedback(houseType, featureType, isCorrect) {
    const houseName = this.houseData[houseType]?.name;
    const featureName = this.featureData[featureType]?.name;
    
    if (isCorrect) {
      this.announceToScreenReader(`Correct! ${featureName} matches ${houseName}.`);
      
      if (window.showToast) {
        window.showToast(`✓ Correct! ${featureName} helps ${houseName} in its climate.`, 'success');
      }
    } else {
      this.announceToScreenReader(`Not quite right. ${featureName} might not be the best match for ${houseName}.`);
      
      if (window.showToast) {
        window.showToast(`Try again! ${featureName} might not be the best match for ${houseName}.`, 'warning');
      }
    }
  }

  animateIncorrectDrop(dropZone) {
    dropZone.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      dropZone.style.animation = '';
    }, 500);
  }

  showCompletionFeedback() {
    if (window.showToast) {
      window.showToast('🎉 Excellent! You\'ve matched all house features correctly!', 'success', { duration: 5000 });
    }
    
    this.announceToScreenReader('Congratulations! You have successfully matched all house features to their climates.');
    
    // Enable reveal button
    const revealBtn = this.container.querySelector('#revealReasonsBtn') || 
                     document.querySelector('#revealReasonsBtn');
    if (revealBtn) {
      revealBtn.disabled = false;
      revealBtn.classList.add('pulse');
    }
  }

  setupRevealButton() {
    const revealBtn = this.container.querySelector('#revealReasonsBtn') || 
                     document.querySelector('#revealReasonsBtn');
    
    if (revealBtn) {
      revealBtn.addEventListener('click', () => {
        this.revealExplanations();
      });
    }
  }

  revealExplanations() {
    Object.keys(this.houseData).forEach(houseType => {
      const houseCard = this.container.querySelector(`[data-house="${houseType}"]`);
      if (houseCard && this.matchedPairs.has(`${houseType}-${this.houseData[houseType].correctFeature}`)) {
        this.addExplanation(houseCard, houseType);
      }
    });

    // Save progress to journal
    this.saveToJournal();
    
    if (window.showToast) {
      window.showToast('Explanations revealed! Read why each feature helps.', 'info');
    }
  }

  addExplanation(houseCard, houseType) {
    const data = this.houseData[houseType];
    
    // Check if explanation already exists
    if (houseCard.querySelector('.house-explanation')) return;
    
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'house-explanation';
    explanationDiv.innerHTML = `
      <h5>Why this works:</h5>
      <p>${data.explanation}</p>
    `;
    
    houseCard.appendChild(explanationDiv);
    
    // Animate appearance
    explanationDiv.style.opacity = '0';
    explanationDiv.style.transform = 'translateY(20px)';
    explanationDiv.style.transition = 'all 0.5s ease-out';
    
    requestAnimationFrame(() => {
      explanationDiv.style.opacity = '1';
      explanationDiv.style.transform = 'translateY(0)';
    });
  }

  setupAccessibility() {
    // Add CSS for accessibility features
    const style = document.createElement('style');
    style.textContent = `
      .feature-card.selected {
        outline: 3px solid var(--color-ocean-blue);
        outline-offset: 2px;
      }
      
      .drop-zone:focus {
        outline: 2px solid var(--color-ocean-blue);
        outline-offset: 2px;
      }
      
      .house-explanation {
        background: rgba(46, 196, 182, 0.1);
        border-radius: var(--radius);
        padding: var(--space-3);
        margin-top: var(--space-3);
        border-left: 4px solid var(--color-leaf-green);
      }
      
      .house-explanation h5 {
        color: var(--color-ink);
        font-size: var(--text-sm);
        font-weight: 600;
        margin-bottom: var(--space-2);
      }
      
      .house-explanation p {
        color: var(--color-ink);
        font-size: var(--text-sm);
        line-height: 1.5;
        margin: 0;
      }
      
      .matched-feature {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        justify-content: center;
        padding: var(--space-2);
        background: rgba(46, 196, 182, 0.1);
        border-radius: var(--radius);
      }
      
      .match-indicator {
        color: var(--color-leaf-green);
        font-weight: bold;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .pulse {
        animation: pulse 1s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    // Add ARIA labels
    const dropZones = this.container.querySelectorAll('.drop-zone');
    dropZones.forEach((zone, index) => {
      zone.setAttribute('role', 'button');
      zone.setAttribute('tabindex', '0');
      zone.setAttribute('aria-label', `Drop zone for house ${index + 1}`);
    });

    const featureCards = this.container.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      const featureName = this.featureData[card.dataset.feature]?.name;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Drag ${featureName} feature`);
    });
  }

  saveToJournal() {
    const matchedFeatures = Array.from(this.matchedPairs).map(pair => {
      const [house, feature] = pair.split('-');
      return {
        house: this.houseData[house]?.name,
        feature: this.featureData[feature]?.name,
        explanation: this.houseData[house]?.explanation
      };
    });

    const journalEntry = {
      type: 'houses_matching',
      step: 'houses_widget',
      data: {
        matches: matchedFeatures,
        completion_time: new Date().toISOString(),
        total_correct: this.matchedPairs.size
      },
      content: `Houses matching activity completed. Matched ${this.matchedPairs.size} features correctly.`,
      tags: ['houses', 'climate', 'architecture', 'matching']
    };

    if (window.saveToJournal) {
      window.saveToJournal(journalEntry);
    }
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

  // Public methods
  reset() {
    // Reset all matches
    this.matchedPairs.clear();
    this.selectedFeature = null;
    
    // Reset UI
    const dropZones = this.container.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
      zone.classList.remove('filled', 'active');
      zone.textContent = 'Drop feature here';
    });
    
    const featureCards = this.container.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      card.style.display = '';
      card.classList.remove('selected');
    });
    
    // Remove explanations
    const explanations = this.container.querySelectorAll('.house-explanation');
    explanations.forEach(exp => exp.remove());
    
    // Reset reveal button
    const revealBtn = this.container.querySelector('#revealReasonsBtn') || 
                     document.querySelector('#revealReasonsBtn');
    if (revealBtn) {
      revealBtn.disabled = true;
      revealBtn.classList.remove('pulse');
    }
  }

  getProgress() {
    return {
      totalMatches: Object.keys(this.houseData).length,
      completedMatches: this.matchedPairs.size,
      isComplete: this.matchedPairs.size === Object.keys(this.houseData).length
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('housesWidget')) {
    window.housesWidget = new HousesWidget();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HousesWidget;
}
