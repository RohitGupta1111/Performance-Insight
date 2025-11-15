import React, { useContext, useEffect, useState } from "react";
import styles from "./SuggestionPanel.module.css";
import { generateSuggestions } from "../suggestion/SuggestionEngine";
import WebVitalsContext from "../context/WebVitalsContext";

export default function SuggestionsPanel() {
  const { webVitalsData } = useContext(WebVitalsContext);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let listener = null;

    async function init() {
      setLoading(true);
      setError(null);

      // set up diagnostics listener
      listener = (msg) => {
        if (msg.type !== "diagnostics_data") return;
        if (!mounted) return;

        const diagnostics = msg.data;
        const generated = generateSuggestions({
          vitals: webVitalsData,
          diagnostics,
        });

        setSuggestions(generated);
        setLoading(false);
      };

      chrome.runtime.onMessage.addListener(listener);

      // trigger diagnostics in page context
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTabId = tabs?.[0]?.id;
        if (typeof activeTabId === "number") {
          await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            func: () => {
              if (window._getDiagnostics) window._getDiagnostics();
            },
          });
        } else {
          // fallback: still allow listener to wait for messages from other contexts
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        setError("Unable to run diagnostics on this page.");
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      if (listener) {
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
  }, [webVitalsData]);

  // highlight now queries the active tab every time (avoids stale activeTabId)
  const highlight = (selector) => {
    if (!selector) return;
    chrome.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const activeTabId = tabs?.[0]?.id;
        if (typeof activeTabId !== "number") return;
        chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          func: (sel) => {
            if (window._highlightElementBySelector) {
              window._highlightElementBySelector(sel);
            } else {
              // fallback: basic highlight
              const el = document.querySelector(sel);
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const overlay = document.createElement("div");
              overlay.style.position = "absolute";
              overlay.style.top = rect.top + window.scrollY + "px";
              overlay.style.left = rect.left + window.scrollX + "px";
              overlay.style.width = rect.width + "px";
              overlay.style.height = rect.height + "px";
              overlay.style.border = "3px solid red";
              overlay.style.background = "rgba(255,0,0,0.12)";
              overlay.style.zIndex = 2147483647;
              overlay.id = "suggestion-highlight-overlay";
              document.body.appendChild(overlay);
              setTimeout(() => {
                const o = document.getElementById("suggestion-highlight-overlay");
                if (o) o.remove();
              }, 2000);
            }
          },
          args: [selector],
        });
      })
      .catch(() => {
        // ignore failures silently
      });
  };

  if (loading) return <div className={styles.loading}>Analyzing page…</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  if (!suggestions.length) {
    return <div className={styles.empty}>No issues detected. Your page looks great! 🎉</div>;
  }

  return (
    <div className={styles.panelOuter}>
      {/* panelInner enforces the fixed content width (matches LCP containers) */}
      <div className={styles.panelInner}>
        {suggestions.map((s) => (
          <div key={s.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>{s.title}</div>
              <span className={`${styles.severity} ${styles[s.severity]}`}>
                {s.severity.toUpperCase()}
              </span>
            </div>

            {s.description && <p className={styles.description}>{s.description}</p>}

            {s.actionableSteps?.length > 0 && (
              <ul className={styles.steps}>
                {s.actionableSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}

            {s.highlights?.selector && (
              <button
                onClick={() => highlight(s.highlights.selector)}
                className={styles.highlightBtn}
              >
                Highlight Element
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
