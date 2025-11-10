import React, { useContext, useEffect, useState } from 'react'
import VitalMainIndicator from './VitalMainIndicator'
import WebVitalsContext from '../context/WebVitalsContext'
import styles from "./INPContainer.module.css";
import DebugInfoConatainer from './DebugInfoConatainer';
import { VitalHeadingContainer } from './VitalHeadingContainer';
import { DEBUG_INFO_KEYS, DESCRIPTION_TEXT } from '../constants';

const INPContainer = () => {
  const {webVitalsData} = useContext(WebVitalsContext);
  const [inpDebugInfo,setINPDebugInfo] = useState({});
  const [elementType,setElementType] = useState("");

  useEffect(() => {
    const inpEntries = webVitalsData["INP"].entries;
    setINPDebugInfo((debugInfo) => ({...debugInfo,navigationType: webVitalsData["INP"].navigationType}));
    if(inpEntries && inpEntries.length >= 1) {
      Object.entries(inpEntries[inpEntries.length-1]).map(([key,value]) => {
        if(DEBUG_INFO_KEYS.INP.includes(key)) {
          setINPDebugInfo((debugInfo) => ({...debugInfo, [key]:value}));
        }
      })
    }

    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: (entry) => window._getINPEntryFromPerformanceObserver(entry),
        args: [inpEntries[inpEntries.length - 1]],
      })
    })
  
    chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
      // console.log(message);
      if(message.type === "INP_ENTRY") {
          setElementType(message.data.elementType);
      }
    })
   
  },[webVitalsData]);

  const highlightINPElement = () => {
    window.close();
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => window._highlightElementByType("INP"),
      })
    })
  }


  return (
    <div className={styles.inpContainer}>
      <VitalHeadingContainer vitalType="INP" value={webVitalsData["INP"].value} description={DESCRIPTION_TEXT.INP} />
        <VitalMainIndicator good={200} poor={500} unit="ms" value={webVitalsData["INP"].value} variant="INP"/>
        {
          webVitalsData["INP"].value >= 0 ? 
          <>
          <p className={styles.sectionTopic}>Element Info:</p>
          <p className={styles.sectionDescription}>Click this section to highlight the element in page where the longest INP occurred.</p>
          <div className={styles.elementTypeContainer} onClick={highlightINPElement}>
            <div>Element Type</div>
            <div className='bold-text'>{`${elementType} element`}</div>
          </div>
          <DebugInfoConatainer debugInfo={inpDebugInfo} variant="INP"/>
          </> : null 
        }

    </div>
  )
}

export default INPContainer