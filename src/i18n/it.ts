import type { Messages } from './en.ts';

const it: Messages = {
  meta: {
    siteName: 'KoBup',
    tagline: 'Backup Kobo gratuito',
    pages: {
      home: {
        title: 'KoBup — Backup e ripristino Kobo gratis, direttamente nel browser',
        description:
          'Fai il backup del tuo e-reader Kobo e ripristinalo: libri, evidenziazioni, note e avanzamento di lettura. Gratuito, privato e open source: nessun upload, nessun account.',
      },
      backup: {
        title: 'Backup del Kobo — libri, evidenziazioni e avanzamento | KoBup',
        description:
          'Crea in pochi minuti un backup completo del tuo Kobo: libri caricati, annotazioni, avanzamento di lettura e impostazioni, con cifratura AES-256 opzionale. Tutto in locale nel browser.',
      },
      restore: {
        title: 'Ripristina un backup Kobo o passa a un nuovo Kobo | KoBup',
        description:
          'Ripristina la libreria su un Kobo resettato o nuovo. Unisci avanzamento, evidenziazioni e raccolte nel nuovo dispositivo senza perdere il suo account. Locale e privato.',
      },
      library: {
        title: 'Libreria Kobo ed esportazione evidenziazioni (Obsidian, Anki) | KoBup',
        description:
          'Sfoglia la libreria del Kobo con copertine vere, statistiche di lettura ed evidenziazioni. Esporta le note in Markdown per Obsidian o in flashcard Anki.',
      },
      history: {
        title: 'Cronologia backup | KoBup',
        description:
          'I tuoi backup Kobo precedenti, salvati solo in questo browser. Verificali o ripristinali con un clic.',
      },
      guide: {
        title: 'Come fare il backup e il ripristino di un Kobo — Guida passo passo | KoBup',
        description:
          'Guida passo passo per fare il backup del Kobo, trasferire la libreria su un nuovo Kobo ed esportare le evidenziazioni. Funziona con Chrome, Edge, Firefox e Safari.',
      },
      faq: {
        title: 'Domande frequenti sul backup Kobo — privacy, browser, ripristino | KoBup',
        description:
          'Risposte sul backup del Kobo: cosa include, quali browser funzionano, come funzionano ripristino e cifratura e perché i tuoi dati non lasciano mai il computer.',
      },
      privacy: {
        title: 'Informativa privacy | KoBup',
        description:
          'KoBup elabora la tua libreria Kobo solo nel browser. Nessun upload, nessun cookie, nessun account. Ecco cosa viene raccolto (e cosa no).',
      },
      notFound: {
        title: 'Pagina non trovata | KoBup',
        description: 'La pagina che cerchi non esiste.',
      },
    },
  },

  common: {
    skipToContent: 'Vai al contenuto principale',
    close: 'Chiudi',
    cancel: 'Annulla',
    back: 'Indietro',
    continue: 'Continua',
    retry: 'Riprova',
    done: 'Fatto',
    loading: 'Caricamento…',
    unknown: 'Sconosciuto',
    optional: 'Facoltativo',
    recommended: 'Consigliato',
    required: 'Obbligatorio',
    technicalDetails: 'Dettagli tecnici',
    books: { one: '{count} libro', other: '{count} libri' },
    annotations: { one: '{count} evidenziazione', other: '{count} evidenziazioni' },
    files: { one: '{count} file', other: '{count} file' },
    stepOf: 'Passo {current} di {total}',
    opensInNewTab: '(si apre in una nuova scheda)',
  },

  units: {
    bytes: ['B', 'KB', 'MB', 'GB', 'TB'],
    hours: 'h',
    minutes: 'min',
  },

  nav: {
    label: 'Navigazione principale',
    home: 'Home',
    backup: 'Backup',
    restore: 'Ripristino',
    library: 'Libreria',
    history: 'Cronologia',
    guide: 'Guida',
    faq: 'FAQ',
    privacy: 'Privacy',
    openMenu: 'Apri il menu',
    closeMenu: 'Chiudi il menu',
    language: 'Lingua',
    switchLanguage: 'English',
    switchLanguageLabel: 'Read this page in English',
    logoLabel: 'KoBup, home page',
  },

  footer: {
    about:
      'Uno strumento gratuito e open source per fare il backup e il ripristino del tuo e-reader Kobo. Tutto avviene nel browser: la tua libreria non lascia mai il computer.',
    resources: 'Risorse',
    privacyTitle: 'Privacy prima di tutto',
    badges: ['Nessun upload', 'Nessun account, nessun cookie', 'Open source e verificabile'],
    github: 'Codice sorgente su GitHub',
    disclaimer: 'Non affiliato con Rakuten Kobo Inc.',
    version: 'Versione {version}',
  },

  analytics: {
    text: 'Questo sito usa Vercel Analytics senza cookie per contare le visite in forma anonima. I dati del tuo Kobo non vengono mai inviati.',
    policy: 'Informativa privacy',
    ok: 'OK',
  },

  browser: {
    limitedTitle: 'Supporto del browser limitato',
    limitedBody:
      'Qui puoi creare backup ed esplorare la libreria. Per ripristinare un backup sul Kobo serve Chrome, Edge o un altro browser Chromium per computer.',
    dismiss: 'Chiudi',
    unsupportedTitle: 'Browser non supportato',
    unsupportedBody:
      'Il tuo browser non supporta WebAssembly, necessario a KoBup per leggere il database del Kobo. Aggiorna il browser.',
    restoreNeedsChromium:
      'Il ripristino scrive file sul Kobo: è possibile solo con Chrome, Edge, Opera o Brave su computer.',
  },

  connect: {
    title: 'Collega il tuo Kobo',
    subtitle: 'Tre passaggi e KoBup legge la tua libreria, in locale.',
    steps: [
      { title: 'Collegalo', body: 'Collega il Kobo al computer con un cavo USB dati.' },
      { title: 'Tocca «Connetti»', body: 'Sblocca il Kobo e tocca «Connetti» sullo schermo.' },
      { title: 'Scegli l’unità', body: 'Seleziona l’unità del Kobo, di solito chiamata «KOBOeReader».' },
    ],
    selectButton: 'Seleziona l’unità del Kobo',
    selecting: 'In attesa della selezione…',
    folderButton: 'Seleziona la cartella del Kobo',
    folderHint:
      'Il browser dirà che sta «caricando» i file: in realtà li legge soltanto in locale. Niente lascia il tuo computer.',
    driveHint: 'Seleziona la radice dell’unità del Kobo (la cartella che contiene .kobo).',
    connected: 'Collegato: {model}',
    disconnect: 'Usa un altro Kobo',
  },

  scanning: {
    title: 'Lettura del Kobo',
    steps: [
      'Lettura del database',
      'Analisi di libri ed evidenziazioni',
      'Ricerca dei file dei libri',
      'Fatto',
    ],
    hint: 'Richiede qualche secondo, in base alle dimensioni della libreria.',
  },

  warnings: {
    walPending:
      'Il tuo Kobo ha modifiche non ancora salvate nel database principale (ad esempio l’ultimo avanzamento di lettura). Per un backup completo espelli il Kobo, attendi qualche secondo, ricollegalo e ripeti la scansione.',
  },

  home: {
    heroTitle: 'Fai il backup della tua libreria Kobo.',
    heroHighlight: 'Non perdere nessuna evidenziazione.',
    heroBody:
      'Backup gratuito e privato di libri, evidenziazioni, note e avanzamento di lettura. Funziona interamente nel browser: nessun upload, nessun account.',
    ctaBackup: 'Crea un backup',
    ctaRestore: 'Ripristina un backup',
    ctaLibrary: 'Esplora la libreria',
    trust: ['Nessuna installazione', 'Nessun upload', 'Open source'],
    featuresTitle: 'Tutto ciò che serve al tuo Kobo',
    features: [
      {
        title: 'Backup completo',
        body: 'Libri caricati, database del Kobo con avanzamento e annotazioni, più impostazioni, font e salvaschermi: tutto in un unico ZIP.',
      },
      {
        title: 'Privato per progettazione',
        body: 'La libreria viene elaborata in locale con WebAssembly. Una politica di sicurezza rigorosa impedisce alla pagina di inviare i tuoi dati.',
      },
      {
        title: 'Cifratura opzionale',
        body: 'Proteggi il backup con AES-256. Utile perché il database del Kobo contiene anche i token di accesso al tuo account.',
      },
      {
        title: 'Passa a un nuovo Kobo',
        body: 'Unisci avanzamento, evidenziazioni e raccolte nel nuovo dispositivo mantenendo il suo account e le sue impostazioni.',
      },
      {
        title: 'Libreria ed esportazioni',
        body: 'Sfoglia i libri con le copertine vere e le statistiche. Esporta le evidenziazioni in Markdown per Obsidian o in flashcard Anki.',
      },
      {
        title: 'Verificato e reversibile',
        body: 'Ogni backup viene riletto e controllato. Prima del ripristino il database attuale viene salvato, così puoi annullare.',
      },
    ],
    howTitle: 'Come funziona',
    how: [
      {
        title: 'Collega il Kobo',
        body: 'Collegalo via USB e tocca «Connetti»: compare come unità sul computer.',
      },
      { title: 'Seleziona l’unità', body: 'KoBup legge la libreria in locale e ti mostra cosa ha trovato.' },
      {
        title: 'Salva il backup',
        body: 'Scegli dove salvare lo ZIP. Tienine una copia su un altro disco o nel cloud.',
      },
    ],
    faqTitle: 'Domande frequenti',
    faqMore: 'Tutte le domande',
  },

  backup: {
    title: 'Backup del tuo Kobo',
    stepLabels: ['Collegamento', 'Riepilogo', 'Opzioni', 'Backup'],
    overviewTitle: 'La tua libreria',
    overviewSubtitle: 'Ecco cosa ha trovato KoBup sul tuo {model}.',
    stats: {
      books: 'Libri',
      annotations: 'Evidenziazioni e note',
      size: 'Dimensione stimata',
      finished: 'Finiti',
      started: 'Iniziati',
      reading: 'In lettura',
      timeRead: 'Tempo di lettura',
    },
    recent: 'Letti di recente',
    more: { one: 'e un altro libro', other: 'e altri {count} libri' },
    toOptions: 'Scegli cosa salvare',
    optionsTitle: 'Cosa includere',
    optionsSubtitle: 'Il database del Kobo (avanzamento, evidenziazioni, raccolte) è sempre incluso.',
    includeBooks: 'File dei libri ({count})',
    includeBooksHint:
      'Deseleziona per un backup leggero del solo database, con avanzamento ed evidenziazioni.',
    includeAnnotations: 'Copia leggibile delle evidenziazioni',
    includeAnnotationsHint:
      'Aggiunge un file Markdown con tutte le evidenziazioni e le note, leggibile ovunque.',
    includeSettings: 'Impostazioni, font e salvaschermi ({count})',
    includeSettingsHint: 'Preferenze di lettura, font caricati e salvaschermi personalizzati.',
    encryptTitle: 'Proteggi con una password (AES-256)',
    encryptHint:
      'Consigliato se conservi il backup nel cloud: il database contiene i token del tuo account Kobo. Senza password il backup non può essere ripristinato.',
    password: 'Password',
    passwordConfirm: 'Conferma password',
    passwordTooShort: 'Usa almeno 8 caratteri.',
    passwordMismatch: 'Le password non coincidono.',
    estimated: 'Dimensione stimata del backup: {size}',
    diskSpace: 'Assicurati di avere abbastanza spazio libero sul disco.',
    start: 'Avvia il backup',
    saveDialogHint: 'Il browser ti chiederà dove salvare il file.',
    progressTitle: 'Creazione del backup',
    keepOpen: 'Tieni aperta questa scheda fino al termine del backup.',
    stages: {
      preparing: 'Preparazione…',
      books: 'Aggiunta dei libri ({current}/{total})…',
      settings: 'Aggiunta delle impostazioni…',
      annotations: 'Esportazione delle evidenziazioni…',
      metadata: 'Scrittura delle informazioni del backup…',
      finalizing: 'Completamento…',
      verifying: 'Verifica del backup…',
      complete: 'Backup completato',
    },
    successTitle: 'Backup completato',
    successBody: 'La libreria del tuo Kobo è al sicuro.',
    verifiedOk: 'Verificato: l’archivio è stato riletto e il checksum del database corrisponde.',
    verifiedFail:
      'Verifica non riuscita: il file salvato potrebbe essere incompleto. Crea di nuovo il backup.',
    encryptedNote: 'Questo backup è cifrato. Custodisci la password: non può essere recuperata.',
    downloadNote: 'Il file è stato scaricato dal browser (di solito nella cartella Download).',
    savedAs: 'Salvato come {filename}',
    summary: { file: 'File', size: 'Dimensione', books: 'Libri', annotations: 'Evidenziazioni' },
    nextTitle: 'Mettilo al sicuro',
    next: [
      'Copialo su un disco esterno o in una cartella cloud',
      'Segui la regola 3-2-1: 3 copie, 2 supporti diversi, 1 fuori casa',
      'Crea un nuovo backup dopo molte letture o prima degli aggiornamenti del firmware',
    ],
    another: 'Backup di un altro Kobo',
    openLibrary: 'Apri la libreria',
    failedTitle: 'Backup non riuscito',
    failedBody: 'Non è stato possibile completare il backup.',
    failedHint: 'Con librerie molto grandi, chiudi le altre schede per liberare memoria e riprova.',
  },

  restore: {
    title: 'Ripristina un backup',
    stepLabels: ['File di backup', 'Kobo', 'Riepilogo', 'Ripristino'],
    fileTitle: 'Scegli un file di backup',
    fileSubtitle: 'Seleziona un backup di KoBup (kobo_backup_*.zip).',
    drop: 'Trascina qui il backup',
    or: 'oppure',
    browse: 'Sfoglia i file',
    reading: 'Lettura del backup…',
    largeFile:
      'Backup di grandi dimensioni: il ripristino può richiedere un po’ di tempo. Tieni aperta questa scheda.',
    passwordTitle: 'Questo backup è protetto da password',
    passwordLabel: 'Password del backup',
    unlock: 'Sblocca il backup',
    deviceTitle: 'Scegli il Kobo su cui ripristinare',
    deviceSubtitle: 'Collega il Kobo che deve ricevere il backup e seleziona la sua unità.',
    deviceWarning:
      'Il ripristino modifica il database di questo Kobo. Prima viene salvata una copia del database attuale, così puoi annullare.',
    selectDevice: 'Seleziona l’unità del Kobo',
    reviewTitle: 'Controlla e scegli come ripristinare',
    backupDetails: 'Backup',
    targetDevice: 'Kobo di destinazione',
    created: 'Creato',
    device: 'Dispositivo',
    firmware: 'Firmware',
    books: 'Libri',
    annotations: 'Evidenziazioni',
    readingTime: 'Tempo di lettura',
    finished: 'Finiti',
    encrypted: 'Cifrato',
    integrityOk: 'Integrità del backup verificata (il checksum del database corrisponde).',
    integrityBad:
      'Attenzione: il database di questo backup non corrisponde al suo checksum. Il file potrebbe essere danneggiato.',
    compatibility: {
      title: 'Compatibilità',
      ok: 'Nessun problema di compatibilità.',
      model:
        'Il backup proviene da un {from}, questo è un {to}. I dati di lettura si trasferiscono senza problemi, le impostazioni forse no.',
      firmware: 'Firmware diverso ({from} → {to}). Di norma funziona.',
      'schema-newer':
        'Il backup è stato creato con un software Kobo più recente (database versione {from}) di quello di questo Kobo ({to}). Aggiorna prima questo Kobo.',
      'old-backup': 'Questo backup ha {days} giorni.',
    },
    modeTitle: 'Come ripristinare',
    modes: {
      merge: {
        title: 'Unisci i dati di lettura',
        badge: 'Consigliato',
        body: 'Aggiunge avanzamento, evidenziazioni e raccolte dei tuoi libri al database di questo Kobo. Mantiene account, libri acquistati e impostazioni di questo Kobo. Ideale per passare a un Kobo nuovo o resettato.',
      },
      full: {
        title: 'Sostituisci tutto',
        body: 'Rende il database di questo Kobo una copia esatta del backup, compresi l’accesso al vecchio account e la libreria dello store. Ideale per lo stesso Kobo dopo un ripristino di fabbrica.',
      },
    },
    mergeWhat: 'Includi',
    mergeProgress: 'Avanzamento di lettura',
    mergeAnnotations: 'Evidenziazioni, note e segnalibri',
    mergeCollections: 'Raccolte',
    filesTitle: 'File',
    restoreBooks: 'File dei libri ({count})',
    restoreBooksHint: 'Ricopia i libri nelle loro cartelle originali.',
    noBooksInBackup: 'Questo backup contiene solo il database: nessun file di libro verrà copiato.',
    restoreSettings: 'Impostazioni, font e salvaschermi ({count})',
    restoreSettingsHint: 'Ideale sullo stesso modello di Kobo.',
    cleanFolders: 'Elimina prima le cartelle dei libri esistenti',
    cleanFoldersHint:
      'Rimuove le cartelle dei libri presenti sul dispositivo prima della copia. I libri aggiunti dopo il backup andranno persi.',
    confirm: 'Ho capito che il database di questo Kobo verrà modificato',
    start: 'Avvia il ripristino',
    progressTitle: 'Ripristino della libreria',
    doNotDisconnect: 'Non scollegare il Kobo finché il ripristino non è terminato.',
    stages: {
      preparing: 'Preparazione del Kobo…',
      snapshot: 'Salvataggio di una copia del database attuale…',
      cleaning: 'Rimozione delle cartelle dei libri esistenti…',
      merging: 'Unione dei dati di lettura…',
      database: 'Scrittura del database…',
      books: 'Copia dei libri ({current}/{total})…',
      settings: 'Ripristino delle impostazioni…',
      verifying: 'Verifica…',
      complete: 'Ripristino completato',
    },
    successTitle: 'Ripristino completato',
    partialTitle: 'Ripristino completato con avvisi',
    summary: {
      books: 'Libri copiati',
      merged: 'Libri aggiornati',
      added: 'Libri aggiunti',
      annotations: 'Evidenziazioni aggiunte',
      collections: 'Raccolte aggiunte',
      settings: 'File di impostazioni',
    },
    failedFiles: {
      one: '{count} file non è stato ripristinato',
      other: '{count} file non sono stati ripristinati',
    },
    verifyMismatch:
      'Il database ripristinato elenca {actual} libri, il backup ne aveva {expected}. Espelli e ricollega il Kobo per fargli ripetere la scansione.',
    snapshotNote:
      'Il database precedente è stato salvato sul Kobo come .kobo/KoboReader.sqlite.before-restore.',
    undo: 'Annulla questo ripristino',
    undoConfirm: 'Vuoi rimettere il database che il Kobo aveva prima del ripristino?',
    undone: 'Il database precedente è stato ripristinato.',
    nextTitle: 'Per finire',
    next: [
      'Espelli il Kobo in modo sicuro dal computer',
      'Scollega il cavo USB e lascia che il Kobo elabori le modifiche',
      'Apri i tuoi libri e riprendi da dove eri rimasto',
    ],
    failedTitle: 'Ripristino non riuscito',
    failedBody: 'Non è stato possibile completare il ripristino.',
    failedDbWritten:
      'Il database potrebbe essere già stato modificato. Puoi annullare tornando alla copia salvata prima del ripristino.',
  },

  library: {
    title: 'La tua libreria Kobo',
    subtitle: 'Sfoglia libri, evidenziazioni e statistiche di lettura, direttamente dal tuo e-reader.',
    connected: '{model} · firmware {firmware}',
    backupCta: 'Fai il backup di questa libreria',
    tabs: { books: 'Libri', annotations: 'Evidenziazioni', collections: 'Raccolte', stats: 'Statistiche' },
    search: 'Cerca libri o autori',
    filter: 'Filtro',
    sort: 'Ordina per',
    filters: { all: 'Tutti i libri', reading: 'In lettura', finished: 'Finiti', unread: 'Da leggere' },
    sorts: { recent: 'Letti di recente', title: 'Titolo', author: 'Autore', progress: 'Avanzamento' },
    results: { one: '{count} libro', other: '{count} libri' },
    noResults: 'Nessun libro corrisponde alla ricerca.',
    read: '{percent}% letto',
    details: 'Dettagli del libro',
    timeRead: 'Tempo di lettura',
    format: 'Formato',
    isbn: 'ISBN',
    publisher: 'Editore',
    series: 'Serie',
    lastRead: 'Ultima lettura',
    never: 'Mai',
    noAnnotationsForBook: 'Ancora nessuna evidenziazione o nota per questo libro.',
    exportTitle: 'Esporta le evidenziazioni',
    exportBody: 'Porta le tue note nei tuoi strumenti preferiti.',
    exportObsidian: 'Obsidian (ZIP Markdown)',
    exportAnki: 'Anki (CSV)',
    exportBook: 'Esporta in Markdown',
    exportFailed: 'Esportazione non riuscita: {error}',
    noAnnotations: 'Nessuna evidenziazione trovata. Evidenzia dei passaggi sul Kobo e compariranno qui.',
    note: 'Nota',
    copy: 'Copia',
    copied: 'Copiato',
    noCollections: 'Nessuna raccolta su questo Kobo.',
    statsOverview: 'Panoramica di lettura',
    progressBreakdown: 'Avanzamento',
    topAuthors: 'Autori più presenti',
    unreadLabel: 'Da leggere',
    readingLabel: 'In corso',
    finishedLabel: 'Finiti',
  },

  history: {
    title: 'Cronologia backup',
    subtitle: 'I backup creati in questo browser. L’elenco è salvato solo su questo computer.',
    emptyTitle: 'Ancora nessun backup',
    emptyBody: 'Crea il tuo primo backup per mettere al sicuro la libreria del Kobo.',
    create: 'Crea un backup',
    encrypted: 'Cifrato',
    verified: 'Verificato',
    verify: 'Verifica',
    verifying: 'Verifica in corso…',
    verifyOk: 'Il file è integro.',
    verifyBad: 'Problemi rilevati: {details}',
    restore: 'Ripristina',
    remove: 'Rimuovi dalla cronologia',
    removeTitle: 'Rimuovere questo backup dalla cronologia?',
    removeBody:
      'Viene rimossa solo la voce della cronologia. Il file di backup sul disco non viene eliminato.',
    notAvailable:
      'Impossibile aprire il file (spostato, rinominato o permesso negato). Usa «Ripristina» e selezionalo manualmente.',
    bestTitle: 'Buone abitudini di backup',
    best: [
      'Fai backup regolari, soprattutto prima degli aggiornamenti del firmware',
      'Conserva copie in più posti (cloud + disco esterno)',
      'Ogni tanto controlla un backup verificandolo',
    ],
  },

  errors: {
    genericTitle: 'Qualcosa è andato storto',
    genericBody: 'Si è verificato un errore imprevisto. I tuoi dati sono al sicuro.',
    reload: 'Ricarica la pagina',
    report: 'Segnala il problema su GitHub',
    codes: {
      INVALID_DEVICE:
        'Questa cartella non è un Kobo. Seleziona la radice dell’unità del Kobo (contiene una cartella .kobo).',
      FS_NOT_SUPPORTED:
        'Questo browser non può accedere direttamente alle cartelle. Usa Chrome, Edge o Opera su computer.',
      FS_PERMISSION_DENIED: 'Permesso negato. Consenti l’accesso al Kobo quando il browser lo chiede.',
      FS_NOT_FOUND: 'Un file necessario non è stato trovato sul Kobo.',
      FS_READ_ERROR: 'Impossibile leggere un file sul Kobo. Ricollega il Kobo e riprova.',
      FS_WRITE_ERROR:
        'Scrittura sul Kobo non riuscita. Controlla che sia ancora collegato e che abbia spazio libero.',
      DB_OPEN_FAILED: 'Impossibile aprire il database del Kobo.',
      DB_QUERY_FAILED: 'Impossibile leggere il database del Kobo.',
      DB_WRITE_ERROR: 'Impossibile preparare il database per il Kobo.',
      BACKUP_FAILED: 'Impossibile creare il backup.',
      RESTORE_INVALID_FILE: 'Questo file non è un backup di KoBup valido.',
      RESTORE_CORRUPTED: 'Il file di backup è danneggiato o incompleto.',
      RESTORE_PASSWORD_REQUIRED: 'Questo backup è cifrato: inserisci la password.',
      RESTORE_WRONG_PASSWORD: 'Password errata. Riprova.',
      RESTORE_DEVICE_BUSY:
        'Il database del Kobo ha modifiche non salvate. Espelli il Kobo, attendi qualche secondo, ricollegalo e riprova.',
      RESTORE_FAILED: 'Impossibile completare il ripristino.',
      SCAN_FAILED: 'Impossibile leggere il Kobo.',
    },
  },

  notFound: {
    title: 'Pagina non trovata',
    body: 'La pagina che cerchi non esiste o è stata spostata.',
    home: 'Vai alla home page',
  },

  guide: {
    title: 'Come fare il backup e il ripristino del Kobo',
    intro:
      'KoBup funziona interamente nel browser. Questa guida ti accompagna nel backup, nel ripristino sullo stesso Kobo o su uno nuovo e nell’esportazione delle evidenziazioni.',
    requirementsTitle: 'Cosa ti serve',
    requirements: [
      'Un computer con Chrome, Edge, Opera o Brave (backup e ripristino)',
      'Firefox e Safari vanno bene per i backup e la libreria, ma non per il ripristino',
      'Un cavo USB dati (alcuni cavi servono solo per la ricarica)',
    ],
    sections: [
      {
        id: 'backup',
        title: 'Crea un backup',
        steps: [
          'Collega il Kobo con il cavo USB, sbloccalo e tocca «Connetti».',
          'Apri «Backup» e seleziona l’unità del Kobo (di solito «KOBOeReader»).',
          'Controlla il riepilogo dei libri e delle evidenziazioni trovati da KoBup.',
          'Scegli cosa includere. Aggiungi una password se conserverai il backup nel cloud.',
          'Scegli dove salvare lo ZIP. KoBup lo scrive e poi lo verifica.',
        ],
      },
      {
        id: 'new-kobo',
        title: 'Trasferisci la libreria su un nuovo Kobo',
        steps: [
          'Configura il nuovo Kobo e accedi al tuo account Kobo.',
          'Collegalo, apri «Ripristino» e seleziona il file di backup.',
          'Seleziona l’unità del nuovo Kobo.',
          'Scegli «Unisci i dati di lettura»: avanzamento, evidenziazioni e raccolte vengono aggiunti mentre il nuovo Kobo mantiene il suo account.',
          'Avvia il ripristino, poi espelli il Kobo in modo sicuro.',
        ],
      },
      {
        id: 'reset',
        title: 'Ripristina lo stesso Kobo dopo un reset',
        steps: [
          'Collega il Kobo e apri «Ripristino».',
          'Seleziona il backup e l’unità del Kobo.',
          'Scegli «Sostituisci tutto» per una copia esatta del database salvato, oppure «Unisci» per mantenere l’account attuale.',
          'Se dopo qualcosa non va, usa «Annulla questo ripristino»: il database precedente è stato salvato sul Kobo.',
        ],
      },
      {
        id: 'export',
        title: 'Esporta le evidenziazioni in Obsidian o Anki',
        steps: [
          'Apri «Libreria» e collega il Kobo.',
          'Vai alla scheda «Evidenziazioni».',
          'Esporta tutto in Obsidian (una nota Markdown per libro) o in Anki (flashcard CSV), oppure esporta un singolo libro.',
        ],
      },
    ],
    troubleshootingTitle: 'Risoluzione dei problemi',
    troubleshooting: [
      {
        q: 'Il Kobo non compare come unità',
        a: 'Usa un cavo USB dati, sblocca il Kobo e tocca «Connetti». Su Windows cerca in Esplora file un’unità chiamata KOBOeReader.',
      },
      {
        q: '«Questa cartella non è un Kobo»',
        a: 'Seleziona la radice dell’unità, non una sottocartella. La radice contiene una cartella nascosta «.kobo».',
      },
      {
        q: 'Il backup è lento',
        a: 'La velocità dipende dalla memoria del Kobo e dalla connessione USB. Librerie di diversi gigabyte possono richiedere qualche minuto.',
      },
      {
        q: 'Dopo il ripristino i libri non hanno l’avanzamento',
        a: 'I libri devono tornare nelle cartelle originali. Lascia che il Kobo finisca l’elaborazione dopo averlo espulso; se serve, ricollegalo una volta.',
      },
    ],
  },

  faq: {
    title: 'Domande frequenti',
    intro: 'Tutto sul backup e sul ripristino del tuo e-reader Kobo con KoBup.',
    categories: [
      {
        title: 'Per iniziare',
        items: [
          {
            q: 'Che cos’è KoBup?',
            a: 'KoBup è uno strumento web gratuito e open source che fa il backup e il ripristino degli e-reader Kobo direttamente nel browser. Legge in locale libri, evidenziazioni e avanzamento di lettura e li salva in un file ZIP sul tuo computer.',
          },
          {
            q: 'Quali browser sono supportati?',
            a: 'Backup e libreria funzionano con tutti i browser moderni per computer. Il ripristino richiede la File System Access API per scrivere sul Kobo, disponibile in Chrome, Edge, Opera e Brave su computer.',
          },
          {
            q: 'Serve un account?',
            a: 'No. Nessuna registrazione, nessun login. KoBup non ha un server che possa conservare i tuoi dati.',
          },
          {
            q: 'È gratuito?',
            a: 'Sì, completamente. È un progetto personale open source con licenza MIT.',
          },
        ],
      },
      {
        title: 'Backup e ripristino',
        items: [
          {
            q: 'Cosa contiene un backup?',
            a: 'Il database del Kobo (avanzamento, evidenziazioni, note, segnalibri, raccolte) e, se vuoi, i file dei libri caricati, le impostazioni di lettura, i font personalizzati e i salvaschermi. I libri acquistati nello store Kobo non sono inclusi: puoi riscaricarli dal tuo account.',
          },
          {
            q: 'Posso trasferire la libreria su un nuovo Kobo?',
            a: 'Sì. Durante il ripristino scegli «Unisci i dati di lettura»: avanzamento, evidenziazioni e raccolte vengono aggiunti al nuovo Kobo, che mantiene il proprio account e le proprie impostazioni.',
          },
          {
            q: 'Il ripristino cancella i libri attuali?',
            a: 'No, a meno che tu non scelga esplicitamente di eliminare le cartelle dei libri esistenti. Prima di modificare il database, KoBup ne salva una copia sul Kobo, così puoi annullare il ripristino.',
          },
          {
            q: 'Come faccio a sapere che un backup è valido?',
            a: 'Subito dopo averlo scritto, KoBup rilegge l’archivio, controlla che ci siano tutti i file e confronta il checksum del database. Puoi verificarlo di nuovo in seguito dalla pagina Cronologia.',
          },
          {
            q: 'Quanto tempo richiede?',
            a: 'Un backup del solo database richiede pochi secondi. Un backup completo dipende dalle dimensioni della libreria e dalla velocità USB: qualche minuto per diversi gigabyte.',
          },
        ],
      },
      {
        title: 'Privacy e sicurezza',
        items: [
          {
            q: 'I miei dati vengono inviati a un server?',
            a: 'No. Tutto funziona nel browser con JavaScript e WebAssembly. La Content Security Policy del sito consente connessioni solo verso il sito stesso, quindi la pagina non può caricare la tua libreria altrove.',
          },
          {
            q: 'Perché dovrei cifrare un backup?',
            a: 'Il database del Kobo contiene anche i token di accesso al tuo account Kobo. Se conservi i backup nel cloud, una password (AES-256) garantisce che nessun altro possa usarli.',
          },
          {
            q: 'KoBup usa analytics o cookie?',
            a: 'Nessun cookie. Il sito usa Vercel Analytics senza cookie per contare le visite in forma anonima; non vede mai la tua libreria né i file di backup.',
          },
          {
            q: 'È affiliato con Rakuten Kobo?',
            a: 'No. KoBup è uno strumento indipendente della community, non approvato da Rakuten Kobo Inc.',
          },
        ],
      },
      {
        title: 'Domande tecniche',
        items: [
          {
            q: 'Funziona offline?',
            a: 'Sì. Dopo la prima visita l’app viene salvata nella cache e può essere installata, quindi continua a funzionare anche senza connessione.',
          },
          {
            q: 'Posso usarlo da telefono o tablet?',
            a: 'Non proprio: i browser mobili non possono accedere a un Kobo collegato via USB. Usa un computer fisso o portatile.',
          },
          {
            q: 'Perché mancano alcune copertine?',
            a: 'Le copertine sono le miniature generate dal Kobo. I libri mai visualizzati nella libreria del Kobo potrebbero non averne ancora una; in quel caso KoBup mostra una copertina segnaposto.',
          },
        ],
      },
    ],
    moreTitle: 'Hai altre domande?',
    moreBody: 'Leggi la guida passo passo o apri una segnalazione su GitHub.',
    moreGuide: 'Leggi la guida',
  },

  privacy: {
    title: 'Informativa privacy',
    updated: 'Ultimo aggiornamento: {date}',
    intro:
      'KoBup è uno strumento gratuito, non commerciale e open source, progettato perché la tua libreria Kobo non lasci mai il tuo computer. Questa pagina spiega esattamente cosa viene elaborato e dove.',
    sections: [
      {
        title: 'I dati del Kobo restano sul tuo computer',
        paragraphs: [
          'Quando crei o ripristini un backup, o apri la libreria, KoBup legge il database e i file del Kobo direttamente nel browser. Nulla viene caricato: non esiste un server di KoBup che riceva dati.',
          'Lo garantisce una Content Security Policy che consente alla pagina di connettersi solo al sito stesso.',
        ],
      },
      {
        title: 'Dati salvati nel browser',
        paragraphs: [
          'KoBup salva in locale pochi dati, che puoi eliminare in qualsiasi momento cancellando i dati del sito:',
        ],
        items: [
          'La cronologia dei backup (data, dimensione, numero di libri) nel local storage',
          'I riferimenti ai file di backup salvati in IndexedDB, per verificarli o ripristinarli in seguito (nessun contenuto dei file)',
          'Se hai chiuso l’avviso sugli analytics',
        ],
      },
      {
        title: 'Visite anonime (Vercel Analytics)',
        paragraphs: [
          'Il sito kobup.org usa Vercel Analytics per contare le visite. Non imposta cookie e non ti traccia tra siti diversi. Registra l’indirizzo della pagina, il referrer, il paese approssimativo, il tipo di browser e di dispositivo. Non riceve mai la tua libreria né i tuoi backup.',
          'Le copie di KoBup ospitate in autonomia possono funzionare senza alcun analytics.',
        ],
      },
      {
        title: 'Nessuna richiesta a terze parti',
        paragraphs: [
          'I font e tutte le altre risorse sono serviti da kobup.org. Il sito non carica nulla da Google o da altre terze parti.',
        ],
      },
      {
        title: 'Base giuridica e diritti (GDPR)',
        paragraphs: [
          'L’elaborazione locale è necessaria per fornire lo strumento che usi. Gli analytics aggregati e senza cookie si basano sul legittimo interesse (art. 6(1)(f) GDPR) e puoi bloccarli con qualsiasi content blocker.',
          'Poiché KoBup non conserva dati personali che ti riguardano, non c’è nulla da consultare, correggere o cancellare da parte nostra. Per domande puoi aprire una segnalazione su GitHub.',
        ],
      },
      {
        title: 'Modifiche',
        paragraphs: [
          'Se questa informativa cambia, la data in alto viene aggiornata. Lo storico completo è pubblico su GitHub.',
        ],
      },
    ],
  },
};

export default it;
