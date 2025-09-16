# 🌱 Harness the Power of Nature - Learning Journey Web App

A world-class educational web application designed for students to explore weather, climate, and sustainable home design through interactive learning experiences.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Open in browser:**
   ```
   http://localhost:8000
   ```

## ✨ Features

### 🏠 **Home Page**
- Hero section with animated illustrations
- Interactive "Today's Wonder" slider
- Journey step previews
- Digital citizenship preview

### 📚 **Learn Page** 
- 8-step visual learning timeline
- Interactive widgets:
  - **Weather Explorer**: Compare global climate data
  - **Houses Around the World**: Drag & drop climate features
  - **Circuits Sandbox**: Build electrical circuits
  - **Design Tester**: Toggle house features with live feedback
- Teacher check-in prompts
- Offline activities for each step

### 🛡️ **Digital Citizenship**
- 4 interactive scenario cards
- Golden Rules poster builder
- Teacher approval system
- Printable classroom posters

### 🏗️ **Build Page**
- 3D building tool integrations (CoSpaces, Tinkercad)
- Embedded design tester
- Year 5 Scratch coding tips
- Export functionality

## 🎨 Design System

### **Colors**
- **Sunrise Yellow** `#FFC857` - CTAs, badges
- **Ocean Blue** `#3A86FF` - Headers, buttons  
- **Leaf Green** `#2EC4B6` - Success, positive feedback
- **Coral** `#FF6B6B` - Alerts, hearts
- **Ink** `#111827` - Text
- **Muted** `#6B7280` - Meta text
- **Background** `#F9FAFB` - Off-white

### **Typography**
- **Headings**: Poppins (700/600)
- **Body/UI**: Inter (400/500/600)

## ♿ Accessibility Features

- **WCAG 2.1 AA compliant**
- **Full keyboard navigation**
- **Screen reader support** with ARIA labels
- **Read-aloud functionality** using Web Speech API
- **High contrast mode** toggle
- **Text size controls**
- **Reduced motion** support
- **Focus management** and visible indicators

## 📱 Responsive Design

- **Tablet-first** approach
- **Mobile-optimized** layouts
- **Touch-friendly** interactions
- **Progressive enhancement**

## 🔧 Technical Features

- **Service Worker** for offline support
- **Local Storage** for journal entries
- **Modular JavaScript** architecture
- **No external dependencies**
- **Performance optimized**

## 📊 Learning Journey Steps

1. **Weather & Climate Explorer** (25-30 min)
2. **Homes Around the World** (25-30 min)  
3. **Circuits Sandbox** (20-30 min)
4. **Singapore Case Study** (20-30 min)
5. **Renewable Energy Arcade** (20-25 min)
6. **Earthquake Challenge** (15-25 min)
7. **Design a Future-Ready Home** (40-60 min)
8. **Share Your Thinking** (20-30 min)

## 🎯 Key Widgets

### **Wonder Slider**
- Interactive shade/temperature exploration
- Real-time calculations
- Journal integration

### **Weather Explorer**
- Compare 4 global cities
- Interactive charts and data
- Climate vs weather learning

### **Design Tester**
- Toggle house features
- Live performance meters
- Export design summaries

### **Circuits Sandbox**
- Drag & drop components
- Real-time circuit validation
- Screenshot to journal

## 👩‍🏫 Teacher Features

- **Mode toggle** (Student/Teacher)
- **Check-in prompts** for each step
- **Gallery moderation** system
- **Progress tracking**
- **Resource downloads**

## 📁 File Structure

```
/
├── index.html              # Home page
├── learn.html              # Learning journey
├── digital-citizenship.html # DC scenarios
├── build.html              # Building tools
├── css/
│   ├── styles.css          # Global styles
│   ├── components.css      # Component styles
│   ├── widgets.css         # Widget styles
│   └── digital-citizenship.css
├── js/
│   ├── app.js              # Main application
│   ├── utils/
│   │   ├── toast.js        # Notifications
│   │   ├── journal.js      # Data storage
│   │   └── accessibility.js # A11y features
│   └── widgets/
│       ├── wonder-slider.js
│       ├── weather-explorer.js
│       ├── houses-widget.js
│       ├── circuits-widget.js
│       ├── design-tester.js
│       └── digital-citizenship.js
└── sw.js                   # Service worker
```

## 🌐 Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 📝 Usage Notes

- **Journal entries** are saved locally
- **Teacher mode** enables additional features
- **Offline functionality** available after first visit
- **Export features** work in modern browsers

## 🔄 Updates

The app uses a service worker for caching and will automatically update when files change. Clear browser cache if you encounter issues.

---

**Built with ❤️ for educational excellence and accessibility**
