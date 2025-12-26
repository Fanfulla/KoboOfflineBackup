# Kobo Backup Manager - Complete Blueprint

**Version:** 1.0  
**Last Updated:** December 2024  
**Project Type:** Progressive Web Application (PWA)  
**Target Users:** Kobo e-reader owners (all experience levels)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Vision](#product-vision)
3. [Technical Architecture](#technical-architecture)
4. [User Journey Mapping](#user-journey-mapping)
5. [Core Features Specification](#core-features-specification)
6. [UI/UX Design System](#uiux-design-system)
7. [Data Architecture](#data-architecture)
8. [Security & Privacy](#security--privacy)
9. [Browser Compatibility](#browser-compatibility)
10. [Implementation Phases](#implementation-phases)
11. [Development Guidelines](#development-guidelines)

---

## 📖 Executive Summary

### Problem Statement
Kobo e-reader users face significant risks when their devices break or are replaced:
- **No official backup solution** for sideloaded content
- **Loss of annotations** and reading progress
- **Complex manual processes** requiring technical knowledge
- **No cross-device synchronization** for personal libraries

### Solution
A **free, web-based backup manager** that:
- Works directly in the browser (no installation required)
- Guides users step-by-step through backup/restore
- Preserves books, annotations, and reading progress
- Supports all Kobo models (Clara, Libra, Sage, etc.)
- Functions offline after initial load (PWA)

### Key Differentiators
✅ **Zero installation** - pure web app  
✅ **Privacy-first** - all processing happens locally  
✅ **Beginner-friendly** - wizard-based interface  
✅ **Universal compatibility** - works on all major browsers  
✅ **Open source** - transparent and auditable  

---

## 🎯 Product Vision

### Mission Statement
*"Empower every Kobo user to protect their digital library, regardless of technical expertise."*

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to First Backup | < 3 minutes | From landing to completed backup |
| Backup Success Rate | > 95% | Percentage of successful operations |
| User Retention (30d) | > 60% | Users who return after first use |
| Browser Support | 85%+ users | Chrome, Edge, Safari, Firefox coverage |
| Mobile Usage | 40%+ | Responsive design adoption |

### User Personas

#### 1. **Tech-Savvy Reader (25%)**
- Age: 25-40
- Comfortable with computers
- Likely uses Calibre
- **Need:** Advanced features, batch operations, automation

#### 2. **Casual Reader (60%)**
- Age: 30-65
- Basic computer skills
- Primarily buys from Kobo store, some sideloading
- **Need:** Simple, guided process

#### 3. **Senior Reader (15%)**
- Age: 60+
- Limited technical knowledge
- Needs maximum hand-holding
- **Need:** Extra-clear instructions, large UI elements

---

## 🏗️ Technical Architecture

### Stack Selection (December 2024)

#### Frontend Framework
**React 18.3+** with modern hooks and concurrent features

```javascript
// Example: Concurrent rendering for better UX
import { useTransition } from 'react';

function BackupManager() {
  const [isPending, startTransition] = useTransition();
  
  const handleBackup = () => {
    startTransition(() => {
      // Non-blocking backup operation
      performBackup();
    });
  };
}
```

**Why React?**
- ✅ Best File System Access API support
- ✅ Rich ecosystem for file handling
- ✅ Excellent PWA integration
- ✅ Strong TypeScript support

#### Build Tool
**Vite 5+** for lightning-fast development

```javascript
// vite.config.js
export default {
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'db': ['sql.js'], // SQLite WASM
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,wasm}']
      }
    })
  ]
}
```

#### Styling System
**TailwindCSS 3.4+** with custom design tokens

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'kobo-cream': '#F5F1E8',
        'kobo-accent': '#D4A574',
        'kobo-dark': '#2C2416',
        'kobo-success': '#7FB069',
        'kobo-error': '#E63946',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  }
}
```

#### State Management
**Zustand** for global state (lightweight, 1.2kb)

```javascript
// stores/koboStore.js
import create from 'zustand';

export const useKoboStore = create((set) => ({
  device: null,
  books: [],
  backups: [],
  
  setDevice: (device) => set({ device }),
  addBackup: (backup) => set((state) => ({
    backups: [...state.backups, backup]
  })),
  
  // Persist to localStorage
  persist: {
    name: 'kobo-backup-storage',
    partialize: (state) => ({
      backups: state.backups
    })
  }
}));
```

#### File System Interaction
**browser-fs-access** polyfill for universal support

```javascript
// utils/fileSystem.js
import { directoryOpen, fileSave } from 'browser-fs-access';

export async function selectKoboDirectory() {
  try {
    const dirHandle = await directoryOpen({
      mode: 'read',
      skipDirectory: (entry) => entry.name.startsWith('.')
    });
    return dirHandle;
  } catch (err) {
    if (err.name === 'AbortError') {
      return null; // User cancelled
    }
    throw err;
  }
}
```

#### SQLite Handling
**sql.js (WASM)** for database parsing

```javascript
// utils/koboDatabase.js
import initSqlJs from 'sql.js';

export class KoboDatabase {
  constructor(arrayBuffer) {
    this.ready = initSqlJs().then(SQL => {
      this.db = new SQL.Database(new Uint8Array(arrayBuffer));
    });
  }
  
  async getBooks() {
    await this.ready;
    
    const query = `
      SELECT 
        ContentID,
        Title,
        Attribution as Author,
        ___PercentRead as Progress,
        DateLastRead
      FROM content
      WHERE ContentType = 6 
        AND IsDownloaded = 'true'
        AND BookTitle IS NULL
      ORDER BY DateLastRead DESC
    `;
    
    const result = this.db.exec(query);
    return this.parseResults(result);
  }
  
  async getAnnotations() {
    await this.ready;
    
    const query = `
      SELECT 
        b.VolumeID,
        b.Text as HighlightText,
        b.Annotation as Note,
        b.DateCreated,
        c.Title as BookTitle
      FROM Bookmark b
      LEFT JOIN content c ON b.VolumeID = c.ContentID
      WHERE b.Text IS NOT NULL OR b.Annotation IS NOT NULL
      ORDER BY b.DateCreated DESC
    `;
    
    const result = this.db.exec(query);
    return this.parseResults(result);
  }
}
```

#### Archive Creation
**JSZip** for backup file generation

```javascript
// utils/backup.js
import JSZip from 'jszip';
import { fileSave } from 'browser-fs-access';

export async function createBackup(koboData) {
  const zip = new JSZip();
  
  // Add database
  zip.file('KoboReader.sqlite', koboData.database);
  
  // Add books
  const booksFolder = zip.folder('books');
  for (const book of koboData.books) {
    booksFolder.file(book.filename, book.blob);
  }
  
  // Add metadata
  zip.file('backup-metadata.json', JSON.stringify({
    version: '1.0',
    created: new Date().toISOString(),
    device: koboData.deviceInfo,
    bookCount: koboData.books.length,
    annotationCount: koboData.annotations.length
  }));
  
  // Generate ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  // Trigger download
  const filename = `kobo_backup_${Date.now()}.zip`;
  await fileSave(blob, {
    fileName: filename,
    extensions: ['.zip']
  });
  
  return { filename, size: blob.size };
}
```

### Application Structure

```
kobo-backup-webapp/
├── public/
│   ├── favicon.ico
│   ├── manifest.json          # PWA manifest
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── StatusBadge.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Container.jsx
│   │   │
│   │   ├── backup/
│   │   │   ├── DeviceSelector.jsx
│   │   │   ├── BookList.jsx
│   │   │   ├── BackupWizard.jsx
│   │   │   └── BackupHistory.jsx
│   │   │
│   │   └── restore/
│   │       ├── FileUploader.jsx
│   │       ├── RestoreWizard.jsx
│   │       └── ProgressTracker.jsx
│   │
│   ├── hooks/
│   │   ├── useFileSystem.js
│   │   ├── useKoboDevice.js
│   │   ├── useBackup.js
│   │   └── useRestore.js
│   │
│   ├── utils/
│   │   ├── fileSystem.js
│   │   ├── koboDatabase.js
│   │   ├── backup.js
│   │   ├── restore.js
│   │   └── validation.js
│   │
│   ├── stores/
│   │   └── koboStore.js
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Backup.jsx
│   │   ├── Restore.jsx
│   │   └── History.jsx
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🗺️ User Journey Mapping

### Primary Flow: First-Time Backup

#### Phase 1: Landing & Onboarding (30 seconds)

**Step 1.1: Hero Section**
```
User arrives at https://kobo-backup.app
↓
Sees immediate value proposition
↓
Understands core benefit in < 5 seconds
```

**UI Component:**
```jsx
<Hero>
  <h1 className="text-6xl font-bold text-kobo-dark">
    Never Lose Your Kobo Library Again
  </h1>
  <p className="text-xl text-gray-600 mt-4">
    Free, secure backup for all your ebooks, annotations, 
    and reading progress. Works 100% in your browser.
  </p>
  
  <div className="flex gap-4 mt-8">
    <Button size="lg" variant="primary">
      Create Backup
    </Button>
    <Button size="lg" variant="secondary">
      Restore Backup
    </Button>
  </div>
  
  <TrustBadges>
    ✓ No Installation  ✓ 100% Private  ✓ Open Source
  </TrustBadges>
</Hero>
```

**Step 1.2: Browser Compatibility Check**
```javascript
// Automatic on page load
useEffect(() => {
  const checkCompatibility = () => {
    if (!window.showDirectoryPicker && !window.FileReader) {
      setShowCompatibilityWarning(true);
    }
  };
  checkCompatibility();
}, []);
```

**Warning Modal (if incompatible):**
```jsx
<CompatibilityModal>
  <AlertIcon />
  <h3>Browser Not Fully Supported</h3>
  <p>
    For the best experience, we recommend:
    • Google Chrome 86+
    • Microsoft Edge 86+
    • Opera 72+
  </p>
  <p>
    You can still use the app with limited functionality:
    • Drag & drop files manually
    • Slower backup process
  </p>
  <Button>Continue Anyway</Button>
  <Button variant="outline">Switch Browser</Button>
</CompatibilityModal>
```

#### Phase 2: Device Connection (1-2 minutes)

**Step 2.1: Connection Instructions**
```jsx
<ConnectionGuide>
  <ProgressSteps current={1} total={4}>
    <Step number={1} active>
      <Icon type="usb" />
      <Title>Connect Your Kobo</Title>
      <Description>
        Plug your Kobo into your computer via USB cable
      </Description>
      <Image src="kobo-usb-connection.svg" />
    </Step>
    
    <Step number={2}>
      <Icon type="unlock" />
      <Title>Unlock Device</Title>
      <Description>
        Tap "Connect" on your Kobo screen
      </Description>
      <AnimatedGif src="kobo-unlock-demo.gif" />
    </Step>
    
    <Step number={3}>
      <Icon type="folder" />
      <Title>Device Mounted</Title>
      <Description>
        Your Kobo should appear as a drive/disk
      </Description>
      <OSSpecificHelp />
    </Step>
    
    <Step number={4} disabled>
      <Icon type="select" />
      <Title>Select Device</Title>
      <Description>
        Click below when ready
      </Description>
    </Step>
  </ProgressSteps>
  
  <Button 
    size="lg" 
    onClick={handleSelectDirectory}
    className="mt-8"
  >
    My Kobo is Connected
  </Button>
</ConnectionGuide>
```

**Step 2.2: Directory Selection**
```javascript
const handleSelectDirectory = async () => {
  setStatus('Waiting for selection...');
  
  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'read',
      startIn: 'desktop' // Hint for file picker
    });
    
    // Validate it's a Kobo device
    const isValid = await validateKoboDirectory(dirHandle);
    
    if (!isValid) {
      showError({
        title: 'Not a Kobo Device',
        message: 'Please select your Kobo drive (usually named "KOBOeReader")',
        action: 'Try Again'
      });
      return;
    }
    
    setDevice(dirHandle);
    proceedToScanning();
    
  } catch (err) {
    if (err.name === 'AbortError') {
      setStatus('Selection cancelled');
    } else {
      showError({
        title: 'Access Error',
        message: err.message
      });
    }
  }
};
```

**Step 2.3: Device Validation**
```javascript
async function validateKoboDirectory(dirHandle) {
  // Check for .kobo folder
  let koboFolder = null;
  
  for await (const entry of dirHandle.values()) {
    if (entry.name === '.kobo' && entry.kind === 'directory') {
      koboFolder = entry;
      break;
    }
  }
  
  if (!koboFolder) {
    return false;
  }
  
  // Check for KoboReader.sqlite
  for await (const entry of koboFolder.values()) {
    if (entry.name === 'KoboReader.sqlite') {
      return true;
    }
  }
  
  return false;
}
```

#### Phase 3: Scanning & Analysis (30-60 seconds)

**Step 3.1: Database Extraction**
```jsx
<ScanningScreen>
  <AnimatedLoader type="pulse" />
  
  <StatusMessage>
    Reading your Kobo database...
  </StatusMessage>
  
  <ProgressBar 
    current={scanProgress.current} 
    total={scanProgress.total}
    label={scanProgress.stage}
  />
  
  <DetailsList>
    <Detail 
      icon="check" 
      text="Database found" 
      completed={true} 
    />
    <Detail 
      icon="loading" 
      text="Analyzing books..." 
      active={true}
    />
    <Detail 
      icon="pending" 
      text="Counting annotations" 
      pending={true}
    />
  </DetailsList>
</ScanningScreen>
```

**Step 3.2: Library Overview**
```jsx
<LibraryOverview>
  <StatCard 
    icon="book"
    value={142}
    label="Books Found"
    color="blue"
  />
  <StatCard 
    icon="note"
    value={47}
    label="Annotations"
    color="green"
  />
  <StatCard 
    icon="chart"
    value="1.8 GB"
    label="Total Size"
    color="purple"
  />
  <StatCard 
    icon="device"
    value="Kobo Clara BW"
    label="Device Model"
    color="gray"
  />
  
  <PreviewSection className="mt-8">
    <h3>Recently Read Books</h3>
    <BookGrid>
      {recentBooks.map(book => (
        <BookCard key={book.id} {...book} />
      ))}
    </BookGrid>
  </PreviewSection>
  
  <ActionBar>
    <Button variant="secondary">
      View All Books
    </Button>
    <Button variant="primary" size="lg">
      Create Backup Now
    </Button>
  </ActionBar>
</LibraryOverview>
```

#### Phase 4: Backup Creation (2-5 minutes)

**Step 4.1: Backup Configuration**
```jsx
<BackupConfiguration>
  <h2>What to Include</h2>
  
  <CheckboxGroup>
    <Checkbox 
      checked={true} 
      disabled={true}
      label="All Books (142 files)"
      sublabel="Required"
    />
    <Checkbox 
      checked={includeAnnotations} 
      onChange={setIncludeAnnotations}
      label="Annotations & Highlights (47)"
      sublabel="Recommended"
    />
    <Checkbox 
      checked={includeProgress}
      onChange={setIncludeProgress}
      label="Reading Progress"
      sublabel="Recommended"
    />
    <Checkbox 
      checked={includeSettings}
      onChange={setIncludeSettings}
      label="Device Settings"
      sublabel="Optional - may not work on different models"
    />
  </CheckboxGroup>
  
  <StorageEstimate>
    <Icon type="info" />
    Estimated backup size: ~1.8 GB
  </StorageEstimate>
  
  <Button onClick={startBackup}>
    Start Backup
  </Button>
</BackupConfiguration>
```

**Step 4.2: Backup Progress**
```jsx
<BackupProgress>
  <CircularProgress 
    percent={backupProgress.percent}
    size="large"
  />
  
  <StatusText>
    {backupProgress.stage}
  </StatusText>
  
  <ProgressDetails>
    <Detail>
      Files: {backupProgress.filesProcessed} / {backupProgress.totalFiles}
    </Detail>
    <Detail>
      Speed: {backupProgress.speed}
    </Detail>
    <Detail>
      Time remaining: {backupProgress.eta}
    </Detail>
  </ProgressDetails>
  
  <StagesList>
    <Stage completed>✓ Reading database</Stage>
    <Stage active>⏳ Compressing books (95/142)</Stage>
    <Stage pending>Extracting annotations</Stage>
    <Stage pending>Creating archive</Stage>
  </StagesList>
  
  <WarningMessage>
    ⚠️ Keep this window open until complete
  </WarningMessage>
</BackupProgress>
```

**Step 4.3: Success & Download**
```jsx
<BackupSuccess>
  <SuccessIcon className="animate-bounce" />
  
  <h2>Backup Complete!</h2>
  
  <SummaryCards>
    <Card>
      <Icon type="file" />
      <Value>kobo_backup_20241226.zip</Value>
      <Label>Filename</Label>
    </Card>
    <Card>
      <Icon type="storage" />
      <Value>1.76 GB</Value>
      <Label>Size</Label>
    </Card>
    <Card>
      <Icon type="book" />
      <Value>142</Value>
      <Label>Books</Label>
    </Card>
    <Card>
      <Icon type="note" />
      <Value>47</Value>
      <Label>Annotations</Label>
    </Card>
  </SummaryCards>
  
  <DownloadInfo>
    <Icon type="download" />
    Your backup has been saved to your Downloads folder
  </DownloadInfo>
  
  <RecommendedActions>
    <h3>📌 Next Steps</h3>
    <ActionList>
      <Action>
        ☁️ Upload to cloud storage (Google Drive, Dropbox)
      </Action>
      <Action>
        💾 Copy to external hard drive
      </Action>
      <Action>
        🔒 Store in multiple locations
      </Action>
    </ActionList>
  </RecommendedActions>
  
  <ButtonGroup>
    <Button variant="secondary">
      Create Another Backup
    </Button>
    <Button variant="primary">
      Done
    </Button>
  </ButtonGroup>
</BackupSuccess>
```

### Secondary Flow: Restore to New Device

#### Phase 1: New Device Setup

**Step 1.1: Restore Entry Point**
```jsx
<RestoreEntryScreen>
  <h1>Restore to New Kobo</h1>
  
  <InstructionSteps>
    <Step>
      <Number>1</Number>
      <Text>Connect your NEW Kobo to computer</Text>
    </Step>
    <Step>
      <Number>2</Number>
      <Text>Have your backup file ready</Text>
    </Step>
    <Step>
      <Number>3</Number>
      <Text>Follow the wizard below</Text>
    </Step>
  </InstructionSteps>
  
  <WarningBox>
    ⚠️ This will erase any existing content on the device
  </WarningBox>
  
  <Button onClick={startRestore}>
    Start Restore Process
  </Button>
</RestoreEntryScreen>
```

**Step 1.2: Device Selection (same as backup)**

#### Phase 2: Backup Upload

**Step 2.1: File Selection**
```jsx
<FileUploadZone>
  <DropZone
    onDrop={handleBackupDrop}
    accept=".zip"
  >
    <Icon type="upload" size="huge" />
    <h3>Drop Your Backup File Here</h3>
    <p>or</p>
    <Button variant="outline">
      Browse Files
    </Button>
  </DropZone>
  
  <HelpText>
    Looking for: kobo_backup_*.zip
  </HelpText>
</FileUploadZone>
```

**Step 2.2: Backup Validation**
```javascript
async function validateBackupFile(file) {
  const zip = await JSZip.loadAsync(file);
  
  // Check required files
  const requiredFiles = [
    'KoboReader.sqlite',
    'backup-metadata.json'
  ];
  
  for (const filename of requiredFiles) {
    if (!zip.files[filename]) {
      throw new Error(`Invalid backup: missing ${filename}`);
    }
  }
  
  // Parse metadata
  const metadataText = await zip.files['backup-metadata.json'].async('text');
  const metadata = JSON.parse(metadataText);
  
  return {
    valid: true,
    metadata,
    zip
  };
}
```

**Step 2.3: Backup Preview**
```jsx
<BackupPreview>
  <h2>Backup Details</h2>
  
  <InfoGrid>
    <Info label="Created" value={metadata.created} />
    <Info label="Device" value={metadata.device} />
    <Info label="Books" value={metadata.bookCount} />
    <Info label="Annotations" value={metadata.annotationCount} />
    <Info label="Size" value={formatBytes(file.size)} />
  </InfoGrid>
  
  <CompatibilityCheck>
    <h3>Compatibility</h3>
    <Check 
      status="success"
      text="Same device model"
    />
    <Check 
      status="warning"
      text="Different firmware version (should work)"
    />
  </CompatibilityCheck>
  
  <Button onClick={proceedToRestore}>
    Restore This Backup
  </Button>
</BackupPreview>
```

#### Phase 3: Restore Execution

**Step 3.1: Restore Options**
```jsx
<RestoreOptions>
  <h2>What to Restore</h2>
  
  <CheckboxGroup>
    <Checkbox 
      checked={true} 
      disabled={true}
      label={`All Books (${metadata.bookCount})`}
    />
    <Checkbox 
      checked={restoreAnnotations}
      onChange={setRestoreAnnotations}
      label={`Annotations (${metadata.annotationCount})`}
    />
    <Checkbox 
      checked={restoreProgress}
      onChange={setRestoreProgress}
      label="Reading Progress"
    />
  </CheckboxGroup>
  
  <WarningBox type="danger">
    ⚠️ WARNING: This will erase current device content
  </WarningBox>
  
  <ConfirmationCheckbox>
    <Checkbox 
      checked={userConfirmed}
      onChange={setUserConfirmed}
    />
    I understand this will replace all content on the device
  </ConfirmationCheckbox>
  
  <Button 
    disabled={!userConfirmed}
    onClick={startRestore}
  >
    Start Restore
  </Button>
</RestoreOptions>
```

**Step 3.2: Restore Progress**
```jsx
<RestoreProgress>
  <h2>Restoring Your Library</h2>
  
  <ProgressBar 
    percent={restoreProgress.percent}
    animated
  />
  
  <CurrentStage>
    {restoreProgress.stage}
  </CurrentStage>
  
  <StagesList>
    <Stage completed>✓ Preparing device</Stage>
    <Stage completed>✓ Copying database</Stage>
    <Stage active>⏳ Transferring books (78/142)</Stage>
    <Stage pending>Restoring annotations</Stage>
    <Stage pending>Updating metadata</Stage>
  </StagesList>
  
  <LiveStats>
    <Stat label="Files copied" value={`${stats.copied}/${stats.total}`} />
    <Stat label="Speed" value={stats.speed} />
    <Stat label="Time remaining" value={stats.eta} />
  </LiveStats>
  
  <ImportantNote>
    🔌 Do NOT disconnect your Kobo until complete
  </ImportantNote>
</RestoreProgress>
```

**Step 3.3: Restore Complete**
```jsx
<RestoreSuccess>
  <SuccessAnimation />
  
  <h1>🎉 Restore Complete!</h1>
  
  <SummaryStats>
    <Stat 
      icon="book"
      value={142}
      label="Books Restored"
    />
    <Stat 
      icon="note"
      value={47}
      label="Annotations"
    />
    <Stat 
      icon="bookmark"
      value="All"
      label="Reading Progress"
    />
  </SummaryStats>
  
  <NextSteps>
    <h3>What's Next?</h3>
    <Step>
      <Icon type="eject" />
      Safely eject your Kobo
    </Step>
    <Step>
      <Icon type="disconnect" />
      Disconnect USB cable
    </Step>
    <Step>
      <Icon type="check" />
      Your books are ready to read!
    </Step>
  </NextSteps>
  
  <LastReadBook>
    <h4>Continue Reading</h4>
    <BookCard>
      <Cover src={lastBook.cover} />
      <Title>{lastBook.title}</Title>
      <Progress value={lastBook.progress} />
      <Text>Pick up where you left off at 85%</Text>
    </BookCard>
  </LastReadBook>
  
  <Button onClick={ejectDevice}>
    Safely Eject Kobo
  </Button>
</RestoreSuccess>
```

### Tertiary Flows

#### Browse Books Flow
```jsx
<BookBrowser>
  <Toolbar>
    <SearchBox 
      placeholder="Search books, authors..."
      onChange={handleSearch}
    />
    <FilterDropdown
      options={['All', 'Recently Read', 'Unread', 'Annotated']}
      selected={filter}
      onChange={setFilter}
    />
    <SortDropdown
      options={['Title', 'Author', 'Date Added', 'Progress']}
      selected={sortBy}
      onChange={setSortBy}
    />
  </Toolbar>
  
  <BookGrid>
    {filteredBooks.map(book => (
      <BookCard 
        key={book.id}
        cover={book.cover}
        title={book.title}
        author={book.author}
        progress={book.progress}
        annotations={book.annotationCount}
        onClick={() => openBookDetails(book)}
      />
    ))}
  </BookGrid>
  
  <Pagination 
    current={page}
    total={totalPages}
    onPageChange={setPage}
  />
</BookBrowser>
```

#### Book Details Modal
```jsx
<BookDetailsModal book={selectedBook}>
  <Header>
    <Cover src={book.cover} size="large" />
    <Info>
      <Title>{book.title}</Title>
      <Author>{book.author}</Author>
      <Metadata>
        <Meta label="Progress" value={`${book.progress}%`} />
        <Meta label="Last read" value={book.lastRead} />
        <Meta label="Format" value={book.format} />
        <Meta label="Size" value={book.size} />
      </Metadata>
    </Info>
  </Header>
  
  <Tabs>
    <Tab label="Annotations">
      <AnnotationList annotations={book.annotations} />
    </Tab>
    <Tab label="Reading Stats">
      <ReadingStats data={book.stats} />
    </Tab>
    <Tab label="File Info">
      <FileInfo file={book.fileInfo} />
    </Tab>
  </Tabs>
</BookDetailsModal>
```

#### Backup History
```jsx
<BackupHistory>
  <Header>
    <h2>Backup History</h2>
    <Button onClick={createNewBackup}>
      New Backup
    </Button>
  </Header>
  
  <BackupList>
    {backups.map(backup => (
      <BackupCard key={backup.id}>
        <Icon type="archive" />
        <Info>
          <Filename>{backup.filename}</Filename>
          <Meta>
            {formatDate(backup.created)} • {backup.size} • {backup.bookCount} books
          </Meta>
          <Device>{backup.device}</Device>
        </Info>
        <Actions>
          <IconButton 
            icon="restore"
            tooltip="Restore this backup"
            onClick={() => restoreBackup(backup)}
          />
          <IconButton 
            icon="download"
            tooltip="Download again"
            onClick={() => downloadBackup(backup)}
          />
          <IconButton 
            icon="delete"
            tooltip="Delete"
            onClick={() => deleteBackup(backup)}
          />
        </Actions>
      </BackupCard>
    ))}
  </BackupList>
</BackupHistory>
```

---

## 🎨 UI/UX Design System

### Design Principles (Inspired by Reference Screenshot)

1. **Warmth & Comfort**: Cream/beige backgrounds evoke physical books
2. **Gentle Hierarchy**: Soft shadows, not harsh borders
3. **Breathing Space**: Generous padding, never cramped
4. **Progressive Disclosure**: Show complexity only when needed
5. **Micro-animations**: Subtle, delightful, purposeful

### Color Palette

```css
:root {
  /* Primary Colors */
  --kobo-cream: #F5F1E8;        /* Main background */
  --kobo-cream-dark: #E8E3D8;   /* Card backgrounds */
  --kobo-accent: #D4A574;        /* CTA buttons, highlights */
  --kobo-accent-dark: #B8895E;  /* Hover states */
  
  /* Neutrals */
  --kobo-dark: #2C2416;          /* Primary text */
  --kobo-gray: #6B675E;          /* Secondary text */
  --kobo-gray-light: #A8A49A;   /* Disabled text */
  
  /* Status Colors */
  --kobo-success: #7FB069;       /* Success messages */
  --kobo-warning: #F4A261;       /* Warnings */
  --kobo-error: #E63946;         /* Errors */
  --kobo-info: #457B9D;          /* Info messages */
  
  /* Overlays */
  --kobo-overlay: rgba(44, 36, 22, 0.4);
  --kobo-glass: rgba(245, 241, 232, 0.8);
}
```

### Typography

```css
/* Font Stack */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Type Scale (1.250 - Major Third) */
h1, .text-6xl { font-size: 3.815rem; line-height: 1.1; }  /* 61px */
h2, .text-5xl { font-size: 3.052rem; line-height: 1.2; }  /* 49px */
h3, .text-4xl { font-size: 2.441rem; line-height: 1.2; }  /* 39px */
h4, .text-3xl { font-size: 1.953rem; line-height: 1.3; }  /* 31px */
h5, .text-2xl { font-size: 1.563rem; line-height: 1.4; }  /* 25px */
h6, .text-xl  { font-size: 1.25rem;  line-height: 1.5; }  /* 20px */
.text-lg      { font-size: 1rem;     line-height: 1.6; }  /* 16px */
.text-base    { font-size: 0.8rem;   line-height: 1.6; }  /* 13px */
.text-sm      { font-size: 0.64rem;  line-height: 1.5; }  /* 10px */

/* Font Weights */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Spacing System (8px Grid)

```css
:root {
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px */
  --space-4: 2rem;     /* 32px */
  --space-5: 3rem;     /* 48px */
  --space-6: 4rem;     /* 64px */
  --space-7: 6rem;     /* 96px */
  --space-8: 8rem;     /* 128px */
}
```

### Component Library

#### Button Variants

```jsx
// Primary Button (CTA)
<Button 
  variant="primary"
  size="lg"
  className="
    bg-kobo-accent 
    hover:bg-kobo-accent-dark 
    text-white 
    font-semibold
    px-8 py-4
    rounded-xl
    shadow-lg
    hover:shadow-xl
    transition-all duration-200
    hover:scale-105
  "
>
  Create Backup
</Button>

// Secondary Button
<Button 
  variant="secondary"
  className="
    bg-kobo-cream-dark
    hover:bg-kobo-gray-light
    text-kobo-dark
    font-medium
    px-6 py-3
    rounded-lg
    border-2 border-kobo-gray-light
    transition-colors duration-200
  "
>
  View Details
</Button>

// Ghost Button
<Button 
  variant="ghost"
  className="
    text-kobo-accent
    hover:bg-kobo-accent/10
    font-medium
    px-4 py-2
    rounded-lg
    transition-colors duration-200
  "
>
  Learn More
</Button>
```

#### Card Components

```jsx
// Elevated Card (inspired by screenshot)
<Card className="
  bg-white
  rounded-2xl
  shadow-[0_8px_30px_rgb(0,0,0,0.06)]
  hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]
  transition-shadow duration-300
  p-6
  relative
  overflow-hidden
">
  {/* Subtle gradient overlay */}
  <div className="
    absolute inset-0 
    bg-gradient-to-br 
    from-kobo-cream/40 
    to-transparent
    pointer-events-none
  " />
  
  <CardContent className="relative z-10">
    {children}
  </CardContent>
</Card>

// Glass Card (for modals/overlays)
<Card className="
  backdrop-blur-md
  bg-kobo-glass
  border border-white/20
  rounded-3xl
  shadow-2xl
  p-8
">
  {children}
</Card>
```

#### Progress Components

```jsx
// Linear Progress Bar
<ProgressBar 
  percent={67}
  className="
    h-3 
    bg-kobo-cream-dark 
    rounded-full 
    overflow-hidden
  "
>
  <div 
    className="
      h-full 
      bg-gradient-to-r 
      from-kobo-accent 
      to-kobo-accent-dark
      rounded-full
      transition-all duration-500 ease-out
      relative
      overflow-hidden
    "
    style={{ width: '67%' }}
  >
    {/* Animated shimmer */}
    <div className="
      absolute inset-0
      bg-gradient-to-r
      from-transparent
      via-white/30
      to-transparent
      animate-shimmer
    " />
  </div>
</ProgressBar>

// Circular Progress (for backup/restore)
<CircularProgress 
  percent={67}
  size={200}
  strokeWidth={12}
>
  <svg viewBox="0 0 200 200">
    {/* Background circle */}
    <circle
      cx="100"
      cy="100"
      r="90"
      fill="none"
      stroke="var(--kobo-cream-dark)"
      strokeWidth="12"
    />
    
    {/* Progress circle */}
    <circle
      cx="100"
      cy="100"
      r="90"
      fill="none"
      stroke="url(#progressGradient)"
      strokeWidth="12"
      strokeLinecap="round"
      strokeDasharray={`${67 * 5.65} 565`}
      transform="rotate(-90 100 100)"
      className="transition-all duration-500"
    />
    
    <defs>
      <linearGradient id="progressGradient">
        <stop offset="0%" stopColor="var(--kobo-accent)" />
        <stop offset="100%" stopColor="var(--kobo-accent-dark)" />
      </linearGradient>
    </defs>
  </svg>
  
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-5xl font-bold text-kobo-dark">67%</span>
  </div>
</CircularProgress>
```

#### Status Badges

```jsx
<StatusBadge 
  status="success"
  className="
    inline-flex items-center gap-2
    px-4 py-2
    rounded-full
    bg-kobo-success/10
    border border-kobo-success/20
    text-kobo-success
    font-medium
  "
>
  <Icon type="check" className="w-4 h-4" />
  Backup Complete
</StatusBadge>

<StatusBadge status="warning">
  <Icon type="alert" />
  Browser Not Supported
</StatusBadge>

<StatusBadge status="error">
  <Icon type="x" />
  Connection Failed
</StatusBadge>
```

### Animations

```css
/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Utility Classes */
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
.animate-shimmer { animation: shimmer 2s infinite; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-bounce { animation: bounce 1s ease-in-out 3; }
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
:root {
  --screen-sm: 640px;   /* Phone landscape */
  --screen-md: 768px;   /* Tablet */
  --screen-lg: 1024px;  /* Desktop */
  --screen-xl: 1280px;  /* Large desktop */
  --screen-2xl: 1536px; /* Extra large */
}
```

```jsx
// Responsive Grid Example
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4
  gap-4 sm:gap-6 lg:gap-8
">
  {books.map(book => <BookCard key={book.id} {...book} />)}
</div>

// Responsive Text
<h1 className="
  text-4xl 
  sm:text-5xl 
  lg:text-6xl
  font-bold
">
  Kobo Backup Manager
</h1>

// Responsive Spacing
<div className="
  px-4 sm:px-6 lg:px-8
  py-8 sm:py-12 lg:py-16
">
  {content}
</div>
```

### Accessibility

```jsx
// Proper ARIA labels
<Button 
  aria-label="Create new backup of your Kobo library"
  onClick={createBackup}
>
  Create Backup
</Button>

// Focus states
.focus-visible:outline-none
.focus-visible:ring-2
.focus-visible:ring-kobo-accent
.focus-visible:ring-offset-2

// Screen reader text
<span className="sr-only">
  Loading books from your Kobo device...
</span>

// Keyboard navigation
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter') confirmAction();
  };
  
  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## 💾 Data Architecture

### Kobo Database Schema (KoboReader.sqlite)

#### Key Tables

```sql
-- content table (books)
CREATE TABLE content (
  ContentID TEXT PRIMARY KEY,       -- Unique identifier
  ContentType INTEGER,              -- 6 = ebook, 9 = chapter
  MimeType TEXT,                    -- application/epub+zip
  BookID TEXT,                      -- For series/collections
  BookTitle TEXT,                   -- Parent book (null for main entry)
  Title TEXT NOT NULL,              -- Book or chapter title
  Attribution TEXT,                 -- Author name
  Description TEXT,                 -- Book description
  Publisher TEXT,
  Series TEXT,
  SeriesNumber TEXT,
  ISBN TEXT,
  Language TEXT,
  
  -- File info
  ContentPath TEXT,                 -- file:///mnt/sd/book.epub
  ImageId TEXT,                     -- Cover image reference
  
  -- Reading progress
  ___PercentRead REAL,              -- 0.0 to 100.0
  ReadStatus INTEGER,               -- 0=unread, 1=reading, 2=finished
  ___UserID TEXT,
  ___SyncTime TIMESTAMP,
  
  -- Timestamps
  DateCreated TIMESTAMP,
  DateLastRead TIMESTAMP,
  FirstTimeReading BOOLEAN,
  
  -- Download status
  IsDownloaded BOOLEAN,
  FeedbackType INTEGER,
  FeedbackTypeSynced BOOLEAN,
  
  -- Other metadata
  Accessibility INTEGER,
  IsSocialEnabled BOOLEAN,
  AverageRating REAL,
  TimeSpentReading INTEGER,         -- Minutes
  ...
);

-- Bookmark table (annotations, highlights)
CREATE TABLE Bookmark (
  BookmarkID TEXT PRIMARY KEY,
  VolumeID TEXT,                    -- References content.ContentID
  ContentID TEXT,                   -- Chapter/section ID
  
  -- Highlight/annotation data
  StartContainerPath TEXT,          -- EPUB location
  StartOffset INTEGER,
  EndContainerPath TEXT,
  EndOffset INTEGER,
  Text TEXT,                        -- Highlighted text
  Annotation TEXT,                  -- User's note
  
  -- Metadata
  DateCreated TIMESTAMP,
  DateModified TIMESTAMP,
  
  -- Sync
  BookmarkType TEXT,                -- highlight, note, dogear
  IsSynced BOOLEAN,
  ...
);

-- Activity table (reading sessions)
CREATE TABLE Activity (
  Id INTEGER PRIMARY KEY,
  Type INTEGER,                     -- Action type
  Action TEXT,
  Date TIMESTAMP,
  Data TEXT,                        -- JSON blob
  ...
);

-- Shelf table (collections)
CREATE TABLE Shelf (
  Id TEXT PRIMARY KEY,
  CreationDate TIMESTAMP,
  InternalName TEXT,
  Name TEXT,
  Type TEXT,
  LastModified TIMESTAMP,
  ...
);
```

#### Critical Queries

```sql
-- Get all sideloaded books (user's own files)
SELECT 
  ContentID,
  Title,
  Attribution AS Author,
  ___PercentRead AS Progress,
  DateLastRead,
  ContentPath AS FilePath,
  TimeSpentReading
FROM content
WHERE ContentType = 6              -- Book (not chapter)
  AND BookTitle IS NULL            -- Top-level entry
  AND IsDownloaded = 'true'
  AND ContentPath LIKE 'file://%'  -- Sideloaded
ORDER BY DateLastRead DESC;

-- Get all annotations for a book
SELECT 
  b.Text AS HighlightedText,
  b.Annotation AS UserNote,
  b.DateCreated,
  b.StartContainerPath AS Location,
  c.Title AS ChapterTitle
FROM Bookmark b
LEFT JOIN content c ON b.ContentID = c.ContentID
WHERE b.VolumeID = ?
  AND (b.Text IS NOT NULL OR b.Annotation IS NOT NULL)
ORDER BY b.StartContainerPath, b.StartOffset;

-- Get reading statistics
SELECT 
  COUNT(*) AS TotalBooks,
  SUM(CASE WHEN ___PercentRead > 0 THEN 1 ELSE 0 END) AS BooksStarted,
  SUM(CASE WHEN ___PercentRead >= 100 THEN 1 ELSE 0 END) AS BooksFinished,
  SUM(TimeSpentReading) AS TotalMinutesRead,
  AVG(___PercentRead) AS AverageProgress
FROM content
WHERE ContentType = 6 
  AND BookTitle IS NULL;
```

### Backup File Structure

```
kobo_backup_YYYYMMDD_HHMMSS.zip
│
├── backup-metadata.json           # Backup metadata
├── KoboReader.sqlite              # Complete database
│
├── books/                         # All ebook files
│   ├── book1.epub
│   ├── book2.kepub.epub
│   ├── book3.pdf
│   └── ...
│
├── covers/                        # Extracted cover images (optional)
│   ├── book1_cover.jpg
│   └── ...
│
└── annotations/                   # Human-readable exports (optional)
    ├── book1_annotations.md
    └── ...
```

#### backup-metadata.json Schema

```json
{
  "version": "1.0.0",
  "created": "2024-12-26T15:30:22.000Z",
  "generator": "Kobo Backup Manager v1.0",
  
  "device": {
    "model": "Kobo Clara BW",
    "serialNumber": "REDACTED",
    "firmwareVersion": "4.38.21586"
  },
  
  "statistics": {
    "totalBooks": 142,
    "totalAnnotations": 47,
    "totalSize": 1876234567,
    "booksStarted": 89,
    "booksFinished": 34,
    "totalReadingTime": 12345
  },
  
  "integrity": {
    "databaseChecksum": "sha256:abc123...",
    "filesChecked": 142,
    "errors": []
  },
  
  "compatibility": {
    "minAppVersion": "1.0.0",
    "supportedDevices": ["all"]
  }
}
```

### Local Storage Schema

```javascript
// LocalStorage/IndexedDB schema
const schema = {
  // Backup history
  backups: [
    {
      id: 'backup_1703607022000',
      filename: 'kobo_backup_20241226.zip',
      created: '2024-12-26T15:30:22.000Z',
      size: 1876234567,
      deviceModel: 'Kobo Clara BW',
      bookCount: 142,
      annotationCount: 47,
      // Note: We don't store the actual file, just metadata
      // Actual files are in Downloads folder
    }
  ],
  
  // App settings
  settings: {
    theme: 'light',
    language: 'en',
    autoBackup: false,
    includeAnnotationsByDefault: true,
    includeProgressByDefault: true,
    includeSettingsByDefault: false,
  },
  
  // User preferences
  preferences: {
    hasCompletedOnboarding: true,
    lastDeviceConnected: '2024-12-26T15:30:22.000Z',
    backupCount: 5,
  }
};
```

---

## 🔒 Security & Privacy

### Privacy-First Architecture

**Core Principle:** All data processing happens **locally in the browser**. Nothing is ever sent to a server.

#### Data Flow

```
User's Kobo → Browser File System Access API → JavaScript Processing → ZIP Download
      ↑                                                                        ↓
      └────────────────── No server involved ──────────────────────────────────┘
```

### Security Measures

#### 1. File System Access Permissions

```javascript
// Request minimal permissions
const dirHandle = await window.showDirectoryPicker({
  mode: 'read',  // Read-only access
  id: 'kobo-backup',  // Consistent permission prompt
});

// Browser automatically enforces:
// - User must explicitly grant access
// - Permission resets when all tabs close
// - HTTPS-only in production
```

#### 2. Input Validation

```javascript
// Validate backup files before processing
async function validateBackupFile(file) {
  // Check file size (prevent DoS)
  if (file.size > 5 * 1024 * 1024 * 1024) {  // 5GB max
    throw new Error('Backup file too large');
  }
  
  // Check file type
  if (!file.name.endsWith('.zip')) {
    throw new Error('Invalid file type');
  }
  
  // Validate ZIP structure
  const zip = await JSZip.loadAsync(file);
  
  // Check for required files
  if (!zip.files['KoboReader.sqlite']) {
    throw new Error('Invalid backup: missing database');
  }
  
  // Validate metadata
  const metadataText = await zip.files['backup-metadata.json']
    .async('text');
  const metadata = JSON.parse(metadataText);
  
  if (metadata.version !== '1.0.0') {
    throw new Error('Unsupported backup version');
  }
  
  return { valid: true, metadata };
}
```

#### 3. SQLite Security

```javascript
// Use sql.js (WASM) in read-only mode
const db = new SQL.Database(new Uint8Array(arrayBuffer));

// Never use user input directly in queries
const stmt = db.prepare(`
  SELECT * FROM content WHERE ContentID = ?
`);
stmt.bind([sanitizedContentId]);
```

#### 4. Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'wasm-unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob:;
        connect-src 'self';
        font-src 'self';
      ">
```

### Privacy Disclosures

```jsx
<PrivacyNotice>
  <h3>Your Privacy Matters</h3>
  <ul>
    <li>✅ All processing happens in your browser</li>
    <li>✅ No data is sent to any server</li>
    <li>✅ No tracking or analytics</li>
    <li>✅ No account required</li>
    <li>✅ Open source - verify yourself</li>
  </ul>
  <Link to="/privacy-policy">Read Full Privacy Policy</Link>
</PrivacyNotice>
```

---

## 🌐 Browser Compatibility

### Support Matrix (December 2024)

| Browser | Version | File System API | Support Level |
|---------|---------|-----------------|---------------|
| Chrome | 86+ | ✅ Full | **Recommended** |
| Edge | 86+ | ✅ Full | **Recommended** |
| Opera | 72+ | ✅ Full | **Recommended** |
| Brave | 1.31+ | ⚠️ Flag required | Supported |
| Safari | 15.2+ | ⚠️ Partial | Limited |
| Firefox | 113+ | ⚠️ Partial | Limited |

### Feature Detection & Fallbacks

```javascript
// useFeatureDetection hook
export function useFeatureDetection() {
  const [features, setFeatures] = useState({
    fileSystemAccess: false,
    fileReader: false,
    webAssembly: false,
    serviceWorker: false,
  });
  
  useEffect(() => {
    setFeatures({
      fileSystemAccess: 'showDirectoryPicker' in window,
      fileReader: 'FileReader' in window,
      webAssembly: typeof WebAssembly !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
    });
  }, []);
  
  return features;
}

// Fallback strategy
function FileSelector() {
  const { fileSystemAccess } = useFeatureDetection();
  
  if (fileSystemAccess) {
    return <ModernFilePicker />;
  } else {
    return <LegacyDragAndDrop />;
  }
}
```

### Legacy Fallback (Drag & Drop)

```jsx
<DragDropZone
  onDrop={(files) => {
    // Manual file selection fallback
    const koboFiles = {
      database: null,
      books: [],
    };
    
    for (const file of files) {
      if (file.name === 'KoboReader.sqlite') {
        koboFiles.database = file;
      } else if (file.name.match(/\.(epub|kepub|pdf)$/i)) {
        koboFiles.books.push(file);
      }
    }
    
    processKoboFiles(koboFiles);
  }}
>
  <Instructions>
    <h3>Drag & Drop Mode</h3>
    <p>Since your browser doesn't support automatic detection:</p>
    <ol>
      <li>Open your Kobo drive in file explorer</li>
      <li>Navigate to .kobo/ folder</li>
      <li>Drag KoboReader.sqlite here</li>
      <li>Also drag all your book files</li>
    </ol>
  </Instructions>
</DragDropZone>
```

### Progressive Enhancement

```javascript
// App.jsx - Progressive enhancement strategy
function App() {
  const features = useFeatureDetection();
  
  if (!features.fileReader || !features.webAssembly) {
    return <UnsupportedBrowser />;
  }
  
  return (
    <>
      {!features.fileSystemAccess && (
        <BrowserWarning>
          Your browser has limited support. 
          We recommend Chrome or Edge for the best experience.
        </BrowserWarning>
      )}
      
      <AppContent 
        modernMode={features.fileSystemAccess}
      />
    </>
  );
}
```

---

## 📐 Implementation Phases

### Phase 1: MVP (4-6 weeks)

**Goal:** Core backup & restore functionality

**Features:**
- ✅ Landing page with value proposition
- ✅ Directory selection (File System Access API)
- ✅ Kobo database reading (sql.js)
- ✅ Book list display
- ✅ Backup creation (ZIP download)
- ✅ Restore from ZIP
- ✅ Basic progress tracking
- ✅ Mobile-responsive UI

**Tech Stack:**
- React 18
- Vite
- TailwindCSS
- sql.js
- JSZip
- browser-fs-access

**Success Criteria:**
- ✅ User can create backup in < 5 minutes
- ✅ User can restore to new device
- ✅ Works on Chrome/Edge
- ✅ 95%+ backup success rate

### Phase 2: Polish & Features (2-3 weeks)

**Goal:** Improve UX and add convenience features

**Features:**
- ✅ Backup history (LocalStorage)
- ✅ Book browser with search/filter
- ✅ Annotation viewer
- ✅ Reading statistics
- ✅ Backup comparison
- ✅ PWA (offline support)
- ✅ Dark mode
- ✅ Improved error handling

**Enhancements:**
- Animated transitions
- Better loading states
- Comprehensive error messages
- Onboarding tutorial

### Phase 3: Advanced Features (3-4 weeks)

**Goal:** Power user features

**Features:**
- ✅ Selective restore (choose books)
- ✅ Backup scheduling (reminder system)
- ✅ Export annotations (Markdown, CSV)
- ✅ Backup encryption (optional)
- ✅ Multi-device management
- ✅ Calibre integration (future)

### Phase 4: Optimization & Scale (2-3 weeks)

**Goal:** Performance and reliability

**Improvements:**
- ✅ Large library optimization (1000+ books)
- ✅ Incremental backups
- ✅ Background processing (Web Workers)
- ✅ Better compression
- ✅ Extensive testing
- ✅ Analytics (privacy-focused)

---

## 🛠️ Development Guidelines

### Code Style

```javascript
// Use modern ES6+ syntax
const books = await getBooks();

// Destructure props
function BookCard({ title, author, progress }) {
  // ...
}

// Use optional chaining
const annotationCount = book?.annotations?.length ?? 0;

// Prefer async/await over promises
async function createBackup() {
  try {
    const data = await readKoboData();
    const backup = await generateBackup(data);
    await downloadBackup(backup);
  } catch (error) {
    handleError(error);
  }
}
```

### Component Structure

```jsx
// BookCard.jsx
import { useState } from 'react';
import { formatDate, formatProgress } from '@/utils';

/**
 * Displays a book card with cover, title, author, and progress
 * @param {Object} props - Component props
 * @param {string} props.title - Book title
 * @param {string} props.author - Author name
 * @param {number} props.progress - Reading progress (0-100)
 * @param {Function} props.onClick - Click handler
 */
export function BookCard({ 
  title, 
  author, 
  progress = 0,
  cover,
  onClick 
}) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <article 
      className="book-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${title} by ${author}, ${progress}% complete`}
    >
      <div className="book-card__cover">
        {!imageError ? (
          <img 
            src={cover} 
            alt={`Cover of ${title}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <DefaultCoverPlaceholder title={title} />
        )}
      </div>
      
      <div className="book-card__info">
        <h3 className="book-card__title">{title}</h3>
        <p className="book-card__author">{author}</p>
        <ProgressBar percent={progress} />
      </div>
    </article>
  );
}

// PropTypes or TypeScript for type safety
BookCard.propTypes = {
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  progress: PropTypes.number,
  cover: PropTypes.string,
  onClick: PropTypes.func,
};
```

### Error Handling

```javascript
// Centralized error handler
export class BackupError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'BackupError';
    this.code = code;
    this.details = details;
  }
}

// Usage
try {
  await createBackup();
} catch (error) {
  if (error instanceof BackupError) {
    // Show user-friendly message
    showError({
      title: 'Backup Failed',
      message: error.message,
      code: error.code,
      recovery: getRecoverySteps(error.code),
    });
  } else {
    // Unexpected error
    showError({
      title: 'Unexpected Error',
      message: 'Something went wrong. Please try again.',
    });
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(error);
    }
  }
}
```

### Performance Optimization

```javascript
// Lazy load routes
const Backup = lazy(() => import('./pages/Backup'));
const Restore = lazy(() => import('./pages/Restore'));

// Memoize expensive calculations
const filteredBooks = useMemo(() => {
  return books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [books, searchQuery]);

// Debounce user input
const debouncedSearch = useDebouncedCallback(
  (query) => setSearchQuery(query),
  300
);

// Use Web Workers for heavy processing
const worker = new Worker(
  new URL('./workers/backup.worker.js', import.meta.url)
);

worker.postMessage({ type: 'CREATE_BACKUP', data: koboData });
worker.onmessage = (e) => {
  if (e.data.type === 'PROGRESS') {
    updateProgress(e.data.percent);
  }
};
```

### Testing Strategy

```javascript
// Unit tests (Vitest)
describe('KoboDatabase', () => {
  it('should parse books correctly', async () => {
    const db = new KoboDatabase(mockDbBuffer);
    const books = await db.getBooks();
    
    expect(books).toHaveLength(142);
    expect(books[0]).toMatchObject({
      title: expect.any(String),
      author: expect.any(String),
      progress: expect.any(Number),
    });
  });
});

// Integration tests
describe('Backup Flow', () => {
  it('should create backup from Kobo directory', async () => {
    // Mock file system
    const mockDir = createMockKoboDirectory();
    
    const backup = await createBackup(mockDir);
    
    expect(backup.filename).toMatch(/kobo_backup_\d+\.zip/);
    expect(backup.size).toBeGreaterThan(0);
  });
});

// E2E tests (Playwright)
test('user can create backup', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Create Backup');
  
  // Mock file picker
  await page.evaluate(() => {
    window.mockFileSystemAccess();
  });
  
  await page.click('text=Select Kobo Device');
  await expect(page.locator('text=Scanning...')).toBeVisible();
  await expect(page.locator('text=Backup Complete')).toBeVisible();
});
```

---

## 📚 Additional Resources

### Documentation Links

- **File System Access API:** https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
- **sql.js:** https://github.com/sql-js/sql.js
- **JSZip:** https://stuk.github.io/jszip/
- **browser-fs-access:** https://github.com/GoogleChromeLabs/browser-fs-access
- **React Docs:** https://react.dev
- **Vite Guide:** https://vitejs.dev/guide/
- **TailwindCSS:** https://tailwindcss.com/docs

### Kobo Hacking Resources

- **Kobo Database Structure:** https://github.com/karlicoss/kobuddy
- **Export Kobo Annotations:** https://github.com/eliascotto/export-kobo
- **MobileRead Forums:** https://www.mobileread.com/forums/forumdisplay.php?f=223

### Design Inspiration

- **Dribbble - Book Apps:** https://dribbble.com/tags/book-app
- **Mobbin - Reading Apps:** https://mobbin.com/browse/ios/apps
- **Apple Books UI:** Study native reading app patterns

---

## 🎯 Success Metrics & KPIs

### User Engagement

- **Daily Active Users (DAU)**
- **Backup Success Rate**: Target 95%+
- **Average Backup Time**: < 5 minutes
- **Return User Rate (30 days)**: Target 60%+

### Performance

- **Time to Interactive (TTI)**: < 3 seconds
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### User Satisfaction

- **User Feedback Score**: Target 4.5/5
- **Error Rate**: < 5%
- **Support Tickets**: Track and minimize

---

## 📋 Checklist for Claude Code

When implementing this blueprint, ensure:

### Setup
- [ ] Initialize Vite + React project
- [ ] Configure TailwindCSS with custom theme
- [ ] Set up ESLint + Prettier
- [ ] Configure Vitest for testing
- [ ] Set up Git with .gitignore

### Core Features
- [ ] Implement File System Access API wrapper
- [ ] Integrate sql.js for database parsing
- [ ] Create backup ZIP generation
- [ ] Implement restore from ZIP
- [ ] Build progress tracking system

### UI Components
- [ ] Design system tokens (colors, spacing, typography)
- [ ] Button variants (primary, secondary, ghost)
- [ ] Card components (elevated, glass)
- [ ] Progress components (linear, circular)
- [ ] Status badges
- [ ] Modal system

### User Flows
- [ ] Landing page with hero
- [ ] Device connection wizard
- [ ] Backup creation flow
- [ ] Restore wizard
- [ ] Book browser
- [ ] Settings page

### Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for backup/restore
- [ ] E2E tests for critical paths
- [ ] Browser compatibility tests

### Optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] PWA configuration
- [ ] Lighthouse audit (score 90+)

### Documentation
- [ ] README with setup instructions
- [ ] API documentation
- [ ] User guide
- [ ] Contributing guidelines

---

**End of Blueprint**

This document provides comprehensive guidance for building the Kobo Backup Manager web application. All implementation details should follow modern best practices (December 2024) for React, TypeScript, and web development.
