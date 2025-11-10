import { useContext, useEffect, useRef, useState } from 'react'
import styles from './DashboardComponent.module.css'
import LinearIndicator from './LinearIndicator'
import webVitalsContext from '../context/WebVitalsContext'

function DashboardComponent({ handleVitalClick }) {
  const { webVitalsData } = useContext(webVitalsContext)

  return (
    <div className={styles.dashboardComponentContainer}>
      <ul>
        {Object.keys(webVitalsData).length > 0 &&
          Object.keys(webVitalsData).map((vitalDataKey) => {
            return (
              <li
                key={vitalDataKey}
                onClick={() => handleVitalClick(vitalDataKey)}
              >
                <LinearIndicator
                  value={webVitalsData[vitalDataKey].value}
                  variant={vitalDataKey}
                />
              </li>
            )
          })}
      </ul>
    </div>
  )
}

export default DashboardComponent
