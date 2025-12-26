import { useState, useEffect } from 'react'
import { useFeatureDetection } from './hooks/useFeatureDetection.js'
import { useKoboStore } from './stores/koboStore.js'

// Layout
import { Header } from './components/layout/Header.jsx'
import { Footer } from './components/layout/Footer.jsx'

// Browser compatibility
import { UnsupportedBrowser } from './components/UnsupportedBrowser.jsx'
import { BrowserWarning } from './components/BrowserWarning.jsx'

// Pages
import { Home } from './pages/Home.jsx'
import { Backup } from './pages/Backup.jsx'
import { Restore } from './pages/Restore.jsx'
import { History } from './pages/History.jsx'

function App() {
  const features = useFeatureDetection()
  const currentPage = useKoboStore((state) => state.currentPage)
  const setCurrentPage = useKoboStore((state) => state.setCurrentPage)

  // Browser compatibility check
  if (features.loading) {
    return (
      <div className="min-h-screen bg-kobo-cream flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4" />
          <p className="text-kobo-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error page for completely unsupported browsers
  if (!features.isSupported) {
    const missingFeatures = []
    if (!features.fileReader) missingFeatures.push('FileReader API')
    if (!features.webAssembly) missingFeatures.push('WebAssembly')
    if (!features.blob) missingFeatures.push('Blob API')

    return <UnsupportedBrowser missingFeatures={missingFeatures} />
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />
      case 'backup':
        return <Backup onComplete={() => handleNavigate('home')} />
      case 'restore':
        return <Restore onComplete={() => handleNavigate('home')} />
      case 'history':
        return <History onNavigate={handleNavigate} />
      default:
        return <Home onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-kobo-cream flex flex-col">
      {/* Browser compatibility warning */}
      <BrowserWarning features={features} />

      {/* Header */}
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main content */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
