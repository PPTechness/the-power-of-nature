/* =============================================================================
   Learn Page - 10 Lesson Management with Progress Tracking
   ============================================================================= */

class LearnPage {
  constructor() {
    this.lessons = null;
    this.currentLesson = null;
    this.widgets = {};
    
    this.init();
  }

  async init() {
    try {
      await this.loadLessons();
      this.renderProgressBar();
      this.renderLessons();
      this.updateStats();
      this.setupEventListeners();
      
      // Listen for progress updates
      window.addEventListener('progressUpdated', () => {
        this.renderProgressBar();
        this.renderLessons();
        this.updateStats();
      });
      
    } catch (error) {
      console.error('Error initializing learn page:', error);
      this.showError('Failed to load lesson data. Please refresh the page.');
    }
  }

  async loadLessons() {
    try {
      const response = await fetch('/data/lessons.json');
      this.lessons = await response.json();
      return this.lessons;
    } catch (error) {
      console.error('Error loading lessons:', error);
      throw error;
    }
  }

  renderProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar || !this.lessons) return;

    const progress = window.progressManager.getProgress();
    
    const segmentsHTML = this.lessons.lessons.map((lesson, index) => {
      const status = progress.lessonStatus[lesson.id] || 'locked';
      const number = index + 1;
      
      return `
        <button class="progress-segment ${status}" 
                data-lesson-id="${lesson.id}"
                title="${lesson.title}"
                aria-label="Lesson ${number}: ${lesson.title}">
          ${status === 'complete' ? '✓' : number}
        </button>
      `;
    }).join('');

    progressBar.innerHTML = segmentsHTML;

    // Add click handlers
    progressBar.querySelectorAll('.progress-segment').forEach(segment => {
      segment.addEventListener('click', (e) => {
        const lessonId = e.target.dataset.lessonId;
        this.scrollToLesson(lessonId);
      });
    });
  }

  renderLessons() {
    const container = document.getElementById('lessonsContainer');
    if (!container || !this.lessons) return;

    const progress = window.progressManager.getProgress();
    
    const lessonsHTML = this.lessons.lessons.map((lesson, index) => {
      const status = progress.lessonStatus[lesson.id] || 'locked';
      const isLocked = status === 'locked';
      const isComplete = status === 'complete';
      const badge = window.badgeManager ? window.badgeManager.getBadge(lesson.badge) : null;
      
      return `
        <article class="card lesson-card ${status}" id="${lesson.id}" data-lesson-id="${lesson.id}">
          <div class="card-content">
            <div class="lesson-header">
              <div class="lesson-number ${status}">
                ${isComplete ? '' : index + 1}
              </div>
              <div class="lesson-meta">
                <h2 class="lesson-title">${lesson.title}</h2>
                <div class="lesson-time">
                  <span>⏱️</span>
                  <span>${lesson.time_minutes} minutes</span>
                </div>
                <div class="milestone-icons">
                  <div class="milestone-icon ${lesson.online.includes('weatherExplorer') || lesson.online.includes('houseGallery') || lesson.online.includes('singaporeTour') || lesson.online.includes('platesMap') ? 'active' : ''}">🌍</div>
                  <div class="milestone-icon ${lesson.online.includes('circuits') || lesson.online.includes('designTester') || lesson.online.includes('renewablesArcade') ? 'active' : ''}">🔬</div>
                  <div class="milestone-icon ${lesson.online.includes('posterMaker') ? 'active' : ''}">🛠️</div>
                </div>
              </div>
              <div class="lesson-status">
                <span class="status-badge ${status}">
                  ${status === 'locked' ? '🔒 Locked' : 
                    status === 'inprogress' ? '▶️ In Progress' : 
                    status === 'complete' ? '✅ Complete' : status}
                </span>
              </div>
            </div>

            <div class="lesson-intention">
              <strong>Learning intention:</strong> ${lesson.learning_intention}
            </div>

            <div class="lesson-knowledge">
              <h4>Sticky knowledge:</h4>
              <ul class="knowledge-list">
                ${lesson.sticky_knowledge.map(knowledge => 
                  `<li>${knowledge}</li>`
                ).join('')}
              </ul>
            </div>

            <div class="lesson-activities">
              <div class="activity-group">
                <h4>🖥️ Online</h4>
                <ul class="activity-list">
                  ${lesson.online.map(activity => 
                    `<li>${this.getWidgetDisplayName(activity)}</li>`
                  ).join('')}
                </ul>
              </div>
              <div class="activity-group">
                <h4>📝 Offline</h4>
                <ul class="activity-list">
                  ${lesson.offline.map(activity => 
                    `<li>${activity}</li>`
                  ).join('')}
                </ul>
              </div>
            </div>

            <div class="lesson-checkin">
              <h4>💬 Teacher check-in:</h4>
              <p>${lesson.check_in}</p>
            </div>

            <div class="lesson-actions">
              ${!isLocked ? `
                <button class="btn btn-primary" 
                        onclick="learnPage.startLesson('${lesson.id}')"
                        ${isComplete ? 'disabled' : ''}>
                  ${isComplete ? 'Lesson Complete' : 
                    status === 'inprogress' ? 'Resume Lesson' : 'Start Lesson'}
                </button>
              ` : `
                <button class="btn btn-primary" disabled>
                  🔒 Complete previous lessons first
                </button>
              `}
              
              ${isComplete && badge ? `
                <div class="badge-display">
                  <span class="badge-icon">${badge.icon}</span>
                  <span class="badge-title">${badge.title}</span>
                </div>
              ` : ''}
              
              ${!isLocked && !isComplete ? `
                <button class="btn btn-success" 
                        onclick="learnPage.completeLesson('${lesson.id}')"
                        id="complete-${lesson.id}">
                  Mark lesson complete
                </button>
              ` : ''}
            </div>

            ${isComplete ? `
              <div class="lesson-completion">
                <p>✅ <strong>Assessment:</strong> ${lesson.assessment_prompt}</p>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = lessonsHTML;
  }

  getWidgetDisplayName(widgetId) {
    const names = {
      'weatherExplorer': 'Weather & Climate Explorer',
      'houseGallery': 'Homes Around the World',
      'circuits': 'Circuit Builder',
      'singaporeTour': 'Singapore Sustainability Tour',
      'renewablesArcade': 'Renewable Energy Arcade',
      'platesMap': 'Earthquake & Plates Map',
      'designTester': 'Design Tester',
      'posterMaker': 'Poster Maker'
    };
    return names[widgetId] || widgetId;
  }

  scrollToLesson(lessonId) {
    const element = document.getElementById(lessonId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Highlight briefly
      element.style.outline = '3px solid var(--primary)';
      setTimeout(() => {
        element.style.outline = '';
      }, 2000);
    }
  }

  startLesson(lessonId) {
    const lesson = this.lessons.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    // Set lesson as in progress
    window.progressManager.setLessonStatus(lessonId, 'inprogress');
    
    // Add 10 XP for starting a lesson
    window.progressManager.addXP(10);
    
    // Open lesson modal or scroll to lesson
    this.openLessonModal(lesson);
    
    this.showToast('Lesson started! Good luck! 🚀', 'success');
  }

  completeLesson(lessonId) {
    const lesson = this.lessons.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    // Show confirmation
    if (!confirm(`Mark "${lesson.title}" as complete?\n\nThis will award you a badge and 50 XP!`)) {
      return;
    }

    // Complete the lesson
    const result = window.progressManager.completeLesson(lessonId);
    
    // Award the badge
    window.progressManager.awardBadge(lesson.badge);
    
    // Create journal entry
    window.journalManager.createEntry({
      lessonId: lessonId,
      title: lesson.title,
      facts: ['Lesson completed successfully'],
      reflection: `Completed: ${lesson.learning_intention}`
    });
    
    this.showToast(`🎉 Lesson complete! Badge earned and +${result.xpAwarded} XP!`, 'success');
    
    // Update display
    this.renderProgressBar();
    this.renderLessons();
    this.updateStats();
  }

  openLessonModal(lesson) {
    const modal = document.getElementById('lessonModal');
    const title = document.getElementById('modalLessonTitle');
    const content = document.getElementById('modalLessonContent');
    
    if (!modal || !title || !content) return;

    title.textContent = lesson.title;
    
    // Create lesson content
    content.innerHTML = `
      <div class="lesson-modal-content">
        <div class="lesson-intention">
          <h3>Learning Intention</h3>
          <p>${lesson.learning_intention}</p>
        </div>
        
        <div class="sticky-knowledge">
          <h3>Key Knowledge</h3>
          <ul>
            ${lesson.sticky_knowledge.map(knowledge => 
              `<li>${knowledge}</li>`
            ).join('')}
          </ul>
        </div>
        
        <div class="lesson-widgets">
          <h3>Interactive Activities</h3>
          ${lesson.online.map(widgetId => `
            <div class="widget-container" id="widget-${widgetId}">
              <div class="widget-header">
                <h4>${this.getWidgetDisplayName(widgetId)}</h4>
                <button class="btn btn-sm btn-primary" onclick="learnPage.loadWidget('${widgetId}')">
                  Load Activity
                </button>
              </div>
              <div class="widget-content" id="content-${widgetId}">
                Click "Load Activity" to start this interactive exercise.
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="offline-activities">
          <h3>Offline Activities</h3>
          <ul>
            ${lesson.offline.map(activity => 
              `<li>${activity}</li>`
            ).join('')}
          </ul>
        </div>
        
        <div class="teacher-checkin">
          <h3>Teacher Check-in</h3>
          <p>${lesson.check_in}</p>
        </div>
        
        <div class="lesson-actions">
          <button class="btn btn-success" onclick="learnPage.completeLesson('${lesson.id}')">
            Mark lesson complete
          </button>
          <button class="btn btn-ghost" onclick="learnPage.closeLessonModal()">
            Close
          </button>
        </div>
      </div>
    `;
    
    modal.classList.add('active');
    this.currentLesson = lesson;
  }

  closeLessonModal() {
    const modal = document.getElementById('lessonModal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.currentLesson = null;
  }

  loadWidget(widgetId) {
    const container = document.getElementById(`content-${widgetId}`);
    if (!container) return;

    // Show loading state
    container.innerHTML = `
      <div class="widget-loading">
        <div class="loading-spinner"></div>
        <p>Loading ${this.getWidgetDisplayName(widgetId)}...</p>
      </div>
    `;

    // Simulate widget loading (replace with actual widget initialization)
    setTimeout(() => {
      container.innerHTML = `
        <div class="widget-placeholder">
          <h4>${this.getWidgetDisplayName(widgetId)}</h4>
          <p>This widget will be fully implemented in the next phase.</p>
          <button class="btn btn-accent" onclick="learnPage.saveToJournal('${widgetId}')">
            Save to Journal
          </button>
        </div>
      `;
    }, 1000);
  }

  saveToJournal(widgetId) {
    if (!this.currentLesson) return;

    window.journalManager.quickSave(
      this.currentLesson.id,
      this.currentLesson.title,
      {
        facts: [`Completed ${this.getWidgetDisplayName(widgetId)} activity`],
        reflection: 'Activity completed successfully',
        widgetId: widgetId
      }
    );

    // Add XP for saving to journal
    window.progressManager.addXP(10);
    
    this.updateStats();
  }

  updateStats() {
    // Update XP display
    const xpDisplay = document.getElementById('xpDisplay');
    if (xpDisplay) {
      const progress = window.progressManager.getProgress();
      xpDisplay.textContent = progress.xp;
    }

    // Update streak display
    const streakDisplay = document.getElementById('streakDisplay');
    if (streakDisplay) {
      const progress = window.progressManager.getProgress();
      streakDisplay.textContent = progress.streak;
    }

    // Update lesson stats
    const completedDisplay = document.getElementById('completedLessons');
    if (completedDisplay) {
      const progress = window.progressManager.getProgress();
      completedDisplay.textContent = progress.completedLessons.length;
    }

    // Update badge stats
    const badgesDisplay = document.getElementById('earnedBadges');
    if (badgesDisplay) {
      const progress = window.progressManager.getProgress();
      badgesDisplay.textContent = Object.keys(progress.badges || {}).length;
    }

    // Update journal stats
    const journalDisplay = document.getElementById('journalEntries');
    if (journalDisplay) {
      const entries = window.journalManager.getEntries();
      journalDisplay.textContent = entries.length;
    }
  }

  setupEventListeners() {
    // Modal close button
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeLessonModal());
    }

    // Close modal on backdrop click
    const modal = document.getElementById('lessonModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeLessonModal();
        }
      });
    }

    // Profile button
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        window.location.href = '/profile.html';
      });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentLesson) {
        this.closeLessonModal();
      }
    });
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-icon">
          ${type === 'success' ? '✅' : 
            type === 'error' ? '❌' : 
            type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div class="toast-message">
          <div class="toast-text">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
      </div>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto hide after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      });
    }
  }

  showError(message) {
    this.showToast(message, 'error');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.learnPage = new LearnPage();
});

// CSS for loading states
const learnPageCSS = `
.widget-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.widget-placeholder {
  text-align: center;
  padding: var(--space-6);
  background: var(--bg-soft);
  border-radius: var(--radius-sm);
  border: 2px dashed #D1D5DB;
}

.lesson-completion {
  background: rgba(46, 196, 182, 0.1);
  border-left: 4px solid var(--success);
  padding: var(--space-4);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-top: var(--space-4);
}
`;

// Inject CSS
const learnStyleSheet = document.createElement('style');
learnStyleSheet.textContent = learnPageCSS;
document.head.appendChild(learnStyleSheet);
