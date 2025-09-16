/**
 * Circuits Sandbox Widget
 * Interactive circuit building with drag and drop components
 */

class CircuitsWidget {
  constructor(containerId = 'circuitsWidget') {
    this.container = document.getElementById(containerId);
    this.grid = null;
    this.gridSize = { rows: 6, cols: 8 };
    this.components = new Map(); // Map of grid position to component
    this.connections = new Set(); // Set of connected positions
    this.isCircuitComplete = false;
    
    this.componentTypes = {
      battery: { symbol: '🔋', connections: 2, isSource: true },
      wire: { symbol: '➖', connections: 2, isSource: false },
      lamp: { symbol: '💡', connections: 2, isSource: false },
      switch: { symbol: '🔘', connections: 2, isSource: false, isSwitch: true }
    };
    
    this.switchState = true; // Switch is initially closed (on)
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.createGrid();
    this.setupDragAndDrop();
    this.setupButtons();
    this.setupAccessibility();
  }

  createGrid() {
    const gridContainer = this.container.querySelector('#circuitGrid');
    if (!gridContainer) return;
    
    this.grid = gridContainer;
    this.grid.innerHTML = '';
    
    // Create grid cells
    for (let row = 0; row < this.gridSize.rows; row++) {
      for (let col = 0; col < this.gridSize.cols; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.position = `${row}-${col}`;
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `Grid cell row ${row + 1}, column ${col + 1}`);
        
        this.setupGridCell(cell);
        this.grid.appendChild(cell);
      }
    }
  }

  setupGridCell(cell) {
    // Click to place selected component
    cell.addEventListener('click', () => {
      if (this.selectedComponent) {
        this.placeComponent(cell, this.selectedComponent);
      } else {
        this.removeComponent(cell);
      }
    });

    // Keyboard support
    cell.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        cell.click();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.removeComponent(cell);
      }
    });

    // Drag over for drop support
    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      cell.classList.add('drag-over');
    });

    cell.addEventListener('dragleave', () => {
      cell.classList.remove('drag-over');
    });

    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      cell.classList.remove('drag-over');
      const componentType = e.dataTransfer.getData('text/plain');
      if (componentType) {
        this.placeComponent(cell, componentType);
      }
    });
  }

  setupDragAndDrop() {
    const components = this.container.querySelectorAll('.component');
    
    components.forEach(component => {
      component.draggable = true;
      
      component.addEventListener('dragstart', (e) => {
        const componentType = component.dataset.component;
        e.dataTransfer.setData('text/plain', componentType);
        component.classList.add('dragging');
        
        this.announceToScreenReader(`Started dragging ${this.componentTypes[componentType]?.symbol} ${componentType}`);
      });

      component.addEventListener('dragend', () => {
        component.classList.remove('dragging');
      });

      // Click to select component for placement
      component.addEventListener('click', () => {
        this.selectComponent(component.dataset.component);
      });

      // Keyboard support
      component.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.selectComponent(component.dataset.component);
        }
      });
    });
  }

  setupButtons() {
    const screenshotBtn = this.container.querySelector('#screenshotCircuitBtn') || 
                         document.querySelector('#screenshotCircuitBtn');
    const resetBtn = this.container.querySelector('#resetCircuitBtn') || 
                    document.querySelector('#resetCircuitBtn');
    
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        this.takeScreenshot();
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetCircuit();
      });
    }
  }

  selectComponent(componentType) {
    // Clear previous selections
    document.querySelectorAll('.component.selected').forEach(comp => {
      comp.classList.remove('selected');
    });
    
    // Select new component
    this.selectedComponent = componentType;
    const componentElement = this.container.querySelector(`[data-component="${componentType}"]`);
    if (componentElement) {
      componentElement.classList.add('selected');
    }
    
    this.announceToScreenReader(`Selected ${componentType}. Click on a grid cell to place it.`);
  }

  placeComponent(cell, componentType) {
    const position = cell.dataset.position;
    
    // Remove existing component if any
    this.removeComponent(cell);
    
    // Place new component
    this.components.set(position, {
      type: componentType,
      element: cell,
      position: position
    });
    
    // Update visual
    cell.innerHTML = `<span class="circuit-component">${this.componentTypes[componentType].symbol}</span>`;
    cell.classList.add('occupied');
    cell.setAttribute('aria-label', `${componentType} at row ${parseInt(cell.dataset.row) + 1}, column ${parseInt(cell.dataset.col) + 1}`);
    
    // Special handling for switch
    if (componentType === 'switch') {
      cell.addEventListener('click', (e) => {
        if (e.target === cell || e.target.classList.contains('circuit-component')) {
          this.toggleSwitch(cell);
        }
      });
      cell.classList.add('switch', this.switchState ? 'switch-on' : 'switch-off');
    }
    
    // Check circuit after placement
    this.checkCircuit();
    
    this.announceToScreenReader(`Placed ${componentType} on grid`);
  }

  removeComponent(cell) {
    const position = cell.dataset.position;
    
    if (this.components.has(position)) {
      this.components.delete(position);
      cell.innerHTML = '';
      cell.classList.remove('occupied', 'connected', 'switch', 'switch-on', 'switch-off');
      cell.setAttribute('aria-label', `Empty grid cell row ${parseInt(cell.dataset.row) + 1}, column ${parseInt(cell.dataset.col) + 1}`);
      
      this.checkCircuit();
    }
  }

  toggleSwitch(switchCell) {
    this.switchState = !this.switchState;
    switchCell.classList.toggle('switch-on', this.switchState);
    switchCell.classList.toggle('switch-off', !this.switchState);
    
    const state = this.switchState ? 'closed' : 'open';
    this.announceToScreenReader(`Switch ${state}`);
    
    this.checkCircuit();
  }

  checkCircuit() {
    // Reset connection states
    this.connections.clear();
    document.querySelectorAll('.grid-cell').forEach(cell => {
      cell.classList.remove('connected');
    });
    
    // Find battery (power source)
    const battery = this.findComponent('battery');
    if (!battery) {
      this.updateCircuitFeedback(false, 'Add a battery to power your circuit');
      return;
    }
    
    // Find lamp
    const lamp = this.findComponent('lamp');
    if (!lamp) {
      this.updateCircuitFeedback(false, 'Add a lamp to see if your circuit works');
      return;
    }
    
    // Check if there's a complete path from battery to lamp and back
    const isComplete = this.findCircuitPath(battery.position, lamp.position);
    
    if (isComplete) {
      // Check if switch is closed (if present)
      const switchComponent = this.findComponent('switch');
      const circuitWorks = !switchComponent || this.switchState;
      
      if (circuitWorks) {
        this.updateCircuitFeedback(true, 'It works! The lamp is lit.');
        this.isCircuitComplete = true;
        
        // Highlight connected components
        this.highlightConnectedPath();
        
        // Save achievement to journal
        this.saveCircuitSuccess();
      } else {
        this.updateCircuitFeedback(false, 'Circuit complete but switch is open. Close the switch to light the lamp.');
      }
    } else {
      this.updateCircuitFeedback(false, 'Connect the components to complete the circuit');
    }
  }

  findComponent(type) {
    for (let [position, component] of this.components) {
      if (component.type === type) {
        return { ...component, position };
      }
    }
    return null;
  }

  findCircuitPath(startPos, endPos) {
    if (startPos === endPos) return true;
    
    const visited = new Set();
    const queue = [startPos];
    visited.add(startPos);
    
    while (queue.length > 0) {
      const currentPos = queue.shift();
      const neighbors = this.getConnectedNeighbors(currentPos);
      
      for (let neighborPos of neighbors) {
        if (neighborPos === endPos) {
          return true;
        }
        
        if (!visited.has(neighborPos) && this.components.has(neighborPos)) {
          visited.add(neighborPos);
          queue.push(neighborPos);
          this.connections.add(neighborPos);
        }
      }
    }
    
    return false;
  }

  getConnectedNeighbors(position) {
    const [row, col] = position.split('-').map(Number);
    const neighbors = [];
    
    // Check adjacent cells (up, down, left, right)
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    
    for (let [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow >= 0 && newRow < this.gridSize.rows && 
          newCol >= 0 && newCol < this.gridSize.cols) {
        neighbors.push(`${newRow}-${newCol}`);
      }
    }
    
    return neighbors;
  }

  highlightConnectedPath() {
    // Highlight all components in the working circuit
    for (let position of this.connections) {
      const cell = this.grid.querySelector(`[data-position="${position}"]`);
      if (cell) {
        cell.classList.add('connected');
      }
    }
    
    // Also highlight start and end points
    const battery = this.findComponent('battery');
    const lamp = this.findComponent('lamp');
    
    if (battery) battery.element.classList.add('connected');
    if (lamp) lamp.element.classList.add('connected');
  }

  updateCircuitFeedback(isWorking, message) {
    const lampIndicator = this.container.querySelector('#lampIndicator');
    const feedbackText = this.container.querySelector('#circuitFeedback');
    
    if (lampIndicator) {
      lampIndicator.classList.toggle('lit', isWorking);
    }
    
    if (feedbackText) {
      feedbackText.textContent = message;
      feedbackText.className = isWorking ? 'feedback-text success' : 'feedback-text';
    }
    
    if (isWorking) {
      this.announceToScreenReader('Success! ' + message);
      
      if (window.showToast) {
        window.showToast('🎉 ' + message, 'success');
      }
    }
  }

  takeScreenshot() {
    if (!this.isCircuitComplete) {
      if (window.showToast) {
        window.showToast('Complete the circuit first before taking a screenshot.', 'warning');
      }
      return;
    }
    
    // Create a simplified representation for the journal
    const circuitData = {
      components: Array.from(this.components.values()).map(comp => ({
        type: comp.type,
        position: comp.position
      })),
      isWorking: this.isCircuitComplete,
      switchState: this.switchState,
      timestamp: new Date().toISOString()
    };
    
    // Save to journal
    const journalEntry = {
      type: 'circuit_screenshot',
      step: 'circuits_sandbox',
      data: circuitData,
      content: `Circuit screenshot: ${circuitData.components.length} components, circuit ${circuitData.isWorking ? 'working' : 'not working'}`,
      tags: ['circuits', 'electronics', 'screenshot']
    };
    
    if (window.saveToJournal) {
      window.saveToJournal(journalEntry);
    }
    
    // Show success feedback
    const screenshotBtn = this.container.querySelector('#screenshotCircuitBtn') || 
                         document.querySelector('#screenshotCircuitBtn');
    
    if (screenshotBtn) {
      const originalText = screenshotBtn.textContent;
      screenshotBtn.textContent = '✓ Saved to Journal!';
      screenshotBtn.classList.add('btn-success');
      screenshotBtn.disabled = true;
      
      setTimeout(() => {
        screenshotBtn.textContent = originalText;
        screenshotBtn.classList.remove('btn-success');
        screenshotBtn.disabled = false;
      }, 2000);
    }
    
    if (window.showToast) {
      window.showToast('Circuit screenshot saved to journal!', 'success');
    }
  }

  saveCircuitSuccess() {
    const componentsUsed = Array.from(this.components.values()).map(comp => comp.type);
    const uniqueComponents = [...new Set(componentsUsed)];
    
    const journalEntry = {
      type: 'circuit_completion',
      step: 'circuits_sandbox',
      data: {
        components_used: componentsUsed,
        unique_components: uniqueComponents,
        total_components: componentsUsed.length,
        completion_time: new Date().toISOString(),
        switch_used: componentsUsed.includes('switch')
      },
      content: `Circuit completed successfully using ${componentsUsed.length} components: ${uniqueComponents.join(', ')}`,
      tags: ['circuits', 'completion', 'electronics', ...uniqueComponents]
    };
    
    if (window.saveToJournal) {
      window.saveToJournal(journalEntry);
    }
  }

  resetCircuit() {
    // Clear all components
    this.components.clear();
    this.connections.clear();
    this.isCircuitComplete = false;
    this.switchState = true;
    this.selectedComponent = null;
    
    // Reset grid
    document.querySelectorAll('.grid-cell').forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('occupied', 'connected', 'switch', 'switch-on', 'switch-off', 'drag-over');
      cell.setAttribute('aria-label', `Empty grid cell row ${parseInt(cell.dataset.row) + 1}, column ${parseInt(cell.dataset.col) + 1}`);
    });
    
    // Reset component selection
    document.querySelectorAll('.component.selected').forEach(comp => {
      comp.classList.remove('selected');
    });
    
    // Reset feedback
    this.updateCircuitFeedback(false, 'Drag components to build your circuit');
    
    this.announceToScreenReader('Circuit reset. Grid is now empty.');
    
    if (window.showToast) {
      window.showToast('Circuit reset successfully', 'info');
    }
  }

  setupAccessibility() {
    // Add CSS for accessibility features
    const style = document.createElement('style');
    style.textContent = `
      .component.selected {
        outline: 3px solid var(--color-ocean-blue);
        outline-offset: 2px;
        transform: translateY(-2px);
      }
      
      .grid-cell.drag-over {
        background: rgba(58, 134, 255, 0.2);
        border-color: var(--color-ocean-blue);
      }
      
      .grid-cell.connected {
        background: rgba(46, 196, 182, 0.3);
        border-color: var(--color-leaf-green);
        border-width: 2px;
      }
      
      .feedback-text.success {
        color: var(--color-leaf-green);
        font-weight: 600;
      }
      
      .switch-on .circuit-component {
        color: var(--color-leaf-green);
      }
      
      .switch-off .circuit-component {
        color: var(--color-muted);
        opacity: 0.6;
      }
      
      .circuit-component {
        font-size: var(--text-lg);
        user-select: none;
        transition: all var(--transition-fast);
      }
      
      .grid-cell:focus {
        outline: 2px solid var(--color-ocean-blue);
        outline-offset: 2px;
      }
      
      .component:focus {
        outline: 2px solid var(--color-ocean-blue);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
    
    // Add instructions for screen readers
    const instructions = document.createElement('div');
    instructions.className = 'sr-only';
    instructions.setAttribute('aria-live', 'polite');
    instructions.id = 'circuit-instructions';
    instructions.textContent = 'Use Tab to navigate components and grid cells. Press Space or Enter to select components or place them on the grid. Use Delete to remove components from grid cells.';
    
    this.container.appendChild(instructions);
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
  getCircuitState() {
    return {
      components: Array.from(this.components.entries()),
      isComplete: this.isCircuitComplete,
      switchState: this.switchState
    };
  }

  loadCircuitState(state) {
    this.resetCircuit();
    
    for (let [position, componentData] of state.components) {
      const cell = this.grid.querySelector(`[data-position="${position}"]`);
      if (cell) {
        this.placeComponent(cell, componentData.type);
      }
    }
    
    this.switchState = state.switchState;
    this.checkCircuit();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('circuitsWidget')) {
    window.circuitsWidget = new CircuitsWidget();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircuitsWidget;
}
