/**
 * Journal Management Utility
 * Handles saving, retrieving, and exporting learning journal entries
 */

class Journal {
  constructor() {
    this.storageKey = 'nature_power_journal';
    this.entries = this.loadEntries();
    this.maxEntries = 1000; // Prevent excessive storage usage
    
    this.init();
  }

  init() {
    // Set up periodic auto-save
    this.setupAutoSave();
    
    // Set up storage event listener for multi-tab sync
    this.setupStorageSync();
  }

  /**
   * Load journal entries from localStorage
   */
  loadEntries() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  }

  /**
   * Save entries to localStorage
   */
  saveEntries() {
    try {
      // Limit entries to prevent storage overflow
      if (this.entries.length > this.maxEntries) {
        this.entries = this.entries.slice(-this.maxEntries);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
      return true;
    } catch (error) {
      console.error('Error saving journal entries:', error);
      
      // Handle storage quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.handleStorageFull();
      }
      return false;
    }
  }

  /**
   * Add a new entry to the journal
   */
  addEntry(entry) {
    const journalEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: entry.type || 'general',
      step: entry.step || 'unknown',
      content: entry.content || '',
      data: entry.data || {},
      tags: entry.tags || [],
      ...entry
    };

    this.entries.push(journalEntry);
    
    if (this.saveEntries()) {
      this.notifyEntryAdded(journalEntry);
      return journalEntry;
    }
    
    return null;
  }

  /**
   * Get entries by type
   */
  getEntriesByType(type) {
    return this.entries.filter(entry => entry.type === type);
  }

  /**
   * Get entries by step
   */
  getEntriesByStep(step) {
    return this.entries.filter(entry => entry.step === step);
  }

  /**
   * Get entries by tag
   */
  getEntriesByTag(tag) {
    return this.entries.filter(entry => 
      entry.tags && entry.tags.includes(tag)
    );
  }

  /**
   * Get recent entries
   */
  getRecentEntries(limit = 10) {
    return this.entries
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Search entries
   */
  searchEntries(query) {
    const lowercaseQuery = query.toLowerCase();
    
    return this.entries.filter(entry => {
      return (
        entry.content.toLowerCase().includes(lowercaseQuery) ||
        entry.type.toLowerCase().includes(lowercaseQuery) ||
        entry.step.toLowerCase().includes(lowercaseQuery) ||
        (entry.tags && entry.tags.some(tag => 
          tag.toLowerCase().includes(lowercaseQuery)
        ))
      );
    });
  }

  /**
   * Delete an entry
   */
  deleteEntry(id) {
    const index = this.entries.findIndex(entry => entry.id === id);
    if (index > -1) {
      const deleted = this.entries.splice(index, 1)[0];
      this.saveEntries();
      return deleted;
    }
    return null;
  }

  /**
   * Update an entry
   */
  updateEntry(id, updates) {
    const index = this.entries.findIndex(entry => entry.id === id);
    if (index > -1) {
      this.entries[index] = {
        ...this.entries[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveEntries();
      return this.entries[index];
    }
    return null;
  }

  /**
   * Clear all entries
   */
  clearAll() {
    this.entries = [];
    this.saveEntries();
    
    if (window.showToast) {
      window.showToast('Journal cleared', 'info');
    }
  }

  /**
   * Export journal as JSON
   */
  exportJSON() {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalEntries: this.entries.length,
      entries: this.entries
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    this.downloadFile(
      dataBlob, 
      `nature-power-journal-${this.formatDate(new Date())}.json`
    );
  }

  /**
   * Export journal as CSV
   */
  exportCSV() {
    const headers = ['ID', 'Date', 'Time', 'Type', 'Step', 'Content', 'Tags'];
    const csvContent = [headers.join(',')];

    this.entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const row = [
        entry.id,
        this.formatDate(date),
        this.formatTime(date),
        this.escapeCsvValue(entry.type),
        this.escapeCsvValue(entry.step),
        this.escapeCsvValue(entry.content),
        this.escapeCsvValue((entry.tags || []).join('; '))
      ];
      csvContent.push(row.join(','));
    });

    const csvBlob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    this.downloadFile(
      csvBlob, 
      `nature-power-journal-${this.formatDate(new Date())}.csv`
    );
  }

  /**
   * Export as ZIP with images and JSON
   */
  async exportZIP() {
    // This would require a ZIP library like JSZip
    // For now, we'll just export JSON and notify about images
    this.exportJSON();
    
    if (window.showToast) {
      window.showToast(
        'Journal exported as JSON. Screenshots are saved separately in your browser downloads.',
        'info',
        { duration: 6000 }
      );
    }
  }

  /**
   * Import journal from file
   */
  async importFromFile(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.entries && Array.isArray(data.entries)) {
        // Merge with existing entries, avoiding duplicates
        const existingIds = new Set(this.entries.map(e => e.id));
        const newEntries = data.entries.filter(e => !existingIds.has(e.id));
        
        this.entries.push(...newEntries);
        this.saveEntries();
        
        if (window.showToast) {
          window.showToast(
            `Imported ${newEntries.length} new journal entries`,
            'success'
          );
        }
        
        return newEntries.length;
      } else {
        throw new Error('Invalid journal file format');
      }
    } catch (error) {
      console.error('Import error:', error);
      
      if (window.showToast) {
        window.showToast('Error importing journal file', 'error');
      }
      
      throw error;
    }
  }

  /**
   * Get journal statistics
   */
  getStats() {
    const stats = {
      totalEntries: this.entries.length,
      entriesByType: {},
      entriesByStep: {},
      dateRange: null,
      totalDays: 0
    };

    if (this.entries.length > 0) {
      // Count by type
      this.entries.forEach(entry => {
        stats.entriesByType[entry.type] = (stats.entriesByType[entry.type] || 0) + 1;
        stats.entriesByStep[entry.step] = (stats.entriesByStep[entry.step] || 0) + 1;
      });

      // Date range
      const dates = this.entries.map(e => new Date(e.timestamp)).sort();
      stats.dateRange = {
        start: dates[0],
        end: dates[dates.length - 1]
      };
      
      stats.totalDays = Math.ceil(
        (stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)
      ) + 1;
    }

    return stats;
  }

  /**
   * Private utility methods
   */
  generateId() {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  formatTime(date) {
    return date.toISOString().split('T')[1].split('.')[0];
  }

  escapeCsvValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    
    // Escape quotes and wrap in quotes if necessary
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    if (window.showToast) {
      window.showToast(`Journal exported as ${filename}`, 'success');
    }
  }

  notifyEntryAdded(entry) {
    // Dispatch custom event for other components to listen to
    document.dispatchEvent(new CustomEvent('journalEntryAdded', {
      detail: entry
    }));
  }

  handleStorageFull() {
    // Remove oldest entries to make space
    const entriesToRemove = Math.ceil(this.entries.length * 0.2); // Remove 20%
    this.entries.splice(0, entriesToRemove);
    
    if (window.showToast) {
      window.showToast(
        `Storage full. Removed ${entriesToRemove} old entries.`,
        'warning'
      );
    }
  }

  setupAutoSave() {
    // Save periodically (every 5 minutes) if there are unsaved changes
    setInterval(() => {
      // In a more complex app, we'd track dirty state
      // For now, just ensure data is saved
      this.saveEntries();
    }, 5 * 60 * 1000);
  }

  setupStorageSync() {
    // Listen for storage changes in other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.entries = this.loadEntries();
        document.dispatchEvent(new CustomEvent('journalSyncUpdate'));
      }
    });
  }
}

// Initialize journal
const journal = new Journal();

// Global functions for easy access
window.saveToJournal = (entry) => {
  return journal.addEntry(entry);
};

window.exportJournal = (format = 'json') => {
  switch (format.toLowerCase()) {
    case 'csv':
      return journal.exportCSV();
    case 'zip':
      return journal.exportZIP();
    default:
      return journal.exportJSON();
  }
};

window.clearJournal = () => {
  if (confirm('Are you sure you want to clear all journal entries? This cannot be undone.')) {
    journal.clearAll();
  }
};

window.getJournalStats = () => {
  return journal.getStats();
};

window.searchJournal = (query) => {
  return journal.searchEntries(query);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Journal;
}
