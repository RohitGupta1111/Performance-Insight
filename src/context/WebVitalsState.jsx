import { useState } from 'react'
import WebVitalsContext from './WebVitalsContext'
import { DEFAULT_VITALS_DATA } from '../enums'

const WebVitalsState = (props) => {
  const [webVitalsData, setWebVitalsData] = useState(DEFAULT_VITALS_DATA)
  const [historicalApiData, setHistoricalApiData] = useState([]);

  return (
    <WebVitalsContext.Provider value={{ webVitalsData, setWebVitalsData, historicalApiData, setHistoricalApiData }}>
      {props.children}
    </WebVitalsContext.Provider>
  )
}

export default WebVitalsState
