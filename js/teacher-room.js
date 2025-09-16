/**
 * Teacher Room Controller
 * Manages teacher resources, downloads, rubrics, and safeguarding tools
 */

const teacherRoom = {
    lessons: null,
    rubrics: null,

    async init() {
        console.log('🏫 Initializing Teacher Room...');
        
        // Load data
        await this.loadData();
        
        // Render sections
        this.renderMTPGrid();
        this.renderRubricPreviews();
        this.setupEventListeners();
        this.refreshModerationStats();
        
        console.log('✅ Teacher Room initialized');
    },

    async loadData() {
        try {
            // Load lessons data
            const lessonsResponse = await fetch('/data/lessons.json');
            if (lessonsResponse.ok) {
                const lessonsData = await lessonsResponse.json();
                this.lessons = lessonsData.lessons;
            }

            // Load rubrics data
            const rubricsResponse = await fetch('/data/rubrics.json');
            if (rubricsResponse.ok) {
                this.rubrics = await rubricsResponse.json();
            }
        } catch (error) {
            console.error('Error loading teacher data:', error);
            this.lessons = [];
            this.rubrics = {};
        }
    },

    renderMTPGrid() {
        const mtpGrid = document.getElementById('mtpGrid');
        if (!this.lessons || this.lessons.length === 0) {
            mtpGrid.innerHTML = '<p class="error-message">Unable to load lesson data</p>';
            return;
        }

        mtpGrid.innerHTML = this.lessons.map((lesson, index) => `
            <div class="mtp-card" data-lesson-id="${lesson.id}">
                <div class="mtp-card-header">
                    <div class="lesson-number">${index + 1}</div>
                    <div class="lesson-week">Week ${index + 1}</div>
                </div>
                
                <div class="mtp-card-content">
                    <h3 class="lesson-title">${lesson.title}</h3>
                    <div class="lesson-time">⏱️ ${lesson.time_minutes} minutes</div>
                    
                    <div class="learning-intention">
                        <strong>Learning Intention:</strong>
                        <p>${lesson.learning_intention}</p>
                    </div>
                    
                    <div class="sticky-knowledge">
                        <strong>Sticky Knowledge:</strong>
                        <ul>
                            ${lesson.sticky_knowledge.map(knowledge => `<li>${knowledge}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="activities-overview">
                        <div class="activity-type">
                            <span class="activity-icon">💻</span>
                            <span class="activity-label">Online: ${lesson.online.join(', ')}</span>
                        </div>
                        <div class="activity-type">
                            <span class="activity-icon">📝</span>
                            <span class="activity-label">Offline: ${lesson.offline[0] || 'None'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="mtp-card-actions">
                    <button class="btn btn-primary btn-sm" onclick="teacherRoom.previewLesson('${lesson.id}')">
                        👁️ Preview Student View
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="teacherRoom.downloadLessonPlan('${lesson.id}')">
                        📥 Lesson Plan
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderRubricPreviews() {
        if (!this.rubrics) return;

        // Data Story Rubric Preview
        const dataStoryPreview = document.getElementById('dataStoryRubric');
        if (this.rubrics.data_story) {
            dataStoryPreview.innerHTML = `
                <div class="rubric-criteria">
                    ${this.rubrics.data_story.slice(0, 2).map(criterion => `
                        <div class="criterion-preview">
                            <strong>${criterion.criterion}:</strong>
                            <span class="levels">${criterion.levels.join(' → ')}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Design Summary Rubric Preview
        const designSummaryPreview = document.getElementById('designSummaryRubric');
        if (this.rubrics.design_summary) {
            designSummaryPreview.innerHTML = `
                <div class="rubric-criteria">
                    ${this.rubrics.design_summary.slice(0, 2).map(criterion => `
                        <div class="criterion-preview">
                            <strong>${criterion.criterion}:</strong>
                            <span class="levels">${criterion.levels.join(' → ')}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    },

    setupEventListeners() {
        // Rubric modal handlers
        const rubricModal = document.getElementById('rubricModal');
        const rubricModalClose = document.getElementById('rubricModalClose');
        
        rubricModalClose?.addEventListener('click', () => {
            rubricModal.classList.remove('active');
        });
        
        rubricModal?.addEventListener('click', (e) => {
            if (e.target === rubricModal) {
                rubricModal.classList.remove('active');
            }
        });
        
        // Keyboard accessibility for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && rubricModal.classList.contains('active')) {
                rubricModal.classList.remove('active');
            }
        });
    },

    previewLesson(lessonId) {
        // Navigate to the lesson in the learn page
        window.open(`/learn.html#${lessonId}`, '_blank');
    },

    downloadLessonPlan(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            this.showNotification('Lesson not found', 'error');
            return;
        }

        const lessonPlan = {
            id: lesson.id,
            title: lesson.title,
            duration: `${lesson.time_minutes} minutes`,
            learningIntention: lesson.learning_intention,
            stickyKnowledge: lesson.sticky_knowledge,
            onlineActivities: lesson.online,
            offlineActivities: lesson.offline,
            teacherCheckIn: lesson.check_in,
            assessmentPrompt: lesson.assessment_prompt,
            badge: lesson.badge,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(lessonPlan, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lesson-plan-${lessonId}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showNotification('Lesson plan downloaded successfully! 📥', 'success');
    },

    downloadSlides(lessonRange) {
        // Simulate downloading slide decks
        this.showNotification(`Slide deck for ${lessonRange} would be downloaded here. This is a placeholder for the actual slide deck files.`, 'info');
        
        // In a real implementation, this would trigger a download of PowerPoint/Keynote files
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#'; // Would be actual file URL
            link.download = `nature-power-slides-${lessonRange}.pptx`;
            // link.click(); // Commented out as it's a placeholder
        }, 500);
    },

    openTemplate(templateType) {
        const templates = {
            cospaces: {
                url: 'https://cospaces.io/edu/templates/nature-power-house-design',
                name: 'CoSpaces VR Template'
            },
            tinkercad: {
                url: 'https://www.tinkercad.com/classrooms/nature-power-design',
                name: 'Tinkercad Classroom'
            }
        };

        const template = templates[templateType];
        if (template) {
            window.open(template.url, '_blank');
            this.showNotification(`Opening ${template.name} in a new tab...`, 'success');
        } else {
            this.showNotification('Template not found', 'error');
        }
    },

    downloadTemplate(templateType) {
        const templates = {
            poster: {
                filename: 'nature-power-poster-templates.zip',
                description: 'Poster template pack with A4 and landscape formats'
            }
        };

        const template = templates[templateType];
        if (template) {
            this.showNotification(`${template.description} would be downloaded here. This is a placeholder for the actual template files.`, 'info');
            
            // In a real implementation, this would download the template files
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = '#'; // Would be actual file URL
                link.download = template.filename;
                // link.click(); // Commented out as it's a placeholder
            }, 500);
        }
    },

    exportAllJournals() {
        // Get all journal entries from localStorage
        const allJournals = JSON.parse(localStorage.getItem('np_journal') || '[]');
        
        if (allJournals.length === 0) {
            this.showNotification('No journal entries found to export', 'info');
            return;
        }

        // Convert to CSV format
        const csvContent = this.journalsToCSV(allJournals);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `all-student-journals-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        this.showNotification(`Exported ${allJournals.length} journal entries successfully! 📊`, 'success');
    },

    journalsToCSV(journals) {
        const headers = ['Date', 'Student', 'Lesson ID', 'Lesson Title', 'Facts', 'Reflection'];
        const rows = [headers];
        
        journals.forEach(entry => {
            const row = [
                new Date(entry.timestamp).toLocaleDateString(),
                'Student', // In a real system, this would be the actual student name
                entry.lessonId,
                entry.title,
                entry.facts ? entry.facts.join('; ') : '',
                entry.reflection || ''
            ];
            rows.push(row);
        });
        
        return rows.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    },

    viewRubric(rubricType) {
        const modal = document.getElementById('rubricModal');
        const modalTitle = document.getElementById('rubricModalTitle');
        const modalContent = document.getElementById('rubricModalContent');
        
        const rubricTitles = {
            data_story: '📝 Data Story Rubric',
            design_summary: '🏗️ Design Summary Rubric'
        };
        
        modalTitle.textContent = rubricTitles[rubricType] || 'Rubric';
        
        if (this.rubrics && this.rubrics[rubricType]) {
            modalContent.innerHTML = this.formatRubricHTML(this.rubrics[rubricType], rubricType);
        } else {
            modalContent.innerHTML = '<p>Rubric data not available</p>';
        }
        
        modal.classList.add('active');
    },

    formatRubricHTML(rubricData, rubricType) {
        const descriptions = {
            data_story: 'Use this rubric to assess how well students use evidence and reasoning in their scientific explanations.',
            design_summary: 'Use this rubric to evaluate student design thinking and problem-solving processes.'
        };

        return `
            <div class="rubric-full">
                <div class="rubric-description">
                    <p>${descriptions[rubricType]}</p>
                </div>
                
                <div class="rubric-table">
                    <div class="rubric-header">
                        <div class="criterion-header">Criterion</div>
                        ${rubricData[0].levels.map(level => `<div class="level-header">${level}</div>`).join('')}
                    </div>
                    
                    ${rubricData.map(criterion => `
                        <div class="rubric-row">
                            <div class="criterion-cell">
                                <strong>${criterion.criterion}</strong>
                            </div>
                            ${criterion.levels.map(level => `
                                <div class="level-cell">
                                    ${this.getLevelDescription(rubricType, criterion.criterion, level)}
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                
                <div class="rubric-usage">
                    <h4>How to Use This Rubric:</h4>
                    <ol>
                        <li>Review student work against each criterion</li>
                        <li>Select the level that best matches the evidence</li>
                        <li>Provide specific feedback referencing the rubric language</li>
                        <li>Use for both formative feedback and summative assessment</li>
                    </ol>
                </div>
            </div>
        `;
    },

    getLevelDescription(rubricType, criterion, level) {
        // Detailed descriptions for rubric levels
        const descriptions = {
            data_story: {
                'Evidence used': {
                    'Starting': 'Makes claims with little or no supporting evidence',
                    'Secure': 'Uses some relevant evidence to support claims',
                    'Strong': 'Uses multiple, specific pieces of evidence effectively'
                },
                'Reasoning': {
                    'Starting': 'Simple statements without clear reasoning',
                    'Secure': 'Shows basic cause-effect understanding',
                    'Strong': 'Clear, logical reasoning linking evidence to conclusions'
                },
                'Clarity for audience': {
                    'Starting': 'Ideas are unclear or hard to follow',
                    'Secure': 'Most ideas are clearly communicated',
                    'Strong': 'All ideas clearly explained for the intended audience'
                }
            },
            design_summary: {
                'Change tested': {
                    'Stated': 'Mentions what was changed',
                    'Explained': 'Describes the change clearly',
                    'Justified': 'Explains why this change was chosen'
                },
                'Impact explained': {
                    'Guessed': 'Makes predictions without testing',
                    'Observed': 'Describes what happened',
                    'Explained with cause': 'Links cause and effect clearly'
                },
                'Safety & ethics': {
                    'Mentioned': 'Shows awareness of safety/ethical issues',
                    'Considered': 'Discusses safety/ethical considerations',
                    'Applied': 'Integrates safety/ethics into design decisions'
                }
            }
        };

        return descriptions[rubricType]?.[criterion]?.[level] || level;
    },

    downloadRubric(rubricType) {
        const rubricTitles = {
            data_story: 'Data Story Assessment Rubric',
            design_summary: 'Design Summary Assessment Rubric'
        };

        // In a real implementation, this would generate and download a PDF
        this.showNotification(`${rubricTitles[rubricType]} PDF would be downloaded here. This is a placeholder for the actual PDF generation.`, 'info');
        
        // Simulate PDF download
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#'; // Would be actual PDF URL
            link.download = `${rubricType}-rubric.pdf`;
            // link.click(); // Commented out as it's a placeholder
        }, 500);
    },

    downloadGuidelines(guidelineType) {
        const guidelines = {
            safety: 'Digital Safety Guidelines for Y4 Nature Power'
        };

        this.showNotification(`${guidelines[guidelineType]} would be downloaded here. This is a placeholder for the actual guideline documents.`, 'info');
    },

    downloadPermissionForms() {
        this.showNotification('Image permission forms would be downloaded here. This is a placeholder for the actual permission form templates.', 'info');
    },

    emergencyContact() {
        const contactInfo = `
Emergency Safeguarding Contacts:

🏫 School Safeguarding Lead: [Contact details]
📞 Local Authority: [Contact details]  
🚨 Emergency Services: 999 (UK) / 911 (US)

This would open your school's specific emergency contact protocol.
        `;

        alert(contactInfo);
        this.showNotification('Emergency contacts displayed. Please follow your school\'s safeguarding protocol.', 'info');
    },

    downloadIncidentForm() {
        this.showNotification('Safeguarding incident form would be downloaded here. This is a placeholder for the actual incident reporting template.', 'info');
    },

    refreshModerationStats() {
        // In a real implementation, this would query a database
        // For now, we'll simulate with some sample data
        const stats = {
            pending: 3,
            approved: 12,
            total: 15
        };

        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('approvedCount').textContent = stats.approved;
        document.getElementById('totalCount').textContent = stats.total;

        this.showNotification('Moderation stats refreshed', 'success');
    },

    showNotification(message, type = 'info') {
        // Create a notification element
        const notification = document.createElement('div');
        notification.className = `teacher-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    teacherRoom.init();
});

// Export for global access
window.teacherRoom = teacherRoom;
