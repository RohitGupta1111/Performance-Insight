import React, { useState } from 'react';
import P75distributionChart from './P75distributionChart';
import HistogramTimeseriesChart from './HistogramTimeseriesChart';
import styles from './CruxvisComponent.module.css';

import { HISTORY_API_METRICS, METRIC_LABELS } from "../constants";

const CruxvisComponent = () => {
  const [mode, setMode] = useState("p75"); // global mode: "p75" | "histogram"

  return (
    <>
      {/* --- GLOBAL TABS --- */}
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

      {/* --- GRID OF CHARTS --- */}
      <div className={styles.gridContainer}>
        {HISTORY_API_METRICS.map(metric => (
          <div key={metric} className={styles.chartCard}>
            <h4 className={styles.title}>{METRIC_LABELS[metric]}</h4>

            {mode === "p75" ? (
              <P75distributionChart metric={metric} />
            ) : (
              <HistogramTimeseriesChart metric={metric} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default CruxvisComponent;
