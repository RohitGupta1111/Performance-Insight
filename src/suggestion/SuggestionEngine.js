/*
SuggestionEngine.js
A self-contained rule-based suggestion engine for Performance-Insight extension.

Usage:
  import { generateSuggestions } from './suggestions/SuggestionEngine';
  const suggestions = generateSuggestions({ vitals, diagnostics });

Input shape (expected):
{
  vitals: {
    LCP: { value: msNumber },
    CLS: { value: number },
    INP: { value: msNumber },
    FCP: { value: msNumber },
    TTFB: { value: msNumber }
  },
  diagnostics: {
    lcpElement: { tagName, src, selector, transferSize, rect },
    clsSources: [{ selector, nodeString, value, rect }],
    longTasks: [{ duration, attribution: [{ url, name }] }],
    resourceEntries: [{ name, initiatorType, transferSize, startTime, responseEnd, encodedBodySize }],
    imagesMissingDimensions: [{ selector, src, naturalWidth, naturalHeight }],
    thirdPartyScripts: [{ url, transferSize, startTime }],
    blockingStyles: [{ href, transferSize }],
    blockingScripts: [{ src, transferSize, async, defer }],
    ttfb: number
  }
}

Output: Array of suggestion objects:
[{ id, title, severity, confidence, impactEstimateMs, effort, description, actionableSteps, highlights }]

This file is intentionally conservative: rules are readable and easy to extend.
*/

// Thresholds and defaults
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 2500, poor: 4000 }, // ms
  CLS: { good: 0.1, needsImprovement: 0.1, poor: 0.25 },
  INP: { good: 200, needsImprovement: 200, poor: 500 }, // ms
  FCP: { good: 1000, needsImprovement: 1000, poor: 3000 },
  TTFB: { good: 600, needsImprovement: 600, poor: 1000 } // ms
};

function kb(bytes) { return Math.round((bytes || 0) / 1024); }
function ms(n) { return Math.round(n || 0); }

function severityFromMetric(metric, score) {
  // metric: 'LCP'|'CLS'|'INP'|'FCP'|'TTFB'
  const t = THRESHOLDS[metric];
  if (!t || score == null) return 'low';
  if (metric === 'CLS') {
    if (score >= t.poor) return 'high';
    if (score > t.needsImprovement) return 'medium';
    return 'low';
  }
  if (score >= t.poor) return 'high';
  if (score > t.needsImprovement) return 'medium';
  return 'low';
}

function effortEstimateFromKind(kind) {
  // quick, medium, large
  if (kind === 'image') return 'quick';
  if (kind === 'css') return 'medium';
  if (kind === 'js') return 'medium';
  if (kind === 'server') return 'large';
  return 'medium';
}

// Helper to build a suggestion object
function makeSuggestion({ id, title, severity='medium', confidence=0.8, impactEstimateMs=0, effort='medium', description='', actionableSteps=[], highlights=null }){
  return { id, title, severity, confidence: Math.min(1, Math.max(0, confidence)), impactEstimateMs: ms(impactEstimateMs), effort, description, actionableSteps, highlights };
}

// Rule implementations
function lcpRules(vitals, diagnostics) {
  const out = [];
  const lcp = vitals && vitals.LCP && vitals.LCP.value;
  if (!lcp) return out;
  const severity = severityFromMetric('LCP', lcp);
  const el = (diagnostics && diagnostics.lcpElement) || {};

  // Rule: Image-based LCP
  if (el.tagName && el.tagName.toLowerCase() === 'img') {
    const sizeKB = kb(el.transferSize);
    // If transferSize is known and large
    if (el.transferSize && el.transferSize > 150 * 1024) {
      out.push(makeSuggestion({
        id: 'lcp-hero-image-large',
        title: 'Optimize the hero image (LCP)',
        severity: severity === 'high' ? 'high' : 'medium',
        confidence: 0.95,
        impactEstimateMs: Math.min(1500, lcp * 0.4),
        effort: effortEstimateFromKind('image'),
        description: `LCP is ${ms(lcp)}ms and the largest contentful element is an <img> (${el.src || el.selector || 'unknown'}) of ~${sizeKB} KB.`,
        actionableSteps: [
          'Compress the image and serve in next-gen formats (WebP/AVIF).',
          'Add width/height attributes or CSS aspect-ratio to reserve layout space.',
          'Use responsive images (srcset) and preload the hero image: <link rel="preload" as="image" href="..."> for above-the-fold images.'
        ],
        highlights: el.selector ? { selector: el.selector, rect: el.rect } : null
      }));
    }

    // Missing srcset or missing dimensions
    if (diagnostics && diagnostics.imagesMissingDimensions && diagnostics.imagesMissingDimensions.length) {
      const missing = diagnostics.imagesMissingDimensions.find(i => i.selector === el.selector) || diagnostics.imagesMissingDimensions[0];
      if (missing) {
        out.push(makeSuggestion({
          id: 'lcp-img-missing-dimensions',
          title: 'Add dimensions for above-the-fold images',
          severity: 'medium',
          confidence: 0.9,
          impactEstimateMs: 300,
          effort: 'quick',
          description: `Some images are missing width/height which can trigger layout shifts and delay LCP. Missing: ${missing.src || missing.selector}`,
          actionableSteps: ['Add explicit width and height attributes, or use CSS aspect-ratio to reserve space.'],
          highlights: { selector: missing.selector }
        }));
      }
    }
  } else {
    // Non-image LCP: maybe a hero HTML block or text; check for render-blocking resources
    const blocking = (diagnostics && diagnostics.blockingStyles) || [];
    if (blocking.length) {
      out.push(makeSuggestion({
        id: 'lcp-render-blocking-css',
        title: 'Reduce render-blocking CSS affecting LCP',
        severity: severity === 'high' ? 'high' : 'medium',
        confidence: 0.8,
        impactEstimateMs: 800,
        effort: 'medium',
        description: `There are ${blocking.length} stylesheet(s) in the critical path that may delay rendering of the LCP element.`,
        actionableSteps: ['Inline critical CSS for above-the-fold styles, defer or load other styles asynchronously (e.g., rel=preload + onload swap).']
      }));
    }

    // If large blocking scripts before LCP
    if (diagnostics && diagnostics.blockingScripts && diagnostics.blockingScripts.length) {
      out.push(makeSuggestion({
        id: 'lcp-blocking-scripts',
        title: 'Defer heavy JavaScript to speed up LCP',
        severity: severity === 'high' ? 'high' : 'medium',
        confidence: 0.75,
        impactEstimateMs: 700,
        effort: 'medium',
        description: 'Heavy or render-blocking scripts loaded before the LCP element can delay paint.',
        actionableSteps: ['Defer/async non-critical scripts, code-split large bundles, or move initialization after first paint.']
      }));
    }
  }

  // General LCP caution if it's poor
  if (severity === 'high') {
    out.push(makeSuggestion({
      id: 'lcp-general',
      title: 'Slow Largest Contentful Paint (LCP)',
      severity: 'high',
      confidence: 0.9,
      impactEstimateMs: Math.max(500, ms(lcp) * 0.3),
      effort: 'medium',
      description: `LCP is ${ms(lcp)}ms which is considered poor.`,
      actionableSteps: ['Investigate the LCP element, compress/optimize its resources, and reduce main-thread work around page load.']
    }));
  }

  return out;
}

function clsRules(vitals, diagnostics) {
  const out = [];
  const cls = vitals && vitals.CLS && vitals.CLS.value;
  if (cls == null) return out;
  const severity = severityFromMetric('CLS', cls);

  if (cls > THRESHOLDS.CLS.needsImprovement) {
    const top = (diagnostics && diagnostics.clsSources && diagnostics.clsSources[0]) || null;
    out.push(makeSuggestion({
      id: 'cls-general',
      title: 'Reduce cumulative layout shift (CLS)',
      severity: severity === 'high' ? 'high' : 'medium',
      confidence: 0.9,
      impactEstimateMs: Math.min(1200, cls * 2000),
      effort: 'medium',
      description: `Page CLS is ${cls.toFixed(3)} and exceeds the recommended threshold.`,
      actionableSteps: [
        'Reserve space for images, ads, and iframes by setting width/height or aspect-ratio CSS.',
        'Avoid inserting content above existing content unless space is reserved.',
        'Use transform animations instead of layout changes for visual effects.'
      ],
      highlights: top ? { selector: top.selector, rect: top.rect } : null
    }));

    if (top && top.nodeString && /iframe|ad|ads|google/i.test(top.nodeString)) {
      out.push(makeSuggestion({
        id: 'cls-ads',
        title: 'Reserve space for third-party ads/iframes',
        severity: 'high',
        confidence: 0.95,
        impactEstimateMs: 500,
        effort: 'medium',
        description: `Top layout shift source appears to be an ad or iframe (${top.nodeString}). Ads often inject content and cause shifts.`,
        actionableSteps: ['Give ads a fixed container size or placeholder, lazy-load ads with reserved space, and use fallback content.'],
        highlights: { selector: top.selector }
      }));
    }
  }

  return out;
}

function inpRules(vitals, diagnostics) {
  const out = [];
  const inp = vitals && vitals.INP && vitals.INP.value;
  if (inp == null) return out;
  const severity = severityFromMetric('INP', inp);

  // If INP is poor, look at long tasks
  if (inp > THRESHOLDS.INP.needsImprovement) {
    const longTasks = (diagnostics && diagnostics.longTasks) || [];
    const bigTasks = longTasks.filter(t => t.duration > 50).sort((a,b)=>b.duration-a.duration).slice(0,5);

    let topAttribution = null;
    if (bigTasks.length && bigTasks[0].attribution && bigTasks[0].attribution.length) {
      topAttribution = bigTasks[0].attribution[0];
    }

    out.push(makeSuggestion({
      id: 'inp-general',
      title: 'Improve interaction readiness (INP)',
      severity: severity === 'high' ? 'high' : 'medium',
      confidence: 0.9,
      impactEstimateMs: Math.min(1200, inp * 0.4),
      effort: 'medium',
      description: `INP is ${ms(inp)}ms which indicates slow responsiveness for user interactions. Found ${bigTasks.length} long tasks.`,
      actionableSteps: [
        'Break up long tasks into smaller chunks.',
        'Offload non-UI work to Web Workers.',
        'Debounce or throttle expensive event handlers and avoid heavy synchronous work in input handlers.'
      ],
      highlights: topAttribution && topAttribution.url ? { url: topAttribution.url } : null
    }));

    // If a particular script shows up repeatedly
    if (topAttribution && topAttribution.url) {
      out.push(makeSuggestion({
        id: 'inp-script-hotspot',
        title: 'Heavy JavaScript affecting interactions',
        severity: 'high',
        confidence: 0.9,
        impactEstimateMs: Math.min(1500, bigTasks[0].duration),
        effort: effortEstimateFromKind('js'),
        description: `Long tasks attributed to ${topAttribution.url} indicate hotspots blocking the main thread.`,
        actionableSteps: [
          'Investigate the script and split tasks, or lazy-load/async where possible.',
          'Move non-critical logic to background threads (Web Workers).'
        ],
        highlights: { url: topAttribution.url }
      }));
    }
  }

  return out;
}

function resourceRules(vitals, diagnostics) {
  const out = [];
  const resources = (diagnostics && diagnostics.resourceEntries) || [];
  if (!resources.length) return out;

  // Large resources that load early
  const early = resources.filter(r => (r.startTime || 0) < 2000).sort((a,b)=> (b.transferSize||0)-(a.transferSize||0)).slice(0,6);
  const heavyEarly = early.filter(r => (r.transferSize || 0) > 150 * 1024);
  if (heavyEarly.length) {
    out.push(makeSuggestion({
      id: 'heavy-early-resources',
      title: 'Large resources loaded early',
      severity: 'medium',
      confidence: 0.85,
      impactEstimateMs: 800,
      effort: 'medium',
      description: `Found ${heavyEarly.length} large resource(s) earlier than 2s load time which may delay initial render. Top: ${heavyEarly.map(r=>r.name).slice(0,3).join(', ')}`,
      actionableSteps: ['Compress/serve next-gen formats for large assets, defer non-critical assets, and consider code-splitting large JS.']
    }));
  }

  // Fonts bigger than 100KB
  const fonts = resources.filter(r => (r.initiatorType === 'font' || /\.(woff2?|ttf|otf)($|\?)/i.test(r.name || '')) && (r.transferSize||0) > 100*1024);
  if (fonts.length) {
    out.push(makeSuggestion({
      id: 'large-fonts',
      title: 'Large webfonts detected',
      severity: 'medium',
      confidence: 0.8,
      impactEstimateMs: 400,
      effort: 'medium',
      description: `Detected ${fonts.length} large font files (>100KB) which can delay text rendering.`,
      actionableSteps: ['Subset fonts, use font-display: swap, or host fonts on a CDN.']
    }));
  }

  // Third-party scripts that are large and early
  const thirdParty = (diagnostics && diagnostics.thirdPartyScripts) || [];
  const big3p = thirdParty.filter(s => (s.transferSize||0) > 50*1024 && (s.startTime||0) < 2000);
  if (big3p.length) {
    out.push(makeSuggestion({
      id: 'third-party-heavy',
      title: 'Third-party scripts impacting startup',
      severity: 'medium',
      confidence: 0.85,
      impactEstimateMs: 700,
      effort: 'medium',
      description: `Found ${big3p.length} heavy third-party script(s) loaded early: ${big3p.map(s=>s.url).slice(0,3).join(', ')}`,
      actionableSteps: ['Defer or lazy-load third-party scripts, use async where safe, and audit the necessity of each third-party.']
    }));
  }

  return out;
}

function ttfbRules(vitals, diagnostics) {
  const out = [];
  const ttfb = (diagnostics && diagnostics.ttfb) || (vitals && vitals.TTFB && vitals.TTFB.value);
  if (ttfb == null) return out;
  const severity = severityFromMetric('TTFB', ttfb);
  if (ttfb > THRESHOLDS.TTFB.needsImprovement) {
    out.push(makeSuggestion({
      id: 'ttfb-slow',
      title: 'High server response time (TTFB)',
      severity: severity === 'high' ? 'high' : 'medium',
      confidence: 0.85,
      impactEstimateMs: Math.min(1000, ttfb * 0.5),
      effort: 'large',
      description: `TTFB is ${ms(ttfb)}ms which suggests backend latency or cache issues.`,
      actionableSteps: ['Add server-side caching, use a CDN, optimize backend processing, or use edge caching/SSR.']
    }));
  }
  return out;
}

// Merge and dedupe suggestions by id
function dedupeSuggestions(suggestions) {
  const map = new Map();
  for (const s of suggestions) {
    if (!map.has(s.id)) map.set(s.id, s);
    else {
      // merge confidence/impact if duplicate
      const prev = map.get(s.id);
      prev.confidence = Math.max(prev.confidence, s.confidence);
      prev.impactEstimateMs = Math.max(prev.impactEstimateMs || 0, s.impactEstimateMs || 0);
      // keep highest severity
      const sevOrder = { low:0, medium:1, high:2 };
      prev.severity = sevOrder[s.severity] > sevOrder[prev.severity] ? s.severity : prev.severity;
    }
  }
  return Array.from(map.values()).sort((a,b) => {
    // sort by severity, confidence, impactEstimate
    const order = { high:3, medium:2, low:1 };
    return (order[b.severity] - order[a.severity]) || (b.confidence - a.confidence) || (b.impactEstimateMs - a.impactEstimateMs);
  });
}

export function generateSuggestions({ vitals = {}, diagnostics = {} } = {}) {
  // Collect rules
  let suggestions = [];
  suggestions = suggestions.concat(lcpRules(vitals, diagnostics));
  suggestions = suggestions.concat(clsRules(vitals, diagnostics));
  suggestions = suggestions.concat(inpRules(vitals, diagnostics));
  suggestions = suggestions.concat(resourceRules(vitals, diagnostics));
  suggestions = suggestions.concat(ttfbRules(vitals, diagnostics));

  // Additional heuristics: suggest preload for large image if LCP close to threshold
  try {
    const lcpVal = vitals && vitals.LCP && vitals.LCP.value;
    if (lcpVal && diagnostics && diagnostics.lcpElement && diagnostics.lcpElement.tagName === 'IMG') {
      const el = diagnostics.lcpElement;
      if (el.transferSize && el.transferSize > 60*1024 && !(diagnostics && diagnostics.preloaded && diagnostics.preloaded.includes(el.src))) {
        suggestions.push(makeSuggestion({
          id: 'preload-hero-image',
          title: 'Preload hero image',
          severity: 'medium',
          confidence: 0.8,
          impactEstimateMs: 300,
          effort: 'quick',
          description: 'Preloading the hero image can help start its download earlier and reduce LCP.',
          actionableSteps: [`Add <link rel="preload" as="image" href="${el.src}"> for the above-the-fold hero image.`],
          highlights: { selector: el.selector }
        }));
      }
    }
  } catch(e){ /* non-critical */ }

  // Dedupe and return
  return dedupeSuggestions(suggestions);
}

// Example export default for ease of import
export default { generateSuggestions };

/*
Example usage (in background/UI):

import SuggestionEngine from './suggestions/SuggestionEngine';
const suggestions = SuggestionEngine.generateSuggestions({ vitals, diagnostics });
// suggestions -> render in UI
*/
