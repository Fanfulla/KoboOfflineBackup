# Kobo Backup Manager

> **Never lose your Kobo library again.** A privacy-first web application for backing up and restoring your Kobo e-reader library - entirely in your browser.

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://react.dev/)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Styled with TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🔒 100% Private** - All processing happens locally in your browser. No server, no uploads, no tracking.
- **📚 Complete Backup** - Backs up your entire library including books, annotations, highlights, and reading progress.
- **⚡ Fast & Easy** - Create a full backup in under 5 minutes with an intuitive wizard interface.
- **🎨 Beautiful UI** - Custom Kobo-inspired design with smooth animations and delightful interactions.
- **🔄 Full Restore** - Restore your entire library to a new device or recover from data loss.
- **💾 No Installation** - Works directly in your web browser - just visit the website.
- **🌐 Browser-Based** - Uses modern File System Access API for direct device access.
- **📖 Open Source** - Fully transparent, auditable code. Community-driven development.

## 🚀 Quick Start

### For Users

1. **Open the app** in a supported browser (Chrome 86+, Edge 86+, Opera 72+)
2. **Connect your Kobo** via USB cable and unlock it
3. **Create a backup**:
   - Click "Create Backup"
   - Select your Kobo device when prompted
   - Wait for scanning to complete
   - Choose what to include
   - Download your backup ZIP file
4. **Store safely** - Keep your backup in cloud storage or an external drive

### For Developers

```bash
# Clone the repository
git clone https://github.com/yourusername/kobo-backup-manager.git
cd kobo-backup-manager

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Browser Compatibility

### ✅ Fully Supported

- **Chrome** 86+ (October 2020)
- **Edge** 86+ (October 2020)
- **Opera** 72+ (November 2020)

### ⚠️ Limited Support

- **Brave** - Works with File System Access API enabled in settings
- **Other Chromium browsers** - May work but untested

### ❌ Not Supported

- **Firefox** - File System Access API not yet implemented
- **Safari** - File System Access API not available
- **Internet Explorer** - Not supported (use Edge instead)

**Required Features:**
- File System Access API (or File/Directory picker fallback)
- WebAssembly (for SQLite parsing with sql.js)
- Blob API
- FileReader API

The app will automatically detect your browser's capabilities and show warnings or fallbacks as needed.

## 📋 What Gets Backed Up?

### Always Included
- ✅ **Kobo Database** - The core SQLite database with all metadata
- ✅ **Sideloaded Books** - All EPUB, PDF, and other ebook files you've added

### Optional (User Choice)
- 📝 **Annotations & Highlights** - All your notes and highlighted passages
- 📖 **Reading Progress** - Bookmarks and current page positions
- ⚙️ **Device Settings** - Font preferences and reading settings

### Not Included
- ❌ **Kobo Store Purchases** - These can be re-downloaded from your Kobo account
- ❌ **System Files** - OS and firmware files (not needed for backup)
- ❌ **Covers Cache** - Can be regenerated

## 🛠️ Technology Stack

### Core Framework
- **React 18.3+** - Modern UI library with concurrent features
- **Vite 5+** - Lightning-fast build tool and dev server
- **TailwindCSS 3.4+** - Utility-first CSS framework

### State Management
- **Zustand** - Lightweight state management with localStorage persistence

### Key Libraries
- **sql.js** - SQLite compiled to WebAssembly for browser-based database parsing
- **JSZip** - Create and extract ZIP archives in JavaScript
- **browser-fs-access** - File System Access API polyfill with fallbacks

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework

## 🏗️ Project Structure

```
kobo-backup-manager/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Reusable UI components (Button, Card, etc.)
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── backup/          # Backup flow components
│   │   └── restore/         # Restore flow components
│   ├── hooks/               # Custom React hooks
│   │   ├── useFileSystem.js
│   │   ├── useKoboDevice.js
│   │   ├── useBackup.js
│   │   └── useRestore.js
│   ├── pages/               # Page components (Home, Backup, Restore, History)
│   ├── stores/              # Zustand state stores
│   ├── styles/              # Global CSS and animations
│   ├── utils/               # Utility functions
│   │   ├── backup.js        # Backup creation logic
│   │   ├── restore.js       # Restore logic
│   │   ├── koboDatabase.js  # SQLite database parsing
│   │   ├── fileSystem.js    # File System Access API wrapper
│   │   └── validation.js    # Input validation
│   ├── App.jsx              # Root component with routing
│   └── main.jsx             # Application entry point
├── public/                  # Static assets
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies and scripts
```

## 🔐 Privacy & Security

### Your Data Never Leaves Your Device

1. **No Server** - The app runs entirely in your browser. There is no backend server.
2. **No Uploads** - Your books and data are never uploaded anywhere.
3. **No Tracking** - No analytics, no cookies, no tracking pixels.
4. **No Account Required** - Use the app completely anonymously.

### How It Works

1. You connect your Kobo device via USB
2. Your browser reads files directly from the device using the File System Access API
3. The app parses your Kobo database using WebAssembly (sql.js)
4. A ZIP backup is created in memory
5. The backup is downloaded directly to your computer
6. Nothing is sent to any server - it's all local processing

### Open Source

The entire codebase is open source and available for inspection. If you're technically inclined, you can:
- Review the code to verify privacy claims
- Run your own local copy
- Contribute improvements
- Report security issues

## 🎨 Design System

The app uses a custom design system inspired by Kobo's brand identity:

### Colors
- **Kobo Cream** - `#F5F1E8` - Warm background color
- **Kobo Accent** - `#D4A574` - Golden accent color
- **Kobo Dark** - `#2C2416` - Dark text color
- **Semantic Colors** - Success (green), Error (red), Warning (yellow), Info (blue)

### Typography
- **Font Family** - Inter
- **Scale** - Major Third ratio (1.250)
- **Weights** - Regular (400), Semibold (600), Bold (700)

### Spacing
- **Grid System** - 8px base unit
- **Responsive** - Mobile-first approach with sm/md/lg/xl breakpoints

### Animations
- **Fade In** - Smooth content appearance
- **Slide Up** - Cards and modals
- **Shimmer** - Loading states
- **Pulse** - Attention indicators
- **Bounce** - Success states

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues
- Use GitHub Issues to report bugs
- Include browser version and steps to reproduce
- Attach screenshots if applicable

### Suggesting Features
- Open a GitHub Discussion for feature requests
- Explain the use case and benefits
- Consider privacy implications

### Submitting Code
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure browser compatibility
- Maintain privacy-first principles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Kobo** - For creating excellent e-readers
- **sql.js Team** - For SQLite in WebAssembly
- **React Team** - For the amazing UI framework
- **Tailwind Labs** - For TailwindCSS
- **All Contributors** - Thank you for your contributions!

## 📞 Support

- **Documentation** - Check this README and code comments
- **Issues** - Report bugs on GitHub Issues
- **Discussions** - Ask questions in GitHub Discussions
- **Security** - Email security@example.com for sensitive issues

## 🗺️ Roadmap

### ✅ Completed (v1.0)
- Full backup and restore functionality
- Browser compatibility detection
- Beautiful UI with Kobo design system
- Error handling and recovery
- Privacy-first architecture

### 🚧 Planned Features
- **Dark Mode** - Toggle between light and dark themes
- **Annotation Export** - Export highlights as Markdown or CSV
- **Selective Restore** - Choose specific books to restore
- **Backup Encryption** - Password-protect your backups
- **Incremental Backups** - Only backup changes since last backup
- **Web Workers** - Background processing for better performance
- **PWA Support** - Install as a standalone app
- **Calibre Integration** - Import/export with Calibre library

---

**Made with ❤️ for the Kobo community**

Never lose your reading progress again. Back up your Kobo library today!
