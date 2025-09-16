/**
 * Teacher Room Widget
 * Manages teacher resources, stats, and class management
 */

class TeacherRoomWidget {
  constructor() {
    this.stats = {
      totalStudents: 0,
      completedActivities: 0,
      galleryItems: 0,
      journalEntries: 0
    };
    
    this.init();
  }

  init() {
    this.loadStats();
    this.setupEventListeners();
    this.updateStatsDisplay();
  }

  setupEventListeners() {
    // Code blocks modal
    const codeBlocksModal = document.getElementById('codeBlocksModal');
    const modalClose = codeBlocksModal?.querySelector('.modal-close');
    
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        codeBlocksModal.classList.remove('active');
      });
    }

    // Close modal on outside click
    if (codeBlocksModal) {
      codeBlocksModal.addEventListener('click', (e) => {
        if (e.target === codeBlocksModal) {
          codeBlocksModal.classList.remove('active');
        }
      });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
          activeModal.classList.remove('active');
        }
      }
    });
  }

  loadStats() {
    // Load from localStorage or calculate from existing data
    const savedStats = localStorage.getItem('teacherStats');
    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    } else {
      this.calculateStats();
    }
  }

  calculateStats() {
    // Calculate stats from existing data
    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const galleryItems = JSON.parse(localStorage.getItem('galleryItems') || '[]');
    
    this.stats = {
      totalStudents: this.getStudentCount(),
      completedActivities: this.getCompletedActivitiesCount(),
      galleryItems: galleryItems.length,
      journalEntries: journalEntries.length
    };
    
    this.saveStats();
  }

  getStudentCount() {
    // Estimate based on journal entries and gallery items
    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const galleryItems = JSON.parse(localStorage.getItem('galleryItems') || '[]');
    
    const allClasses = new Set();
    journalEntries.forEach(entry => {
      if (entry.class) allClasses.add(entry.class);
    });
    galleryItems.forEach(item => {
      if (item.class) allClasses.add(item.class);
    });
    
    // Estimate 25 students per class
    return allClasses.size * 25;
  }

  getCompletedActivitiesCount() {
    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const galleryItems = JSON.parse(localStorage.getItem('galleryItems') || '[]');
    
    // Count unique activities completed
    const completedActivities = new Set();
    journalEntries.forEach(entry => {
      if (entry.activity) completedActivities.add(entry.activity);
    });
    galleryItems.forEach(item => {
      if (item.activity) completedActivities.add(item.activity);
    });
    
    return completedActivities.size;
  }

  updateStatsDisplay() {
    const elements = {
      totalStudents: document.getElementById('totalStudents'),
      completedActivities: document.getElementById('completedActivities'),
      galleryItems: document.getElementById('galleryItems'),
      journalEntries: document.getElementById('journalEntries')
    };

    Object.entries(elements).forEach(([key, element]) => {
      if (element) {
        this.animateNumber(element, this.stats[key]);
      }
    });
  }

  animateNumber(element, targetNumber) {
    const startNumber = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress);
      element.textContent = currentNumber;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  saveStats() {
    localStorage.setItem('teacherStats', JSON.stringify(this.stats));
  }

  // Resource action methods
  openInteractivePlan() {
    if (window.showToast) {
      window.showToast('Opening interactive learning plan...', 'info');
    }
    
    // In a real implementation, this would open an interactive map
    // For now, redirect to learn page
    window.location.href = '/learn.html';
  }

  downloadSlides(topic) {
    const slideContent = this.generateSlideContent(topic);
    this.downloadFile(slideContent, `${topic}-slides.txt`, 'text/plain');
    
    if (window.showToast) {
      window.showToast(`${topic} slides downloaded!`, 'success');
    }
  }

  openGoogleSlides(topic) {
    // In a real implementation, this would open Google Slides
    if (window.showToast) {
      window.showToast('Opening Google Slides...', 'info');
    }
    
    // For demo purposes, open a new tab
    window.open('https://docs.google.com/presentation/', '_blank');
  }

  downloadTemplate(type) {
    let content = '';
    let filename = '';
    
    switch (type) {
      case 'poster':
        content = this.generatePosterTemplate();
        filename = 'digital-citizenship-poster-template.txt';
        break;
      case 'csv':
        content = this.generateCSVTemplate();
        filename = 'student-progress-template.csv';
        break;
    }
    
    this.downloadFile(content, filename, type === 'csv' ? 'text/csv' : 'text/plain');
    
    if (window.showToast) {
      window.showToast(`${type} template downloaded!`, 'success');
    }
  }

  downloadRubric(type) {
    const rubricContent = this.generateRubricContent(type);
    this.downloadFile(rubricContent, `${type}-rubric.txt`, 'text/plain');
    
    if (window.showToast) {
      window.showToast(`${type} rubric downloaded!`, 'success');
    }
  }

  openTechVideos() {
    if (window.showToast) {
      window.showToast('Opening Tech in 10 videos...', 'info');
    }
    
    // In a real implementation, this would open a video playlist
    // For demo purposes, show a modal with video links
    this.showVideoModal();
  }

  downloadSafeguarding() {
    const safeguardingContent = this.generateSafeguardingContent();
    this.downloadFile(safeguardingContent, 'safeguarding-checklist.txt', 'text/plain');
    
    if (window.showToast) {
      window.showToast('Safeguarding checklist downloaded!', 'success');
    }
  }

  openReportForm() {
    if (window.showToast) {
      window.showToast('Opening report form...', 'info');
    }
    
    // In a real implementation, this would open a report form
    // For demo purposes, show an alert
    alert('Report form would open here. In a real implementation, this would connect to your school\'s reporting system.');
  }

  showCodeBlocks() {
    const modal = document.getElementById('codeBlocksModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  openProgressTracker() {
    if (window.showToast) {
      window.showToast('Opening progress tracker...', 'info');
    }
    
    // In a real implementation, this would open a detailed progress view
    // For demo purposes, redirect to gallery
    window.location.href = '/gallery.html';
  }

  exportClassData() {
    const classData = this.generateClassDataExport();
    this.downloadFile(classData, 'class-data-export.json', 'application/json');
    
    if (window.showToast) {
      window.showToast('Class data exported!', 'success');
    }
  }

  openSettings() {
    if (window.showToast) {
      window.showToast('Opening settings...', 'info');
    }
    
    // In a real implementation, this would open a settings modal
    alert('Settings panel would open here. This would include class configuration, moderation rules, and notification preferences.');
  }

  // Content generation methods
  generateSlideContent(topic) {
    const slides = {
      weather: `
Weather & Climate Explorer - Lesson Slides

Slide 1: Title
"Understanding Weather vs Climate"
- What's the difference?
- Why does it matter for our homes?

Slide 2: Learning Objectives
- Compare weather patterns between different places
- Understand how climate affects home design
- Use data to make informed decisions

Slide 3: Interactive Activity
"Let's explore together!"
- Open the Weather Explorer widget
- Choose two cities to compare
- Look for patterns in the data

Slide 4: Discussion Questions
- What patterns do you notice?
- How might this affect home design?
- What questions do you have?

Slide 5: Next Steps
- Complete the weather comparison
- Save your findings to your journal
- Share interesting discoveries with the class
      `,
      circuits: `
Circuits Sandbox - Lesson Slides

Slide 1: Title
"Building Electrical Circuits"
- Understanding how electricity flows
- Creating working circuits

Slide 2: Learning Objectives
- Identify circuit components
- Build complete circuits
- Understand electrical flow

Slide 3: Safety First
- Always ask an adult for help
- Never touch exposed wires
- Use only the provided components

Slide 4: Let's Build!
- Open the Circuits Sandbox
- Start with a simple circuit
- Experiment with different components

Slide 5: Share Your Success
- Take a screenshot of your working circuit
- Save it to your journal
- Explain how your circuit works
      `
    };
    
    return slides[topic] || 'Slide content not available.';
  }

  generatePosterTemplate() {
    return `
Digital Citizenship Poster Template

Instructions:
1. Print this template on A3 paper
2. Have students fill in their own rules
3. Display in the classroom

Our Digital Citizenship Golden Rules

Rule 1: ________________________________
_______________________________________

Rule 2: ________________________________
_______________________________________

Rule 3: ________________________________
_______________________________________

Rule 4: ________________________________
_______________________________________

Class: ________________
Date: ________________

Remember: Think before you share!
    `.trim();
  }

  generateCSVTemplate() {
    return `Student Name,Class,Weather Activity,Circuit Activity,Design Activity,Poster Activity,Journal Entries,Last Updated
John Smith,5A,Completed,Completed,In Progress,Not Started,3,2024-09-13
Sarah Johnson,5A,Completed,Completed,Completed,Completed,5,2024-09-13
Mike Chen,5B,In Progress,Not Started,Not Started,Not Started,1,2024-09-12
Emma Wilson,5B,Completed,Completed,In Progress,Not Started,4,2024-09-13`;
  }

  generateRubricContent(type) {
    const rubrics = {
      'data-story': `
Data Story Rubric - Assessment Criteria

Excellent (4 points):
- Clear comparison between two or more places
- Uses specific data to support conclusions
- Explains patterns and relationships
- Asks thoughtful questions about the data

Good (3 points):
- Compares two places with some data
- Draws basic conclusions from data
- Identifies some patterns
- Asks relevant questions

Satisfactory (2 points):
- Basic comparison with limited data
- Simple conclusions
- Identifies obvious patterns
- Asks basic questions

Needs Improvement (1 point):
- Limited or no comparison
- No clear conclusions
- No pattern identification
- No questions asked

Total: ___/16 points
      `,
      'design-summary': `
Design Summary Rubric - Assessment Criteria

Excellent (4 points):
- Explains design choices with clear reasoning
- Considers multiple environmental factors
- Shows understanding of sustainability
- Creative and innovative solutions

Good (3 points):
- Explains most design choices
- Considers some environmental factors
- Shows basic understanding of sustainability
- Some creative elements

Satisfactory (2 points):
- Basic explanation of design choices
- Limited environmental consideration
- Basic sustainability understanding
- Few creative elements

Needs Improvement (1 point):
- Little or no explanation
- No environmental consideration
- No sustainability understanding
- No creative elements

Total: ___/16 points
      `
    };
    
    return rubrics[type] || 'Rubric not available.';
  }

  generateSafeguardingContent() {
    return `
Safeguarding & Permissions Checklist

Pre-Activity Checklist:
□ Parent/guardian permission obtained for image sharing
□ Students understand what can/cannot be shared
□ Clear guidelines provided for online behavior
□ Reporting procedures explained to students

During Activity:
□ Monitor student interactions
□ Ensure appropriate content sharing
□ Address any concerns immediately
□ Document any incidents

Post-Activity:
□ Review all shared content
□ Moderate gallery submissions
□ Follow up on any concerns
□ Update permissions as needed

Emergency Contacts:
- School Safeguarding Lead: [Contact Info]
- IT Support: [Contact Info]
- Emergency: [Contact Info]

Report a Concern:
- Use the in-app reporting feature
- Contact safeguarding lead immediately
- Document all details
- Follow school procedures

Remember: Student safety is our top priority!
    `.trim();
  }

  generateClassDataExport() {
    const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const galleryItems = JSON.parse(localStorage.getItem('galleryItems') || '[]');
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      stats: this.stats,
      journalEntries: journalEntries,
      galleryItems: galleryItems,
      summary: {
        totalStudents: this.stats.totalStudents,
        totalActivities: this.stats.completedActivities,
        totalSubmissions: this.stats.galleryItems,
        totalJournalEntries: this.stats.journalEntries
      }
    }, null, 2);
  }

  showVideoModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h3>Tech in 10 - Quick Tutorial Videos</h3>
        <div class="video-list">
          <div class="video-item">
            <h4>🌤️ Weather Explorer (2:30)</h4>
            <p>How to use the weather comparison tool effectively</p>
            <button class="btn btn-primary">Watch Video</button>
          </div>
          <div class="video-item">
            <h4>🏠 Design Tester (1:45)</h4>
            <p>Understanding the house design feedback system</p>
            <button class="btn btn-primary">Watch Video</button>
          </div>
          <div class="video-item">
            <h4>⚡ Circuits Sandbox (2:15)</h4>
            <p>Building and testing electrical circuits</p>
            <button class="btn btn-primary">Watch Video</button>
          </div>
          <div class="video-item">
            <h4>🎨 Gallery Moderation (1:30)</h4>
            <p>Managing student submissions and approvals</p>
            <button class="btn btn-primary">Watch Video</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Public method to refresh stats
  refreshStats() {
    this.calculateStats();
    this.updateStatsDisplay();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.teacher-stats')) {
    window.teacherWidget = new TeacherRoomWidget();
  }
});

// Global functions for onclick handlers
window.openInteractivePlan = () => window.teacherWidget?.openInteractivePlan();
window.downloadSlides = (topic) => window.teacherWidget?.downloadSlides(topic);
window.openGoogleSlides = (topic) => window.teacherWidget?.openGoogleSlides(topic);
window.downloadTemplate = (type) => window.teacherWidget?.downloadTemplate(type);
window.downloadRubric = (type) => window.teacherWidget?.downloadRubric(type);
window.openTechVideos = () => window.teacherWidget?.openTechVideos();
window.downloadSafeguarding = () => window.teacherWidget?.downloadSafeguarding();
window.openReportForm = () => window.teacherWidget?.openReportForm();
window.showCodeBlocks = () => window.teacherWidget?.showCodeBlocks();
window.openProgressTracker = () => window.teacherWidget?.openProgressTracker();
window.exportClassData = () => window.teacherWidget?.exportClassData();
window.openSettings = () => window.teacherWidget?.openSettings();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TeacherRoomWidget;
}
