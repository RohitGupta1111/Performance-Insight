import { useState } from 'react'
import WebVitalsContext from './WebVitalsContext'
import { DEFAULT_VITALS_DATA } from '../enums'

const WebVitalsState = (props) => {
  const [webVitalsData, setWebVitalsData] = useState(DEFAULT_VITALS_DATA)
  const [desktopHistoricalApiData, setDesktopHistoricalApiData] = useState([]);
  const [phoneHistoricalApiData, setPhoneHistoricalApiData] = useState([]);

  return (
    <WebVitalsContext.Provider value={{ webVitalsData, setWebVitalsData, desktopHistoricalApiData, setDesktopHistoricalApiData, phoneHistoricalApiData,setPhoneHistoricalApiData  }}>
      {props.children}
    </WebVitalsContext.Provider>
  )
}

export default WebVitalsState
