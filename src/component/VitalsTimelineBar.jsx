import React, { useContext, useMemo } from "react";
import WebVitalsContext from "../context/WebVitalsContext";
import styles from "./VitalsTimelineBar.module.css";

const VitalsTimelineBar = () => {
  const { webVitalsData } = useContext(WebVitalsContext);

  const ttfb = webVitalsData?.TTFB?.value || 0;
  const fcp = webVitalsData?.FCP?.value || 0;
  const lcp = webVitalsData?.LCP?.value || 0;

  // Normalize widths based on LCP
  const total = Math.max(lcp, fcp, ttfb);
  const pct = (val) => ((val / total) * 100).toFixed(2);

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineBar}>
        <div
          className={styles.ttfb}
          style={{ width: `${pct(ttfb)}%` }}
          title={`TTFB: ${ttfb.toFixed(0)}ms`}
        >
          <span>TTFB</span>
        </div>
        <div
          className={styles.fcp}
          style={{ width: `${pct(fcp - ttfb)}%` }}
          title={`FCP: ${fcp.toFixed(0)}ms`}
        >
          <span>FCP</span>
        </div>
        <div
          className={styles.lcp}
          style={{ width: `${pct(lcp - fcp)}%` }}
          title={`LCP: ${lcp.toFixed(0)}ms`}
        >
          <span>LCP</span>
        </div>
      </div>
      <div className={styles.timelineLabels}>
        <span>{ttfb.toFixed(0)} ms</span>
        <span>{fcp.toFixed(0)} ms</span>
        <span>{lcp.toFixed(0)} ms</span>
      </div>
    </div>
  );
};

export default VitalsTimelineBar;
