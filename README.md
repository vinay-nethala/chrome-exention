# Productivity Suite

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Docker](https://img.shields.io/badge/docker-enabled-blue.svg)
![Platform](https://img.shields.io/badge/platform-Chrome%20Extension-blue.svg)

**Your Personal Productivity Dashboard – Stay Focused, Accomplish More**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Architecture](#architecture) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Overview

**Productivity Suite** is a feature-rich browser extension dashboard designed to enhance user productivity. It provides a personalized new tab experience with integrated tools for task management, time tracking, and session management. The application seamlessly synchronizes data across browser instances using Chrome Storage API with automatic fallback to localStorage.

The suite is built with vanilla JavaScript, ensuring zero dependencies and lightweight performance. It supports Docker containerization for easy deployment and scaling.

### Key Characteristics

- **Lightweight & Fast**: Pure JavaScript implementation with minimal overhead
- **Cross-Browser Compatible**: Graceful fallback from Chrome Storage to localStorage
- **Containerized**: Docker & Docker Compose support for easy deployment
- **Privacy-Focused**: All data stored locally on your device
- **Progressive Enhancement**: Works as browser extension and standalone web application

---

## ✨ Features

### 1. **Welcome Dashboard**
   - Personalized greeting interface
   - Motivational messaging
   - Status indicator
   - Professional card-based layout

### 2. **Real-Time Clock**
   - Live time display with 1-second updates
   - 24-hour time format with millisecond precision
   - Visual live status indicator
   - Timezone-aware display

### 3. **Notes Widget**
   - Create and manage quick notes
   - Persistent storage across sessions
   - Easy deletion functionality
   - Auto-save capability
   - Clean, intuitive interface

### 4. **Session Management**
   - Save current browser session with one click
   - Store multiple named sessions
   - Quick session restoration
   - Session deletion and management
   - Intelligent tab URL tracking

### 5. **Smart Storage**
   - Dual-mode storage system (Chrome API + localStorage)
   - Automatic data migration
   - Persistent state management
   - Cross-session synchronization

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│            (HTML/CSS - Responsive Dashboard)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Application Logic Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Notes Logic │  │  Sessions   │  │  Clock & Timer   │   │
│  │  Manager    │  │   Handler   │  │   Controller     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Storage Abstraction Layer                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Intelligent Storage Router                       │  │
│  │  (Chrome Storage API OR localStorage)                │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
    ┌────▼────────┐          ┌────────▼────┐
    │ Chrome API  │          │ localStorage │
    │(Extension   │          │(Web Fallback)│
    │ Mode)       │          │              │
    └─────────────┘          └───────────────┘
```

### Data Flow Diagram

```
User Action
    │
    ├─ Add Note ──┐
    ├─ Save Session ──┐
    ├─ Delete Item ──┤
    └─ View Data ──┬─▶ Application Handler
                   │
                   ▼
         Storage Router
            │
      ┌─────┴─────┐
      │            │
      ▼            ▼
   Chrome      localStorage
   Storage API  Fallback
      │            │
      └─────┬──────┘
            │
            ▼
      Persistent Data
      (JSON Format)
```

### Component Interaction Diagram

```
┌──────────────┐
│   DOM Events │
│ (User Input) │
└──────┬───────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
  ┌──────────────┐              ┌──────────────────┐
  │ Notes Module │              │ Sessions Module  │
  ├──────────────┤              ├──────────────────┤
  │ • addNote()  │              │ • saveSession()  │
  │ • deleteNote │              │ • getSessions()  │
  │ • renderNote │              │ • deleteSession()│
  │ • getNotes() │              │ • renderSession()│
  └──────┬───────┘              └────────┬─────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                    ┌────▼─────────┐
                    │ Storage Layer │
                    │ (Dual Mode)   │
                    └────┬──────────┘
                         │
                         ▼
                  Persistent Storage
```

---

## 📁 Project Structure

```
productivity-suite/
├── README.md                    # This file - comprehensive documentation
├── package.json                 # NPM project metadata
├── Dockerfile                   # Docker container configuration
├── docker-compose.yml          # Docker Compose orchestration
├── submission.json             # Project submission metadata
└── src/
    ├── newtab.html            # Main UI markup & structure (82 lines)
    ├── newtab.js              # Application logic & state management (258 lines)
    └── styles.css             # Styling & responsive design
```

### File Descriptions

| File | Purpose | Size |
|------|---------|------|
| `newtab.html` | Semantic HTML structure with card-based layout | 82 lines |
| `newtab.js` | Core application logic with storage abstraction | 258 lines |
| `styles.css` | Modern, responsive styling with flexbox & grid | TBD |
| `Dockerfile` | Nginx-based containerization | Alpine |
| `docker-compose.yml` | Single-service composition on port 3000 | v3 |

---

## 🛠️ Requirements

### System Requirements
- **Node.js**: v14.0.0 or higher (optional, for development)
- **Docker**: v20.10+ (for containerized deployment)
- **Docker Compose**: v1.29+ (for orchestration)
- **Browser**: Chrome/Chromium 90+ (for extension functionality)

### Browser API Requirements
- Chrome Storage API (with localStorage fallback)
- Chrome Tabs API (for session management)
- DOM API
- Web Storage API

---

## 📥 Installation

### Method 1: Browser Extension Installation

1. **Clone or download the project**
   ```bash
   git clone https://github.com/yourusername/productivity-suite.git
   cd productivity-suite
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load Unpacked Extension**
   - Click "Load unpacked"
   - Select the `dist/` directory
   - Extension will appear in your extensions list

4. **Verify Installation**
   - Open a new tab
   - You should see the Productivity Suite dashboard

### Method 2: Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   ```
   http://localhost:3000
   ```

3. **Stop the service**
   ```bash
   docker-compose down
   ```

### Method 3: Manual Script Loading

```html
<!-- Include in your HTML file -->
<script src="path/to/newtab.js"></script>
```

---

## 🎮 Usage

### Dashboard Features

#### **Welcome Card**
- Displays on first load
- Shows motivational message
- Indicates ready status
- Professional greeting interface

#### **Clock Widget**
- Updates every second
- Shows current time in HH:MM:SS format
- Live status indicator
- Timezone-aware display

#### **Notes Widget**

**Creating a Note:**
```javascript
1. Click on the notes widget
2. Type your note in the textarea
3. Click "Add Note" button
4. Note is automatically saved
```

**Deleting a Note:**
```javascript
1. Find the note you want to remove
2. Click the "Delete" button next to it
3. Note is immediately removed from storage
```

**Programmatic Usage:**
```javascript
// Add a note
await addNote("This is my note");

// Get all notes
const notes = await getNotes();

// Delete a note
await deleteNote(noteId);

// Render notes
await renderNotes();
```

#### **Session Management**

**Saving a Session:**
```javascript
1. Click "Save Session" button
2. Enter a descriptive session name in the dialog
3. All current browser tabs are captured
4. Session is stored locally
```

**Managing Sessions:**
```javascript
1. View all saved sessions in the widget
2. Click "Delete" to remove a session
3. Sessions remain available until manually deleted
```

**Programmatic Usage:**
```javascript
// Get all sessions
const sessions = await getSessions();

// Save current session
await saveCurrentSession();

// Delete a session
await deleteSession("Session Name");

// Render sessions
await renderSessions();
```

### Data Persistence Examples

```javascript
// Notes are stored as an array of objects
{
  "notes": [
    { "id": "1234567890", "text": "Buy groceries" },
    { "id": "1234567891", "text": "Reply to emails" }
  ]
}

// Sessions are stored as key-value pairs
{
  "sessions": {
    "Work": ["https://mail.google.com", "https://github.com"],
    "Learning": ["https://udemy.com", "https://stackoverflow.com"]
  }
}
```

---

## 🐳 Docker Deployment

### Docker Architecture

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

### Docker Compose Configuration

```yaml
version: '3'
services:
  productivity-suite:
    build: .
    ports:
      - "3000:80"
```

### Deployment Steps

1. **Build the Docker image**
   ```bash
   docker build -t productivity-suite:1.0 .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Verify deployment**
   ```bash
   docker ps
   # Check logs
   docker-compose logs -f
   ```

4. **Access the application**
   ```
   http://localhost:3000
   ```

### Docker Commands Reference

```bash
# Build image
docker build -t productivity-suite .

# Run container
docker run -p 3000:80 productivity-suite

# Using Docker Compose
docker-compose up                 # Start services
docker-compose up -d             # Start in background
docker-compose down              # Stop services
docker-compose logs -f           # View logs
docker-compose restart           # Restart services

# Cleanup
docker system prune              # Remove unused resources
docker rmi productivity-suite     # Remove image
```

---

## 📡 API Documentation

### Storage API

The application uses a dual-mode storage system that automatically selects the best available storage method.

#### **Storage Interface**

```javascript
/**
 * Retrieves data from storage
 * @param {string|string[]|object} keys - Key(s) to retrieve
 * @returns {Promise<object>} Retrieved data as key-value pairs
 */
storageGet(keys): Promise<object>

/**
 * Saves data to storage
 * @param {object} items - Key-value pairs to store
 * @returns {Promise<void>}
 */
storageSet(items): Promise<void>

/**
 * Removes data from storage
 * @param {string|string[]} keys - Key(s) to remove
 * @returns {Promise<void>}
 */
storageRemove(keys): Promise<void>
```

### Notes API

```javascript
/**
 * Retrieves all notes from storage
 * @returns {Promise<Array>} Array of note objects with id and text
 */
getNotes(): Promise<Array>

/**
 * Saves notes array to storage
 * @param {Array} notes - Array of note objects
 * @returns {Promise<void>}
 */
saveNotes(notes): Promise<void>

/**
 * Adds a new note
 * @param {string} text - Note content
 * @returns {Promise<void>}
 */
addNote(text: string): Promise<void>

/**
 * Deletes a note by ID
 * @param {string} id - Note ID to delete
 * @returns {Promise<void>}
 */
deleteNote(id: string): Promise<void>

/**
 * Renders notes to the DOM
 * @returns {Promise<void>}
 */
renderNotes(): Promise<void>
```

### Sessions API

```javascript
/**
 * Retrieves all saved sessions
 * @returns {Promise<object>} Key-value pair of session names and URLs
 */
getSessions(): Promise<object>

/**
 * Saves sessions object to storage
 * @param {object} sessions - Object with session names as keys
 * @returns {Promise<void>}
 */
saveSessions(sessions: object): Promise<void>

/**
 * Saves current browser session
 * Prompts user for session name
 * @returns {Promise<void>}
 */
saveCurrentSession(): Promise<void>

/**
 * Deletes a session by name
 * @param {string} name - Session name to delete
 * @returns {Promise<void>}
 */
deleteSession(name: string): Promise<void>

/**
 * Renders sessions to the DOM
 * @returns {Promise<void>}
 */
renderSessions(): Promise<void>
```

### Chrome API Utilities

```javascript
/**
 * Safely queries Chrome tabs
 * @param {object} query - Tab query parameters
 * @returns {Promise<Array>} Array of tab objects or empty array
 */
safeTabsQuery(query: object): Promise<Array>

/**
 * Checks if Chrome Storage API is available
 * @returns {boolean} True if Chrome Storage API is accessible
 */
isChromeStorageAvailable(): boolean
```

---

## ⚙️ Configuration

### Default Configuration

The application works with zero configuration required. All defaults are sensible and production-ready.

### Storage Configuration

**Chrome Extension Mode (Preferred)**
```javascript
chrome.storage.local.get()  // Synced with Chrome account
chrome.storage.local.set()
```

**Web Fallback Mode**
```javascript
window.localStorage.getItem()   // Browser storage (~5-10MB limit)
window.localStorage.setItem()
```

### Port Configuration (Docker)

Edit `docker-compose.yml` to change the port:
```yaml
ports:
  - "8080:80"  # Change 3000 to desired port
```

### Time Format Configuration

Current implementation uses `toLocaleTimeString()` for 24-hour format:
```javascript
// To modify time display
const now = new Date();
const time = now.toLocaleTimeString('en-US', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});
```

---

## 🔧 Development

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/productivity-suite.git
   cd productivity-suite
   ```

2. **Install dependencies (if using Node tools)**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

### Code Style

- **Language**: Vanilla JavaScript (ES6+)
- **Format**: Async/await for promises
- **Convention**: camelCase for functions and variables
- **Comments**: JSDoc style for API documentation

### Loading in Development

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the `src/` directory
5. Changes are reflected immediately after refresh

### Debugging

**Chrome DevTools**
```javascript
// Open Extension popup DevTools
Right-click extension icon → Inspect popup

// View Storage Data
chrome://extensions → Details → Inspect views
→ Open browser console
```

**Console Access**
```javascript
// Test storage functions
await storageGet('notes').then(console.log);
await getSessions().then(console.log);
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Report issues responsibly

### Contributing Steps

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/productivity-suite.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add JSDoc comments
   - Test thoroughly

4. **Commit with meaningful messages**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe changes clearly
   - Reference related issues
   - Await review

### Areas for Contribution

- 🐛 **Bug Fixes**: Found an issue? Help us fix it
- ✨ **Features**: New widgets or functionality
- 📚 **Documentation**: Improve clarity and examples
- 🧪 **Tests**: Increase test coverage
- 🎨 **UI/UX**: Design improvements
- 🚀 **Performance**: Optimization opportunities

---

## 📜 License

This project is licensed under the **ISC License** - see details below:

```
ISC License

Copyright (c) 2026 Productivity Suite Contributors

Permission to use, copy, modify, and/or distribute this software
for any purpose with or without fee is hereby granted, provided 
that the above copyright notice and this permission notice appear 
in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL 
WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE 
AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR 
CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM 
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, 
NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN 
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 💬 Support

### Getting Help

- **📖 Documentation**: Check this README first
- **🐛 Bug Reports**: Open an issue on GitHub with:
  - Browser version
  - Steps to reproduce
  - Expected vs actual behavior
  - Console errors/logs
  
- **💡 Feature Requests**: Submit ideas via GitHub Issues
  - Use clear, descriptive titles
  - Explain use cases
  - Suggest implementation approach

### Community

- **Discussion Forum**: GitHub Discussions
- **Email Support**: support@productivity-suite.dev
- **Twitter**: @ProductivitySuite

### FAQ

**Q: Can I use this without Chrome?**
A: Yes! The localStorage fallback works in any modern browser as a web app.

**Q: Is my data synced across devices?**
A: In extension mode, yes (via Chrome Sync). In web mode, it's local to that browser only.

**Q: How much data can I store?**
A: Chrome Storage: ~100MB per extension. localStorage: ~5-10MB per domain.

**Q: Can I export my data?**
A: Currently stored as JSON in Chrome Storage or localStorage. Manual export is possible via DevTools.

**Q: Is there a mobile version?**
A: Not currently, but the responsive design provides a good mobile web experience.

---

## 📈 Roadmap

### Version 1.1 (Planned)
- [ ] Data export/import functionality
- [ ] Dark mode theme
- [ ] Analytics dashboard
- [ ] Keyboard shortcuts
- [ ] Cloud sync option

### Version 2.0 (Future)
- [ ] Mobile app
- [ ] Collaboration features
- [ ] Advanced scheduling
- [ ] Integration with calendar apps
- [ ] AI-powered productivity insights

---

## 📊 Statistics

```
Total Lines of Code: ~450
├── HTML: 82 lines
├── JavaScript: 258 lines
└── CSS: ~110 lines

Dependencies: 0 (Zero Dependencies!)
Browser APIs Used: 3
  ├── Chrome Storage API
  ├── Chrome Tabs API
  └── Web Storage API

Supported Browsers: Chrome/Chromium 90+
Container Size: ~50MB
```

---

## 🙏 Acknowledgments

- Inspired by modern productivity tools
- Built with vanilla JavaScript for maximum compatibility
- Containerized with Nginx for production deployment
- Community feedback and contributions

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 27, 2026 | Initial release with core features |

---

<div align="center">

### Made with ❤️ Vinay nethala

[⬆ Back to Top](#productivity-suite)

**Star this project if you find it helpful!** ⭐

</div>
