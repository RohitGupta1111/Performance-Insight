import React, { useState } from 'react'
import styles from "./DebugInfoContainer.module.css";
import TooltipText from './TooltipText';
import { debugFieldTooltips } from '../constants';

const DebugInfoConatainer = ({debugInfo, variant}) => {
//     const [demoDebugInfo, setDemoDebugInfo] = useState({
//   name: "LCP",                    // Metric name
//   id: "v3-1699029123456-1234567890123", // Unique metric ID
//   navigationType: "navigate",     // How user got to the page
//   entryType: "largest-contentful-paint", // Type of performance entry
//   startTime: 2450.32,             // Start time of metric in ms
//   renderTime: 2400.12,            // Render time in ms
//   loadTime: 2450.32,              // Load time in ms
//   size: 320000,                    // Size of element in bytes
//   url: "https://example.com/images/hero.jpg", // URL of the element
//   elementSelector: "img.hero-banner",        // Selector for element
// })
  return (
    <>
        <p className={styles.sectionTopic}>Debug Info:</p>
        <p className={styles.sectionDescription}>Hover over a debug key to see detailed info.</p>
        <ul className={styles.debugInfoContainer}>
            {
                debugInfo && Object.entries(debugInfo).map(([key,value],index) => {
                    return (
                        value !==null && (typeof value !== "string" || value.trim().length !== 0) ? <li className={styles.debugInfoKeyValue} key={index}>
                            <TooltipText tooltipText={debugFieldTooltips[variant][key]}>{key}:</TooltipText>
                            <div className='bold-text'>{value}</div>
                        </li>:null
                    )
                })
            }
        </ul>  
    </>
  )
}

export default DebugInfoConatainer