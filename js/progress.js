/* =============================================================================
   Progress Model - Track lesson completion, XP, streaks via LocalStorage
   ============================================================================= */

class ProgressManager {
  constructor() {
    this.storageKey = 'np_progress';
    this.defaultProgress = {
      lessonStatus: {},
      xp: 0,
      streak: 0,
      lastVisitISO: new Date().toISOString(),
      badges: {},
      completedLessons: []
    };
    
    // Initialize lesson statuses
    for (let i = 1; i <= 10; i++) {
      this.defaultProgress.lessonStatus[`L${i}`] = i === 1 ? 'inprogress' : 'locked';
    }
  }

  // Get current progress from localStorage
  getProgress() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        this.setProgress(this.defaultProgress);
        return this.defaultProgress;
      }
      
      const progress = JSON.parse(stored);
      
      // Ensure all required fields exist
      return {
        ...this.defaultProgress,
        ...progress,
        lessonStatus: {
          ...this.defaultProgress.lessonStatus,
          ...progress.lessonStatus
        }
      };
    } catch (error) {
      console.error('Error loading progress:', error);
      return this.defaultProgress;
    }
  }

  // Save progress to localStorage
  setProgress(progress) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('progressUpdated', { 
        detail: progress 
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }

  // Set status for a specific lesson
  setLessonStatus(lessonId, status) {
    const progress = this.getProgress();
    progress.lessonStatus[lessonId] = status;
    
    // If completing a lesson, unlock the next one
    if (status === 'complete') {
      const lessonNum = parseInt(lessonId.replace('L', ''));
      const nextLessonId = `L${lessonNum + 1}`;
      
      if (lessonNum < 10 && progress.lessonStatus[nextLessonId] === 'locked') {
        progress.lessonStatus[nextLessonId] = 'inprogress';
      }
      
      // Track completed lessons
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
    }
    
    progress.lastVisitISO = new Date().toISOString();
    return this.setProgress(progress);
  }

  // Complete a lesson (sets status and awards XP)
  completeLesson(lessonId) {
    this.setLessonStatus(lessonId, 'complete');
    this.addXP(50); // Base XP for completing a lesson
    this.updateStreak();
    
    return {
      xpAwarded: 50,
      streakUpdated: this.getProgress().streak
    };
  }

  // Add XP points
  addXP(points) {
    const progress = this.getProgress();
    progress.xp += points;
    progress.lastVisitISO = new Date().toISOString();
    
    this.setProgress(progress);
    
    // Show XP notification
    this.showXPNotification(points);
    
    return progress.xp;
  }

  // Update streak based on weekly visits
  updateStreak() {
    const progress = this.getProgress();
    const lastVisit = new Date(progress.lastVisitISO);
    const now = new Date();
    
    // Calculate week difference
    const weekDiff = Math.floor((now - lastVisit) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekDiff === 0) {
      // Same week, no change
      return progress.streak;
    } else if (weekDiff === 1) {
      // Next week, increment streak
      progress.streak += 1;
      this.addXP(10); // Bonus XP for streak
    } else {
      // Missed weeks, reset streak
      progress.streak = 1;
    }
    
    progress.lastVisitISO = now.toISOString();
    this.setProgress(progress);
    
    return progress.streak;
  }

  // Award a badge
  awardBadge(badgeId) {
    const progress = this.getProgress();
    
    if (!progress.badges[badgeId]) {
      progress.badges[badgeId] = Date.now();
      progress.lastVisitISO = new Date().toISOString();
      
      this.setProgress(progress);
      this.showBadgeNotification(badgeId);
      
      return true; // Badge was newly awarded
    }
    
    return false; // Badge already existed
  }

  // Check if all lessons are complete
  allComplete() {
    const progress = this.getProgress();
    return progress.completedLessons.length === 10;
  }

  // Get lesson progress summary
  getLessonProgress() {
    const progress = this.getProgress();
    const total = 10;
    const completed = progress.completedLessons.length;
    const percentage = Math.round((completed / total) * 100);
    
    return {
      completed,
      total,
      percentage,
      current: this.getCurrentLesson()
    };
  }

  // Get current active lesson
  getCurrentLesson() {
    const progress = this.getProgress();
    
    for (let i = 1; i <= 10; i++) {
      const lessonId = `L${i}`;
      if (progress.lessonStatus[lessonId] === 'inprogress') {
        return lessonId;
      }
    }
    
    // If no lesson is in progress, check for first incomplete
    for (let i = 1; i <= 10; i++) {
      const lessonId = `L${i}`;
      if (progress.lessonStatus[lessonId] !== 'complete') {
        return lessonId;
      }
    }
    
    return 'L10'; // All complete, return last lesson
  }

  // Get badge status
  getBadgeStatus(badgeId) {
    const progress = this.getProgress();
    return progress.badges[badgeId] ? 'earned' : 'locked';
  }

  // Get all earned badges
  getEarnedBadges() {
    const progress = this.getProgress();
    return Object.keys(progress.badges);
  }

  // Reset all progress (for testing)
  reset() {
    localStorage.removeItem(this.storageKey);
    const fresh = this.getProgress();
    window.dispatchEvent(new CustomEvent('progressReset'));
    return fresh;
  }

  // Export progress data
  exportData() {
    const progress = this.getProgress();
    const blob = new Blob([JSON.stringify(progress, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nature-power-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Show XP notification
  showXPNotification(points) {
    const notification = document.createElement('div');
    notification.className = 'xp-notification';
    notification.innerHTML = `
      <div class="xp-content">
        <span class="xp-icon">⭐</span>
        <span class="xp-text">+${points} XP</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate and remove
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  }

  // Show badge notification
  showBadgeNotification(badgeId) {
    // This will be implemented when badges.js is loaded
    window.dispatchEvent(new CustomEvent('badgeEarned', { 
      detail: { badgeId } 
    }));
  }

  // Get progress statistics
  getStats() {
    const progress = this.getProgress();
    const lessonProgress = this.getLessonProgress();
    
    return {
      xp: progress.xp,
      streak: progress.streak,
      badges: Object.keys(progress.badges).length,
      lessons: lessonProgress,
      lastVisit: progress.lastVisitISO
    };
  }
}

// Create global instance
window.progressManager = new ProgressManager();

// Convenience functions for backwards compatibility
function getProgress() {
  return window.progressManager.getProgress();
}

function setLessonStatus(lessonId, status) {
  return window.progressManager.setLessonStatus(lessonId, status);
}

function completeLesson(lessonId) {
  return window.progressManager.completeLesson(lessonId);
}

function addXP(points) {
  return window.progressManager.addXP(points);
}

function awardBadge(badgeId) {
  return window.progressManager.awardBadge(badgeId);
}

function allComplete() {
  return window.progressManager.allComplete();
}

// CSS for XP notifications
const xpNotificationCSS = `
.xp-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, var(--accent), #FFB020);
  color: var(--ink);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  transform: translateX(100%);
  transition: transform var(--duration-normal) var(--ease-out);
  font-weight: 600;
}

.xp-notification.show {
  transform: translateX(0);
}

.xp-notification.hide {
  transform: translateX(100%);
}

.xp-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.xp-icon {
  font-size: var(--text-lg);
  animation: sparkle 0.6s ease-out;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = xpNotificationCSS;
document.head.appendChild(styleSheet);
