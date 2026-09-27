/**
 * English messages. This object defines the shape (type) every other
 * language must implement. Placeholders use {name}; plurals use {one, other}.
 */
const en = {
  meta: {
    siteName: 'KoBup',
    tagline: 'Free Kobo backup tool',
    pages: {
      home: {
        title: 'KoBup — Free Kobo Backup & Restore Tool, 100% in Your Browser',
        description:
          'Back up and restore your Kobo e-reader: books, highlights, notes and reading progress. Free, private, open source — nothing is uploaded, no account needed.',
      },
      backup: {
        title: 'Back Up Your Kobo — Books, Highlights & Reading Progress | KoBup',
        description:
          'Create a complete backup of your Kobo in minutes: sideloaded books, annotations, reading progress and settings, with optional AES-256 encryption. Runs locally in your browser.',
      },
      restore: {
        title: 'Restore a Kobo Backup or Move to a New Kobo | KoBup',
        description:
          'Restore your library to a reset or new Kobo. Merge reading progress, highlights and collections into the new device without losing its account. Local and private.',
      },
      library: {
        title: 'Kobo Library Viewer & Highlights Exporter (Obsidian, Anki) | KoBup',
        description:
          'Browse your Kobo library with real covers, reading stats and highlights. Export notes to Obsidian Markdown or Anki flashcards — directly from your e-reader.',
      },
      history: {
        title: 'Backup History | KoBup',
        description:
          'Your previous Kobo backups, stored only in this browser. Verify or restore them in one click.',
      },
      guide: {
        title: 'How to Back Up and Restore a Kobo — Step-by-Step Guide | KoBup',
        description:
          'Step-by-step guide to backing up your Kobo e-reader, moving your library to a new Kobo and exporting highlights. Works in Chrome, Edge, Firefox and Safari.',
      },
      faq: {
        title: 'Kobo Backup FAQ — Privacy, Browsers, Restore | KoBup',
        description:
          'Answers about backing up a Kobo: what is included, which browsers work, how restore and encryption work, and why your data never leaves your computer.',
      },
      privacy: {
        title: 'Privacy Policy | KoBup',
        description:
          'KoBup processes your Kobo library only inside your browser. No uploads, no cookies, no accounts. Read exactly what is (and is not) collected.',
      },
      notFound: {
        title: 'Page not found | KoBup',
        description: 'The page you are looking for does not exist.',
      },
    },
  },

  common: {
    skipToContent: 'Skip to main content',
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back',
    continue: 'Continue',
    retry: 'Try again',
    done: 'Done',
    loading: 'Loading…',
    unknown: 'Unknown',
    optional: 'Optional',
    recommended: 'Recommended',
    required: 'Required',
    technicalDetails: 'Technical details',
    books: { one: '{count} book', other: '{count} books' },
    annotations: { one: '{count} highlight', other: '{count} highlights' },
    files: { one: '{count} file', other: '{count} files' },
    stepOf: 'Step {current} of {total}',
    opensInNewTab: '(opens in a new tab)',
  },

  units: {
    bytes: ['B', 'KB', 'MB', 'GB', 'TB'],
    hours: 'h',
    minutes: 'm',
  },

  nav: {
    label: 'Main navigation',
    home: 'Home',
    backup: 'Back up',
    restore: 'Restore',
    library: 'Library',
    history: 'History',
    guide: 'Guide',
    faq: 'FAQ',
    privacy: 'Privacy',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
    switchLanguage: 'Italiano',
    switchLanguageLabel: 'Leggi questa pagina in italiano',
    logoLabel: 'KoBup home',
  },

  footer: {
    about:
      'A free, open-source tool to back up and restore your Kobo e-reader. Everything happens in your browser: your library never leaves your computer.',
    resources: 'Resources',
    privacyTitle: 'Privacy first',
    badges: ['Nothing is uploaded', 'No account, no cookies', 'Open source & auditable'],
    github: 'Source code on GitHub',
    disclaimer: 'Not affiliated with Rakuten Kobo Inc.',
    version: 'Version {version}',
  },

  analytics: {
    text: 'This site uses cookieless Vercel Analytics to count anonymous page views. Your Kobo data is never sent anywhere.',
    policy: 'Privacy policy',
    ok: 'OK',
  },

  browser: {
    limitedTitle: 'Limited browser support',
    limitedBody:
      'You can create backups and explore your library here. Restoring to a Kobo needs Chrome, Edge or another Chromium-based desktop browser.',
    dismiss: 'Dismiss',
    unsupportedTitle: 'Browser not supported',
    unsupportedBody:
      'Your browser lacks WebAssembly, which KoBup needs to read the Kobo database. Please update your browser.',
    restoreNeedsChromium:
      'Restoring writes files to your Kobo, which is only possible in Chrome, Edge, Opera or Brave on a computer.',
  },

  connect: {
    title: 'Connect your Kobo',
    subtitle: 'Three quick steps and KoBup reads your library — locally.',
    steps: [
      { title: 'Plug it in', body: 'Connect your Kobo to the computer with a USB data cable.' },
      { title: 'Tap “Connect”', body: 'Unlock the Kobo and tap “Connect” on its screen.' },
      { title: 'Choose the drive', body: 'Select the Kobo drive, usually named “KOBOeReader”.' },
    ],
    selectButton: 'Select Kobo drive',
    selecting: 'Waiting for your selection…',
    folderButton: 'Select Kobo folder',
    folderHint:
      'Your browser will say it is “uploading” files: it is only reading them locally. Nothing leaves your computer.',
    driveHint: 'Select the root of the Kobo drive (the folder containing .kobo).',
    connected: 'Connected: {model}',
    disconnect: 'Use a different Kobo',
  },

  scanning: {
    title: 'Reading your Kobo',
    steps: ['Reading the database', 'Analysing books and highlights', 'Finding book files', 'Done'],
    hint: 'This takes a few seconds, depending on the size of your library.',
  },

  warnings: {
    walPending:
      'Your Kobo has changes that are not yet saved in its main database (for example the latest reading progress). For a complete backup, eject the Kobo, wait a few seconds, reconnect it and scan again.',
  },

  home: {
    heroTitle: 'Back up your Kobo library.',
    heroHighlight: 'Keep every highlight.',
    heroBody:
      'Free, private backup for your books, highlights, notes and reading progress. It runs entirely in your browser: nothing is uploaded, no account needed.',
    ctaBackup: 'Create a backup',
    ctaRestore: 'Restore a backup',
    ctaLibrary: 'Explore your library',
    trust: ['No installation', 'Nothing uploaded', 'Open source'],
    featuresTitle: 'Everything your Kobo needs',
    features: [
      {
        title: 'Complete backup',
        body: 'Sideloaded books, the Kobo database with progress and annotations, plus settings, fonts and sleep screens — in one ZIP.',
      },
      {
        title: 'Private by design',
        body: 'Your library is processed locally with WebAssembly. A strict security policy stops the page from sending your data anywhere.',
      },
      {
        title: 'Optional encryption',
        body: 'Protect the backup with AES-256. Useful because the Kobo database also contains your account sign-in tokens.',
      },
      {
        title: 'Move to a new Kobo',
        body: 'Merge reading progress, highlights and collections into the new device while keeping its account and settings.',
      },
      {
        title: 'Library & exports',
        body: 'Browse your books with real covers and stats. Export highlights to Obsidian Markdown or Anki flashcards.',
      },
      {
        title: 'Verified and reversible',
        body: 'Every backup is read back and checksummed. Before restoring, the current database is saved so you can undo.',
      },
    ],
    howTitle: 'How it works',
    how: [
      {
        title: 'Connect your Kobo',
        body: 'Plug it in via USB and tap “Connect”. It appears as a drive on your computer.',
      },
      { title: 'Select the drive', body: 'KoBup reads your library locally and shows what it found.' },
      {
        title: 'Save the backup',
        body: 'Choose where to save the ZIP. Keep a copy on another disk or in the cloud.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqMore: 'All questions',
  },

  backup: {
    title: 'Back up your Kobo',
    stepLabels: ['Connect', 'Review', 'Options', 'Backup'],
    overviewTitle: 'Your library',
    overviewSubtitle: 'Here is what KoBup found on your {model}.',
    stats: {
      books: 'Books',
      annotations: 'Highlights & notes',
      size: 'Estimated size',
      finished: 'Finished',
      started: 'Started',
      reading: 'Reading now',
      timeRead: 'Time spent reading',
    },
    recent: 'Recently read',
    more: { one: 'and {count} more book', other: 'and {count} more books' },
    toOptions: 'Choose what to back up',
    optionsTitle: 'What to include',
    optionsSubtitle: 'The Kobo database (reading progress, highlights, collections) is always included.',
    includeBooks: 'Book files ({count})',
    includeBooksHint: 'Uncheck for a small, database-only backup of progress and highlights.',
    includeAnnotations: 'Readable copy of highlights',
    includeAnnotationsHint: 'Adds a Markdown file with all your highlights and notes, readable anywhere.',
    includeSettings: 'Device settings, fonts and sleep screens ({count})',
    includeSettingsHint: 'Reading preferences, sideloaded fonts and custom screensavers.',
    encryptTitle: 'Protect with a password (AES-256)',
    encryptHint:
      'Recommended if you store the backup in the cloud: the database contains your Kobo account tokens. Without the password the backup cannot be restored.',
    password: 'Password',
    passwordConfirm: 'Confirm password',
    passwordTooShort: 'Use at least 8 characters.',
    passwordMismatch: 'The passwords do not match.',
    estimated: 'Estimated backup size: {size}',
    diskSpace: 'Make sure you have enough free disk space.',
    start: 'Start backup',
    saveDialogHint: 'Your browser will ask where to save the file.',
    progressTitle: 'Creating your backup',
    keepOpen: 'Keep this tab open until the backup is complete.',
    stages: {
      preparing: 'Preparing…',
      books: 'Adding books ({current}/{total})…',
      settings: 'Adding device settings…',
      annotations: 'Exporting highlights…',
      metadata: 'Writing backup information…',
      finalizing: 'Finalizing…',
      verifying: 'Verifying the backup…',
      complete: 'Backup complete',
    },
    successTitle: 'Backup complete',
    successBody: 'Your Kobo library is safely backed up.',
    verifiedOk: 'Verified: the archive was read back and the database checksum matches.',
    verifiedFail: 'Verification failed: the saved file may be incomplete. Please create the backup again.',
    encryptedNote: 'This backup is encrypted. Keep the password safe: it cannot be recovered.',
    downloadNote: 'The file was downloaded by your browser (usually to the Downloads folder).',
    savedAs: 'Saved as {filename}',
    summary: { file: 'File', size: 'Size', books: 'Books', annotations: 'Highlights' },
    nextTitle: 'Keep it safe',
    next: [
      'Copy it to an external drive or a cloud folder',
      'Follow the 3-2-1 rule: 3 copies, 2 different media, 1 off-site',
      'Create a new backup after big reading sessions or before firmware updates',
    ],
    another: 'Back up another Kobo',
    openLibrary: 'Open library',
    failedTitle: 'Backup failed',
    failedBody: 'The backup could not be completed.',
    failedHint: 'With very large libraries, close other tabs to free memory and try again.',
  },

  restore: {
    title: 'Restore a backup',
    stepLabels: ['Backup file', 'Kobo', 'Review', 'Restore'],
    fileTitle: 'Choose a backup file',
    fileSubtitle: 'Select a KoBup backup (kobo_backup_*.zip).',
    drop: 'Drag and drop the backup here',
    or: 'or',
    browse: 'Browse files',
    reading: 'Reading the backup…',
    largeFile: 'Large backup: restoring may take a while. Keep this tab open.',
    passwordTitle: 'This backup is password-protected',
    passwordLabel: 'Backup password',
    unlock: 'Unlock backup',
    deviceTitle: 'Choose the Kobo to restore to',
    deviceSubtitle: 'Connect the Kobo that should receive the backup and select its drive.',
    deviceWarning:
      'Restoring changes the database on this Kobo. A copy of the current database is saved first so you can undo.',
    selectDevice: 'Select Kobo drive',
    reviewTitle: 'Review and choose how to restore',
    backupDetails: 'Backup',
    targetDevice: 'Target Kobo',
    created: 'Created',
    device: 'Device',
    firmware: 'Firmware',
    books: 'Books',
    annotations: 'Highlights',
    readingTime: 'Reading time',
    finished: 'Finished',
    encrypted: 'Encrypted',
    integrityOk: 'Backup integrity verified (database checksum matches).',
    integrityBad:
      'Warning: the database in this backup does not match its checksum. The file may be damaged.',
    compatibility: {
      title: 'Compatibility',
      ok: 'No compatibility issues found.',
      model: 'The backup comes from a {from}, this is a {to}. Reading data transfers fine; settings may not.',
      firmware: 'Different firmware ({from} → {to}). This normally works.',
      'schema-newer':
        'The backup was made with newer Kobo software (database version {from}) than this Kobo has ({to}). Update this Kobo first.',
      'old-backup': 'This backup is {days} days old.',
    },
    modeTitle: 'How to restore',
    modes: {
      merge: {
        title: 'Merge reading data',
        badge: 'Recommended',
        body: 'Adds progress, highlights and collections of your books to this Kobo’s own database. Keeps this Kobo’s account, store books and settings. Best when moving to a new or reset Kobo.',
      },
      full: {
        title: 'Replace everything',
        body: 'Makes this Kobo’s database an exact copy of the backup, including the old account sign-in and store library. Best for the same Kobo after a factory reset.',
      },
    },
    mergeWhat: 'Include',
    mergeProgress: 'Reading progress',
    mergeAnnotations: 'Highlights, notes and bookmarks',
    mergeCollections: 'Collections',
    filesTitle: 'Files',
    restoreBooks: 'Book files ({count})',
    restoreBooksHint: 'Copies the books back to their original folders.',
    noBooksInBackup: 'This is a database-only backup: no book files will be copied.',
    restoreSettings: 'Device settings, fonts and sleep screens ({count})',
    restoreSettingsHint: 'Best on the same Kobo model.',
    cleanFolders: 'Delete existing book folders first',
    cleanFoldersHint:
      'Removes the device’s current book folders before copying. Books you added after the backup will be lost.',
    confirm: 'I understand that the database on this Kobo will be changed',
    start: 'Start restore',
    progressTitle: 'Restoring your library',
    doNotDisconnect: 'Do not disconnect your Kobo until the restore is complete.',
    stages: {
      preparing: 'Preparing the Kobo…',
      snapshot: 'Saving a copy of the current database…',
      cleaning: 'Removing existing book folders…',
      merging: 'Merging reading data…',
      database: 'Writing the database…',
      books: 'Copying books ({current}/{total})…',
      settings: 'Restoring device settings…',
      verifying: 'Verifying…',
      complete: 'Restore complete',
    },
    successTitle: 'Restore complete',
    partialTitle: 'Restore completed with warnings',
    summary: {
      books: 'Books copied',
      merged: 'Books updated',
      added: 'Books added',
      annotations: 'Highlights added',
      collections: 'Collections added',
      settings: 'Settings files',
    },
    failedFiles: { one: '{count} file could not be restored', other: '{count} files could not be restored' },
    verifyMismatch:
      'The restored database lists {actual} books, the backup had {expected}. Eject and reconnect the Kobo to let it rescan.',
    snapshotNote: 'The previous database was saved on the Kobo as .kobo/KoboReader.sqlite.before-restore.',
    undo: 'Undo this restore',
    undoConfirm: 'Put back the database this Kobo had before the restore?',
    undone: 'The previous database has been restored.',
    nextTitle: 'Finish up',
    next: [
      'Eject the Kobo safely from your computer',
      'Unplug the USB cable and let the Kobo process the changes',
      'Open your books and continue where you left off',
    ],
    failedTitle: 'Restore failed',
    failedBody: 'The restore could not be completed.',
    failedDbWritten:
      'The database may already have been changed. You can undo to the copy saved before the restore.',
  },

  library: {
    title: 'Your Kobo library',
    subtitle: 'Browse books, highlights and reading stats — straight from your e-reader.',
    connected: '{model} · firmware {firmware}',
    backupCta: 'Back up this library',
    tabs: { books: 'Books', annotations: 'Highlights', collections: 'Collections', stats: 'Statistics' },
    search: 'Search books or authors',
    filter: 'Filter',
    sort: 'Sort by',
    filters: { all: 'All books', reading: 'Reading', finished: 'Finished', unread: 'Unread' },
    sorts: { recent: 'Recently read', title: 'Title', author: 'Author', progress: 'Progress' },
    results: { one: '{count} book', other: '{count} books' },
    noResults: 'No books match your search.',
    read: '{percent}% read',
    details: 'Book details',
    timeRead: 'Time spent reading',
    format: 'Format',
    isbn: 'ISBN',
    publisher: 'Publisher',
    series: 'Series',
    lastRead: 'Last read',
    never: 'Never',
    noAnnotationsForBook: 'No highlights or notes for this book yet.',
    exportTitle: 'Export your highlights',
    exportBody: 'Take your notes to your favourite tools.',
    exportObsidian: 'Obsidian (Markdown ZIP)',
    exportAnki: 'Anki (CSV)',
    exportBook: 'Export to Markdown',
    exportFailed: 'Export failed: {error}',
    noAnnotations: 'No highlights found. Highlight passages on your Kobo and they will appear here.',
    note: 'Note',
    copy: 'Copy',
    copied: 'Copied',
    noCollections: 'No collections on this Kobo.',
    statsOverview: 'Reading overview',
    progressBreakdown: 'Progress',
    topAuthors: 'Top authors',
    unreadLabel: 'Unread',
    readingLabel: 'In progress',
    finishedLabel: 'Finished',
  },

  history: {
    title: 'Backup history',
    subtitle: 'Backups created in this browser. The list is stored only on this computer.',
    emptyTitle: 'No backups yet',
    emptyBody: 'Create your first backup to keep your Kobo library safe.',
    create: 'Create a backup',
    encrypted: 'Encrypted',
    verified: 'Verified',
    verify: 'Verify',
    verifying: 'Verifying…',
    verifyOk: 'The file is intact.',
    verifyBad: 'Problems found: {details}',
    restore: 'Restore',
    remove: 'Remove from history',
    removeTitle: 'Remove this backup from the history?',
    removeBody: 'Only the history entry is removed. The backup file on your disk is not deleted.',
    notAvailable:
      'The file could not be opened (moved, renamed or permission denied). Use “Restore” and pick it manually.',
    bestTitle: 'Good backup habits',
    best: [
      'Back up regularly, especially before firmware updates',
      'Keep copies in more than one place (cloud + external drive)',
      'Test a backup now and then by verifying it',
    ],
  },

  errors: {
    genericTitle: 'Something went wrong',
    genericBody: 'An unexpected error occurred. Your data is safe.',
    reload: 'Reload the page',
    report: 'Report the problem on GitHub',
    codes: {
      INVALID_DEVICE:
        'This folder is not a Kobo. Select the root of the Kobo drive (it contains a .kobo folder).',
      FS_NOT_SUPPORTED:
        'This browser cannot access folders directly. Use Chrome, Edge or Opera on a computer.',
      FS_PERMISSION_DENIED: 'Permission denied. Allow access to the Kobo when your browser asks.',
      FS_NOT_FOUND: 'A required file was not found on the Kobo.',
      FS_READ_ERROR: 'A file on the Kobo could not be read. Reconnect the Kobo and try again.',
      FS_WRITE_ERROR: 'Writing to the Kobo failed. Check it is still connected and has free space.',
      DB_OPEN_FAILED: 'The Kobo database could not be opened.',
      DB_QUERY_FAILED: 'The Kobo database could not be read.',
      DB_WRITE_ERROR: 'The database could not be prepared for the Kobo.',
      BACKUP_FAILED: 'The backup could not be created.',
      RESTORE_INVALID_FILE: 'This file is not a valid KoBup backup.',
      RESTORE_CORRUPTED: 'The backup file is damaged or incomplete.',
      RESTORE_PASSWORD_REQUIRED: 'This backup is encrypted: enter its password.',
      RESTORE_WRONG_PASSWORD: 'Wrong password. Try again.',
      RESTORE_DEVICE_BUSY:
        'The Kobo database has unsaved changes. Eject the Kobo, wait a few seconds, reconnect it and try again.',
      RESTORE_FAILED: 'The restore could not be completed.',
      SCAN_FAILED: 'The Kobo could not be read.',
    },
  },

  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist or has moved.',
    home: 'Go to the home page',
  },

  guide: {
    title: 'How to back up and restore your Kobo',
    intro:
      'KoBup works entirely in your browser. This guide walks you through a backup, a restore to the same or a new Kobo, and exporting your highlights.',
    requirementsTitle: 'What you need',
    requirements: [
      'A computer with Chrome, Edge, Opera or Brave (backup and restore)',
      'Firefox or Safari work for backups and the library, but cannot restore',
      'A USB data cable (some cables only charge)',
    ],
    sections: [
      {
        id: 'backup',
        title: 'Create a backup',
        steps: [
          'Connect your Kobo with the USB cable, unlock it and tap “Connect”.',
          'Open “Back up” and select the Kobo drive (usually “KOBOeReader”).',
          'Check the summary of books and highlights KoBup found.',
          'Choose what to include. Add a password if you will store the backup in the cloud.',
          'Pick where to save the ZIP. KoBup writes it and then verifies it.',
        ],
      },
      {
        id: 'new-kobo',
        title: 'Move your library to a new Kobo',
        steps: [
          'Set up the new Kobo and sign in to your Kobo account.',
          'Connect it, open “Restore” and select your backup file.',
          'Select the new Kobo drive.',
          'Choose “Merge reading data”: your progress, highlights and collections are added while the new Kobo keeps its account.',
          'Start the restore, then eject the Kobo safely.',
        ],
      },
      {
        id: 'reset',
        title: 'Restore the same Kobo after a reset',
        steps: [
          'Connect the Kobo and open “Restore”.',
          'Select the backup and the Kobo drive.',
          'Choose “Replace everything” for an exact copy of the backed-up database, or “Merge” to keep the current account.',
          'If something looks wrong afterwards, use “Undo this restore”: the previous database was saved on the Kobo.',
        ],
      },
      {
        id: 'export',
        title: 'Export highlights to Obsidian or Anki',
        steps: [
          'Open “Library” and connect your Kobo.',
          'Go to the “Highlights” tab.',
          'Export everything to Obsidian (one Markdown note per book) or to Anki (CSV flashcards), or export a single book.',
        ],
      },
    ],
    troubleshootingTitle: 'Troubleshooting',
    troubleshooting: [
      {
        q: 'The Kobo does not appear as a drive',
        a: 'Use a data-capable USB cable, unlock the Kobo and tap “Connect”. On Windows, check File Explorer for a drive named KOBOeReader.',
      },
      {
        q: '“This folder is not a Kobo”',
        a: 'Select the root of the drive, not a subfolder. The root contains a hidden “.kobo” folder.',
      },
      {
        q: 'The backup is slow',
        a: 'Speed depends on the Kobo’s storage and the USB connection. Libraries of several gigabytes can take a few minutes.',
      },
      {
        q: 'Books show up without progress after a restore',
        a: 'Books must be restored to their original folders. Let the Kobo finish processing after you eject it; if needed, reconnect it once.',
      },
    ],
  },

  faq: {
    title: 'Frequently asked questions',
    intro: 'Everything about backing up and restoring your Kobo e-reader with KoBup.',
    categories: [
      {
        title: 'Getting started',
        items: [
          {
            q: 'What is KoBup?',
            a: 'KoBup is a free, open-source web tool that backs up and restores Kobo e-readers directly in your browser. It reads your books, highlights and reading progress locally and saves them into a ZIP file on your computer.',
          },
          {
            q: 'Which browsers are supported?',
            a: 'Backups and the library work in all modern desktop browsers. Restoring needs the File System Access API to write to the Kobo, available in Chrome, Edge, Opera and Brave on a computer.',
          },
          {
            q: 'Do I need an account?',
            a: 'No. There is no registration and no login. KoBup has no server that could store your data.',
          },
          {
            q: 'Is it free?',
            a: 'Yes, completely. It is a personal open-source project under the MIT license.',
          },
        ],
      },
      {
        title: 'Backup & restore',
        items: [
          {
            q: 'What does a backup contain?',
            a: 'The Kobo database (reading progress, highlights, notes, bookmarks, collections) and, optionally, your sideloaded book files, reading settings, custom fonts and sleep screens. Books bought from the Kobo store are not included: you can download them again from your account.',
          },
          {
            q: 'Can I move my library to a new Kobo?',
            a: 'Yes. Choose “Merge reading data” when restoring: progress, highlights and collections are added to the new Kobo while it keeps its own account and settings.',
          },
          {
            q: 'Will restoring delete my current books?',
            a: 'No, unless you explicitly choose to delete the existing book folders. Before changing the database, KoBup saves a copy of it on the Kobo so you can undo the restore.',
          },
          {
            q: 'How do I know a backup is good?',
            a: 'Right after writing, KoBup reads the archive back, checks every file is there and compares the database checksum. You can verify it again later from the History page.',
          },
          {
            q: 'How long does it take?',
            a: 'A database-only backup takes seconds. A full backup depends on your library size and USB speed: a few minutes for several gigabytes.',
          },
        ],
      },
      {
        title: 'Privacy & security',
        items: [
          {
            q: 'Is my data sent to a server?',
            a: 'No. Everything runs in your browser with JavaScript and WebAssembly. The site’s Content Security Policy only allows connections to its own origin, so the page cannot upload your library.',
          },
          {
            q: 'Why would I encrypt a backup?',
            a: 'The Kobo database also stores your Kobo account sign-in tokens. If you keep backups in the cloud, a password (AES-256) makes sure nobody else can use them.',
          },
          {
            q: 'Does KoBup use analytics or cookies?',
            a: 'No cookies. The site uses cookieless Vercel Analytics to count anonymous page views; it never sees your library or backup files.',
          },
          {
            q: 'Is it affiliated with Rakuten Kobo?',
            a: 'No. KoBup is an independent community tool, not endorsed by Rakuten Kobo Inc.',
          },
        ],
      },
      {
        title: 'Technical',
        items: [
          {
            q: 'Does it work offline?',
            a: 'Yes. After the first visit the app is cached and can be installed, so it keeps working without an internet connection.',
          },
          {
            q: 'Can I use it on a phone or tablet?',
            a: 'Not really: mobile browsers cannot access a USB-connected Kobo. Use a desktop or laptop computer.',
          },
          {
            q: 'Why are my book covers missing?',
            a: 'Covers come from the thumbnails your Kobo generated. Books you never opened in the library view may not have one yet; KoBup then draws a placeholder.',
          },
        ],
      },
    ],
    moreTitle: 'Still have questions?',
    moreBody: 'Read the step-by-step guide or open an issue on GitHub.',
    moreGuide: 'Read the guide',
  },

  privacy: {
    title: 'Privacy policy',
    updated: 'Last updated: {date}',
    intro:
      'KoBup is a free, non-commercial, open-source tool. It is built so that your Kobo library never leaves your computer. This page explains exactly what is processed and where.',
    sections: [
      {
        title: 'Your Kobo data stays on your computer',
        paragraphs: [
          'When you create or restore a backup, or open the library, KoBup reads the Kobo database and files directly in your browser. Nothing is uploaded: there is no KoBup server that receives data.',
          'This is enforced by a Content Security Policy that only allows the page to connect to its own origin.',
        ],
      },
      {
        title: 'Data stored in your browser',
        paragraphs: [
          'KoBup stores a small amount of data locally, which you can delete at any time by clearing site data:',
        ],
        items: [
          'Backup history (date, size, number of books) in local storage',
          'References to saved backup files in IndexedDB, used to verify or restore them later (no file content)',
          'Whether you dismissed the analytics notice',
        ],
      },
      {
        title: 'Anonymous page views (Vercel Analytics)',
        paragraphs: [
          'The hosted site at kobup.org uses Vercel Analytics to count page views. It sets no cookies and does not track you across sites. It records the page address, referrer, approximate country, browser and device type. It never receives your library or backups.',
          'Self-hosted copies of KoBup can run without any analytics.',
        ],
      },
      {
        title: 'No third-party requests',
        paragraphs: [
          'Fonts and all other assets are served from kobup.org itself. The site does not load anything from Google or other third parties.',
        ],
      },
      {
        title: 'Legal basis and your rights (GDPR)',
        paragraphs: [
          'Local processing is needed to provide the tool you use. Aggregate, cookieless analytics rely on legitimate interest (Art. 6(1)(f) GDPR). You can block them with any content blocker.',
          'Because KoBup does not hold personal data about you, there is nothing to access, correct or delete on our side. Questions can be asked through GitHub issues.',
        ],
      },
      {
        title: 'Changes',
        paragraphs: [
          'If this policy changes, the date at the top will be updated. The full history is public on GitHub.',
        ],
      },
    ],
  },
};

export default en;

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;
