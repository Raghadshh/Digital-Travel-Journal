import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
//import PhotoGallery from './components/PhotoGallery'
import './App.css'

function App() {
  // Track which view is currently active
  const [view, setView] = useState('home')

  return (
    <>
      {/* Navbar */}
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

      {/* Main Page */}
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
              {/* <JournalEntriesList /> Placeholder for your entries component */}
            </div>
          </section>
        )}

        {view === 'map' && (
          <section id="center">
            <div>
              <h1>Map Tracker</h1>
              {/* <TravelMap /> Placeholder for your map tracking component */}
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

      <div className="ticks"></div>

      {/* Footer System */}
      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App