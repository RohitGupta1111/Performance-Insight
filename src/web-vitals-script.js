import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";

let lcpElement = null;
let inpEntry = null;
let lastCLSValue = 0;              // Track last CLS score
let lastEntriesLength = 0; 
let inpEventEntries = [];
let layoutShiftEntries = [];
const inpPO = new PerformanceObserver((list) => {
    const filteredList = list.getEntries().filter((entry) => 
        entry.name === "keydown" ||
        entry.name === "keyup" ||
        entry.name === "click" ||
        entry.name === "mousedown" ||
        entry.name === "mouseup" ||
        entry.name === "pointerdown" ||
        entry.name === "pointerup" ||
        entry.name === "touchstart" ||
        entry.name === "touchend"
    )
    inpEventEntries.push(...filteredList);
    console.log(...filteredList);
});
inpPO.observe({ type: 'event', buffered: true, durationThreshold: 16});
inpPO.observe({type: 'first-input', buffered: true,});


const clsPO = new PerformanceObserver((list) => {
    const filteredList = list.getEntries().filter((entry) => !entry.hadRecentInput)
    layoutShiftEntries.push(...filteredList);
    console.log(...filteredList);
});
clsPO.observe({ type: 'layout-shift', buffered: true});

function getElementPathString(element) {
  if (!element || element.nodeType !== 1) return "";

  const parts = [];
  let current = element;

  while (current && current.nodeType === 1 && parts.length < 2) { // limit depth
    const tag = current.tagName.toLowerCase();
    const id = current.id ? `#${current.id}` : "";
    const classList = Array.from(current.classList)
      .slice(0, 1) // limit to 3 classes for brevity
      .map(c => `.${c}`)
      .join("");

    parts.unshift(`${tag}${id}${classList}`);
    current = current.parentElement;
  }

  return parts.join(" > ");
}


function enrichWithNodes(topSources) {
  const tolerance = 2;

  function almostEqualRects(r1, r2) {
    return (
      Math.abs(r1.x - r2.x) <= tolerance &&
      Math.abs(r1.y - r2.y) <= tolerance &&
      Math.abs(r1.width - r2.width) <= tolerance &&
      Math.abs(r1.height - r2.height) <= tolerance
    );
  }

  return topSources.map((src) => {
        const matchedLS = layoutShiftEntries.find((ls) =>
            Math.abs(ls.startTime - src.startTime) < 5 &&
            ls.sources?.some(
            (lsSrc) =>
                almostEqualRects(lsSrc.currentRect, src.currentRect) ||
                almostEqualRects(lsSrc.previousRect, src.previousRect)
            )
        );

        let nodeSelector = null;
        if (matchedLS) {
            const matchedSrc = matchedLS.sources.find(
            (lsSrc) =>
                almostEqualRects(lsSrc.currentRect, src.currentRect) ||
                almostEqualRects(lsSrc.previousRect, src.previousRect)
            );
            if (matchedSrc?.node) nodeSelector = getElementPathString(matchedSrc.node);
        }

        nodeSelector = nodeSelector === null ? "Non-element shift (e.g. text, font, or viewport change)": nodeSelector;

        return { ...src, nodeSelector };
    });
}

window._getTop5SourceRects = (entries) => {
  const allSources = [];

  for (const entry of entries) {
    if (!entry.sources?.length) continue;

    // Compute total movement impact for normalization
    const totalImpact = entry.sources.reduce((sum, src) => {
      const dx = src.currentRect.x - src.previousRect.x;
      const dy = src.currentRect.y - src.previousRect.y;
      const moveDist = Math.sqrt(dx * dx + dy * dy);
      const area = Math.max(
        src.previousRect.width * src.previousRect.height,
        src.currentRect.width * src.currentRect.height
      );
      return sum + moveDist * area;
    }, 0);

    for (const src of entry.sources) {
      const dx = src.currentRect.x - src.previousRect.x;
      const dy = src.currentRect.y - src.previousRect.y;
      const moveDist = Math.sqrt(dx * dx + dy * dy);
      const area = Math.max(
        src.previousRect.width * src.previousRect.height,
        src.currentRect.width * src.currentRect.height
      );
      const movementImpact = moveDist * area;

      // Weight this source’s score relative to the entry’s total
      const score =
        totalImpact > 0
          ? entry.value * (movementImpact / totalImpact)
          : entry.value / entry.sources.length;

      allSources.push({
        value: entry.value,
        score,
        startTime: entry.startTime,
        previousRect: src.previousRect,
        currentRect: src.currentRect,
        oldRect: src.oldRect,
        newRect: src.newRect
      });
    }
  }

  // Sort all sources by estimated contribution
  allSources.sort((a, b) => b.score - a.score);

  // Take the top 5
  const slicedSources = allSources.slice(0, 5);

  const slicedSourcesWithNode = enrichWithNodes(slicedSources);
  chrome.runtime.sendMessage({ type: "top-layout-shift-data", data: slicedSourcesWithNode});
}

function ensureOverlayControlPanel() {if (document.getElementById("web-vitals-overlay-panel")) return;

  const panel = document.createElement("div");
  panel.id = "web-vitals-overlay-panel";
  panel.innerHTML = `
    <div id="wv-header">🔍 Web Vitals Overlay
      <button id="wv-hide">Hide</button>
      <button id="wv-clear">Clear</button>
    </div>
  `;
  panel.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    background: rgba(30,30,30,0.92);
    color: white;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 14px;
    cursor: move;
    z-index: 2147483647;
  `;

  document.body.appendChild(panel);

  // Drag support
  const header = panel.querySelector("#wv-header");
  let offsetX = 0, offsetY = 0, isDragging = false;

  header.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
  };

  window.onmousemove = (e) => {
    if (isDragging) {
      panel.style.left = e.clientX - offsetX + "px";
      panel.style.top = e.clientY - offsetY + "px";
      panel.style.right = "auto"; // so it stops snapping back
    }
  };

  window.onmouseup = () => (isDragging = false);

  // Action buttons remain same
  document.getElementById("wv-hide").onclick = () => {
    document.querySelectorAll(".cls-highlight-overlay, #element-highlight-overlay")
      .forEach(o => o.style.display = o.style.display === "none" ? "block" : "none");
  };

  document.getElementById("wv-clear").onclick = () => {
    document.querySelectorAll(".cls-highlight-overlay, #element-highlight-overlay").forEach(o => o.remove());
    panel.remove();
  };
}


function updateINPEntryFromPerformanceObserver (webVitalEntry)  {
    const {interactionId, name} = webVitalEntry;
    // const threshold = 20;

    for (const entry of inpEventEntries) {
        if (entry.entryType !== "event" && entry.entryType !== "first-input") continue;

        // const diffStart = Math.abs(entry.startTime - startTime);
        // const diffProcStart = Math.abs(entry.processingStart - processingStart);
        // const diffProcEnd = Math.abs(entry.processingEnd - processingEnd);

        if (entry.interactionId === interactionId && entry.name === name && entry.target.id !== "wv-hide" && entry.target.id !== "wv-clear") {
            inpEntry = entry;
        }
    }

    inpEventEntries = [];
}

function getMetricWithDocumentRects(metric) {
  const convertRect = (rect) => {
    if (!rect) return null;
    return {
      top: rect.top,
      left: rect.left,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  };

  return {
    ...metric, // copies value, id, navigationType, etc.
    entries: metric.entries.map(entry => ({
      // ✅ Copy PerformanceEntry fields explicitly (they're not enumerable!)
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      value: entry.value,
      hadRecentInput: entry.hadRecentInput,
      // keep other layout shift fields:
      sources: entry.sources?.map(source => ({
        node: source.node || null,
        previousRect: source.previousRect, // viewport-based
        currentRect: source.currentRect,   // viewport-based
        oldRect: convertRect(source.previousRect), // doc-based
        newRect: convertRect(source.currentRect),  // doc-based
      })) || []
    }))
  };
}

function pruneLayoutShiftArray(currentCLSEntries, currentCLSValue) {
  // 1️⃣ If CLS is final or page is hidden → clear everything
  if (document.visibilityState === 'hidden' || currentCLSEntries == null) {
    layoutShiftEntries = [];
    return;
  }

  // 2️⃣ Detect CLS session reset:
  //    CLS value increases AND entries list size becomes smaller → new window replaced old
  if (currentCLSValue > lastCLSValue && currentCLSEntries.length < lastEntriesLength) {
    // The CLS session was reset to a new (higher scoring) one.
    // Remove all raw layout-shifts that happened before the first entry of the new CLS session.
    
    const firstRelevantStartTime = currentCLSEntries[0]?.startTime || 0;

    layoutShiftEntries = layoutShiftEntries.filter(ls =>
      ls.startTime >= firstRelevantStartTime
    );
  }

  // ✅ Update history values for next cycle
  lastEntriesLength = currentCLSEntries.length;
  lastCLSValue = currentCLSValue;
}




window._getWebVitals = () => {
    const sendWebVitals = (metric) => {
        let updatedMetric = metric;
        console.log("My extension" + JSON.stringify(metric));
        if(metric.entries.length >= 1) {
          if(metric.name === "INP") {
            setTimeout(() => {
              const entry = metric.entries[metric.entries.length-1];
              if(entry.target.id === "wv-hide" && entry.target.id === "Wv.clear") return;
              updateINPEntryFromPerformanceObserver(entry);
            }, 0);
          } else if(metric.name === "CLS") {
            updatedMetric = getMetricWithDocumentRects(metric);
            setTimeout(() => {
              pruneLayoutShiftArray(metric.entries, metric.value);
            }, 0)
          }
        }
        chrome.runtime.sendMessage({ type: "web-vitals", data: updatedMetric});

    }
    onCLS(sendWebVitals, {reportAllChanges: true});
    onFCP(sendWebVitals, {reportAllChanges: true});
    onLCP(sendWebVitals, { reportAllChanges: true});
    onINP(sendWebVitals, { reportAllChanges: true});
    onTTFB(sendWebVitals, { reportAllChanges: true});
}

window._getWebVitals();

function getElementByVitalType(type) {
    switch(type) {
        case "LCP":
            return lcpElement;
        case "INP":
            return inpEntry.target;
    }

}

function getElementType(entry) {
    const elem = entry.element || entry.target;
    if (!elem) return "null";

    if (entry.initiatorType === "img" || elem.tagName === "IMG") return "image";
    if (entry.initiatorType === "video" || elem.tagName === "VIDEO") return "video";
    if (!entry.name && elem.textContent && elem.textContent.trim().length > 0) return "text";

    return elem.tagName.toLowerCase(); // e.g., div with background image
}

window._getLCPEntryFromPerformanceObserver = () => {
    const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
            const elementType = getElementType(entry);
            lcpElement = entry.element;
            console.log(entry.element);
            chrome.runtime.sendMessage({
                type: 'LCP_ENTRY',
                data: {
                    elementType: elementType
                }
            });
        }
    }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
}

window._highlightCLSShiftRects = (previousRect, currentRect) => {
    console.log(
  "CLS currentRect:", currentRect,
  "Viewport size:", window.innerWidth, window.innerHeight,
  "Scroll:", window.scrollX, window.scrollY,
  "DevicePixelRatio:", window.devicePixelRatio,
  "Body transform:", getComputedStyle(document.body).transform
);
  // Remove any existing overlays
  document.querySelectorAll(".cls-highlight-overlay").forEach(el => el.remove());

  const createOverlay = (rect, color, label) => {
    const scale = window.devicePixelRatio || 1;

    const overlay = document.createElement("div");
    overlay.className = "cls-highlight-overlay";
    overlay.style.position = "absolute";
    
    overlay.style.left = rect.left / scale + rect.scrollX + "px";
    overlay.style.top = rect.top / scale + rect.scrollY + "px";
    overlay.style.width = rect.width / scale + "px";
    overlay.style.height = rect.height / scale + "px";
    // overlay.style.left = rect.left + "px";
    // overlay.style.top  = rect.top  + "px";
    // overlay.style.width  = rect.width  + "px";
    // overlay.style.height = rect.height + "px";
    overlay.style.border = `3px solid ${color}`;
    overlay.style.background = `${color}22`; // translucent fill
    overlay.style.zIndex = "999999";
    overlay.style.pointerEvents = "none";

    // Optional label
    const tag = document.createElement("div");
    tag.textContent = label;
    tag.style.position = "absolute";
    tag.style.top = "-20px";
    tag.style.left = "0";
    tag.style.fontSize = "12px";
    tag.style.background = color;
    tag.style.color = "#fff";
    tag.style.padding = "2px 4px";
    tag.style.borderRadius = "4px";
    tag.style.pointerEvents = "none";
    overlay.appendChild(tag);

    document.body.appendChild(overlay);
    return overlay;
  };

  // Create both overlays
  createOverlay(previousRect, "#ff0000", "Old (before)");
  createOverlay(currentRect, "#00ff00", "New (after)");

  ensureOverlayControlPanel();

  // Smooth scroll to center the new rect in view
  if (currentRect) {
    const targetY = currentRect.top + currentRect.scrollY - window.innerHeight / 2 + currentRect.height / 2;
    window.scrollTo({
      top: Math.max(targetY, 0),
      behavior: "smooth"
    });
} 

}

window._getINPEntryFromPerformanceObserver = () => {
    const elementType = getElementType(inpEntry);
    chrome.runtime.sendMessage({
         type: 'INP_ENTRY',
          data: {
             elementType: elementType
        }
    });
}

window._highlightElementByType = (type) => {
  const element = getElementByVitalType(type);
  if (!element) return;

  // Remove old overlay if it exists
  const oldOverlay = document.getElementById("element-highlight-overlay");
  if (oldOverlay) oldOverlay.remove();

  // Optional: bring element into view
  element.scrollIntoView({ behavior: "smooth", block: "center" });

  // Get rect in document coordinates
  const rect = element.getBoundingClientRect();

  const overlay = document.createElement("div");
  overlay.id = "element-highlight-overlay";
  overlay.style.position = "absolute"; // ✅ Document-relative positioning
  overlay.style.top = rect.top + window.scrollY + "px";
  overlay.style.left = rect.left + window.scrollX + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";
  overlay.style.background = "rgba(255, 0, 0, 0.15)";
  overlay.style.border = "8px solid red";
  overlay.style.zIndex = "999999";
  overlay.style.pointerEvents = "none";

  document.body.appendChild(overlay);  

  ensureOverlayControlPanel();
}