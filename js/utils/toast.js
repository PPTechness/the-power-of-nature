/**
 * Toast Notification Utility
 * Provides accessible, user-friendly notifications
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.defaultDuration = 4000;
    this.maxToasts = 5;
    
    this.init();
  }

  init() {
    this.createContainer();
    this.setupStyles();
  }

  createContainer() {
    // Check if container already exists
    this.container = document.getElementById('toastContainer');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(this.container);
    }
  }

  setupStyles() {
    // Add toast-specific styles if not already present
    if (!document.querySelector('#toastStyles')) {
      const style = document.createElement('style');
      style.id = 'toastStyles';
      style.textContent = `
        .read-aloud-btn {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          background: rgba(58, 134, 255, 0.1);
          border: 1px solid var(--color-ocean-blue);
          color: var(--color-ocean-blue);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius);
          font-size: var(--text-xs);
          cursor: pointer;
          transition: all var(--transition-fast);
          z-index: 10;
        }
        
        .read-aloud-btn:hover {
          background: var(--color-ocean-blue);
          color: var(--color-white);
        }
        
        .slider-output.very-cool {
          border-color: var(--color-leaf-green);
          background: rgba(46, 196, 182, 0.1);
        }
        
        .slider-output.cool {
          border-color: var(--color-ocean-blue);
          background: rgba(58, 134, 255, 0.1);
        }
        
        .slider-output.slightly-cool {
          border-color: var(--color-sunrise-yellow);
          background: rgba(255, 200, 87, 0.1);
        }
        
        .shade-slider.high-shade::-webkit-slider-thumb {
          background: var(--color-leaf-green);
        }
        
        .shade-slider.medium-shade::-webkit-slider-thumb {
          background: var(--color-ocean-blue);
        }
        
        .shade-slider.low-shade::-webkit-slider-thumb {
          background: var(--color-sunrise-yellow);
        }
      `;
      document.head.appendChild(style);
    }
  }

  show(message, type = 'info', options = {}) {
    const toastId = this.generateId();
    const toast = this.createToast(toastId, message, type, options);
    
    // Remove excess toasts if we have too many
    this.limitToasts();
    
    // Add toast to container
    this.container.appendChild(toast);
    this.toasts.set(toastId, toast);
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });
    
    // Auto-dismiss after duration
    const duration = options.duration !== undefined ? options.duration : this.defaultDuration;
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toastId);
      }, duration);
    }
    
    return toastId;
  }

  createToast(id, message, type, options) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('data-toast-id', id);
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease-out';

    const icon = this.getIcon(type);
    const title = options.title || this.getDefaultTitle(type);
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">×</button>
      ${options.showProgress !== false ? '<div class="toast-progress"></div>' : ''}
    `;

    // Setup close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.hide(id);
    });

    // Keyboard accessibility
    toast.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide(id);
      }
    });

    return toast;
  }

  hide(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    // Exit animation
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (this.container.contains(toast)) {
        this.container.removeChild(toast);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  hideAll() {
    this.toasts.forEach((toast, id) => {
      this.hide(id);
    });
  }

  limitToasts() {
    if (this.toasts.size >= this.maxToasts) {
      // Remove oldest toast
      const oldestId = this.toasts.keys().next().value;
      this.hide(oldestId);
    }
  }

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  getDefaultTitle(type) {
    const titles = {
      success: 'Success!',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };
    return titles[type] || '';
  }

  generateId() {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for common toast types
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', { ...options, duration: 6000 });
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', { ...options, duration: 5000 });
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  // Method for announcements to screen readers
  announce(message, priority = 'polite') {
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
}

// Initialize toast manager
const toastManager = new ToastManager();

// Global functions for easy access
window.showToast = (message, type, options) => {
  return toastManager.show(message, type, options);
};

window.hideToast = (id) => {
  return toastManager.hide(id);
};

window.hideAllToasts = () => {
  return toastManager.hideAll();
};

// Convenience methods
window.toast = {
  success: (message, options) => toastManager.success(message, options),
  error: (message, options) => toastManager.error(message, options),
  warning: (message, options) => toastManager.warning(message, options),
  info: (message, options) => toastManager.info(message, options),
  announce: (message, priority) => toastManager.announce(message, priority)
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastManager;
}
