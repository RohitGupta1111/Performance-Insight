import React, { useContext, useEffect, useState } from 'react'
import VitalMainIndicator from './VitalMainIndicator'
import WebVitalsContext from '../context/WebVitalsContext'
import styles from "./CLSComponent.module.css";
import DebugInfoConatainer from './DebugInfoConatainer';
import { VitalHeadingContainer } from './VitalHeadingContainer';
import { DEBUG_INFO_KEYS, DESCRIPTION_TEXT } from '../constants';

const CLSComponent = () => {
  const {webVitalsData} = useContext(WebVitalsContext);
  const [clsTopEntriesData, setCLSTopEntriesData] = useState([]);

  useEffect(() => {
    const clsEntries = webVitalsData["CLS"].entries;
    if(clsEntries && clsEntries.length >= 1) {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                func: (clsEntries) => window._getTop5SourceRects(clsEntries),
                args: [clsEntries]
            })
        })
    }
  
    chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
      // console.log(message);
      if(message.type === "top-layout-shift-data") {
          setCLSTopEntriesData(message.data);
      }
    })
  },[webVitalsData]);

  const highlightCLSRect = (previousRect, newRect) => {
    window.close();
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: (previousRect, newRect) => window._highlightCLSShiftRects(previousRect,newRect),
        args: [previousRect, newRect]
      })
    })
  }


  return (
    <div className={styles.inpContainer}>
        <VitalHeadingContainer vitalType="CLS" value={webVitalsData["CLS"].value} description={DESCRIPTION_TEXT.CLS} />
        <VitalMainIndicator good={0.1} poor={0.25} value={webVitalsData["CLS"].value} variant="CLS"/>
        {
          webVitalsData["CLS"].value >=0 ?
        <>
          <p className={styles.sectionTopic}>Top CLS Entries</p>
          <p className={styles.sectionDescription}>Click on the entry to visualize the layout shift in page.</p>
          <div className={styles.clsTopicContainer}>
              <div className={`${styles.clsNodeSelectorText} bold-text`}>Node Selector</div>
              <div className={`${styles.clsStartTimeText} bold-text`}>Start Time</div>
              <div className={`${styles.clsValueText} bold-text`}>Value</div>
            </div>
          <div className={styles.clsTopContainer}>
              {

                  clsTopEntriesData.map((entry) => {
                      return (
                          <div className={styles.clsRowContainer} onClick={() => highlightCLSRect(entry.oldRect, entry.newRect)}>
                              <div className={styles.clsNodeSelectorText}>{entry.nodeSelector}</div>
                              <div className={styles.clsStartTimeText}>{entry.startTime.toFixed(3)}</div>
                              <div className={styles.clsValueText}>{entry.value.toFixed(3)}</div>
                          </div>
                      )
                  })
              }
          </div>
        </>: null }
    </div>
  )
}

export default CLSComponent