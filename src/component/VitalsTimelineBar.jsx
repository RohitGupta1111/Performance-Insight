import React, { useContext } from 'react'
import styles from './VitalsTimelineBar.module.css'
import WebVitalsContext from '../context/WebVitalsContext'
import { formatVitalValue } from '../utils'

function VitalsTimelineBar() {
  const { webVitalsData } = useContext(WebVitalsContext)

  // Example metric times (in ms)
  const metrics = {
    navigationStart: 0,
    ttfb: webVitalsData.TTFB.value,
    fcp: webVitalsData.FCP.value,
    lcp: webVitalsData.LCP.value,
  }

  const total = metrics.lcp + 500
  const scale = (value) => `${(value / total) * 100}%`

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Page Load Timeline</h2>

      <div className={styles.timeline}>
        {/* Base line */}
        <div className={styles.track}></div>

        {/* Segments */}
        <div
          className={`${styles.segment} ${styles.blue}`}
          style={{
            left: scale(metrics.ttfb),
            width: `calc(${scale(metrics.fcp - metrics.ttfb)})`,
          }}
        />
        <div
          className={`${styles.segment} ${styles.yellow}`}
          style={{
            left: scale(metrics.fcp),
            width: `calc(${scale(metrics.lcp - metrics.fcp)})`,
          }}
        />
        <div
          className={`${styles.segment} ${styles.green}`}
          style={{
            left: scale(metrics.lcp),
            width: `calc(${scale(total - metrics.lcp)})`,
          }}
        />

        {/* Markers */}
        <div
          className={`${styles.marker} ${styles.blue}`}
          style={{ left: scale(metrics.ttfb) }}
        >
          <span className={styles.label}>TTFB</span>
        </div>
        <div
          className={`${styles.marker} ${styles.yellow}`}
          style={{ left: scale(metrics.fcp) }}
        >
          <span className={styles.downLabel}>FCP</span>
        </div>
        <div
          className={`${styles.marker} ${styles.green}`}
          style={{ left: scale(metrics.lcp) }}
        >
          <span className={styles.label}>LCP</span>
        </div>
      </div>
      {/* 
      <div className={styles.footer}>
        <span className="bold-text">0</span>
        <span className="bold-text">{formatVitalValue(total)}</span>
      </div> */}

      <div className={styles.legend}>
        <div>
          <span className={`${styles.dot} ${styles.blue}`}></span>
          {`TTFB (${formatVitalValue(metrics.ttfb)})`}
        </div>
        <div>
          <span className={`${styles.dot} ${styles.yellow}`}></span>
          {`FCP (${formatVitalValue(metrics.fcp)})`}
        </div>
        <div>
          <span className={`${styles.dot} ${styles.green}`}></span>
          {`LCP (${formatVitalValue(metrics.lcp)})`}
        </div>
      </div>
    </div>
  )
}

export default VitalsTimelineBar
