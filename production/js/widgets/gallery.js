/**
 * Gallery Widget
 * Manages class gallery with moderation features
 */

class GalleryWidget {
  constructor() {
    this.items = [];
    this.filteredItems = [];
    this.currentFilter = 'all';
    this.currentSort = 'newest';
    this.isModerationOn = true;
    
    this.init();
  }

  init() {
    this.loadGalleryItems();
    this.setupEventListeners();
    this.setupModerationToggle();
    this.updateStats();
    this.renderGallery();
  }

  setupEventListeners() {
    // Filter controls
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('gallerySearch');
    
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.filterAndSort();
      });
    }
    
    if (sortFilter) {
      sortFilter.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.filterAndSort();
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchItems(e.target.value);
      });
    }
  }

  setupModerationToggle() {
    const moderationToggle = document.getElementById('moderationToggle');
    if (moderationToggle) {
      moderationToggle.addEventListener('change', (e) => {
        this.isModerationOn = e.target.checked;
        this.updateModerationUI();
        this.saveSettings();
      });
    }
  }

  loadGalleryItems() {
    // Load from localStorage or create sample data
    const saved = localStorage.getItem('galleryItems');
    if (saved) {
      this.items = JSON.parse(saved);
    } else {
      this.items = this.createSampleItems();
      this.saveItems();
    }
  }

  createSampleItems() {
    return [
      {
        id: '1',
        type: 'design',
        title: 'Future-Ready Home Design',
        description: 'A sustainable home design with solar panels, natural shading, and excellent ventilation for tropical climate.',
        class: 'Class 5A',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Solar', 'Shade', 'Ventilation'],
        likes: 12,
        approved: true,
        reasoning: 'I chose solar panels because Singapore gets lots of sun, and shade trees to keep the house cool. The raised floor helps with flooding during heavy rain.',
        features: ['shade', 'solar', 'ventilation', 'raised-floor']
      },
      {
        id: '2',
        type: 'circuit',
        title: 'Working Circuit Design',
        description: 'Successfully built a complete circuit with battery, switch, and lamp. The lamp lights up when the switch is closed!',
        class: 'Class 5B',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Electronics', 'Circuits'],
        likes: 8,
        approved: true,
        components: ['battery', 'wire', 'lamp', 'switch']
      },
      {
        id: '3',
        type: 'poster',
        title: 'Our Golden Rules Poster',
        description: 'Class-created digital citizenship rules poster ready for classroom display.',
        class: 'Class 5C',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['DigitalCitizenship', 'Safety'],
        likes: 15,
        approved: true,
        rules: ['Think before you share', 'Ask before posting photos', 'Balance screens and real life']
      },
      {
        id: '4',
        type: 'weather',
        title: 'Singapore vs London Weather',
        description: 'Compared weather patterns between Singapore and London. Singapore is much warmer and more humid!',
        class: 'Class 5A',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['Weather', 'Climate', 'Comparison'],
        likes: 6,
        approved: false,
        facts: ['Singapore is 12°C warmer on average', 'London has 4 distinct seasons', 'Singapore gets more rainfall']
      }
    ];
  }

  filterAndSort() {
    // Filter by category
    this.filteredItems = this.items.filter(item => {
      if (this.currentFilter === 'all') return true;
      return item.type === this.currentFilter;
    });

    // Sort items
    this.filteredItems.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'popular':
          return b.likes - a.likes;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    this.renderGallery();
  }

  searchItems(query) {
    if (!query.trim()) {
      this.filterAndSort();
      return;
    }

    const searchTerm = query.toLowerCase();
    this.filteredItems = this.items.filter(item => {
      return item.title.toLowerCase().includes(searchTerm) ||
             item.description.toLowerCase().includes(searchTerm) ||
             item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
             item.class.toLowerCase().includes(searchTerm);
    });

    this.renderGallery();
  }

  renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    if (this.filteredItems.length === 0) {
      this.showEmptyState();
      return;
    }

    galleryGrid.innerHTML = this.filteredItems.map(item => this.createGalleryItemHTML(item)).join('');
    this.setupItemEventListeners();
  }

  createGalleryItemHTML(item) {
    const daysAgo = Math.floor((Date.now() - new Date(item.date)) / (1000 * 60 * 60 * 24));
    const statusClass = item.approved ? 'approved' : 'pending';
    
    return `
      <div class="gallery-item ${statusClass}" data-id="${item.id}" data-category="${item.type}">
        <div class="item-image">
          ${this.createItemPreview(item)}
          <div class="item-overlay">
            <button class="like-btn ${item.liked ? 'liked' : ''}" data-id="${item.id}">
              <span class="like-icon">❤️</span>
              <span class="like-count">${item.likes}</span>
            </button>
            <button class="view-btn" data-id="${item.id}">
              <span>👁️</span>
            </button>
          </div>
        </div>
        <div class="item-content">
          <h3 class="item-title">${item.title}</h3>
          <div class="item-meta">
            <span class="item-class">${item.class}</span>
            <span class="item-date">${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago</span>
          </div>
          <div class="item-tags">
            ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
          </div>
          <p class="item-description">${item.description}</p>
        </div>
        <div class="teacher-actions teacher-only">
          <button class="btn btn-success btn-sm" onclick="galleryWidget.approveItem('${item.id}')">
            ✓ ${item.approved ? 'Approved' : 'Approve'}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="galleryWidget.hideItem('${item.id}')">
            👁️ Hide
          </button>
          <button class="btn btn-accent btn-sm" onclick="galleryWidget.downloadItem('${item.id}')">
            📥 Download
          </button>
        </div>
      </div>
    `;
  }

  createItemPreview(item) {
    switch (item.type) {
      case 'design':
        return `
          <div class="design-preview">
            <div class="preview-house">
              <div class="house-roof"></div>
              <div class="house-wall"></div>
              <div class="house-features">
                ${item.features?.slice(0, 2).map(feature => {
                  const icons = {
                    'shade': '🌳',
                    'solar': '☀️',
                    'ventilation': '💨',
                    'insulation': '🧥',
                    'raised-floor': '🏠',
                    'rainwater': '🌧️'
                  };
                  return `<span class="feature-tag">${icons[feature] || '🏠'} ${feature.replace('-', ' ')}</span>`;
                }).join('') || ''}
              </div>
            </div>
          </div>
        `;
      
      case 'circuit':
        return `
          <div class="circuit-preview">
            <div class="circuit-components">
              ${item.components?.map(comp => {
                const icons = {
                  'battery': '🔋',
                  'wire': '➖',
                  'lamp': '💡',
                  'switch': '🔘'
                };
                return `<div class="component ${comp === 'lamp' ? 'lit' : ''}">${icons[comp] || '🔧'}</div>`;
              }).join('') || ''}
            </div>
          </div>
        `;
      
      case 'poster':
        return `
          <div class="poster-preview">
            <div class="poster-header">Digital Citizenship Rules</div>
            <div class="poster-rules">
              ${item.rules?.slice(0, 3).map((rule, index) => 
                `<div class="rule">${index + 1}. ${rule}</div>`
              ).join('') || ''}
            </div>
          </div>
        `;
      
      case 'weather':
        return `
          <div class="weather-preview">
            <div class="weather-chart">
              <div class="chart-bars">
                <div class="bar singapore" style="height: 80%"></div>
                <div class="bar london" style="height: 40%"></div>
              </div>
              <div class="chart-labels">
                <span>Singapore</span>
                <span>London</span>
              </div>
            </div>
          </div>
        `;
      
      default:
        return `<div class="default-preview">📄</div>`;
    }
  }

  setupItemEventListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.id;
        this.toggleLike(itemId);
      });
    });

    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.id;
        this.openLightbox(itemId);
      });
    });
  }

  toggleLike(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    if (item.liked) {
      item.likes--;
      item.liked = false;
    } else {
      item.likes++;
      item.liked = true;
    }

    this.saveItems();
    this.filterAndSort();
    
    if (window.showToast) {
      window.showToast(item.liked ? 'Liked!' : 'Unliked', 'info');
    }
  }

  openLightbox(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('lightboxModal');
    const image = document.getElementById('lightboxImage');
    const title = document.getElementById('lightboxTitle');
    const description = document.getElementById('lightboxDescription');
    const classInfo = document.getElementById('lightboxClass');
    const date = document.getElementById('lightboxDate');
    const tags = document.getElementById('lightboxTags');
    const reasoning = document.getElementById('lightboxReasoning');
    const reasoningText = document.getElementById('reasoningText');

    if (image) image.innerHTML = this.createItemPreview(item);
    if (title) title.textContent = item.title;
    if (description) description.textContent = item.description;
    if (classInfo) classInfo.textContent = item.class;
    if (date) {
      const daysAgo = Math.floor((Date.now() - new Date(item.date)) / (1000 * 60 * 60 * 24));
      date.textContent = `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
    }
    if (tags) {
      tags.innerHTML = item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
    }
    if (reasoning && reasoningText) {
      if (item.reasoning) {
        reasoning.style.display = 'block';
        reasoningText.textContent = item.reasoning;
      } else {
        reasoning.style.display = 'none';
      }
    }

    modal.classList.add('active');
  }

  approveItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    item.approved = !item.approved;
    this.saveItems();
    this.filterAndSort();
    this.updateStats();

    if (window.showToast) {
      window.showToast(
        item.approved ? 'Item approved!' : 'Item unapproved',
        item.approved ? 'success' : 'info'
      );
    }
  }

  hideItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    item.hidden = !item.hidden;
    this.saveItems();
    this.filterAndSort();

    if (window.showToast) {
      window.showToast(
        item.hidden ? 'Item hidden' : 'Item shown',
        'info'
      );
    }
  }

  downloadItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    // Create downloadable content based on item type
    const content = this.createDownloadContent(item);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    link.click();
    
    URL.revokeObjectURL(url);

    if (window.showToast) {
      window.showToast('Item downloaded!', 'success');
    }
  }

  createDownloadContent(item) {
    const date = new Date(item.date).toLocaleDateString();
    
    return `
${item.title}
Class: ${item.class}
Date: ${date}
Likes: ${item.likes}
Status: ${item.approved ? 'Approved' : 'Pending'}

Description:
${item.description}

Tags: ${item.tags.join(', ')}

${item.reasoning ? `Student's Reasoning:\n${item.reasoning}\n` : ''}

---
Exported from Nature Power Learning Gallery
    `.trim();
  }

  updateStats() {
    const totalSubmissions = document.getElementById('totalSubmissions');
    const approvedItems = document.getElementById('approvedItems');
    const pendingItems = document.getElementById('pendingItems');

    if (totalSubmissions) {
      totalSubmissions.textContent = this.items.length;
    }
    if (approvedItems) {
      approvedItems.textContent = this.items.filter(i => i.approved).length;
    }
    if (pendingItems) {
      pendingItems.textContent = this.items.filter(i => !i.approved).length;
    }
  }

  updateModerationUI() {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
      if (this.isModerationOn) {
        item.classList.add('moderation-mode');
      } else {
        item.classList.remove('moderation-mode');
      }
    });
  }

  showEmptyState() {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyGallery = document.getElementById('emptyGallery');
    
    if (galleryGrid && emptyGallery) {
      galleryGrid.innerHTML = '';
      emptyGallery.style.display = 'block';
    }
  }

  saveItems() {
    localStorage.setItem('galleryItems', JSON.stringify(this.items));
  }

  saveSettings() {
    const settings = {
      moderationOn: this.isModerationOn,
      currentFilter: this.currentFilter,
      currentSort: this.currentSort
    };
    localStorage.setItem('gallerySettings', JSON.stringify(settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('gallerySettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.isModerationOn = settings.moderationOn;
      this.currentFilter = settings.currentFilter;
      this.currentSort = settings.currentSort;
    }
  }

  // Public methods for external access
  addItem(itemData) {
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      date: new Date().toISOString(),
      likes: 0,
      liked: false,
      approved: false,
      hidden: false
    };
    
    this.items.unshift(newItem);
    this.saveItems();
    this.filterAndSort();
    this.updateStats();
    
    if (window.showToast) {
      window.showToast('Item added to gallery!', 'success');
    }
  }

  getStats() {
    return {
      total: this.items.length,
      approved: this.items.filter(i => i.approved).length,
      pending: this.items.filter(i => !i.approved).length,
      hidden: this.items.filter(i => i.hidden).length
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.gallery-section')) {
    window.galleryWidget = new GalleryWidget();
  }
});

// Global functions for onclick handlers
window.approveItem = (button) => {
  const itemId = button.closest('.gallery-item').dataset.id;
  window.galleryWidget?.approveItem(itemId);
};

window.hideItem = (button) => {
  const itemId = button.closest('.gallery-item').dataset.id;
  window.galleryWidget?.hideItem(itemId);
};

window.downloadItem = (button) => {
  const itemId = button.closest('.gallery-item').dataset.id;
  window.galleryWidget?.downloadItem(itemId);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GalleryWidget;
}
