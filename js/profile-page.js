/**
 * Profile Page Controller
 * Manages the student's profile dashboard with badges, XP, and journal timeline
 */

const profilePage = {
    progress: null,
    badges: null,
    journal: null,

    async init() {
        console.log('📊 Initializing Profile Page...');
        
        // Load data
        this.progress = getProgress();
        this.badges = await this.loadBadges();
        this.journal = getEntries();
        
        // Render all sections
        this.renderProfileStats();
        this.renderProgressOverview();
        this.renderBadgeGrid();
        this.renderJournalTimeline();
        this.renderLearningStats();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Profile Page initialized');
    },

    async loadBadges() {
        try {
            const response = await fetch('/data/badges.json');
            if (!response.ok) throw new Error('Failed to load badges');
            const data = await response.json();
            return data.badges;
        } catch (error) {
            console.error('Error loading badges:', error);
            return [];
        }
    },

    renderProfileStats() {
        const completedLessons = Object.values(this.progress.lessonStatus).filter(status => status === 'complete').length;
        const completionPercentage = Math.round((completedLessons / 10) * 100);
        
        // Update header stats
        document.getElementById('profileXP').textContent = this.progress.xp;
        document.getElementById('profileStreak').textContent = this.progress.streak;
        document.getElementById('profileCompletion').textContent = `${completionPercentage}%`;
        
        // Show certificate button if all complete
        const certificateBtn = document.getElementById('downloadCertificateBtn');
        if (allComplete()) {
            certificateBtn.style.display = 'inline-flex';
        }
    },

    renderProgressOverview() {
        const completedLessons = Object.values(this.progress.lessonStatus).filter(status => status === 'complete').length;
        const earnedBadges = Object.keys(this.progress.badges || {}).length;
        const completionPercentage = Math.round((completedLessons / 10) * 100);
        
        // Update progress circle
        const progressCircle = document.getElementById('progressCircle');
        const progressPercentage = document.getElementById('progressPercentage');
        
        const gradientEnd = (completionPercentage / 100) * 360;
        progressCircle.style.background = `conic-gradient(var(--primary) ${gradientEnd}deg, var(--bg-soft) ${gradientEnd}deg)`;
        progressPercentage.textContent = `${completionPercentage}%`;
        
        // Update progress details
        document.getElementById('lessonsComplete').textContent = `${completedLessons}/10`;
        document.getElementById('badgesEarned').textContent = `${earnedBadges}/10`;
        document.getElementById('journalCount').textContent = this.journal.length;
    },

    renderBadgeGrid() {
        const badgeGrid = document.getElementById('badgeGrid');
        badgeGrid.innerHTML = '';
        
        this.badges.forEach(badge => {
            const isEarned = this.progress.badges && this.progress.badges[badge.id];
            
            const badgeItem = document.createElement('div');
            badgeItem.className = `badge-item ${isEarned ? 'earned' : ''}`;
            badgeItem.setAttribute('title', badge.caption);
            
            badgeItem.innerHTML = `
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-title">${badge.title}</div>
                <div class="badge-caption">${badge.caption}</div>
                ${isEarned ? '<div class="badge-date">' + this.formatBadgeDate(this.progress.badges[badge.id]) + '</div>' : ''}
            `;
            
            // Add click handler for earned badges
            if (isEarned) {
                badgeItem.style.cursor = 'pointer';
                badgeItem.addEventListener('click', () => {
                    this.showBadgeDetail(badge);
                });
            }
            
            badgeGrid.appendChild(badgeItem);
        });
    },

    renderJournalTimeline() {
        const journalTimeline = document.getElementById('journalTimeline');
        
        if (this.journal.length === 0) {
            journalTimeline.innerHTML = `
                <div class="journal-empty">
                    <div class="journal-empty-icon">📓</div>
                    <h3>No Journal Entries Yet</h3>
                    <p>Complete lessons to start building your learning journal!</p>
                    <a href="/learn.html" class="btn btn-primary">Start Learning</a>
                </div>
            `;
            return;
        }
        
        // Sort journal entries by timestamp (newest first)
        const sortedEntries = [...this.journal].sort((a, b) => b.timestamp - a.timestamp);
        
        journalTimeline.innerHTML = '';
        
        sortedEntries.forEach(entry => {
            const journalEntry = document.createElement('div');
            journalEntry.className = 'journal-entry';
            
            journalEntry.innerHTML = `
                <div class="journal-card">
                    <div class="journal-header">
                        <div>
                            <div class="journal-lesson">${entry.title}</div>
                            <div class="journal-date">${this.formatDate(entry.timestamp)}</div>
                        </div>
                    </div>
                    
                    ${entry.facts && entry.facts.length > 0 ? `
                        <div class="journal-facts">
                            <h4>Key Facts</h4>
                            <ul>
                                ${entry.facts.map(fact => `<li>${fact}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${entry.reflection ? `
                        <div class="journal-reflection">
                            ${entry.reflection}
                        </div>
                    ` : ''}
                    
                    ${entry.evidenceImg ? `
                        <div class="journal-evidence">
                            <img src="${entry.evidenceImg}" alt="Evidence from ${entry.title}" style="max-width: 100%; border-radius: 8px; margin-top: 1rem;">
                        </div>
                    ` : ''}
                </div>
            `;
            
            journalTimeline.appendChild(journalEntry);
        });
    },

    renderLearningStats() {
        const totalXP = this.progress.xp;
        const currentStreak = this.progress.streak;
        const lessonsCompleted = Object.values(this.progress.lessonStatus).filter(status => status === 'complete').length;
        
        // Calculate engagement level based on XP per lesson
        let engagementLevel = '📊';
        if (lessonsCompleted > 0) {
            const avgXPPerLesson = totalXP / lessonsCompleted;
            if (avgXPPerLesson >= 70) engagementLevel = 'High';
            else if (avgXPPerLesson >= 50) engagementLevel = 'Medium';
            else engagementLevel = 'Growing';
        }
        
        document.getElementById('totalXP').textContent = totalXP;
        document.getElementById('currentStreak').textContent = currentStreak;
        document.getElementById('lessonsCompleted').textContent = lessonsCompleted;
        document.getElementById('averageScore').textContent = engagementLevel;
    },

    setupEventListeners() {
        // Certificate modal handlers
        const certificateBtn = document.getElementById('downloadCertificateBtn');
        const certificateModal = document.getElementById('certificateModal');
        const certificateClose = document.getElementById('certificateClose');
        
        certificateBtn?.addEventListener('click', () => {
            this.showCertificateModal();
        });
        
        certificateClose?.addEventListener('click', () => {
            certificateModal.classList.remove('active');
        });
        
        certificateModal?.addEventListener('click', (e) => {
            if (e.target === certificateModal) {
                certificateModal.classList.remove('active');
            }
        });
        
        // Keyboard accessibility for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && certificateModal.classList.contains('active')) {
                certificateModal.classList.remove('active');
            }
        });
    },

    showCertificateModal() {
        const modal = document.getElementById('certificateModal');
        const certificateDate = document.getElementById('certificateDate');
        const certificateBadges = document.getElementById('certificateBadges');
        
        // Set completion date
        certificateDate.textContent = `Completed: ${this.formatDate(Date.now())}`;
        
        // Show earned badges
        certificateBadges.innerHTML = '';
        this.badges.forEach(badge => {
            if (this.progress.badges && this.progress.badges[badge.id]) {
                const badgeMini = document.createElement('div');
                badgeMini.className = 'badge-mini';
                badgeMini.textContent = badge.icon;
                badgeMini.title = badge.title;
                certificateBadges.appendChild(badgeMini);
            }
        });
        
        modal.classList.add('active');
    },

    downloadCertificateImage() {
        // Create a canvas element for rendering the certificate
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size (A4 proportions)
        canvas.width = 800;
        canvas.height = 600;
        
        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#3A86FF';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Draw inner border
        ctx.strokeStyle = '#FFC857';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
        
        // Title
        ctx.fillStyle = '#3A86FF';
        ctx.font = 'bold 36px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Achievement', canvas.width / 2, 120);
        
        // Subtitle
        ctx.fillStyle = '#475569';
        ctx.font = '18px Inter, sans-serif';
        ctx.fillText('Nature Power Learning Journey', canvas.width / 2, 150);
        
        // Student name
        ctx.fillStyle = '#111827';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('This certifies that', canvas.width / 2, 200);
        
        ctx.fillStyle = '#3A86FF';
        ctx.font = 'bold 28px Poppins, sans-serif';
        ctx.fillText('Young Scientist', canvas.width / 2, 240);
        
        ctx.fillStyle = '#111827';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('has successfully completed', canvas.width / 2, 270);
        
        ctx.font = 'bold 20px Poppins, sans-serif';
        ctx.fillText('Y4 Harness the Power of Nature', canvas.width / 2, 310);
        
        // Achievement text
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#475569';
        const achievementText = 'Demonstrating understanding of weather, climate, renewable energy,';
        const achievementText2 = 'earthquake safety, and sustainable design through 10 interactive lessons.';
        ctx.fillText(achievementText, canvas.width / 2, 350);
        ctx.fillText(achievementText2, canvas.width / 2, 370);
        
        // Date
        ctx.fillStyle = '#475569';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Date: ${this.formatDate(Date.now())}`, 80, 520);
        
        // Signature line
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(550, 520);
        ctx.lineTo(720, 520);
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.fillText('Teacher', 635, 540);
        
        // Convert to image and download
        const link = document.createElement('a');
        link.download = 'nature-power-certificate.png';
        link.href = canvas.toDataURL();
        link.click();
        
        // Show success message
        this.showToast('Certificate downloaded successfully! 🎉', 'success');
    },

    printCertificate() {
        const certificateContent = document.getElementById('certificate');
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Nature Power Certificate</title>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
                    .certificate { 
                        border: 8px solid #3A86FF; 
                        padding: 40px; 
                        text-align: center; 
                        background: white;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .certificate-border { border: 2px solid #FFC857; padding: 30px; }
                    h1 { color: #3A86FF; font-size: 2.5rem; margin-bottom: 0.5rem; }
                    .certificate-subtitle { color: #475569; font-size: 1.25rem; margin-bottom: 2rem; }
                    .certificate-name { color: #3A86FF; font-size: 2rem; text-decoration: underline; }
                    .signature-line { width: 200px; height: 2px; background: #111827; margin: 2rem auto 0.5rem; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${certificateContent.outerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    },

    exportData() {
        const exportData = {
            progress: this.progress,
            journal: this.journal,
            exportDate: new Date().toISOString(),
            student: 'Young Scientist',
            course: 'Y4 Harness the Power of Nature'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nature-power-data-${this.formatDate(Date.now(), true)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully! 📤', 'success');
    },

    exportJournal() {
        const csvContent = this.journalToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nature-power-journal-${this.formatDate(Date.now(), true)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Journal exported as CSV! 📄', 'success');
    },

    clearJournal() {
        if (confirm('Are you sure you want to clear all journal entries? This cannot be undone.')) {
            localStorage.removeItem('np_journal');
            this.journal = [];
            this.renderJournalTimeline();
            this.showToast('Journal cleared successfully! 🗑️', 'info');
        }
    },

    journalToCSV() {
        const headers = ['Date', 'Lesson', 'Title', 'Facts', 'Reflection'];
        const rows = [headers];
        
        this.journal.forEach(entry => {
            const row = [
                this.formatDate(entry.timestamp),
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

    showBadgeDetail(badge) {
        const earnedDate = this.progress.badges[badge.id];
        const message = `🏆 ${badge.title}\n\n${badge.caption}\n\nEarned: ${this.formatDate(earnedDate)}`;
        alert(message); // TODO: Replace with proper modal
    },

    formatDate(timestamp, fileFormat = false) {
        const date = new Date(timestamp);
        if (fileFormat) {
            return date.toISOString().split('T')[0];
        }
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },

    formatBadgeDate(timestamp) {
        return this.formatDate(timestamp);
    },

    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type} show`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
                <div class="toast-message">
                    <div class="toast-text">${message}</div>
                </div>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    profilePage.init();
});

// Export for global access
window.profilePage = profilePage;
