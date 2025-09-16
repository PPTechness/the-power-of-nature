/**
 * Enhanced Learn Page - BETT Award Ready
 * Implements 10/10 design excellence with crystal clear lesson structure
 */

class EnhancedLearnPage {
    constructor() {
        this.lessons = [];
        this.progress = null;
        this.currentTab = localStorage.getItem('np_preferred_tab') || 'student';
        this.badges = {};
    }

    getParam(name) {
        const u = new URL(location.href);
        return u.searchParams.get(name);
    }

    setStatus(lessonId, status) {
        this.progress.lessonStatus[lessonId] = status;
        localStorage.setItem('np_progress', JSON.stringify(this.progress));
        this.showToast(`Lesson ${lessonId} marked as ${status}`, 'success');
    }

    async init() {
        console.log('🎓 Initializing Enhanced Learn Page...');
        
        await this.loadData();
        this.renderPage();
        this.setupEventListeners();
        
        console.log('✅ Enhanced Learn Page ready');
    }

    async loadData() {
        try {
            // Load enhanced lessons data
            const lessonsResponse = await fetch('/data/lessons-enhanced.json');
            if (lessonsResponse.ok) {
                const data = await lessonsResponse.json();
                this.lessons = data.lessons;
            } else {
                console.warn('Failed to load enhanced lessons, falling back to standard lessons');
                const fallbackResponse = await fetch('/data/lessons.json');
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    this.lessons = fallbackData.lessons;
                }
            }

            // Load badges for progress tracking
            const badgesResponse = await fetch('/data/badges.json');
            if (badgesResponse.ok) {
                const badgesData = await badgesResponse.json();
                badgesData.badges.forEach((badge, index) => {
                    this.badges[`B${index + 1}`] = badge;
                });
            }

            // Load current progress
            this.progress = this.getProgress();
        } catch (error) {
            console.error('Error loading data:', error);
            this.lessons = [];
        }
    }

    singleLessonView(L, i) {
        // Renders a focused, single-lesson page style
        return `
            <article class="lesson" id="${L.id}" tabindex="-1" aria-labelledby="${L.id}-title">
                <header class="head">
                    <a class="btn-outline" href="/learn-enhanced.html" aria-label="Back to all lessons">← All lessons</a>
                    <div>
                        <h2 class="title" id="${L.id}-title"><span class="emoji">${L.emoji || '📘'}</span> ${L.title}</h2>
                        <div class="meta">Time: ${L.time_minutes || L.time} min · Subjects: ${(L.subjects || []).join(' · ')}</div>
                        <div class="chips" aria-label="status and actions">
                            <span class="chip">Lesson ${i+1} of ${this.lessons.length}</span>
                        </div>
                    </div>
                    <div class="nextprev">
                        <a class="btn-outline" href="/learn-enhanced.html?lesson=L${Math.max(1,i)}">← Prev</a>
                        <a class="btn" href="/learn-enhanced.html?lesson=L${Math.min(this.lessons.length, i+2)}">Next →</a>
                    </div>
                </header>
                <section class="tabs" aria-label="Lesson tabs">
                    <div class="tabbtns">
                        <button class="active" data-tab="S-${L.id}">Student</button>
                        <button data-tab="T-${L.id}">Teacher</button>
                    </div>
                    <div class="panel active" id="S-${L.id}">${this.renderStudentView(L)}</div>
                    <div class="panel" id="T-${L.id}">${this.renderTeacherView(L)}</div>
                </section>
            </article>`;
    }

    renderStudentView(lesson) {
        const student = lesson.student || {};
        return `
            <div class="student-content">
                <h3>Learning Objective</h3>
                <p class="objective">${student.learning_objective || 'Complete this lesson'}</p>
                
                <h3>Success Check</h3>
                <ul class="success-list">
                    ${(student.success_check || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h3>What You'll Do</h3>
                <ol class="activity-list">
                    ${(student.flow || []).map(step => `<li>${step}</li>`).join('')}
                </ol>
                
                <div class="lesson-actions">
                    <button class="btn btn-primary" data-act="start" data-id="${lesson.id}">
                        Start Lesson
                    </button>
                    <button class="btn btn-success" data-act="complete" data-id="${lesson.id}">
                        Mark Complete
                    </button>
                </div>
            </div>
        `;
    }

    renderTeacherView(lesson) {
        const teacher = lesson.teacher || {};
        return `
            <div class="teacher-content">
                <h3>Learning Objective (Formal)</h3>
                <p class="objective">${teacher.learning_objective_formal || 'Complete this lesson'}</p>
                
                <h3>Success Criteria</h3>
                <ul class="criteria-list">
                    ${(teacher.success_criteria || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h3>National Curriculum Links</h3>
                <ul class="nc-links">
                    ${(teacher.nc_alignment || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h3>Materials Needed</h3>
                <ul class="materials-list">
                    ${(teacher.before_lesson || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h3>Assessment</h3>
                <p class="assessment">${teacher.assessing_progress || 'Assess student understanding through activities'}</p>
            </div>
        `;
    }

    renderPage() {
        const container = document.getElementById('main') || document.body;
        const single = this.getParam('lesson'); // e.g., L4
        
        if (single) {
            const idx = Math.max(0, this.lessons.findIndex(x => x.id === single));
            container.innerHTML = this.singleLessonView(this.lessons[idx], idx);
        } else {
            container.innerHTML = `
                <div class="enhanced-learn-container">
                    <!-- Clear Progress Header -->
                    <div class="progress-header">
                        <div class="course-title">
                            <h1>Y4 Harness the Power of Nature</h1>
                            <p class="course-subtitle">Your 10-lesson learning journey</p>
                        </div>
                        ${this.renderProgressBar()}
                    </div>

                    <!-- Global Tab Preference -->
                    <div class="global-tab-controls">
                        <div class="tab-buttons">
                            <button class="tab-btn ${this.currentTab === 'student' ? 'active' : ''}" data-tab="student">
                                👨‍🎓 Student Mode
                            </button>
                            <button class="tab-btn ${this.currentTab === 'teacher' ? 'active' : ''}" data-tab="teacher">
                                🧑‍🏫 Teacher Mode
                            </button>
                        </div>
                        <p class="tab-explanation">
                            ${this.currentTab === 'student' ? 
                                'Friendly guidance and scaffolded steps for learners' : 
                                'Complete breakdown with curriculum links and assessment guidance'}
                        </p>
                    </div>

                    <!-- Lessons List -->
                    <div class="lessons-container">
                        ${this.lessons.map(lesson => this.renderLessonCard(lesson)).join('')}
                    </div>
                </div>
            `;
        }
    }

    renderProgressBar() {
        return `
            <div class="enhanced-progress-bar">
                <div class="progress-segments">
                    ${this.lessons.map((lesson, index) => {
                        const lessonNumber = index + 1;
                        const status = this.progress.lessonStatus[lesson.id] || 'notstarted';
                        const isCurrent = this.getCurrentLessonIndex() === index;
                        
                        return `
                            <button class="progress-segment ${status} ${isCurrent ? 'current' : ''}" 
                                    data-lesson="${lesson.id}"
                                    aria-current="${isCurrent ? 'step' : 'false'}"
                                    aria-label="Lesson ${lessonNumber}: ${lesson.title} - ${status}">
                                <div class="segment-number">${lessonNumber}</div>
                                <div class="segment-status">
                                    ${status === 'complete' ? '✓' : 
                                      status === 'inprogress' ? '◐' : '○'}
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
                <div class="progress-legend">
                    <div class="legend-item">
                        <span class="legend-symbol">○</span>
                        <span>Not started</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-symbol">◐</span>
                        <span>In progress</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-symbol">✓</span>
                        <span>Completed</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLessonCard(lesson) {
        const lessonNumber = lesson.id.replace('L', '');
        const status = this.progress.lessonStatus[lesson.id] || 'notstarted';
        const isLocked = this.isLessonLocked(lesson.id);
        
        return `
            <section class="enhanced-lesson-card ${status} ${isLocked ? 'locked' : ''}" 
                     id="${lesson.id}" 
                     aria-labelledby="${lesson.id}-title">
                
                <!-- Crystal Clear Header -->
                <div class="lesson-header">
                    <div class="lesson-id-block">
                        <div class="lesson-number">L${lessonNumber}</div>
                        <div class="lesson-week">Week ${lessonNumber}</div>
                    </div>
                    
                    <div class="lesson-meta">
                        <h2 id="${lesson.id}-title" class="lesson-title">
                            L${lessonNumber} · ${lesson.title}
                        </h2>
                        <div class="lesson-info">
                            <span class="time-info">⏱️ Time: ${lesson.time_minutes} minutes</span>
                            <span class="subjects-info">
                                📚 Milestones: ${lesson.subjects.map(subject => {
                                    const icons = {
                                        'Geography': '🌍',
                                        'Science': '🔬',
                                        'Design & Technology': '🛠️',
                                        'Computing': '💻',
                                        'English': '📝'
                                    };
                                    return `${icons[subject] || '📚'} ${subject}`;
                                }).join(' · ')}
                            </span>
                        </div>
                    </div>
                    
                    <div class="lesson-actions">
                        <div class="status-chip ${status}">${this.getStatusText(status)}</div>
                        ${!isLocked ? `
                            <button class="btn btn-primary complete-lesson-btn" 
                                    data-lesson="${lesson.id}"
                                    ${status === 'complete' ? 'disabled' : ''}>
                                ${status === 'complete' ? '✅ Completed' : 'Mark lesson complete'}
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Content Tabs -->
                <div class="lesson-content">
                    <div class="lesson-tabs">
                        <div class="tab-content ${this.currentTab === 'student' ? 'active' : ''}">
                            ${this.renderStudentView(lesson)}
                        </div>
                        <div class="tab-content ${this.currentTab === 'teacher' ? 'active' : ''}">
                            ${this.renderTeacherView(lesson)}
                        </div>
                    </div>
                </div>

                ${isLocked ? `
                    <div class="lesson-lock-overlay">
                        <div class="lock-message">
                            🔒 Complete the previous lesson to unlock
                        </div>
                    </div>
                ` : ''}
            </section>
        `;
    }

    renderStudentView(lesson) {
        return `
            <div class="student-view">
                <!-- Learning Objective -->
                <div class="learning-objective-card">
                    <h3>🎯 Learning objective</h3>
                    <p class="objective-text">${lesson.student.learning_objective}</p>
                </div>

                <!-- Success Check -->
                <div class="success-check-card">
                    <h4>✅ Success check</h4>
                    <ul class="success-criteria">
                        ${lesson.student.success_check.map(criterion => 
                            `<li><span class="criterion-icon">✓</span> ${criterion}</li>`
                        ).join('')}
                    </ul>
                </div>

                <!-- Lesson Flow -->
                <div class="lesson-flow-card">
                    <h4>📋 Lesson flow</h4>
                    <div class="flow-steps">
                        ${lesson.student.flow.map((step, index) => `
                            <div class="flow-step">
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">${step}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Teacher Check-in (Sticky Sidebar Style) -->
                <div class="check-in-sidebar">
                    <div class="check-in-content">
                        <h5>🧑‍🏫 Teacher check-in</h5>
                        <p class="check-in-question">${lesson.student.check_in}</p>
                    </div>
                </div>

                <!-- Student Actions -->
                <div class="student-actions">
                    <button class="btn btn-outline start-lesson-btn" data-lesson="${lesson.id}">
                        🚀 Start / Resume
                    </button>
                    <button class="btn btn-secondary save-journal-btn" data-lesson="${lesson.id}">
                        📝 Save to Journal
                    </button>
                    <button class="btn btn-ghost read-aloud-btn" data-target="${lesson.id}">
                        🔈 Read aloud
                    </button>
                </div>
            </div>
        `;
    }

    renderTeacherView(lesson) {
        return `
            <div class="teacher-view">
                <!-- Formal Learning Objective -->
                <div class="formal-objective-card">
                    <h3>🎓 Learning objective (formal)</h3>
                    <p>${lesson.teacher.learning_objective_formal}</p>
                </div>

                <!-- Success Criteria -->
                <div class="formal-criteria-card">
                    <h4>📊 Success criteria</h4>
                    <ul class="formal-criteria">
                        ${lesson.teacher.success_criteria.map(criterion => 
                            `<li>${criterion}</li>`
                        ).join('')}
                    </ul>
                </div>

                <!-- National Curriculum Alignment -->
                <div class="nc-alignment-card">
                    <h4>📜 National Curriculum alignment</h4>
                    <ul class="nc-links">
                        ${lesson.teacher.nc_alignment.map(link => 
                            `<li><strong>${link.split(':')[0]}:</strong> ${link.split(':')[1] || link}</li>`
                        ).join('')}
                    </ul>
                </div>

                <!-- Before the Lesson -->
                <div class="preparation-card">
                    <h4>📋 Before the lesson</h4>
                    <div class="checklist">
                        ${lesson.teacher.before_lesson.map(item => `
                            <label class="checklist-item">
                                <input type="checkbox" class="prep-checkbox">
                                <span class="checkmark">✓</span>
                                <span class="item-text">${item}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Adaptive Teaching -->
                <div class="adaptive-teaching-card">
                    <h4>🎯 Adaptive teaching</h4>
                    <div class="adaptive-grid">
                        <div class="support-column">
                            <h5>🤝 Support</h5>
                            <p>${lesson.teacher.adaptive_teaching.support}</p>
                        </div>
                        <div class="depth-column">
                            <h5>⭐ Greater depth</h5>
                            <p>${lesson.teacher.adaptive_teaching.greater_depth}</p>
                        </div>
                    </div>
                </div>

                <!-- Assessing Progress -->
                <div class="assessment-card">
                    <h4>📈 Assessing progress</h4>
                    <p class="assessment-guidance">${lesson.teacher.assessing_progress}</p>
                </div>

                <!-- Vocabulary -->
                <div class="vocabulary-card">
                    <h4>📖 Vocabulary</h4>
                    <div class="vocabulary-grid">
                        ${Object.entries(lesson.teacher.vocabulary).map(([term, definition]) => `
                            <div class="vocab-item">
                                <strong class="vocab-term">${term}</strong>
                                <span class="vocab-definition">${definition}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Teacher Actions -->
                <div class="teacher-actions">
                    <button class="btn btn-primary download-slides-btn" data-lesson="${lesson.id}">
                        📥 Download slides
                    </button>
                    <button class="btn btn-secondary download-checklist-btn" data-lesson="${lesson.id}">
                        📋 Download checklist
                    </button>
                    <button class="btn btn-outline preview-student-btn" data-lesson="${lesson.id}">
                        👁️ Preview student view
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const single = this.getParam('lesson');
        
        if (single) {
            // Single lesson view event listeners
            // Wire tabs and actions in single view
            const group = document.querySelector('.tabbtns');
            if (group) {
                const [btnS, btnT] = group.querySelectorAll('button');
                const panelS = group.parentElement.querySelector('.panel:nth-of-type(1)');
                const panelT = group.parentElement.querySelector('.panel:nth-of-type(2)');
                btnS.onclick = () => { 
                    btnS.classList.add('active'); 
                    btnT.classList.remove('active'); 
                    panelS.classList.add('active'); 
                    panelT.classList.remove('active'); 
                };
                btnT.onclick = () => { 
                    btnT.classList.add('active'); 
                    btnS.classList.remove('active'); 
                    panelT.classList.add('active'); 
                    panelS.classList.remove('active'); 
                };
            }
            document.querySelectorAll('[data-act="start"]').forEach(b => b.onclick = e => this.setStatus(e.currentTarget.dataset.id, 'inprogress'));
            document.querySelectorAll('[data-act="complete"]').forEach(b => b.onclick = e => {
                const id = e.currentTarget.dataset.id;
                const n = Number(id.replace('L', ''));
                this.completeLesson(id, 'B' + n);
            });
            return; // Skip multi-view setup
        }
        
        // Multi-view event listeners
        // Global tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchGlobalTab(tab);
            });
        });

        // Progress bar navigation
        document.querySelectorAll('.progress-segment').forEach(segment => {
            segment.addEventListener('click', (e) => {
                const lessonId = e.currentTarget.dataset.lesson;
                this.scrollToLesson(lessonId);
            });
        });

        // Complete lesson buttons
        document.querySelectorAll('.complete-lesson-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.lesson;
                this.completeLesson(lessonId);
            });
        });

        // Student action buttons
        document.querySelectorAll('.start-lesson-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.lesson;
                this.startLesson(lessonId);
            });
        });

        document.querySelectorAll('.save-journal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.lesson;
                this.saveToJournal(lessonId);
            });
        });

        document.querySelectorAll('.read-aloud-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                this.readAloud(targetId);
            });
        });

        // Teacher action buttons
        document.querySelectorAll('.download-slides-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.lesson;
                this.downloadSlides(lessonId);
            });
        });

        document.querySelectorAll('.download-checklist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.lesson;
                this.downloadChecklist(lessonId);
            });
        });

        document.querySelectorAll('.preview-student-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lessonId = e.target.dataset.lesson;
                this.previewStudentView(lessonId);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.switchGlobalTab(this.currentTab === 'student' ? 'teacher' : 'student');
            }
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.showKeyboardHelp();
            }
            if (e.key === 'Escape') {
                this.hideKeyboardHelp();
            }
        });

        // Modal close functionality
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideKeyboardHelp();
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('keyboardHelp');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideKeyboardHelp();
                }
            });
        }
    }

    switchGlobalTab(tab) {
        this.currentTab = tab;
        localStorage.setItem('np_preferred_tab', tab);
        
        // Update global tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update all lesson tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            const isStudentTab = content.classList.contains('student-view') || 
                               content.querySelector('.student-view');
            const shouldShow = (tab === 'student' && isStudentTab) || 
                              (tab === 'teacher' && !isStudentTab);
            content.classList.toggle('active', shouldShow);
        });
        
        // Update explanation
        const explanation = document.querySelector('.tab-explanation');
        explanation.textContent = tab === 'student' ? 
            'Friendly guidance and scaffolded steps for learners' : 
            'Complete breakdown with curriculum links and assessment guidance';
    }

    scrollToLesson(lessonId) {
        const element = document.getElementById(lessonId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
            
            // Add focus for accessibility
            element.setAttribute('tabindex', '-1');
            element.focus();
            
            // Brief highlight animation
            element.classList.add('highlighted');
            setTimeout(() => element.classList.remove('highlighted'), 2000);
        }
    }

    completeLesson(lessonId) {
        const lessonNumber = lessonId.replace('L', '');
        const badgeId = `B${lessonNumber}`;
        
        // Update progress
        this.progress.lessonStatus[lessonId] = 'complete';
        this.progress.xp += 50;
        
        // Award badge
        if (!this.progress.badges[badgeId]) {
            this.progress.badges[badgeId] = Date.now();
        }
        
        // Update streak
        this.updateStreak();
        
        // Save progress
        this.saveProgress();
        
        // Create journal entry
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            this.saveJournalEntry({
                id: `${lessonId}-${Date.now()}`,
                lessonId: lessonId,
                title: lesson.title,
                facts: [],
                reflection: '',
                timestamp: Date.now()
            });
        }
        
        // Show celebration
        this.showCompletionCelebration(lessonId, badgeId);
        
        // Update UI
        setTimeout(() => {
            this.renderPage();
        }, 2000);
    }

    showCompletionCelebration(lessonId, badgeId) {
        const badge = this.badges[badgeId];
        
        // Create celebration modal
        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-confetti">🎉</div>
                <h2>Lesson Completed!</h2>
                <div class="badge-earned">
                    <div class="badge-icon-large">${badge?.icon || '🏆'}</div>
                    <div class="badge-info">
                        <h3>${badge?.title || 'Achievement Unlocked'}</h3>
                        <p>${badge?.caption || 'Well done!'}</p>
                    </div>
                </div>
                <div class="xp-gained">+50 XP</div>
                <button class="btn btn-primary continue-btn">Continue Learning</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add celebration animation
        setTimeout(() => modal.classList.add('show'), 100);
        
        // Handle continue
        modal.querySelector('.continue-btn').addEventListener('click', () => {
            modal.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 5000);
    }

    getCurrentLessonIndex() {
        // Check if we're in single lesson view
        const single = this.getParam('lesson');
        if (single) {
            return this.lessons.findIndex(x => x.id === single);
        }
        
        // Find the first incomplete lesson
        for (let i = 0; i < this.lessons.length; i++) {
            const status = this.progress.lessonStatus[this.lessons[i].id];
            if (status !== 'complete') {
                return i;
            }
        }
        return this.lessons.length - 1; // All complete, highlight last
    }

    isLessonLocked(lessonId) {
        const currentIndex = this.lessons.findIndex(l => l.id === lessonId);
        
        // First lesson is never locked
        if (currentIndex === 0) return false;
        
        // Check if previous lesson is complete
        const previousLesson = this.lessons[currentIndex - 1];
        const previousStatus = this.progress.lessonStatus[previousLesson.id];
        
        return previousStatus !== 'complete';
    }

    getStatusText(status) {
        const statusMap = {
            'notstarted': 'Not started',
            'inprogress': 'In progress',
            'complete': '✅ Completed'
        };
        return statusMap[status] || 'Not started';
    }

    // Progress management methods
    getProgress() {
        try {
            return JSON.parse(localStorage.getItem('np_progress')) || {
                lessonStatus: {},
                xp: 0,
                badges: {},
                streak: 0,
                lastVisitISO: null
            };
        } catch {
            return {
                lessonStatus: {},
                xp: 0,
                badges: {},
                streak: 0,
                lastVisitISO: null
            };
        }
    }

    saveProgress() {
        localStorage.setItem('np_progress', JSON.stringify(this.progress));
    }

    updateStreak() {
        const today = new Date().toDateString();
        if (!this.progress.lastVisitISO) {
            this.progress.lastVisitISO = today;
            this.progress.streak = 1;
        } else if (this.progress.lastVisitISO !== today) {
            this.progress.streak += 1;
            this.progress.lastVisitISO = today;
        }
    }

    saveJournalEntry(entry) {
        try {
            const journal = JSON.parse(localStorage.getItem('np_journal')) || [];
            journal.push(entry);
            localStorage.setItem('np_journal', JSON.stringify(journal));
        } catch (error) {
            console.error('Error saving journal entry:', error);
        }
    }

    // Action methods for buttons
    startLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            this.setLessonStatus(lessonId, 'inprogress');
            this.showToast(`🚀 Started ${lesson.title}! Your progress is being saved.`, 'success');
            
            // Track interaction
            if (window.learningAnalytics) {
                window.learningAnalytics.trackInteraction('lesson_started', lessonId, {
                    lessonTitle: lesson.title,
                    timeMinutes: lesson.time_minutes
                });
            }
        }
    }

    saveToJournal(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            const entry = {
                id: `${lessonId}-${Date.now()}`,
                lessonId: lessonId,
                title: lesson.title,
                facts: ['Saved from enhanced learn page'],
                reflection: 'I learned about ' + lesson.title.toLowerCase(),
                timestamp: Date.now()
            };
            
            this.saveJournalEntry(entry);
            this.showToast('📝 Saved to Journal!', 'success');
            
            // Track interaction
            if (window.learningAnalytics) {
                window.learningAnalytics.trackInteraction('journal_saved', lessonId);
            }
        }
    }

    readAloud(targetId) {
        const element = document.getElementById(targetId);
        if (element && window.speechSynthesis) {
            const text = element.textContent || element.innerText;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
            this.showToast('🔈 Reading aloud...', 'info');
        } else {
            this.showToast('🔈 Read-aloud not available in this browser', 'warning');
        }
    }

    downloadSlides(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            // Create a simple text file as placeholder
            const content = `Lesson ${lessonId}: ${lesson.title}\n\nLearning Objective: ${lesson.teacher.learning_objective_formal}\n\nSuccess Criteria:\n${lesson.teacher.success_criteria.map(c => `• ${c}`).join('\n')}\n\nNational Curriculum Links:\n${lesson.teacher.nc_alignment.map(l => `• ${l}`).join('\n')}`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lesson-${lessonId}-slides.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('📥 Slides downloaded!', 'success');
        }
    }

    downloadChecklist(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (lesson) {
            const content = `Lesson ${lessonId} Preparation Checklist\n\n${lesson.teacher.before_lesson.map(item => `☐ ${item}`).join('\n')}\n\nVocabulary to Review:\n${Object.entries(lesson.teacher.vocabulary).map(([term, def]) => `• ${term}: ${def}`).join('\n')}`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lesson-${lessonId}-checklist.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('📋 Checklist downloaded!', 'success');
        }
    }

    previewStudentView(lessonId) {
        this.switchGlobalTab('student');
        this.scrollToLesson(lessonId);
        this.showToast('👁️ Switched to student view', 'info');
    }

    showKeyboardHelp() {
        const modal = document.getElementById('keyboardHelp');
        if (modal) {
            modal.setAttribute('aria-hidden', 'false');
            modal.style.display = 'flex';
            modal.querySelector('.modal-close').focus();
        }
    }

    hideKeyboardHelp() {
        const modal = document.getElementById('keyboardHelp');
        if (modal) {
            modal.setAttribute('aria-hidden', 'true');
            modal.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg);
            color: var(--ink);
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--accent)' : 'var(--primary)'};
            z-index: 1000;
            animation: toast-slide-in 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toast-slide-out 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    setLessonStatus(lessonId, status) {
        this.progress.lessonStatus[lessonId] = status;
        this.saveProgress();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const enhancedLearnPage = new EnhancedLearnPage();
    enhancedLearnPage.init();
    
    // Export for global access
    window.enhancedLearnPage = enhancedLearnPage;
});
