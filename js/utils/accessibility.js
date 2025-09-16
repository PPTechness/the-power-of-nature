/**
 * Accessibility Utilities and WCAG Compliance Checker
 * Ensures world-class accessibility standards
 */

class AccessibilityManager {
  constructor() {
    this.focusManagement = new FocusManager();
    this.keyboardNavigation = new KeyboardNavigation();
    this.screenReader = new ScreenReaderSupport();
    this.colorContrast = new ColorContrastChecker();
    this.motionPreferences = new MotionPreferences();
    
    this.init();
  }

  init() {
    this.setupGlobalAccessibility();
    this.addAccessibilityTools();
    this.performInitialAudit();
    
    // Setup periodic checks
    setInterval(() => {
      this.performAccessibilityCheck();
    }, 30000); // Check every 30 seconds
  }

  setupGlobalAccessibility() {
    // Add skip link
    this.addSkipLink();
    
    // Setup focus indicators
    this.setupFocusIndicators();
    
    // Add landmark roles
    this.addLandmarkRoles();
    
    // Setup error handling
    this.setupErrorAnnouncements();
    
    // Add page title management
    this.setupPageTitleManagement();
  }

  addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000;
      background: var(--color-ocean-blue);
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.transform = 'translateY(0)';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.transform = 'translateY(-100%)';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Ensure main content has ID
    const main = document.querySelector('main');
    if (main && !main.id) {
      main.id = 'main-content';
    }
  }

  setupFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced focus indicators */
      :focus-visible {
        outline: 3px solid var(--color-ocean-blue);
        outline-offset: 2px;
        border-radius: 2px;
      }
      
      .focus-trap {
        position: relative;
      }
      
      .focus-trap::before,
      .focus-trap::after {
        content: '';
        position: absolute;
        top: 0;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
      
      .high-contrast-mode {
        filter: contrast(150%) brightness(110%);
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      .large-text {
        font-size: 1.25em !important;
        line-height: 1.6 !important;
      }
      
      .high-contrast {
        background: black !important;
        color: white !important;
      }
      
      .high-contrast a {
        color: yellow !important;
      }
      
      .high-contrast button {
        background: white !important;
        color: black !important;
        border: 2px solid white !important;
      }
    `;
    document.head.appendChild(style);
  }

  addLandmarkRoles() {
    // Add ARIA landmarks where missing
    const nav = document.querySelector('nav, .nav-header');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'Main navigation');
    }
    
    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }
    
    const footer = document.querySelector('footer');
    if (footer && !footer.getAttribute('role')) {
      footer.setAttribute('role', 'contentinfo');
    }
    
    // Add heading structure
    this.validateHeadingStructure();
  }

  validateHeadingStructure() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substr(1));
      
      // Check for logical heading progression
      if (level > previousLevel + 1) {
        console.warn(`Heading level jump detected: ${heading.textContent.trim()} (h${level} after h${previousLevel})`);
      }
      
      // Ensure headings have content
      if (!heading.textContent.trim()) {
        console.warn('Empty heading detected:', heading);
      }
      
      previousLevel = level;
    });
  }

  setupErrorAnnouncements() {
    // Intercept and announce form errors
    document.addEventListener('invalid', (e) => {
      e.preventDefault();
      const field = e.target;
      const message = field.validationMessage || 'This field has an error';
      
      this.announceToScreenReader(`Error: ${message}`, 'assertive');
      
      // Add visual error indication
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
      
      // Remove error state when fixed
      field.addEventListener('input', () => {
        if (field.validity.valid) {
          field.classList.remove('error');
          field.removeAttribute('aria-invalid');
        }
      }, { once: true });
    }, true);
  }

  setupPageTitleManagement() {
    // Update page title for SPA navigation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const h1 = document.querySelector('h1');
          if (h1 && h1.textContent.trim()) {
            const baseTitle = 'Harness the Power of Nature';
            document.title = `${h1.textContent.trim()} | ${baseTitle}`;
          }
        }
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  addAccessibilityTools() {
    const toolsContainer = document.createElement('div');
    toolsContainer.className = 'accessibility-tools';
    toolsContainer.setAttribute('role', 'toolbar');
    toolsContainer.setAttribute('aria-label', 'Accessibility tools');
    toolsContainer.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      z-index: 1000;
      background: white;
      border: 2px solid var(--color-ocean-blue);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    `;
    
    toolsContainer.addEventListener('mouseenter', () => {
      toolsContainer.style.opacity = '1';
    });
    
    toolsContainer.addEventListener('mouseleave', () => {
      toolsContainer.style.opacity = '0.8';
    });
    
    // Text size controls
    const textSizeLabel = document.createElement('div');
    textSizeLabel.textContent = 'Text Size:';
    textSizeLabel.style.fontSize = '12px';
    textSizeLabel.style.fontWeight = 'bold';
    toolsContainer.appendChild(textSizeLabel);
    
    const increaseTextBtn = this.createToolButton('A+', 'Increase text size', () => {
      document.body.classList.toggle('large-text');
    });
    
    const decreaseTextBtn = this.createToolButton('A-', 'Decrease text size', () => {
      document.body.classList.remove('large-text');
    });
    
    // Contrast controls
    const contrastLabel = document.createElement('div');
    contrastLabel.textContent = 'Contrast:';
    contrastLabel.style.fontSize = '12px';
    contrastLabel.style.fontWeight = 'bold';
    contrastLabel.style.marginTop = '8px';
    toolsContainer.appendChild(contrastLabel);
    
    const highContrastBtn = this.createToolButton('HC', 'Toggle high contrast', () => {
      document.body.classList.toggle('high-contrast');
    });
    
    // Motion controls
    const motionLabel = document.createElement('div');
    motionLabel.textContent = 'Motion:';
    motionLabel.style.fontSize = '12px';
    motionLabel.style.fontWeight = 'bold';
    motionLabel.style.marginTop = '8px';
    toolsContainer.appendChild(motionLabel);
    
    const reduceMotionBtn = this.createToolButton('RM', 'Reduce motion', () => {
      document.body.classList.toggle('reduced-motion');
    });
    
    // Read aloud
    const readLabel = document.createElement('div');
    readLabel.textContent = 'Audio:';
    readLabel.style.fontSize = '12px';
    readLabel.style.fontWeight = 'bold';
    readLabel.style.marginTop = '8px';
    toolsContainer.appendChild(readLabel);
    
    const readAloudBtn = this.createToolButton('🔊', 'Read page aloud', () => {
      this.readPageAloud();
    });
    
    toolsContainer.append(
      increaseTextBtn, decreaseTextBtn,
      highContrastBtn, reduceMotionBtn, readAloudBtn
    );
    
    document.body.appendChild(toolsContainer);
  }

  createToolButton(text, ariaLabel, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.setAttribute('aria-label', ariaLabel);
    button.style.cssText = `
      background: var(--color-ocean-blue);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s ease;
      min-width: 30px;
      min-height: 30px;
    `;
    
    button.addEventListener('click', onClick);
    button.addEventListener('mouseenter', () => {
      button.style.background = '#2563EB';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'var(--color-ocean-blue)';
    });
    
    return button;
  }

  readPageAloud() {
    if (!window.speechSynthesis) {
      alert('Speech synthesis not supported in this browser');
      return;
    }
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    
    const content = this.extractReadableContent();
    if (!content) return;
    
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
    
    this.announceToScreenReader('Started reading page aloud. Click the audio button again to stop.');
  }

  extractReadableContent() {
    const contentSelectors = [
      'h1, h2, h3',
      '.hero-title, .hero-subtitle',
      '.section-title',
      '.step-title, .step-goal',
      'p:not(.sr-only)',
      '.scenario-description',
      '.feedback-explanation'
    ];
    
    const elements = document.querySelectorAll(contentSelectors.join(', '));
    const content = Array.from(elements)
      .map(el => el.textContent.trim())
      .filter(text => text.length > 0)
      .join('. ');
    
    return content;
  }

  performInitialAudit() {
    console.group('🔍 Accessibility Audit');
    
    this.auditImages();
    this.auditForms();
    this.auditColorContrast();
    this.auditKeyboardNavigation();
    this.auditScreenReaderSupport();
    
    console.groupEnd();
  }

  auditImages() {
    const images = document.querySelectorAll('img');
    let issues = 0;
    
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        console.warn('Image missing alt text:', img);
        issues++;
      }
      
      if (img.alt && img.alt.length > 100) {
        console.warn('Alt text too long (>100 chars):', img);
        issues++;
      }
    });
    
    console.log(`✓ Images audit: ${issues} issues found`);
  }

  auditForms() {
    const inputs = document.querySelectorAll('input, textarea, select');
    let issues = 0;
    
    inputs.forEach(input => {
      const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel) {
        console.warn('Form control missing label:', input);
        issues++;
      }
      
      if (input.required && !input.getAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true');
      }
    });
    
    console.log(`✓ Forms audit: ${issues} issues found`);
  }

  auditColorContrast() {
    // This would ideally use a more sophisticated contrast checking library
    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
    let lowContrastWarnings = 0;
    
    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Simple check for obvious contrast issues
      if (color === backgroundColor) {
        console.warn('Potential contrast issue (same color and background):', el);
        lowContrastWarnings++;
      }
    });
    
    console.log(`✓ Color contrast audit: ${lowContrastWarnings} potential issues found`);
  }

  auditKeyboardNavigation() {
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    let issues = 0;
    
    interactiveElements.forEach(el => {
      if (el.tabIndex < 0 && !el.hasAttribute('aria-hidden')) {
        console.warn('Interactive element not keyboard accessible:', el);
        issues++;
      }
    });
    
    console.log(`✓ Keyboard navigation audit: ${issues} issues found`);
  }

  auditScreenReaderSupport() {
    const clickHandlers = document.querySelectorAll('[onclick], .clickable');
    let issues = 0;
    
    clickHandlers.forEach(el => {
      if (el.tagName !== 'BUTTON' && el.tagName !== 'A' && !el.getAttribute('role')) {
        console.warn('Clickable element should have button role:', el);
        issues++;
      }
    });
    
    console.log(`✓ Screen reader audit: ${issues} issues found`);
  }

  performAccessibilityCheck() {
    // Lightweight ongoing checks
    this.checkFocusTraps();
    this.checkDynamicContent();
  }

  checkFocusTraps() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      if (!modal.querySelector('[tabindex="0"], button, input, textarea, select, a')) {
        console.warn('Modal without focusable content:', modal);
      }
    });
  }

  checkDynamicContent() {
    // Monitor for content changes that need announcements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if new content needs ARIA live regions
              if (node.classList && node.classList.contains('alert')) {
                node.setAttribute('role', 'alert');
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
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

  // Public API
  enableHighContrast() {
    document.body.classList.add('high-contrast');
  }

  disableHighContrast() {
    document.body.classList.remove('high-contrast');
  }

  increaseTextSize() {
    document.body.classList.add('large-text');
  }

  decreaseTextSize() {
    document.body.classList.remove('large-text');
  }

  reduceMotion() {
    document.body.classList.add('reduced-motion');
  }

  enableMotion() {
    document.body.classList.remove('reduced-motion');
  }

  getAccessibilityReport() {
    return {
      timestamp: new Date().toISOString(),
      checks: {
        images: this.auditImages,
        forms: this.auditForms,
        contrast: this.auditColorContrast,
        keyboard: this.auditKeyboardNavigation,
        screenReader: this.auditScreenReaderSupport
      }
    };
  }
}

// Helper classes for specific accessibility features
class FocusManager {
  constructor() {
    this.focusStack = [];
    this.setupFocusTrapping();
  }

  setupFocusTrapping() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    });
  }

  handleTabNavigation(e) {
    const modal = document.querySelector('.modal.active');
    if (modal) {
      this.trapFocusInModal(e, modal);
    }
  }

  trapFocusInModal(e, modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  pushFocus(element) {
    this.focusStack.push(document.activeElement);
    element.focus();
  }

  popFocus() {
    const element = this.focusStack.pop();
    if (element && element.focus) {
      element.focus();
    }
  }
}

class KeyboardNavigation {
  constructor() {
    this.setupKeyboardShortcuts();
    this.setupSkipLinks();
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + M: Toggle mode (already implemented in main app)
      // Alt + S: Focus search (already implemented in main app)
      // Alt + H: Go to homepage
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = '/';
      }
      
      // Alt + L: Go to learn page
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        window.location.href = '/learn.html';
      }
      
      // Alt + 1-6: Navigate to specific sections
      if (e.altKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        this.navigateToSection(parseInt(e.key));
      }
    });
  }

  navigateToSection(sectionNumber) {
    const sections = document.querySelectorAll('section, .learning-step');
    if (sections[sectionNumber - 1]) {
      sections[sectionNumber - 1].scrollIntoView({ behavior: 'smooth' });
      sections[sectionNumber - 1].focus();
    }
  }

  setupSkipLinks() {
    // Additional skip links for complex pages
    const skipLinks = [
      { href: '#main-navigation', text: 'Skip to navigation' },
      { href: '#main-content', text: 'Skip to content' },
      { href: '#footer', text: 'Skip to footer' }
    ];
    
    // Implementation would add these dynamically based on page structure
  }
}

class ScreenReaderSupport {
  constructor() {
    this.setupLiveRegions();
    this.enhanceInteractiveElements();
  }

  setupLiveRegions() {
    // Create global live regions for announcements
    const politeRegion = document.createElement('div');
    politeRegion.id = 'polite-announcements';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'false');
    politeRegion.className = 'sr-only';
    
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'assertive-announcements';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    
    document.body.appendChild(politeRegion);
    document.body.appendChild(assertiveRegion);
  }

  enhanceInteractiveElements() {
    // Add better descriptions to interactive elements
    document.querySelectorAll('button').forEach(button => {
      if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
        console.warn('Button without accessible text:', button);
      }
    });
    
    // Enhance form elements
    document.querySelectorAll('input[type="range"]').forEach(range => {
      if (!range.getAttribute('aria-valuetext')) {
        range.addEventListener('input', () => {
          const value = range.value;
          const min = range.min || 0;
          const max = range.max || 100;
          const percentage = ((value - min) / (max - min)) * 100;
          range.setAttribute('aria-valuetext', `${value} (${Math.round(percentage)}%)`);
        });
      }
    });
  }

  announce(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'assertive-announcements' : 'polite-announcements';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }
}

class ColorContrastChecker {
  constructor() {
    this.checkSystemPreferences();
  }

  checkSystemPreferences() {
    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast-mode');
    }
    
    // Listen for changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      document.body.classList.toggle('high-contrast-mode', e.matches);
    });
  }

  // Color contrast calculation would go here
  // This would use WCAG contrast ratio formulas
}

class MotionPreferences {
  constructor() {
    this.checkMotionPreferences();
  }

  checkMotionPreferences() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }
    
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      document.body.classList.toggle('reduced-motion', e.matches);
    });
  }
}

// Initialize accessibility manager
document.addEventListener('DOMContentLoaded', () => {
  window.accessibilityManager = new AccessibilityManager();
});

// Global accessibility functions
window.announceToScreenReader = (message, priority) => {
  if (window.accessibilityManager) {
    window.accessibilityManager.announceToScreenReader(message, priority);
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityManager;
}
