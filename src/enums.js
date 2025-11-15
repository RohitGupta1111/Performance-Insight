export const INDICATOR_LEVEL = {
  NOT_CALCULATED: 'Not Calculated',
  GOOD: 'Good',
  NEEDS_IMPROVEMENT: 'Needs Improvement',
  POOR: 'Poor',
}

export const NAV_OPTIONS = {
  MAIN: 'Main',
  LCP: 'LCP',
  INP: 'INP',
  CLS: 'CLS',
  TTFB: 'TTFB',
  FCP: 'FCP',
  AUDIT: 'Audit',
  CRUX: 'Crux',
  INSIGHTS: 'Insights'

}

export const VARIANT_LEVELS = {
  LCP: {
    GOOD: 2500,
    POOR: 4000,
    MAX: 6000,
  },
  CLS: {
    GOOD: 0.1,
    POOR: 0.25,
    MAX: 1,
  },
  FCP: {
    GOOD: 1000,
    POOR: 2000,
    MAX: 5000,
  },
  TTFB: {
    GOOD: 200,
    POOR: 500,
    MAX: 1000,
  },
  INP: {
    GOOD: 200,
    POOR: 500,
    MAX: 2000,
  },
}

export const DEFAULT_VITALS_DATA = {
  LCP: { value: -1 },
  INP: { value: -1 },
  CLS: { value: -1 },
  TTFB: { value: -1 },
  FCP: { value: -1 },
}

export const METRIC_TO_VARIANT_KEY = {
  largest_contentful_paint: "LCP",
  cumulative_layout_shift: "CLS",
  first_contentful_paint: "FCP",
  experimental_time_to_first_byte: "TTFB",
  interaction_to_next_paint: "INP",
};
