/**
 * Learn Page JavaScript
 * Manages the learning journey timeline and step interactions
 */

class LearnPage {
  constructor() {
    this.currentStep = 1;
    this.completedSteps = new Set();
    this.init();
  }

  init() {
    this.loadProgress();
    this.setupEventListeners();
    this.updateStepDisplay();
    this.initializeWidgets();
  }

  setupEventListeners() {
    // Step navigation
    document.querySelectorAll('.step-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        this.goToStep(index + 1);
      });
    });

    // Step completion buttons
    document.querySelectorAll('.step-complete-btn').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.completeStep(index + 1);
      });
    });

    // Teacher check-in buttons
    document.querySelectorAll('.teacher-checkin-btn').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showTeacherCheckIn(index + 1);
      });
    });

    // Offline activity buttons
    document.querySelectorAll('.offline-activity-btn').forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showOfflineActivity(index + 1);
      });
    });
  }

  loadProgress() {
    const saved = localStorage.getItem('learnProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      this.currentStep = progress.currentStep || 1;
      this.completedSteps = new Set(progress.completedSteps || []);
    }
  }

  saveProgress() {
    const progress = {
      currentStep: this.currentStep,
      completedSteps: Array.from(this.completedSteps)
    };
    localStorage.setItem('learnProgress', JSON.stringify(progress));
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    this.updateStepDisplay();
    this.saveProgress();
    
    // Scroll to the step content
    const stepContent = document.querySelector(`[data-step="${stepNumber}"]`);
    if (stepContent) {
      stepContent.scrollIntoView({ behavior: 'smooth' });
    }
  }

  completeStep(stepNumber) {
    this.completedSteps.add(stepNumber);
    this.updateStepDisplay();
    this.saveProgress();
    
    if (window.showToast) {
      window.showToast(`Step ${stepNumber} completed! Great work!`, 'success');
    }

    // Auto-advance to next step if not the last one
    if (stepNumber < 8) {
      setTimeout(() => {
        this.goToStep(stepNumber + 1);
      }, 1500);
    }
  }

  updateStepDisplay() {
    // Update step cards
    document.querySelectorAll('.step-card').forEach((card, index) => {
      const stepNumber = index + 1;
      const isCompleted = this.completedSteps.has(stepNumber);
      const isCurrent = stepNumber === this.currentStep;
      
      card.classList.toggle('completed', isCompleted);
      card.classList.toggle('current', isCurrent);
      
      // Update step status
      const statusIcon = card.querySelector('.step-status');
      if (statusIcon) {
        if (isCompleted) {
          statusIcon.textContent = '✓';
          statusIcon.className = 'step-status completed';
        } else if (isCurrent) {
          statusIcon.textContent = '→';
          statusIcon.className = 'step-status current';
        } else {
          statusIcon.textContent = stepNumber;
          statusIcon.className = 'step-status';
        }
      }
    });

    // Update progress bar
    const progressBar = document.querySelector('.timeline-progress');
    if (progressBar) {
      const progress = (this.completedSteps.size / 8) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // Update completion counter
    const completionCounter = document.querySelector('.completion-counter');
    if (completionCounter) {
      completionCounter.textContent = `${this.completedSteps.size}/8`;
    }
  }

  initializeWidgets() {
    // Initialize widgets when their sections become visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const widgetType = entry.target.dataset.widget;
          this.initializeWidget(widgetType);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-widget]').forEach(element => {
      observer.observe(element);
    });
  }

  initializeWidget(widgetType) {
    switch (widgetType) {
      case 'weather-explorer':
        if (!window.weatherExplorer) {
          // Weather Explorer is already initialized in its own file
          console.log('Weather Explorer widget ready');
        }
        break;
      case 'houses-widget':
        if (!window.housesWidget) {
          // Houses widget is already initialized in its own file
          console.log('Houses widget ready');
        }
        break;
      case 'circuits-widget':
        if (!window.circuitsWidget) {
          // Circuits widget is already initialized in its own file
          console.log('Circuits widget ready');
        }
        break;
      case 'design-tester':
        if (!window.designTester) {
          // Design Tester is already initialized in its own file
          console.log('Design Tester widget ready');
        }
        break;
    }
  }

  showTeacherCheckIn(stepNumber) {
    const checkInData = this.getTeacherCheckInData(stepNumber);
    
    const modal = document.createElement('div');
    modal.className = 'modal active teacher-checkin-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h3>Teacher Check-In: Step ${stepNumber}</h3>
        <div class="checkin-content">
          <h4>${checkInData.title}</h4>
          <p>${checkInData.description}</p>
          <div class="checkin-questions">
            <h5>Discussion Questions:</h5>
            <ul>
              ${checkInData.questions.map(q => `<li>${q}</li>`).join('')}
            </ul>
          </div>
          <div class="checkin-notes">
            <label for="teacherNotes">Your Notes:</label>
            <textarea id="teacherNotes" placeholder="Add your observations and notes here..."></textarea>
          </div>
          <div class="checkin-actions">
            <button class="btn btn-primary" onclick="learnPage.saveCheckInNotes(${stepNumber})">Save Notes</button>
            <button class="btn btn-secondary" onclick="learnPage.closeModal()">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupModalClose(modal);
  }

  showOfflineActivity(stepNumber) {
    const activityData = this.getOfflineActivityData(stepNumber);
    
    const modal = document.createElement('div');
    modal.className = 'modal active offline-activity-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h3>Offline Activity: Step ${stepNumber}</h3>
        <div class="activity-content">
          <h4>${activityData.title}</h4>
          <p>${activityData.description}</p>
          <div class="activity-materials">
            <h5>Materials Needed:</h5>
            <ul>
              ${activityData.materials.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
          <div class="activity-steps">
            <h5>Instructions:</h5>
            <ol>
              ${activityData.steps.map(s => `<li>${s}</li>`).join('')}
            </ol>
          </div>
          <div class="activity-actions">
            <button class="btn btn-primary" onclick="learnPage.markOfflineComplete(${stepNumber})">Mark as Complete</button>
            <button class="btn btn-secondary" onclick="learnPage.closeModal()">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupModalClose(modal);
  }

  getTeacherCheckInData(stepNumber) {
    const checkIns = {
      1: {
        title: "Weather & Climate Discussion",
        description: "Check in with students about their weather comparisons and what patterns they've noticed.",
        questions: [
          "What surprised you about the weather data?",
          "How do you think these differences affect how people live?",
          "What questions do you still have about weather vs climate?"
        ]
      },
      2: {
        title: "Homes Around the World",
        description: "Discuss the different house features students identified and why they might be important.",
        questions: [
          "Which house features did you find most interesting?",
          "Why do you think different places have different house designs?",
          "What would you want in a house for Singapore's climate?"
        ]
      },
      3: {
        title: "Circuit Building Success",
        description: "Celebrate successful circuit building and troubleshoot any challenges.",
        questions: [
          "What was the most challenging part of building your circuit?",
          "How did you know your circuit was working?",
          "What would you like to try next with circuits?"
        ]
      },
      4: {
        title: "Singapore Case Study",
        description: "Reflect on Singapore's unique challenges and solutions.",
        questions: [
          "What makes Singapore's situation unique?",
          "How do you think Singapore can prepare for climate change?",
          "What solutions seem most practical for Singapore?"
        ]
      },
      5: {
        title: "Renewable Energy Exploration",
        description: "Discuss renewable energy options and their benefits.",
        questions: [
          "Which renewable energy source interests you most?",
          "What are the benefits and challenges of each type?",
          "How could we use more renewable energy in Singapore?"
        ]
      },
      6: {
        title: "Earthquake Challenge",
        description: "Reflect on earthquake preparedness and building design.",
        questions: [
          "What did you learn about earthquake safety?",
          "How can buildings be designed to withstand earthquakes?",
          "What other natural disasters should we prepare for?"
        ]
      },
      7: {
        title: "Design Process Reflection",
        description: "Discuss the design process and decision-making.",
        questions: [
          "What was your design process like?",
          "How did you decide which features to include?",
          "What would you do differently next time?"
        ]
      },
      8: {
        title: "Sharing and Communication",
        description: "Prepare for sharing designs and communicating ideas.",
        questions: [
          "How will you explain your design to others?",
          "What are the most important points to share?",
          "How can you make your presentation engaging?"
        ]
      }
    };
    
    return checkIns[stepNumber] || {
      title: "General Check-In",
      description: "Check in with students about their progress.",
      questions: ["How is the learning going?", "What questions do you have?", "What would you like to explore more?"]
    };
  }

  getOfflineActivityData(stepNumber) {
    const activities = {
      1: {
        title: "Weather Journal",
        description: "Keep a daily weather journal for one week to observe local patterns.",
        materials: ["Notebook", "Pencil", "Thermometer (optional)", "Weather app or website"],
        steps: [
          "Record the temperature, weather conditions, and any observations each day",
          "Note the time of day and location of your measurements",
          "Look for patterns in your data",
          "Compare your observations with the Weather Explorer data",
          "Share your findings with the class"
        ]
      },
      2: {
        title: "House Feature Hunt",
        description: "Take a walk around your neighborhood and identify house features.",
        materials: ["Camera or phone", "Notebook", "Pencil"],
        steps: [
          "Walk around your neighborhood with a parent or guardian",
          "Take photos of different house features you notice",
          "Record what you see in your notebook",
          "Look for features that might help with climate control",
          "Create a collage or presentation of your findings"
        ]
      },
      3: {
        title: "Simple Circuit Building",
        description: "Build a real circuit using household materials.",
        materials: ["Battery", "Wire", "Light bulb", "Switch", "Tape"],
        steps: [
          "Ask an adult to help you gather materials",
          "Follow safety guidelines for electrical work",
          "Build a simple circuit with a battery, wire, and light bulb",
          "Add a switch to turn the light on and off",
          "Take a photo of your working circuit",
          "Explain how your circuit works"
        ]
      },
      4: {
        title: "Singapore Climate Research",
        description: "Research Singapore's climate and environmental challenges.",
        materials: ["Internet access", "Notebook", "Pencil"],
        steps: [
          "Research Singapore's climate characteristics",
          "Find information about environmental challenges Singapore faces",
          "Look for examples of sustainable solutions in Singapore",
          "Create a fact sheet about Singapore's climate",
          "Share your research with the class"
        ]
      },
      5: {
        title: "Renewable Energy Model",
        description: "Create a model of a renewable energy system.",
        materials: ["Cardboard", "Scissors", "Glue", "Markers", "String", "Small motor"],
        steps: [
          "Choose a renewable energy source to model",
          "Design and build a simple model using cardboard and other materials",
          "Add labels to explain how your model works",
          "Test your model if possible",
          "Present your model to the class"
        ]
      },
      6: {
        title: "Earthquake Safety Plan",
        description: "Create an earthquake safety plan for your home.",
        materials: ["Paper", "Pencil", "Ruler", "Colored pencils"],
        steps: [
          "Draw a floor plan of your home",
          "Identify safe spots in each room",
          "Mark emergency exits and meeting points",
          "Create a list of emergency supplies",
          "Practice your earthquake safety plan with your family"
        ]
      },
      7: {
        title: "Design Model Building",
        description: "Build a physical model of your future-ready home design.",
        materials: ["Cardboard", "Scissors", "Glue", "Markers", "Recycled materials"],
        steps: [
          "Use your digital design as a guide",
          "Build a 3D model of your home design",
          "Include all the features you designed digitally",
          "Add labels to explain each feature",
          "Test your model for stability and functionality"
        ]
      },
      8: {
        title: "Presentation Preparation",
        description: "Prepare to present your design to the class.",
        materials: ["Poster board", "Markers", "Photos of your work", "Presentation notes"],
        steps: [
          "Create a poster showcasing your design",
          "Include photos of your digital and physical models",
          "Write key points you want to share",
          "Practice your presentation",
          "Prepare to answer questions about your design"
        ]
      }
    };
    
    return activities[stepNumber] || {
      title: "General Offline Activity",
      description: "Complete an offline activity related to this learning step.",
      materials: ["Notebook", "Pencil"],
      steps: ["Think about what you learned", "Create something to show your understanding", "Share with others"]
    };
  }

  saveCheckInNotes(stepNumber) {
    const notes = document.getElementById('teacherNotes').value;
    const checkInData = {
      step: stepNumber,
      notes: notes,
      timestamp: new Date().toISOString()
    };
    
    const savedNotes = JSON.parse(localStorage.getItem('teacherCheckInNotes') || '[]');
    savedNotes.push(checkInData);
    localStorage.setItem('teacherCheckInNotes', JSON.stringify(savedNotes));
    
    if (window.showToast) {
      window.showToast('Check-in notes saved!', 'success');
    }
    
    this.closeModal();
  }

  markOfflineComplete(stepNumber) {
    const offlineData = {
      step: stepNumber,
      completed: true,
      timestamp: new Date().toISOString()
    };
    
    const savedOffline = JSON.parse(localStorage.getItem('offlineActivities') || '[]');
    savedOffline.push(offlineData);
    localStorage.setItem('offlineActivities', JSON.stringify(savedOffline));
    
    if (window.showToast) {
      window.showToast('Offline activity marked as complete!', 'success');
    }
    
    this.closeModal();
  }

  setupModalClose(modal) {
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  closeModal() {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      activeModal.remove();
    }
  }

  // Public method to get current progress
  getProgress() {
    return {
      currentStep: this.currentStep,
      completedSteps: Array.from(this.completedSteps),
      progressPercentage: (this.completedSteps.size / 8) * 100
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.learn-timeline')) {
    window.learnPage = new LearnPage();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LearnPage;
}
