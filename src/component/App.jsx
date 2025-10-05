import { useEffect, useState } from 'react'
import './App.css'
import LinearIndicator from './LinearIndicator'
import { DEFAULT_VITALS_DATA, NAV_OPTIONS } from '../enums';
import DashboardComponent from './DashboardComponent';

function App() {
  const [selectedNavOption, setsSelectedNavOption] = useState(NAV_OPTIONS.MAIN);
  const [webVitalsData,setWebVitalsData] = useState(DEFAULT_VITALS_DATA);

  useEffect(() => {
    chrome.storage.local.get(null, data => {
      setWebVitalsData((webVitalsData) => ({...webVitalsData, ...data}));
    })
  },[]);

  const renderMainContent = () => {
    switch(selectedNavOption) {
      case NAV_OPTIONS.MAIN:
        return <DashboardComponent webVitalsData={webVitalsData}/>
      default:
        return <DashboardComponent webVitalsData={webVitalsData}/>
    }
  }

  return (
    <div className='app-container'>
      <nav  className='nav-bar'>
        <ul>
          <li onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.MAIN)}>
              <span class="material-symbols-outlined">dashboard</span>
              <span className='nav-text'>{NAV_OPTIONS.MAIN}</span>
          </li>
          <li onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.LCP)}>
              <span className="material-symbols-outlined">image</span>
              <span className='nav-text'>{NAV_OPTIONS.LCP}</span>
          </li>
          <li onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.INP)}>
              <span className="material-symbols-outlined">touch_app</span>
              <span className='nav-text'>{NAV_OPTIONS.INP}</span>
          </li>
          <li onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.CLS)}>
              <span className="material-symbols-outlined">flip</span>
              <span className='nav-text'>{NAV_OPTIONS.CLS}</span>
          </li>
          <li onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.TTFB)}>
              <span className="material-symbols-outlined">timer</span>
              <span className='nav-text'>{NAV_OPTIONS.TTFB}</span>
          </li>
          <li onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.FCP)}>
              <span className="material-symbols-outlined">format_paint</span>
              <span className='nav-text'>{NAV_OPTIONS.FCP}</span>
          </li>
        </ul>
      </nav>
      <main className='main-container'>
        {renderMainContent()}
      </main>
      
    </div>
  )
}

export default App
