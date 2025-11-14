import React, { useContext, useState } from 'react';
import P75distributionChart from './P75distributionChart';
import HistogramTimeseriesChart from './HistogramTimeseriesChart';
import styles from './CruxvisComponent.module.css';

import { HISTORY_API_METRICS, METRIC_LABELS } from "../constants";
import WebVitalsContext from '../context/WebVitalsContext';

const CruxvisComponent = () => {
  const [mode, setMode] = useState("p75");        
  const [device, setDevice] = useState("DESKTOP");
  const { desktopHistoricalApiData, phoneHistoricalApiData } = useContext(WebVitalsContext);

  return (
    <>
      {/* --- HEADING --- */}
      <h2 className={styles.heading}>
        CrUX Historical Web Vitals Data
      </h2>

      {/* --- BOTH GLOBAL TOGGLES IN SAME ROW --- */}
      <div className={styles.rowToggleContainer}>

        {/* Device toggle */}
        <div className={styles.tabsContainer}>
          <div
            className={`${styles.tab} ${device === "DESKTOP" ? styles.activeTab : ""}`}
            onClick={() => setDevice("DESKTOP")}
          >
            Desktop
          </div>

          <div
            className={`${styles.tab} ${device === "MOBILE" ? styles.activeTab : ""}`}
            onClick={() => setDevice("MOBILE")}
          >
            Mobile
          </div>
        </div>

        {/* Mode toggle */}
        <div className={styles.tabsContainer}>
          <div
            className={`${styles.tab} ${mode === "p75" ? styles.activeTab : ""}`}
            onClick={() => setMode("p75")}
          >
            P75
          </div>

          <div
            className={`${styles.tab} ${mode === "histogram" ? styles.activeTab : ""}`}
            onClick={() => setMode("histogram")}
          >
            Histogram
          </div>
        </div>

      </div>

      {/* --- CHART GRID --- */}
      <div className={styles.gridContainer}>
        {HISTORY_API_METRICS.map(metric => (
          <div key={metric} className={styles.chartCard}>
            <h4 className={styles.title}>{METRIC_LABELS[metric]}</h4>

            {mode === "p75" ? (
              <P75distributionChart metric={metric} historicalApiData={device === "DESKTOP" ? desktopHistoricalApiData : phoneHistoricalApiData} />
            ) : (
              <HistogramTimeseriesChart metric={metric} historicalApiData={device === "DESKTOP" ? desktopHistoricalApiData : phoneHistoricalApiData} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default CruxvisComponent;
