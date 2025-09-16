/**
 * Digital Citizenship Widget
 * Interactive scenarios and golden rules poster builder
 */

class DigitalCitizenship {
  constructor() {
    this.currentScenario = null;
    this.completedScenarios = new Set();
    this.goldenRules = ['', '', ''];
    
    this.scenarios = {
      photos: {
        icon: '📸',
        title: 'Respect & Photos',
        situation: 'Your friend Maya posted a photo of you and your family at the beach without asking. You feel uncomfortable because you\'re wearing swimwear and some family members prefer privacy. What\'s the most respectful choice?',
        choices: [
          {
            text: 'Comment angrily on the post telling Maya she\'s wrong',
            correct: false,
            feedback: 'While your feelings are valid, public anger can hurt friendships and doesn\'t solve the problem.'
          },
          {
            text: 'Send Maya a private message asking her to remove the photo and explain why',
            correct: true,
            feedback: 'Perfect! Private, respectful communication protects everyone\'s feelings and solves the problem.'
          },
          {
            text: 'Ignore it and hope Maya realizes her mistake',
            correct: false,
            feedback: 'Staying silent means the problem continues, and Maya might not understand your concerns.'
          }
        ],
        rule: 'Ask before posting photos of others',
        explanation: 'Ask before sharing photos. If someone\'s upset, talk privately and remove it.'
      },
      
      strangers: {
        icon: '💬',
        title: 'Strangers in Chats',
        situation: 'While playing an online game, someone you don\'t know starts asking friendly questions: "What\'s your real name?" "What school do you go to?" "What\'s your address? I want to send you a game gift!" What should you do?',
        choices: [
          {
            text: 'Answer their questions because they seem nice and offered a gift',
            correct: false,
            feedback: 'Never share personal information online, even if someone seems friendly. Gifts can be tricks.'
          },
          {
            text: 'Block them immediately and tell a trusted adult',
            correct: true,
            feedback: 'Excellent! Strangers asking for personal information is a red flag. Always tell a trusted adult.'
          },
          {
            text: 'Give them fake information to trick them',
            correct: false,
            feedback: 'Even fake information keeps the conversation going, which isn\'t safe. It\'s better to block and report.'
          }
        ],
        rule: 'Never share personal information with strangers',
        explanation: 'Block and report strangers asking personal questions. Tell a trusted adult.'
      },
      
      truth: {
        icon: '🔍',
        title: 'Truth or Trick?',
        situation: 'You see a social media post that says: "Scientists PROVE eating 25 chocolate bars daily makes you 50% smarter! Schools don\'t want you to know this secret!" Your friend is excited and wants to try it. What do you think?',
        choices: [
          {
            text: 'It must be true because it mentions scientists',
            correct: false,
            feedback: 'Just saying "scientists prove" doesn\'t make something true. Real science studies are published with details.'
          },
          {
            text: 'Check if this claim appears on reliable health websites before believing it',
            correct: true,
            feedback: 'Smart thinking! Always check multiple trusted sources before believing surprising claims.'
          },
          {
            text: 'Share it immediately because it sounds amazing',
            correct: false,
            feedback: 'Sharing false information can mislead others. It\'s better to check facts first.'
          }
        ],
        rule: 'Check sources before believing or sharing',
        explanation: 'Check another trusted source. If it sounds too good to be true, it probably is.'
      },
      
      balance: {
        icon: '⏰',
        title: 'Screen Balance',
        situation: 'You started watching videos "for just 10 minutes" but realize you\'ve been watching for over an hour. You have homework to do and promised to help your parent with dinner. The next video looks really interesting. What helps you stop?',
        choices: [
          {
            text: 'Watch just one more video, then stop for sure',
            correct: false,
            feedback: '"Just one more" often becomes many more. It\'s hard to stop when you\'re already in the habit.'
          },
          {
            text: 'Close the app, put the device away, and set a timer for homework time',
            correct: true,
            feedback: 'Perfect! Removing temptation and using timers helps you stick to your intentions.'
          },
          {
            text: 'Keep watching while doing homework to multitask',
            correct: false,
            feedback: 'Multitasking with screens makes homework take longer and reduces quality. Focus on one thing at a time.'
          }
        ],
        rule: 'Use timers and take breaks from screens',
        explanation: 'Use a timer. Remove the device from sight when you need to focus on other things.'
      }
    };

    this.init();
  }

  init() {
    this.setupScenarioButtons();
    this.setupRulesBuilder();
    this.setupPosterActions();
    this.setupModal();
    this.loadSavedRules();
  }

  setupScenarioButtons() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    
    scenarioButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scenarioCard = e.target.closest('.scenario-card');
        const scenarioId = scenarioCard.dataset.scenario;
        this.openScenario(scenarioId);
      });
    });
  }

  setupRulesBuilder() {
    const ruleInputs = document.querySelectorAll('[id^="rule"]');
    
    ruleInputs.forEach((input, index) => {
      // Load default or saved values
      if (this.goldenRules[index]) {
        input.value = this.goldenRules[index];
      }
      
      input.addEventListener('input', (e) => {
        this.updateRule(index, e.target.value);
      });

      // Auto-save on blur
      input.addEventListener('blur', () => {
        this.saveRulesToStorage();
      });
    });
  }

  setupPosterActions() {
    const previewBtn = document.getElementById('previewPosterBtn');
    const approveBtn = document.getElementById('approvePosterBtn');
    
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        this.previewPoster();
      });
    }
    
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        this.downloadPoster();
      });
    }
  }

  setupModal() {
    const modal = document.getElementById('scenarioModal');
    const closeBtn = modal.querySelector('.modal-close');
    const addToRulesBtn = document.getElementById('addToRulesBtn');
    const nextScenarioBtn = document.getElementById('nextScenarioBtn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    if (addToRulesBtn) {
      addToRulesBtn.addEventListener('click', () => {
        this.addCurrentRuleToBuilder();
      });
    }
    
    if (nextScenarioBtn) {
      nextScenarioBtn.addEventListener('click', () => {
        this.openRandomScenario();
      });
    }
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openScenario(scenarioId) {
    const scenario = this.scenarios[scenarioId];
    if (!scenario) return;
    
    this.currentScenario = scenarioId;
    
    // Populate modal content
    const modal = document.getElementById('scenarioModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalSituation = document.getElementById('modalSituation');
    const modalChoices = document.getElementById('modalChoices');
    const modalFeedback = document.getElementById('modalFeedback');
    
    modalIcon.textContent = scenario.icon;
    modalTitle.textContent = scenario.title;
    modalSituation.textContent = scenario.situation;
    
    // Create choice buttons
    modalChoices.innerHTML = '';
    scenario.choices.forEach((choice, index) => {
      const choiceBtn = document.createElement('button');
      choiceBtn.className = 'choice-option';
      choiceBtn.textContent = choice.text;
      choiceBtn.dataset.choiceIndex = index;
      
      choiceBtn.addEventListener('click', () => {
        this.selectChoice(index);
      });
      
      modalChoices.appendChild(choiceBtn);
    });
    
    // Reset feedback
    modalFeedback.style.display = 'none';
    document.getElementById('addToRulesBtn').style.display = 'none';
    document.getElementById('nextScenarioBtn').style.display = 'none';
    
    // Show modal
    modal.classList.add('active');
    
    // Focus first choice for accessibility
    const firstChoice = modalChoices.querySelector('.choice-option');
    if (firstChoice) {
      firstChoice.focus();
    }
    
    this.announceToScreenReader(`Opened scenario: ${scenario.title}. ${scenario.situation}`);
  }

  selectChoice(choiceIndex) {
    const scenario = this.scenarios[this.currentScenario];
    const choice = scenario.choices[choiceIndex];
    const modalChoices = document.getElementById('modalChoices');
    const modalFeedback = document.getElementById('modalFeedback');
    
    // Disable all choices
    const choiceButtons = modalChoices.querySelectorAll('.choice-option');
    choiceButtons.forEach((btn, index) => {
      btn.classList.add('disabled');
      btn.disabled = true;
      
      if (index === choiceIndex) {
        btn.classList.add(choice.correct ? 'correct' : 'incorrect');
      } else if (scenario.choices[index].correct) {
        btn.classList.add('correct');
      }
    });
    
    // Show feedback
    const resultIcon = choice.correct ? '✅' : '❌';
    const resultText = choice.correct ? 'Great choice!' : 'Not quite right.';
    
    modalFeedback.innerHTML = `
      <div class="feedback-result">
        <span>${resultIcon}</span>
        <span>${resultText}</span>
      </div>
      <div class="feedback-explanation">${choice.feedback}</div>
    `;
    modalFeedback.style.display = 'block';
    
    // Show action buttons
    document.getElementById('addToRulesBtn').style.display = 'inline-flex';
    document.getElementById('nextScenarioBtn').style.display = 'inline-flex';
    
    // Mark scenario as completed
    this.completedScenarios.add(this.currentScenario);
    
    // Save progress
    this.saveProgress();
    
    // Announce result
    this.announceToScreenReader(`${resultText} ${choice.feedback}`);
    
    if (choice.correct && window.showToast) {
      window.showToast('✅ Excellent choice! You showed good digital citizenship.', 'success');
    }
  }

  addCurrentRuleToBuilder() {
    if (!this.currentScenario) return;
    
    const scenario = this.scenarios[this.currentScenario];
    const suggestedRule = scenario.rule;
    
    // Find first empty rule slot
    let emptySlot = -1;
    for (let i = 0; i < 3; i++) {
      if (!this.goldenRules[i] || this.goldenRules[i].trim() === '') {
        emptySlot = i;
        break;
      }
    }
    
    if (emptySlot === -1) {
      // No empty slots, ask user which to replace
      if (window.showToast) {
        window.showToast('All rule slots are full. Edit one of your existing rules to add this suggestion.', 'info');
      }
      return;
    }
    
    // Add rule to slot
    this.updateRule(emptySlot, suggestedRule);
    const ruleInput = document.getElementById(`rule${emptySlot + 1}`);
    if (ruleInput) {
      ruleInput.value = suggestedRule;
    }
    
    this.saveRulesToStorage();
    this.closeModal();
    
    if (window.showToast) {
      window.showToast(`Added "${suggestedRule}" to your golden rules!`, 'success');
    }
    
    // Scroll to golden rules section
    const goldenRulesSection = document.querySelector('.golden-rules-section');
    if (goldenRulesSection) {
      goldenRulesSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openRandomScenario() {
    const availableScenarios = Object.keys(this.scenarios).filter(id => id !== this.currentScenario);
    if (availableScenarios.length === 0) {
      this.closeModal();
      if (window.showToast) {
        window.showToast('🎉 You\'ve completed all scenarios! Great job learning about digital citizenship.', 'success', { duration: 5000 });
      }
      return;
    }
    
    const randomScenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    this.openScenario(randomScenario);
  }

  closeModal() {
    const modal = document.getElementById('scenarioModal');
    modal.classList.remove('active');
    this.currentScenario = null;
  }

  updateRule(index, value) {
    this.goldenRules[index] = value.trim();
    
    // Update preview
    const previewRule = document.getElementById(`previewRule${index + 1}`);
    if (previewRule) {
      const ruleNumber = index + 1;
      const displayText = value.trim() || `Rule ${ruleNumber} - Add your rule here`;
      previewRule.textContent = `${ruleNumber}. ${displayText}`;
    }
  }

  previewPoster() {
    // Validate that at least one rule is filled
    const hasRules = this.goldenRules.some(rule => rule.trim() !== '');
    
    if (!hasRules) {
      if (window.showToast) {
        window.showToast('Please add at least one golden rule before previewing.', 'warning');
      }
      return;
    }
    
    // Scroll to poster preview
    const posterPreview = document.getElementById('posterPreview');
    if (posterPreview) {
      posterPreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight animation
      posterPreview.style.transform = 'scale(1.02)';
      posterPreview.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      
      setTimeout(() => {
        posterPreview.style.transform = '';
        posterPreview.style.boxShadow = '';
      }, 1000);
    }
    
    if (window.showToast) {
      window.showToast('📋 Here\'s your poster preview! Teachers can approve and download it.', 'info');
    }
  }

  downloadPoster() {
    // Validate rules
    const filledRules = this.goldenRules.filter(rule => rule.trim() !== '');
    
    if (filledRules.length === 0) {
      if (window.showToast) {
        window.showToast('Please add at least one golden rule before downloading.', 'warning');
      }
      return;
    }
    
    // Get class information
    const className = document.getElementById('classNameDisplay').textContent || 'Demo Class';
    
    // Create poster HTML for download
    const posterHTML = this.createPosterHTML(className);
    
    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(posterHTML);
    printWindow.document.close();
    
    // Save to journal
    this.savePosterToJournal(className);
    
    if (window.showToast) {
      window.showToast('🎉 Poster approved and ready for download!', 'success');
    }
  }

  createPosterHTML(className) {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Digital Citizenship Rules - ${className}</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              max-width: 800px; 
              margin: 40px auto; 
              padding: 40px;
              background: #F9FAFB;
            }
            .poster {
              background: white;
              border: 6px solid #FFC857;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            .poster-header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 4px solid #FFC857;
              padding-bottom: 30px;
            }
            .poster-title {
              color: #111827;
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 15px;
            }
            .poster-subtitle {
              color: #6B7280;
              font-size: 18px;
              margin-bottom: 20px;
            }
            .class-info {
              color: #3A86FF;
              font-size: 20px;
              font-weight: 600;
            }
            .rules-list {
              margin-bottom: 40px;
            }
            .rule-item {
              background: rgba(255, 200, 87, 0.15);
              border-left: 8px solid #FFC857;
              padding: 20px 25px;
              margin-bottom: 20px;
              border-radius: 0 12px 12px 0;
              font-size: 18px;
              font-weight: 500;
              color: #111827;
              line-height: 1.6;
            }
            .poster-footer {
              text-align: center;
              padding-top: 30px;
              border-top: 2px solid #E5E7EB;
              color: #6B7280;
            }
            .school-logo {
              color: #3A86FF;
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .date {
              font-size: 14px;
            }
            @media print {
              body { margin: 0; background: white; }
              .poster { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="poster-header">
              <h1 class="poster-title">Our Digital Citizenship Rules</h1>
              <p class="poster-subtitle">Be safe, be kind, be smart online</p>
              <div class="class-info">${className}</div>
            </div>
            
            <div class="rules-list">
              ${this.goldenRules.map((rule, index) => {
                if (!rule.trim()) return '';
                return `<div class="rule-item">${index + 1}. ${rule}</div>`;
              }).join('')}
            </div>
            
            <div class="poster-footer">
              <div class="school-logo">🌱 Nature Power Learning</div>
              <div class="date">Created: ${currentDate}</div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `;
  }

  savePosterToJournal(className) {
    const journalEntry = {
      type: 'digital_citizenship_poster',
      step: 'digital_citizenship',
      data: {
        golden_rules: this.goldenRules.filter(rule => rule.trim() !== ''),
        class_name: className,
        completed_scenarios: Array.from(this.completedScenarios),
        creation_date: new Date().toISOString()
      },
      content: `Digital Citizenship Poster created for ${className}. Rules: ${this.goldenRules.filter(rule => rule.trim() !== '').join('; ')}`,
      tags: ['digital-citizenship', 'poster', 'golden-rules', 'safety']
    };
    
    if (window.saveToJournal) {
      window.saveToJournal(journalEntry);
    }
  }

  saveProgress() {
    const progress = {
      completedScenarios: Array.from(this.completedScenarios),
      goldenRules: this.goldenRules,
      lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('digitalCitizenshipProgress', JSON.stringify(progress));
  }

  saveRulesToStorage() {
    const rulesData = {
      goldenRules: this.goldenRules,
      lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('goldenRules', JSON.stringify(rulesData));
  }

  loadSavedRules() {
    try {
      const saved = localStorage.getItem('goldenRules');
      if (saved) {
        const data = JSON.parse(saved);
        this.goldenRules = data.goldenRules || ['', '', ''];
        
        // Update UI
        this.goldenRules.forEach((rule, index) => {
          const input = document.getElementById(`rule${index + 1}`);
          if (input) {
            input.value = rule;
          }
          this.updateRule(index, rule);
        });
      }
      
      // Load progress
      const progress = localStorage.getItem('digitalCitizenshipProgress');
      if (progress) {
        const data = JSON.parse(progress);
        this.completedScenarios = new Set(data.completedScenarios || []);
      }
      
    } catch (error) {
      console.error('Error loading saved rules:', error);
    }
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
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

  // Public methods
  getProgress() {
    return {
      completedScenarios: Array.from(this.completedScenarios),
      totalScenarios: Object.keys(this.scenarios).length,
      goldenRules: this.goldenRules.filter(rule => rule.trim() !== ''),
      isComplete: this.completedScenarios.size === Object.keys(this.scenarios).length
    };
  }

  resetProgress() {
    this.completedScenarios.clear();
    this.goldenRules = ['', '', ''];
    
    // Clear UI
    document.querySelectorAll('[id^="rule"]').forEach(input => {
      input.value = '';
    });
    
    this.goldenRules.forEach((rule, index) => {
      this.updateRule(index, '');
    });
    
    // Clear storage
    localStorage.removeItem('digitalCitizenshipProgress');
    localStorage.removeItem('goldenRules');
    
    if (window.showToast) {
      window.showToast('Progress reset successfully', 'info');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.scenarios-section')) {
    window.digitalCitizenship = new DigitalCitizenship();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DigitalCitizenship;
}
