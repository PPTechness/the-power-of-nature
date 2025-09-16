/* =============================================================================
   Journal Model - Create, store, and export journal entries
   ============================================================================= */

class JournalManager {
  constructor() {
    this.storageKey = 'np_journal';
  }

  // Create a new journal entry
  createEntry(data) {
    const entry = {
      id: `${data.lessonId}-${new Date().toISOString()}`,
      lessonId: data.lessonId,
      title: data.title,
      facts: data.facts || [],
      reflection: data.reflection || '',
      evidenceImg: data.evidenceImg || null,
      timestamp: Date.now(),
      ...data // Allow additional fields
    };

    this.saveEntry(entry);
    return entry;
  }

  // Save an entry to localStorage
  saveEntry(entry) {
    try {
      const entries = this.getEntries();
      
      // Check if entry already exists (update scenario)
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('journalUpdated', { 
        detail: { entry, action: existingIndex >= 0 ? 'updated' : 'created' }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return false;
    }
  }

  // Get all journal entries
  getEntries() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  }

  // Get entries for a specific lesson
  getByLesson(lessonId) {
    return this.getEntries().filter(entry => entry.lessonId === lessonId);
  }

  // Get latest entry for a lesson
  getLatestForLesson(lessonId) {
    const entries = this.getByLesson(lessonId);
    return entries.length > 0 ? entries[entries.length - 1] : null;
  }

  // Delete an entry
  deleteEntry(entryId) {
    try {
      const entries = this.getEntries();
      const filtered = entries.filter(entry => entry.id !== entryId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      
      window.dispatchEvent(new CustomEvent('journalUpdated', { 
        detail: { entryId, action: 'deleted' }
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return false;
    }
  }

  // Export entries as JSON
  exportJSON() {
    const entries = this.getEntries();
    const data = {
      exported: new Date().toISOString(),
      course: 'Y4 Harness the Power of Nature',
      entries: entries
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nature-power-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    return data;
  }

  // Export entries as CSV
  exportCSV() {
    const entries = this.getEntries();
    
    if (entries.length === 0) {
      alert('No journal entries to export');
      return;
    }
    
    // CSV headers
    const headers = [
      'Lesson ID',
      'Lesson Title', 
      'Date',
      'Facts',
      'Reflection',
      'Has Evidence'
    ];
    
    // Convert entries to CSV rows
    const rows = entries.map(entry => [
      entry.lessonId,
      `"${entry.title}"`,
      new Date(entry.timestamp).toLocaleDateString(),
      `"${Array.isArray(entry.facts) ? entry.facts.join('; ') : entry.facts || ''}"`,
      `"${entry.reflection || ''}"`,
      entry.evidenceImg ? 'Yes' : 'No'
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nature-power-journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    return csvContent;
  }

  // Get journal statistics
  getStats() {
    const entries = this.getEntries();
    const lessons = [...new Set(entries.map(e => e.lessonId))];
    const withEvidence = entries.filter(e => e.evidenceImg).length;
    
    return {
      totalEntries: entries.length,
      lessonsWithEntries: lessons.length,
      entriesWithEvidence: withEvidence,
      latestEntry: entries.length > 0 ? entries[entries.length - 1] : null
    };
  }

  // Create quick entry (for widgets)
  quickSave(lessonId, title, data) {
    const entry = this.createEntry({
      lessonId,
      title,
      facts: data.facts || [],
      reflection: data.reflection || data.observation || '',
      evidenceImg: data.screenshot || null,
      widgetData: data
    });
    
    // Show success notification
    this.showSaveNotification();
    
    return entry;
  }

  // Capture screenshot for evidence
  async captureScreenshot(element) {
    try {
      // Use html2canvas if available
      if (window.html2canvas) {
        const canvas = await html2canvas(element);
        return canvas.toDataURL('image/png');
      }
      
      // Fallback: prompt user to take screenshot
      return prompt('Please take a screenshot and paste the data URL here (optional):') || null;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  }

  // Show save notification
  showSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'journal-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">📝</span>
        <span class="notification-text">Saved to Journal!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate and remove
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2500);
  }

  // Clear all entries (for testing)
  clear() {
    localStorage.removeItem(this.storageKey);
    window.dispatchEvent(new CustomEvent('journalCleared'));
    return true;
  }

  // Import entries from JSON
  importJSON(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const entries = data.entries || data;
      
      if (!Array.isArray(entries)) {
        throw new Error('Invalid journal data format');
      }
      
      // Validate entries
      const validEntries = entries.filter(entry => 
        entry.lessonId && entry.title && entry.timestamp
      );
      
      if (validEntries.length === 0) {
        throw new Error('No valid entries found');
      }
      
      // Save entries
      localStorage.setItem(this.storageKey, JSON.stringify(validEntries));
      
      window.dispatchEvent(new CustomEvent('journalImported', { 
        detail: { count: validEntries.length }
      }));
      
      return validEntries.length;
    } catch (error) {
      console.error('Error importing journal:', error);
      throw error;
    }
  }
}

// Create global instance
window.journalManager = new JournalManager();

// Convenience functions for backwards compatibility
function saveEntry(entry) {
  return window.journalManager.saveEntry(entry);
}

function getEntries() {
  return window.journalManager.getEntries();
}

function getByLesson(lessonId) {
  return window.journalManager.getByLesson(lessonId);
}

function exportJSON() {
  return window.journalManager.exportJSON();
}

function exportCSV() {
  return window.journalManager.exportCSV();
}

// CSS for journal notifications
const journalNotificationCSS = `
.journal-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, var(--success), #20B2AA);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  transform: translateX(100%);
  transition: transform var(--duration-normal) var(--ease-out);
  font-weight: 600;
}

.journal-notification.show {
  transform: translateX(0);
}

.journal-notification.hide {
  transform: translateX(100%);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.notification-icon {
  font-size: var(--text-lg);
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
`;

// Inject CSS
const journalStyleSheet = document.createElement('style');
journalStyleSheet.textContent = journalNotificationCSS;
document.head.appendChild(journalStyleSheet);
