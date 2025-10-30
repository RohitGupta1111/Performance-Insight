import { useContext, useEffect, useState } from 'react'
import './App.css'
import LinearIndicator from './LinearIndicator'
import { DEFAULT_VITALS_DATA, NAV_OPTIONS } from '../enums';
import DashboardComponent from './DashboardComponent';
import LCPContainer from './LCPContainer';
import INPContainer from './INPContainer';
import CLSComponent from  './CLSComponent';
import WebVitalsContext from '../context/WebVitalsContext';
import TTFBComponent from './TTFBComponent';
import FCPComponent from './FCPComponent';
import ThrottlingControls from './ThrottlingControls';

function App() {
  const [selectedNavOption, setsSelectedNavOption] = useState(NAV_OPTIONS.MAIN);
  const {setWebVitalsData} = useContext(WebVitalsContext);

  useEffect(() => {
    chrome.storage.local.get(null, data => {
      setWebVitalsData((webVitalsData) => ({...webVitalsData, ...data}));
    })
  },[]);

  const renderMainContent = () => {
    switch(selectedNavOption) {
      case NAV_OPTIONS.MAIN:
        return <DashboardComponent handleVitalClick={setsSelectedNavOption} />
      case NAV_OPTIONS.LCP:
        return <LCPContainer />
      case NAV_OPTIONS.INP:
        return <INPContainer />
      case NAV_OPTIONS.CLS:
        return <CLSComponent />
      case NAV_OPTIONS.TTFB:
        return <TTFBComponent />
      case NAV_OPTIONS.FCP:
        return <FCPComponent />
      case NAV_OPTIONS.THROTTLE:
        return <ThrottlingControls />
      default:
        return <DashboardComponent/>
    }
  }

  return (
    <div className='app-container'>
      <nav  className='nav-bar'>
        <ul className=''>
          <li className={ selectedNavOption === NAV_OPTIONS.MAIN ? 'active': ''} onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.MAIN)}>
              <span className="material-symbols-outlined">dashboard</span>
              <span className='nav-text'>{NAV_OPTIONS.MAIN}</span>
          </li>
          <li className={ selectedNavOption === NAV_OPTIONS.LCP ? 'active': ''} onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.LCP)}>
              <span className="material-symbols-outlined">image</span>
              <span className='nav-text'>{NAV_OPTIONS.LCP}</span>
          </li>
          <li className={ selectedNavOption === NAV_OPTIONS.INP ? 'active': ''} onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.INP)}>
              <span className="material-symbols-outlined">touch_app</span>
              <span className='nav-text'>{NAV_OPTIONS.INP}</span>
          </li>
          <li className={ selectedNavOption === NAV_OPTIONS.CLS ? 'active': ''} onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.CLS)}>
              <span className="material-symbols-outlined">flip</span>
              <span className='nav-text'>{NAV_OPTIONS.CLS}</span>
          </li>
          <li className={ selectedNavOption === NAV_OPTIONS.TTFB ? 'active': ''} onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.TTFB)}>
              <span className="material-symbols-outlined">timer</span>
              <span className='nav-text'>{NAV_OPTIONS.TTFB}</span>
          </li>
          <li className={ selectedNavOption === NAV_OPTIONS.FCP ? 'active': ''} onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.FCP)}>
              <span className="material-symbols-outlined">format_paint</span>
              <span className='nav-text'>{NAV_OPTIONS.FCP}</span>
          </li>
          <li className={ selectedNavOption === NAV_OPTIONS.THROTTLE ? 'active': ''} onClick={(e) => setsSelectedNavOption(NAV_OPTIONS.THROTTLE)}>
              <span className="material-symbols-outlined">format_paint</span>
              <span className='nav-text'>{NAV_OPTIONS.THROTTLE}</span>
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
