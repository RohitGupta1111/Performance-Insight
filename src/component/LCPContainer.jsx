import React, { useContext, useEffect, useState } from 'react'
import VitalMainIndicator from './VitalMainIndicator'
import WebVitalsContext from '../context/WebVitalsContext'
import styles from './LCPContainer.module.css'
import DebugInfoConatainer from './DebugInfoConatainer'
import { VitalHeadingContainer } from './VitalHeadingContainer'
import { DEBUG_INFO_KEYS, DESCRIPTION_TEXT } from '../constants'

const LCPContainer = () => {
  const { webVitalsData } = useContext(WebVitalsContext)
  const [lcpDebugInfo, setLCPDebugInfo] = useState({})
  const [elementType, setElementType] = useState('')

  useEffect(() => {
    if (webVitalsData['LCP'].value >= 0) {
      const lcpEntries = webVitalsData['LCP'].entries
      setLCPDebugInfo((debugInfo) => ({
        ...debugInfo,
        navigationType: webVitalsData['LCP'].navigationType,
      }))
      if (lcpEntries && lcpEntries.length >= 1) {
        Object.entries(lcpEntries[0]).map(([key, value]) => {
          if (DEBUG_INFO_KEYS.LCP.includes(key)) {
            setLCPDebugInfo((debugInfo) => ({ ...debugInfo, [key]: value }))
          }
        })
      }

      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window._getLCPEntryFromPerformanceObserver(),
        })
      })

      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        // console.log(message);
        if (message.type === 'LCP_ENTRY') {
          setElementType(message.data.elementType)
        }
      })
    }
  }, [webVitalsData])

  const highlightLCPElement = () => {
    window.close()
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window._highlightElementByType('LCP'),
      })
    })
  }

  return (
    <div className={styles.lcpContainer}>
      <VitalHeadingContainer
        vitalType="LCP"
        value={webVitalsData['LCP'].value}
        description={DESCRIPTION_TEXT.LCP}
      />
      <VitalMainIndicator
        good={2.5}
        poor={4}
        unit="s"
        value={webVitalsData['LCP'].value}
        variant="LCP"
      />
      {webVitalsData['LCP'].value >= 0 ? (
        <>
          <p className={styles.sectionTopic}>Element Info:</p>
          <p className={styles.sectionDescription}>
            Click on the element to highlight the Largest Contentful Paint
            element in page.
          </p>
          <div
            className={styles.elementTypeContainer}
            onClick={highlightLCPElement}
          >
            <div>Element Type</div>
            <div className="bold-text">{`${elementType} element`}</div>
          </div>
          <DebugInfoConatainer debugInfo={lcpDebugInfo} variant="LCP" />
        </>
      ) : null}
    </div>
  )
}

export default LCPContainer
