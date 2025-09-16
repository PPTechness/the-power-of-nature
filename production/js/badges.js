/* =============================================================================
   Badges System - Award, render, and manage achievement badges
   ============================================================================= */

class BadgeManager {
  constructor() {
    this.badges = null;
    this.loadBadges();
  }

  // Load badge definitions from data/badges.json
  async loadBadges() {
    try {
      const response = await fetch('/data/badges.json');
      this.badges = await response.json();
      return this.badges;
    } catch (error) {
      console.error('Error loading badges:', error);
      // Fallback badge data
      this.badges = {
        badges: [
          { id: "B1_nature_detective", title: "Nature Detective", icon: "🧭", caption: "I can compare places and spot patterns." }
        ]
      };
    }
  }

  // Get badge by ID
  getBadge(badgeId) {
    if (!this.badges) return null;
    return this.badges.badges.find(badge => badge.id === badgeId);
  }

  // Get all badges
  getAllBadges() {
    return this.badges ? this.badges.badges : [];
  }

  // Render badge grid for profile page
  renderBadgeGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.badges) return;

    const progress = window.progressManager.getProgress();
    const earnedBadges = progress.badges || {};

    const badgeHTML = this.badges.badges.map(badge => {
      const isEarned = earnedBadges[badge.id];
      const earnedDate = isEarned ? new Date(earnedBadges[badge.id]).toLocaleDateString() : null;
      
      return `
        <div class="badge-slot ${isEarned ? 'earned' : 'locked'}" 
             data-badge-id="${badge.id}"
             title="${badge.caption}${earnedDate ? ' - Earned: ' + earnedDate : ''}">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-title">${badge.title}</div>
          ${isEarned ? '<div class="badge-check">✓</div>' : ''}
          ${!isEarned ? '<div class="badge-lock">🔒</div>' : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="badge-grid">
        ${badgeHTML}
      </div>
    `;
  }

  // Render single badge (for lesson completion)
  renderBadge(badgeId, className = '') {
    const badge = this.getBadge(badgeId);
    if (!badge) return '';

    return `
      <div class="badge-display ${className}" data-badge-id="${badgeId}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-info">
          <div class="badge-title">${badge.title}</div>
          <div class="badge-caption">${badge.caption}</div>
        </div>
      </div>
    `;
  }

  // Show badge earned notification
  showBadgeEarned(badgeId) {
    const badge = this.getBadge(badgeId);
    if (!badge) return;

    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <div class="badge-notification-content">
        <div class="badge-celebration">🎉</div>
        <div class="badge-earned">
          <div class="badge-icon-large">${badge.icon}</div>
          <div class="badge-info">
            <div class="badge-title">${badge.title}</div>
            <div class="badge-caption">${badge.caption}</div>
          </div>
        </div>
        <div class="badge-success-text">Badge Earned!</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 4000);

    // Add click to close
    notification.addEventListener('click', () => {
      notification.classList.add('hide');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    });
  }

  // Get badge progress statistics
  getBadgeStats() {
    if (!this.badges) return { total: 0, earned: 0, percentage: 0 };

    const progress = window.progressManager.getProgress();
    const earnedCount = Object.keys(progress.badges || {}).length;
    const totalCount = this.badges.badges.length;

    return {
      earned: earnedCount,
      total: totalCount,
      percentage: Math.round((earnedCount / totalCount) * 100)
    };
  }

  // Get next badge to earn
  getNextBadge() {
    if (!this.badges) return null;

    const progress = window.progressManager.getProgress();
    const earnedBadges = progress.badges || {};

    return this.badges.badges.find(badge => !earnedBadges[badge.id]);
  }

  // Check if badge is earned
  isBadgeEarned(badgeId) {
    const progress = window.progressManager.getProgress();
    return !!(progress.badges && progress.badges[badgeId]);
  }
}

// Create global instance
window.badgeManager = new BadgeManager();

// Listen for badge earned events
window.addEventListener('badgeEarned', (event) => {
  const { badgeId } = event.detail;
  window.badgeManager.showBadgeEarned(badgeId);
});

// CSS for badge system
const badgeCSS = `
/* Badge Grid */
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-4);
  padding: var(--space-4);
}

.badge-slot {
  aspect-ratio: 1;
  background: var(--bg-soft);
  border: 2px solid #E5E7EB;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3);
  text-align: center;
  position: relative;
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
}

.badge-slot.earned {
  background: linear-gradient(135deg, var(--success), #10B981);
  color: white;
  border-color: var(--success);
  box-shadow: var(--shadow);
  transform: scale(1);
}

.badge-slot.earned:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

.badge-slot.locked {
  opacity: 0.5;
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.badge-icon {
  font-size: 2rem;
  margin-bottom: var(--space-2);
}

.badge-title {
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.2;
}

.badge-check {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  background: white;
  color: var(--success);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: 700;
}

.badge-lock {
  position: absolute;
  bottom: var(--space-1);
  right: var(--space-1);
  font-size: var(--text-sm);
  opacity: 0.6;
}

/* Badge Display (single badge) */
.badge-display {
  background: var(--bg);
  border: 1px solid #E5E7EB;
  border-radius: var(--radius);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.badge-display:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow);
}

.badge-display .badge-icon {
  font-size: 1.5rem;
  margin: 0;
}

.badge-info .badge-title {
  font-size: var(--text-base);
  margin-bottom: var(--space-1);
}

.badge-caption {
  font-size: var(--text-sm);
  color: var(--muted);
}

/* Badge Notification */
.badge-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  padding: var(--space-8);
  text-align: center;
  max-width: 400px;
  opacity: 0;
  transition: all var(--duration-slow) var(--ease-out);
  cursor: pointer;
}

.badge-notification.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.badge-notification.hide {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.badge-celebration {
  font-size: 3rem;
  margin-bottom: var(--space-4);
  animation: celebrate 0.8s ease-out;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2) rotate(-5deg); }
  75% { transform: scale(1.2) rotate(5deg); }
}

.badge-earned {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-soft);
  border-radius: var(--radius);
}

.badge-icon-large {
  font-size: 3rem;
}

.badge-earned .badge-title {
  font-size: var(--text-xl);
  color: var(--ink);
  margin-bottom: var(--space-1);
}

.badge-earned .badge-caption {
  font-size: var(--text-base);
  color: var(--muted);
}

.badge-success-text {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--success);
  margin-bottom: var(--space-2);
}

/* Badge notification backdrop */
.badge-notification::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .badge-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--space-3);
  }
  
  .badge-notification {
    margin: var(--space-4);
    max-width: calc(100vw - var(--space-8));
    padding: var(--space-6);
  }
  
  .badge-earned {
    flex-direction: column;
    text-align: center;
  }
  
  .badge-icon-large {
    font-size: 2.5rem;
  }
}
`;

// Inject CSS
const badgeStyleSheet = document.createElement('style');
badgeStyleSheet.textContent = badgeCSS;
document.head.appendChild(badgeStyleSheet);
