import React, { useState } from "react";
import styles from "./AuditControls.module.css";

// const NETWORK_PRESETS = {
//   "No Throttle (Baseline)": { latency: 0, download: 0, upload: 0, cpu: 1 },
//   "Fast 4G": { latency: 20, download: 4000, upload: 3000, cpu: 1.5 },
//   "Regular 4G": { latency: 40, download: 1700, upload: 1200, cpu: 2 },
//   "Slow 3G": { latency: 400, download: 400, upload: 400, cpu: 4 },
//   "Very Slow": { latency: 1000, download: 200, upload: 150, cpu: 6 },
//   Custom: { latency: "", download: "", upload: "", cpu: "" },
// };

const AuditControls = () => {

  // const [selectedPreset, setSelectedPreset] = useState("No Throttle (Baseline)");
  // const [customValues, setCustomValues] = useState({
  //   latency: 150,
  //   download: 1000,
  //   upload: 750,
  //   cpu: 3,
  // });
  // const [loading, setLoading] = useState(false);

  // const preset =
  //   selectedPreset === "Custom"
  //     ? customValues
  //     : NETWORK_PRESETS[selectedPreset];

  // const handleCustomChange = (field, value) => {
  //   setCustomValues((prev) => ({
  //     ...prev,
  //     [field]: value ? parseFloat(value) : "",
  //   }));
  // };

  // const applyThrottling = async () => {
  //   setLoading(true);
  //   try {
  //     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  //     const tabId = tab.id;

  //     await chrome.debugger.attach({ tabId }, "1.3");
  //     await chrome.debugger.sendCommand({ tabId }, "Network.enable");

  //     await chrome.debugger.sendCommand(
  //       { tabId },
  //       "Network.emulateNetworkConditions",
  //       {
  //         offline: false,
  //         latency: preset.latency,
  //         downloadThroughput: preset.download * 1024, // KB/s → B/s
  //         uploadThroughput: preset.upload * 1024,
  //         connectionType:
  //           preset.latency > 200 ? "cellular3g" : "cellular4g",
  //       }
  //     );

  //     await chrome.debugger.sendCommand(
  //       { tabId },
  //       "Emulation.setCPUThrottlingRate",
  //       { rate: preset.cpu }
  //     );

  //     await chrome.debugger.sendCommand({ tabId }, "Page.reload");
  //   } catch (err) {
  //     console.error("Failed to apply throttling:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className={styles.container}>
      {/* <div className={styles.header}>
        <span className="material-symbols-outlined">speed</span>
        <span>Performance Throttling</span>
      </div>

      <p className={styles.description}>
        Simulate various network and CPU conditions to test how your page performs under real-world scenarios.
      </p>

      <div className={styles.selectRow}>
        <label htmlFor="preset">Preset:</label>
        <select
          id="preset"
          className={styles.dropdown}
          value={selectedPreset}
          onChange={(e) => setSelectedPreset(e.target.value)}
        >
          {Object.keys(NETWORK_PRESETS).map((key) => (
            <option key={key}>{key}</option>
          ))}
        </select>
      </div>

      <div className={styles.summaryBox}>
        <div><strong>Latency:</strong> {preset.latency || 0} ms</div>
        <div><strong>Download:</strong> {preset.download || 0} KB/s</div>
        <div><strong>Upload:</strong> {preset.upload || 0} KB/s</div>
        <div><strong>CPU Throttle:</strong> ×{preset.cpu || 1}</div>
      </div>

      {selectedPreset === "Custom" && (
        <div className={styles.customBox}>
          <p className={styles.customHeading}>Custom Throttle Settings</p>
          <div className={styles.customGrid}>
            <label>
              Latency (ms)
              <input
                type="number"
                value={customValues.latency}
                onChange={(e) => handleCustomChange("latency", e.target.value)}
              />
            </label>
            <label>
              Download (KB/s)
              <input
                type="number"
                value={customValues.download}
                onChange={(e) => handleCustomChange("download", e.target.value)}
              />
            </label>
            <label>
              Upload (KB/s)
              <input
                type="number"
                value={customValues.upload}
                onChange={(e) => handleCustomChange("upload", e.target.value)}
              />
            </label>
            <label>
              CPU Throttle (×)
              <input
                type="number"
                value={customValues.cpu}
                step="0.5"
                onChange={(e) => handleCustomChange("cpu", e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      <button
        className={styles.applyButton}
        onClick={applyThrottling}
        disabled={loading}
      >
        {loading ? "Applying..." : "Apply & Reload"}
      </button> */}
  <div className={styles.analysisSection}>
  <div className={styles.analysisHeader}>
    <span className="material-symbols-outlined">analytics</span>
    <span>Analysis Tools</span>
  </div>

  <div className={styles.toolGrid}>
    {/* PageSpeed Insights */}
    <div
      className={styles.toolCard}
      onClick={async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = encodeURIComponent(tab.url);
        chrome.tabs.create({ url: `https://pagespeed.web.dev/report?url=${url}` });
      }}
    >
      <div className={styles.toolLeft}>
        <span className="material-symbols-outlined">insights</span>
        <div>
          <div className={styles.toolName}>PageSpeed Insights</div>
          <div className={styles.toolDesc}>View Core Web Vitals & lab data</div>
        </div>
      </div>
      <span className={`material-symbols-outlined ${styles.openIcon}`}>open_in_new</span>
    </div>

    {/* Treo Site Speed */}
    <div
      className={styles.toolCard}
      onClick={async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = encodeURIComponent(tab.url);
        const hostName = new URL(tab.url).hostname;
        chrome.tabs.create({ url: `https://treo.sh/sitespeed/${hostName}` });
      }}
    >
      <div className={styles.toolLeft}>
        <span className="material-symbols-outlined">speed</span>
        <div>
          <div className={styles.toolName}>Treo Site Speed</div>
          <div className={styles.toolDesc}>Analyze performance benchmarks</div>
        </div>
      </div>
      <span className={`material-symbols-outlined ${styles.openIcon}`}>open_in_new</span>
    </div>

    {/* CrUXVis */}
    <div
      className={styles.toolCard}
      onClick={async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = encodeURIComponent(tab.url);
        chrome.tabs.create({ url: `https://cruxvis.withgoogle.com/#/?view=cwvsummary&identifier=origin&device=DESKTOP&url=${url}&periodStart=0&periodEnd=-1&display=p75s` });
      }}
    >
      <div className={styles.toolLeft}>
        <span className="material-symbols-outlined">timeline</span>
        <div>
          <div className={styles.toolName}>CrUXVis Historical Data</div>
          <div className={styles.toolDesc}>Explore field data over time</div>
        </div>
      </div>
      <span className={`material-symbols-outlined ${styles.openIcon}`}>open_in_new</span>
    </div>
  </div>
</div>



    </div>
  );
};

export default AuditControls;
