import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";

let lcpElement = null;
let inpEntry = null;
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

document.addEventListener("onclick", () => {
  removeAllOverlayLayout();
})

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
      });
    }
  }

  // Sort all sources by estimated contribution
  allSources.sort((a, b) => b.score - a.score);

  // Take the top 5
  allSources.slice(0, 5);

  const allSourcesWithNode = enrichWithNodes(allSources);
  chrome.runtime.sendMessage({ type: "top-layout-shift-data", data: allSourcesWithNode});
}

function ensureOverlayControlPanel() {
  if (document.getElementById("web-vitals-overlay-panel")) return;

  const panel = document.createElement("div");
  panel.id = "web-vitals-overlay-panel";
  panel.innerHTML = `
  <style>
    #web-vitals-overlay-panel {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      background: rgba(30,30,30,0.92);
      color: #fff;
      font-family: system-ui, sans-serif;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      user-select: none;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.6), 0 0 5px rgba(0, 0, 0, 0.3);
      display: flex;
      gap: 10px;
      align-items: center;
      transition: opacity 0.3s ease, transform 0.3s ease;
      animation: panel-pulse 2s ease-in-out infinite;
    }

    @keyframes panel-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(0,255,255,0.4), 0 0 3px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 0 18px rgba(0,255,255,0.8), 0 0 8px rgba(0,0,0,0.4); }
    }

    #web-vitals-overlay-panel button {
      background: linear-gradient(145deg, #00c8ff, #007bff);
      border: none;
      color: white;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    #web-vitals-overlay-panel button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 10px rgba(0,200,255,0.6);
    }

    #web-vitals-overlay-panel button:active {
      transform: scale(0.97);
    }

    /* Optional: subtle fade-in when panel appears */
    #web-vitals-overlay-panel.fade-in {
      opacity: 0;
      transform: translateY(-10px);
      animation: fadeIn 0.4s forwards ease;
    }

    @keyframes fadeIn {
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
  <div>🔍 Web Vitals Overlay</div>
  <button id="wv-hide">Hide</button>
  <button id="wv-clear">Clear</button>
`;

  
  document.body.appendChild(panel);
  panel.classList.add('fade-in');


  document.getElementById("wv-hide").onclick = () => {
    const overlays = document.querySelectorAll(".cls-highlight-overlay, #element-highlight-overlay");
    overlays.forEach(o => o.style.display = o.style.display === "none" ? "block" : "none");
  };

  document.getElementById("wv-clear").onclick = () => {
    setTimeout(() => {
      document.querySelectorAll(".cls-highlight-overlay, #element-highlight-overlay").forEach(o => o.remove());
      document.getElementById("web-vitals-overlay-panel")?.remove();
    }, 500);
    
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

window._getWebVitals = () => {
    const sendWebVitals = (metric) => {
        console.log("My extension" + JSON.stringify(metric));
        if(metric.entries.length >= 1) {
            setTimeout(() => {
                if(metric.name === "INP") {
                    const entry = metric.entries[metric.entries.length-1];
                    if(entry.target.id === "wv-hide" && entry.target.id === "Wv.clear") return;
                    updateINPEntryFromPerformanceObserver(entry);
                }
                
            }, 0);
        }
        chrome.runtime.sendMessage({ type: "web-vitals", data: metric});

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
    if (!elem) return "unknown";

    if (entry.initiatorType === "img" || elem.tagName === "IMG") return "image";
    if (entry.initiatorType === "video" || elem.tagName === "VIDEO") return "video";
    if (!entry.name && elem.textContent && elem.textContent.trim().length > 0) return "text";

    return "other"; // e.g., div with background image
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
    overlay.style.position = "fixed";
    
    overlay.style.left = rect.x / scale + "px";
    overlay.style.top = rect.y / scale + "px";
    overlay.style.width = rect.width / scale + "px";
    overlay.style.height = rect.height / scale + "px";
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
  const oldOverlay = createOverlay(previousRect, "#ff0000", "Old (before)");
  const newOverlay = createOverlay(currentRect, "#00ff00", "New (after)");

  ensureOverlayControlPanel();


  // Scroll to bring the new rect into view
  window.scrollTo({
    top: currentRect.y + window.scrollY - window.innerHeight / 2,
    left: currentRect.x + window.scrollX - window.innerWidth / 2,
    behavior: "smooth",
  });
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
    if(element) {
        if (!element) return;
        // Scroll into view
        // element.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
          // Remove old overlay if it existss
          const oldOverlay = document.getElementById("element-highlight-overlay");
          if (oldOverlay) oldOverlay.remove();

          const rect = element.getBoundingClientRect();

          // Create overlay container
          const overlay = document.createElement("div");
          overlay.id = "element-highlight-overlay";
          overlay.style.position = "fixed";
          overlay.style.left = rect.left + "px";
          overlay.style.top = rect.top + "px";
          overlay.style.width = rect.width + "px";
          overlay.style.height = rect.height + "px";
          overlay.style.background = "rgba(255, 0, 0, 0.15)"; // translucent red tint
          overlay.style.border = "8px solid red";
          overlay.style.zIndex = "999999";
          overlay.style.pointerEvents = "none"; // allow clicks to pass through

          document.body.appendChild(overlay);
          ensureOverlayControlPanel();


          

          // Optional: reposition overlay on scroll/resize
          const reposition = () => {
              const newRect = element.getBoundingClientRect();
              overlay.style.left = newRect.left + "px";
              overlay.style.top = newRect.top + "px";
              overlay.style.width = newRect.width + "px";
              overlay.style.height = newRect.height + "px";
          };

          window.addEventListener("scroll", reposition);
          window.addEventListener("resize", reposition);

          // Cleanup listener if overlay removed
          const observer = new MutationObserver(() => {
              if (!document.body.contains(overlay)) {
                  window.removeEventListener("scroll", reposition);
                  window.removeEventListener("resize", reposition);
                  observer.disconnect();
              }
          });
          observer.observe(document.body, { childList: true });
        }, 100);

        
    }
    
}