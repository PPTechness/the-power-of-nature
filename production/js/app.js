/**
 * Main Application JavaScript
 * Handles global functionality, navigation, and user mode switching
 */

class NaturePowerApp {
  constructor() {
    this.currentMode = localStorage.getItem('userMode') || 'student';
    this.journal = JSON.parse(localStorage.getItem('journal')) || [];
    this.language = localStorage.getItem('language') || 'en';
    
    this.init();
  }

  init() {
    try {
      this.setupModeToggle();
      this.setupSearch();
      this.setupLanguageToggle();
      this.setupAccessibility();
      this.setInitialMode();
      this.setupNavigation();
      
      // Initialize page-specific functionality
      this.initPageSpecific();
    } catch (error) {
      console.error('Error initializing Nature Power App:', error);
      this.showError('Failed to initialize app. Please refresh the page.');
    }
  }

  /**
   * Mode Toggle Functionality (Student/Teacher)
   */
  setupModeToggle() {
    const modeToggle = document.getElementById('modeToggle');
    if (!modeToggle) return;

    modeToggle.addEventListener('click', () => {
      this.toggleMode();
    });

    // Update UI based on current mode
    this.updateModeUI();
  }

  toggleMode() {
    this.currentMode = this.currentMode === 'student' ? 'teacher' : 'student';
    localStorage.setItem('userMode', this.currentMode);
    
    this.updateModeUI();
    this.announceToScreenReader(`Switched to ${this.currentMode} mode`);
  }

  updateModeUI() {
    const modeBtn = document.getElementById('modeToggle');
    const modeText = modeBtn?.querySelector('.mode-text');
    
    if (modeText) {
      modeText.textContent = this.currentMode === 'student' ? 'Student' : 'Teacher';
    }
    
    // Update body class for conditional styling
    document.body.className = document.body.className.replace(/\b(student|teacher)-mode\b/g, '');
    document.body.classList.add(`${this.currentMode}-mode`);
    
    // Update button appearance
    if (modeBtn) {
      modeBtn.classList.toggle('teacher', this.currentMode === 'teacher');
    }
  }

  setInitialMode() {
    document.body.classList.add(`${this.currentMode}-mode`);
  }

  /**
   * Search Functionality
   */
  setupSearch() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchInput = document.querySelector('.search-input');
    
    if (!searchToggle || !searchInput) return;

    searchToggle.addEventListener('click', () => {
      searchInput.classList.toggle('active');
      if (searchInput.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Close search when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        searchInput.classList.remove('active');
      }
    });

    // Handle search functionality
    searchInput.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.classList.remove('active');
        searchInput.value = '';
      }
    });
  }

  performSearch(query) {
    if (query.length < 2) return;
    
    // Simple search implementation - could be enhanced with more sophisticated search
    const searchableElements = document.querySelectorAll('h1, h2, h3, p, .step-title, .step-caption');
    
    searchableElements.forEach(el => {
      const text = el.textContent.toLowerCase();
      const isMatch = text.includes(query.toLowerCase());
      
      if (isMatch) {
        el.style.backgroundColor = 'rgba(255, 200, 87, 0.3)';
        el.style.borderRadius = '4px';
        el.style.padding = '2px 4px';
      } else {
        el.style.backgroundColor = '';
        el.style.borderRadius = '';
        el.style.padding = '';
      }
    });
  }

  /**
   * Language Toggle Functionality
   */
  setupLanguageToggle() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        this.switchLanguage(lang);
      });
    });
  }

  switchLanguage(lang) {
    this.language = lang;
    localStorage.setItem('language', lang);
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // In a real implementation, this would trigger i18n
    console.log(`Language switched to: ${lang}`);
    this.announceToScreenReader(`Language changed to ${this.getLanguageName(lang)}`);
  }

  getLanguageName(code) {
    const names = {
      'en': 'English',
      'zh': 'Chinese',
      'ms': 'Malay'
    };
    return names[code] || code;
  }

  /**
   * Accessibility Features
   */
  setupAccessibility() {
    // Setup read-aloud functionality (Web Speech API)
    this.setupReadAloud();
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
    
    // Setup focus management
    this.setupFocusManagement();
  }

  setupReadAloud() {
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) return;

    // Add read-aloud buttons to content sections
    const contentSections = document.querySelectorAll('.hero-content, .step-card, .wonder-card, .learning-step');
    
    contentSections.forEach(section => {
      const readBtn = document.createElement('button');
      readBtn.className = 'read-aloud-btn';
      readBtn.innerHTML = '🔊 Read aloud';
      readBtn.setAttribute('aria-label', 'Read this section aloud');
      
      readBtn.addEventListener('click', () => {
        this.readAloud(section);
      });
      
      section.style.position = 'relative';
      section.appendChild(readBtn);
    });
  }

  readAloud(element) {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }

    const text = this.extractTextContent(element);
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  }

  extractTextContent(element) {
    // Extract meaningful text, excluding buttons and UI elements
    const textElements = element.querySelectorAll('h1, h2, h3, p, .step-caption, .wonder-subtitle, .step-goal');
    return Array.from(textElements).map(el => el.textContent.trim()).join('. ');
  }

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for better accessibility
    document.addEventListener('keydown', (e) => {
      // Alt + M: Toggle mode
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        this.toggleMode();
      }
      
      // Alt + S: Focus search
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.classList.add('active');
          searchInput.focus();
        }
      }
      
      // Escape: Close modals and overlays
      if (e.key === 'Escape') {
        this.closeAllOverlays();
      }
    });
  }

  setupFocusManagement() {
    // Ensure focus is visible and properly managed
    document.addEventListener('focusin', (e) => {
      // Remove focus styles from non-keyboard users
      if (e.target.matches(':focus-visible')) {
        e.target.classList.add('keyboard-focus');
      }
    });

    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('keyboard-focus');
    });
  }

  closeAllOverlays() {
    // Close search
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.classList.remove('active');
    }
    
    // Close any open modals or dropdowns
    document.querySelectorAll('.modal.active, .dropdown.active').forEach(el => {
      el.classList.remove('active');
    });
  }

  /**
   * Navigation Functionality
   */
  setupNavigation() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Update active navigation based on scroll position
    if (window.location.pathname.includes('learn')) {
      this.setupTimelineNavigation();
    }
  }

  setupTimelineNavigation() {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    const learningSections = document.querySelectorAll('.learning-step');
    
    if (!timelineSteps.length || !learningSections.length) return;

    // Click handlers for timeline steps
    timelineSteps.forEach((step, index) => {
      step.addEventListener('click', () => {
        if (learningSections[index]) {
          learningSections[index].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Update active step based on scroll position
    const updateActiveStep = () => {
      const scrollPosition = window.scrollY + 200; // Offset for sticky header
      
      learningSections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top <= 200 && rect.bottom >= 200;
        
        if (timelineSteps[index]) {
          timelineSteps[index].classList.toggle('active', isVisible);
        }
      });
    };

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveStep, 10);
    });

    // Initial update
    updateActiveStep();
  }

  /**
   * Page-specific Initialization
   */
  initPageSpecific() {
    const pathname = window.location.pathname;
    
    if (pathname === '/' || pathname.includes('index')) {
      this.initHomePage();
    } else if (pathname.includes('learn')) {
      this.initLearnPage();
    } else if (pathname.includes('digital-citizenship')) {
      this.initDigitalCitizenshipPage();
    } else if (pathname.includes('build')) {
      this.initBuildPage();
    } else if (pathname.includes('gallery')) {
      this.initGalleryPage();
    } else if (pathname.includes('teacher')) {
      this.initTeacherPage();
    }
  }

  initHomePage() {
    // Animation for journey steps on scroll
    this.observeElements('.step-card', (el) => {
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    });

    // Initial state for animations
    document.querySelectorAll('.step-card').forEach(card => {
      card.style.transform = 'translateY(30px)';
      card.style.opacity = '0';
      card.style.transition = 'all 0.6s ease-out';
    });
  }

  initLearnPage() {
    // Will be implemented when learn.html is created
    console.log('Learn page initialized');
  }

  initDigitalCitizenshipPage() {
    // Will be implemented when digital-citizenship.html is created
    console.log('Digital Citizenship page initialized');
  }

  initBuildPage() {
    // Will be implemented when build.html is created
    console.log('Build page initialized');
  }

  initGalleryPage() {
    // Will be implemented when gallery.html is created
    console.log('Gallery page initialized');
  }

  initTeacherPage() {
    // Will be implemented when teacher.html is created
    console.log('Teacher page initialized');
  }

  /**
   * Utility Functions
   */
  observeElements(selector, callback) {
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll(selector).forEach(el => {
      observer.observe(el);
    });
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Journal Management
   */
  saveToJournal(entry) {
    this.journal.push({
      ...entry,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    });
    
    localStorage.setItem('journal', JSON.stringify(this.journal));
    
    // Show success message
    window.showToast?.('Saved to journal!', 'success');
  }

  exportJournal() {
    const dataStr = JSON.stringify(this.journal, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `nature-power-journal-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    window.showToast?.('Journal exported successfully!', 'success');
  }

  /**
   * Show error message to user
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">
          <h3>Error</h3>
          <p>${message}</p>
          <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
        </div>
      </div>
    `;
    
    // Add error styles if not already present
    if (!document.querySelector('#error-styles')) {
      const errorStyles = document.createElement('style');
      errorStyles.id = 'error-styles';
      errorStyles.textContent = `
        .error-message {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .error-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .error-text h3 {
          color: #D93025;
          margin-bottom: 0.5rem;
        }
        .error-text p {
          color: #5F6368;
          margin-bottom: 1.5rem;
        }
      `;
      document.head.appendChild(errorStyles);
    }
    
    document.body.appendChild(errorDiv);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.naturePowerApp = new NaturePowerApp();
});

// Global utility functions
window.saveToJournal = (entry) => {
  window.naturePowerApp?.saveToJournal(entry);
};

window.exportJournal = () => {
  window.naturePowerApp?.exportJournal();
};

// Handle page visibility changes (for better performance)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause any running animations or timers
    window.speechSynthesis?.cancel();
  }
});

// Error handling
window.addEventListener('error', (e) => {
  console.error('App error:', e.error);
  window.showToast?.('Something went wrong. Please refresh the page.', 'error');
});

// Service worker registration (for offline support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// --- Progress helper for lesson completion badge (idempotent) ---
window.markLessonComplete = function(id){
  try{
    const progress = JSON.parse(localStorage.getItem('np_progress')||'{"lessonStatus":{},"badges":{},"xp":0"}');
    progress.lessonStatus[id] = 'complete';
    progress.xp = (progress.xp||0) + 10;
    localStorage.setItem('np_progress', JSON.stringify(progress));
  }catch(e){ console.warn('Progress save failed', e); }
};
