/**
 * Internationalization & Accessibility Module
 * Handles read-aloud functionality and glossary tooltips
 */

const i18n = {
    glossary: {},
    speechSynthesis: null,
    isReadAloudEnabled: false,
    currentUtterance: null,

    async init() {
        console.log('🗣️ Initializing i18n & Accessibility...');
        
        // Load glossary
        await this.loadGlossary();
        
        // Initialize speech synthesis
        this.initSpeechSynthesis();
        
        // Setup read-aloud controls
        this.setupReadAloudControls();
        
        // Initialize glossary tooltips
        this.initGlossaryTooltips();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        // Load user preferences
        this.loadUserPreferences();
        
        console.log('✅ i18n & Accessibility initialized');
    },

    async loadGlossary() {
        try {
            const response = await fetch('/data/glossary.json');
            if (response.ok) {
                const data = await response.json();
                this.glossary = data.terms || {};
                console.log(`📚 Loaded ${Object.keys(this.glossary).length} glossary terms`);
            }
        } catch (error) {
            console.error('Error loading glossary:', error);
            this.glossary = {};
        }
    },

    initSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.speechSynthesis = window.speechSynthesis;
            console.log('🔊 Speech synthesis available');
        } else {
            console.warn('Speech synthesis not supported');
        }
    },

    setupReadAloudControls() {
        // Add read-aloud toggle to header if it doesn't exist
        this.addHeaderReadAloudToggle();
        
        // Add read-aloud buttons to cards and content sections
        this.addReadAloudButtons();
        
        // Setup global keyboard shortcut (R key)
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r' && e.altKey) {
                e.preventDefault();
                this.toggleReadAloud();
            }
        });
    },

    addHeaderReadAloudToggle() {
        const header = document.querySelector('.header-right');
        if (!header || header.querySelector('.read-aloud-toggle')) return;

        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'read-aloud-container';
        toggleContainer.innerHTML = `
            <button class="btn btn-ghost read-aloud-toggle" 
                    id="globalReadAloudToggle"
                    aria-label="Toggle read aloud mode"
                    title="Toggle read aloud (Alt+R)">
                <span class="read-aloud-icon">🔊</span>
                <span class="read-aloud-text">Read Aloud</span>
            </button>
        `;

        header.insertBefore(toggleContainer, header.firstChild);

        // Setup toggle functionality
        const toggle = document.getElementById('globalReadAloudToggle');
        toggle.addEventListener('click', () => {
            this.toggleReadAloud();
        });
    },

    addReadAloudButtons() {
        // Add to lesson cards
        const lessonCards = document.querySelectorAll('.lesson-card, .card, .journal-card');
        lessonCards.forEach((card, index) => {
            if (card.querySelector('.read-aloud-btn')) return; // Already added

            const readAloudBtn = document.createElement('button');
            readAloudBtn.className = 'btn btn-ghost btn-sm read-aloud-btn';
            readAloudBtn.innerHTML = '🔈 Read aloud';
            readAloudBtn.setAttribute('aria-label', 'Read this content aloud');
            readAloudBtn.style.marginLeft = 'auto';

            readAloudBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.readContentAloud(card);
            });

            // Find a good place to insert the button
            const cardActions = card.querySelector('.lesson-actions, .card-footer, .journal-header');
            if (cardActions) {
                cardActions.appendChild(readAloudBtn);
            } else {
                // Create a simple actions container
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'card-read-aloud-actions';
                actionsContainer.style.cssText = 'padding: 0.75rem; border-top: 1px solid #E5E7EB; text-align: right;';
                actionsContainer.appendChild(readAloudBtn);
                card.appendChild(actionsContainer);
            }
        });
    },

    toggleReadAloud() {
        this.isReadAloudEnabled = !this.isReadAloudEnabled;
        
        // Update toggle button state
        const toggle = document.getElementById('globalReadAloudToggle');
        if (toggle) {
            toggle.classList.toggle('active', this.isReadAloudEnabled);
            toggle.setAttribute('aria-pressed', this.isReadAloudEnabled.toString());
            
            const icon = toggle.querySelector('.read-aloud-icon');
            const text = toggle.querySelector('.read-aloud-text');
            
            if (this.isReadAloudEnabled) {
                icon.textContent = '🔇';
                text.textContent = 'Stop Reading';
                toggle.style.background = 'var(--primary)';
                toggle.style.color = 'white';
            } else {
                icon.textContent = '🔊';
                text.textContent = 'Read Aloud';
                toggle.style.background = '';
                toggle.style.color = '';
                this.stopReading();
            }
        }

        // Update all read-aloud buttons
        const buttons = document.querySelectorAll('.read-aloud-btn');
        buttons.forEach(btn => {
            btn.style.display = this.isReadAloudEnabled ? 'inline-flex' : 'none';
        });

        // Save preference
        localStorage.setItem('np_read_aloud_enabled', this.isReadAloudEnabled.toString());
        
        // Show notification
        this.showAccessibilityNotification(
            this.isReadAloudEnabled ? 'Read aloud mode enabled 🔊' : 'Read aloud mode disabled 🔇',
            'info'
        );
    },

    readContentAloud(element) {
        if (!this.speechSynthesis) {
            this.showAccessibilityNotification('Speech synthesis not supported in this browser', 'error');
            return;
        }

        // Stop any current reading
        this.stopReading();

        // Extract text content
        const textContent = this.extractReadableText(element);
        
        if (!textContent.trim()) {
            this.showAccessibilityNotification('No readable content found', 'error');
            return;
        }

        // Create and configure utterance
        const utterance = new SpeechSynthesisUtterance(textContent);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        // Add event listeners
        utterance.onstart = () => {
            element.classList.add('being-read');
            this.currentUtterance = utterance;
        };

        utterance.onend = () => {
            element.classList.remove('being-read');
            this.currentUtterance = null;
        };

        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            element.classList.remove('being-read');
            this.currentUtterance = null;
            this.showAccessibilityNotification('Error reading content aloud', 'error');
        };

        // Start speaking
        this.speechSynthesis.speak(utterance);
        this.showAccessibilityNotification('Reading content aloud...', 'success');
    },

    stopReading() {
        if (this.speechSynthesis && this.currentUtterance) {
            this.speechSynthesis.cancel();
            
            // Remove visual indicators
            document.querySelectorAll('.being-read').forEach(el => {
                el.classList.remove('being-read');
            });
            
            this.currentUtterance = null;
        }
    },

    extractReadableText(element) {
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Remove script and style elements
        const scriptsAndStyles = clone.querySelectorAll('script, style, .read-aloud-btn, .btn, button');
        scriptsAndStyles.forEach(el => el.remove());
        
        // Extract text content and clean it up
        let text = clone.textContent || clone.innerText || '';
        
        // Clean up whitespace and formatting
        text = text.replace(/\s+/g, ' ').trim();
        
        // Add natural pauses for better speech
        text = text.replace(/\./g, '.').replace(/,/g, ', ').replace(/:/g, ': ');
        
        return text;
    },

    initGlossaryTooltips() {
        // Find all text content and wrap glossary terms
        this.processTextForGlossary(document.body);
        
        // Setup tooltip event listeners
        this.setupTooltipListeners();
    },

    processTextForGlossary(container) {
        if (!container || Object.keys(this.glossary).length === 0) return;

        // Skip already processed elements and interactive elements
        if (container.hasAttribute('data-glossary-processed') || 
            container.matches('button, input, select, textarea, .glossary-term, script, style')) {
            return;
        }

        // Process text nodes
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip text in interactive elements
                    const parent = node.parentElement;
                    if (parent.matches('button, input, select, textarea, script, style, .glossary-term')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // Process each text node
        textNodes.forEach(textNode => {
            this.wrapGlossaryTermsInText(textNode);
        });

        // Mark as processed
        container.setAttribute('data-glossary-processed', 'true');
    },

    wrapGlossaryTermsInText(textNode) {
        const text = textNode.textContent;
        const parent = textNode.parentNode;
        
        // Create regex pattern for all glossary terms
        const terms = Object.keys(this.glossary);
        if (terms.length === 0) return;
        
        // Sort by length (longest first) to prevent partial matches
        terms.sort((a, b) => b.length - a.length);
        
        const pattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
        const matches = [...text.matchAll(pattern)];
        
        if (matches.length === 0) return;
        
        // Create document fragment with wrapped terms
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        matches.forEach(match => {
            const term = match[0];
            const termKey = term.toLowerCase();
            const index = match.index;
            
            // Add text before the term
            if (index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
            }
            
            // Create glossary term element
            const termElement = document.createElement('span');
            termElement.className = 'glossary-term';
            termElement.textContent = term;
            termElement.setAttribute('data-term', termKey);
            termElement.setAttribute('title', this.glossary[termKey] || '');
            termElement.setAttribute('tabindex', '0');
            termElement.setAttribute('role', 'button');
            termElement.setAttribute('aria-label', `Definition: ${this.glossary[termKey] || 'No definition available'}`);
            
            fragment.appendChild(termElement);
            
            lastIndex = index + term.length;
        });
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        
        // Replace the text node with the fragment
        parent.replaceChild(fragment, textNode);
    },

    setupTooltipListeners() {
        // Use event delegation for glossary terms
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('glossary-term')) {
                this.showGlossaryTooltip(e.target, e);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('glossary-term') && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.showGlossaryTooltip(e.target, e);
            }
        });

        // Close tooltip on escape or click outside
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideGlossaryTooltip();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.glossary-tooltip, .glossary-term')) {
                this.hideGlossaryTooltip();
            }
        });
    },

    showGlossaryTooltip(termElement, event) {
        // Remove any existing tooltip
        this.hideGlossaryTooltip();
        
        const term = termElement.getAttribute('data-term');
        const definition = this.glossary[term];
        
        if (!definition) {
            this.showAccessibilityNotification('Definition not available', 'error');
            return;
        }

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'glossary-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <strong>${termElement.textContent}</strong>
                <button class="tooltip-close" aria-label="Close definition">&times;</button>
            </div>
            <div class="tooltip-content">
                ${definition}
            </div>
            <div class="tooltip-actions">
                <button class="btn btn-ghost btn-sm tooltip-read" aria-label="Read definition aloud">
                    🔈 Read
                </button>
            </div>
        `;

        // Position tooltip
        document.body.appendChild(tooltip);
        this.positionTooltip(tooltip, termElement);

        // Setup tooltip event listeners
        tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
            this.hideGlossaryTooltip();
        });

        tooltip.querySelector('.tooltip-read').addEventListener('click', () => {
            this.readDefinitionAloud(termElement.textContent, definition);
        });

        // Focus management
        const firstFocusable = tooltip.querySelector('.tooltip-close');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Mark term as active
        termElement.classList.add('active');
        
        // Store reference
        this.currentTooltip = { tooltip, termElement };
    },

    positionTooltip(tooltip, termElement) {
        const termRect = termElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = termRect.left + (termRect.width / 2) - (tooltipRect.width / 2);
        let top = termRect.bottom + 8;
        
        // Adjust horizontal position if off-screen
        if (left < 8) {
            left = 8;
        } else if (left + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - tooltipRect.width - 8;
        }
        
        // Adjust vertical position if off-screen
        if (top + tooltipRect.height > viewportHeight - 8) {
            top = termRect.top - tooltipRect.height - 8;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    },

    hideGlossaryTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.tooltip.remove();
            this.currentTooltip.termElement.classList.remove('active');
            this.currentTooltip = null;
        }
    },

    readDefinitionAloud(term, definition) {
        if (!this.speechSynthesis) {
            this.showAccessibilityNotification('Speech synthesis not supported', 'error');
            return;
        }

        const text = `${term}: ${definition}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        this.speechSynthesis.speak(utterance);
        this.showAccessibilityNotification('Reading definition...', 'success');
    },

    setupKeyboardNavigation() {
        // Ensure all interactive elements are keyboard accessible
        this.enhanceKeyboardNavigation();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
        
        // Setup focus management
        this.setupFocusManagement();
    },

    enhanceKeyboardNavigation() {
        // Ensure all clickable elements have proper keyboard support
        const clickableElements = document.querySelectorAll('[onclick], .clickable, .card:not([tabindex])');
        clickableElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            if (!element.hasAttribute('role')) {
                element.setAttribute('role', 'button');
            }
            
            // Add keyboard event listener if not present
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    },

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (e.target.matches('input, textarea, select')) return;
            
            // Alt + R: Toggle read aloud
            if (e.altKey && e.key.toLowerCase() === 'r') {
                e.preventDefault();
                this.toggleReadAloud();
            }
            
            // Alt + G: Focus glossary search (if available)
            if (e.altKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                const glossarySearch = document.querySelector('.glossary-search, #glossarySearch');
                if (glossarySearch) {
                    glossarySearch.focus();
                }
            }
            
            // Alt + H: Show keyboard shortcuts help
            if (e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                this.showKeyboardShortcutsHelp();
            }
        });
    },

    setupFocusManagement() {
        // Add focus indicators for better visibility
        const style = document.createElement('style');
        style.textContent = `
            .being-read {
                background: rgba(58, 134, 255, 0.1) !important;
                border: 2px solid var(--primary) !important;
                animation: reading-pulse 2s ease-in-out infinite;
            }
            
            @keyframes reading-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            
            .glossary-term {
                background: rgba(255, 200, 87, 0.2);
                border-bottom: 1px dotted var(--accent);
                cursor: help;
                transition: all 0.2s ease;
            }
            
            .glossary-term:hover,
            .glossary-term:focus {
                background: rgba(255, 200, 87, 0.4);
                outline: 2px solid var(--focus);
                outline-offset: 1px;
            }
            
            .glossary-term.active {
                background: var(--accent);
                color: var(--ink);
            }
            
            .read-aloud-toggle.active {
                animation: reading-indicator 1s ease-in-out infinite;
            }
            
            @keyframes reading-indicator {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    },

    showKeyboardShortcutsHelp() {
        const shortcuts = [
            { key: 'Alt + R', description: 'Toggle read aloud mode' },
            { key: 'Alt + G', description: 'Focus glossary search' },
            { key: 'Alt + H', description: 'Show this help' },
            { key: 'Tab', description: 'Navigate between elements' },
            { key: 'Enter/Space', description: 'Activate buttons and links' },
            { key: 'Escape', description: 'Close modals and tooltips' }
        ];

        const helpText = shortcuts.map(s => `${s.key}: ${s.description}`).join('\n');
        
        alert(`Keyboard Shortcuts:\n\n${helpText}`);
    },

    loadUserPreferences() {
        // Load read-aloud preference
        const readAloudPref = localStorage.getItem('np_read_aloud_enabled');
        if (readAloudPref === 'true') {
            this.toggleReadAloud();
        }
        
        // Load other accessibility preferences
        const highContrast = localStorage.getItem('np_high_contrast');
        if (highContrast === 'true') {
            document.body.classList.add('high-contrast');
        }
        
        const reducedMotion = localStorage.getItem('np_reduced_motion');
        if (reducedMotion === 'true') {
            document.body.classList.add('reduced-motion');
        }
    },

    showAccessibilityNotification(message, type = 'info') {
        // Create an accessible notification
        const notification = document.createElement('div');
        notification.className = `a11y-notification ${type}`;
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg);
            border: 2px solid var(--primary);
            border-radius: var(--radius);
            padding: 1rem 1.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            font-weight: 500;
            color: var(--ink);
            max-width: 400px;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure other scripts have initialized
    setTimeout(() => {
        i18n.init();
    }, 500);
});

// Export for global access
window.i18n = i18n;
