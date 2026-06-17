import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import PhotoGallery from './components/PhotoGallery'
import './App.css'

function App() {
  // Track which view is currently active
  const [view, setView] = useState('home')

  return (
    <>
      <div className="app-layout-container">
        {/* Sidebar Navbar */}
        <nav className="journalNav">
          <span className="navBrand" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
            Digital Travel Journal
          </span>
          <div className="navTabs">
            <button 
              className={`navBtn ${view === 'home' ? 'active' : ''}`}
              onClick={() => setView('home')}
            >
              Dashboard
            </button>
            <button 
              className={`navBtn ${view === 'entries' ? 'active' : ''}`}
              onClick={() => setView('entries')}
            >
              Entries
            </button>
            <button 
              className={`navBtn ${view === 'map' ? 'active' : ''}`}
              onClick={() => setView('map')}
            >
              Map Tracker
            </button>
            <button 
              className={`navBtn ${view === 'gallery' ? 'active' : ''}`}
              onClick={() => setView('gallery')}
            >
              Gallery
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content-wrapper">
          {view === 'home' && (
            <section id="center">
              <div>
                <h1>Digital Travel Journal</h1>
              </div>
            </section>
          )}

          {view === 'entries' && (
            <section id="center">
              <div>
                <h1>Journal Entries</h1>
              </div>
            </section>
          )}

          {view === 'map' && (
            <section id="center">
              <div>
                <h1>Map Tracker</h1>
              </div>
            </section>
          )}

          {view === 'gallery' && (
            <section id="center">
              <div>
                <h1>Journal Gallery</h1>
              </div>
              <PhotoGallery />
            </section>
          )}
        </main>
      </div>
    </>
  )
}

export default App