import { MONTH_NAMES } from './constants'
import { INDICATOR_LEVEL } from './enums'

export const getBarPosition = (value, good, poor, max, firstBarPosition) => {
  let levelMin, levelMax, levelIndex, levelIndicator
  if (value > max) value = max

  if (value <= good) {
    levelIndex = 1 // Good
    levelMin = 0
    levelMax = good
    levelIndicator = INDICATOR_LEVEL.GOOD
  } else if (value <= poor) {
    levelIndex = 2 // Average
    levelMin = good
    levelMax = poor
    levelIndicator = INDICATOR_LEVEL.NEEDS_IMPROVEMENT
  } else {
    levelIndex = 3 // Poor
    levelMin = poor
    levelMax = max
    levelIndicator = INDICATOR_LEVEL.POOR
  }

  // Fraction within current level
  let levelFraction = (value - levelMin) / (levelMax - levelMin)

  // Map to full bar (3 levels)
  let barPosition = firstBarPosition * (levelIndex - 1 + levelFraction)

  // Clamp between 0 and 1
  return { level: levelIndicator, barPosition: barPosition }
}

export const formatVitalValue = (value, variant) => {
  if (variant === 'CLS') {
    return `${Number(value.toFixed(4))}`
  } else if (value < 1000) {
    return `${Number(value.toFixed(3))}ms`
  } else {
    const seconds = Number((value / 1000).toFixed(3))
    return `${seconds}s`
  }
}


export const processHistoricalApiDataForP75Linechart = (apiData, metric) => {
  let processedMetricData = [];
  for(let i=0; i < apiData.collectionPeriods.length ; i++) {
    let data = {};
    data.firstDate = apiData.collectionPeriods[i].firstDate;
    data.lastDate = apiData.collectionPeriods[i].lastDate;
    data.p75 = apiData.metrics[metric].percentilesTimeseries.p75s[i];
    data.monthLabel = MONTH_NAMES[apiData.collectionPeriods[i].firstDate.month - 1];
    data.xIndex = i;
    processedMetricData.push(data);
  }

  return processedMetricData;
}

export const processHistoricalApiDataForHistogram = (apiData, metric) => {
  const periods = apiData.collectionPeriods;
  const binsTimeseries = apiData.metrics[metric].histogramTimeseries;

  const bin0 = binsTimeseries[0];
  const bin1 = binsTimeseries[1];
  const bin2 = binsTimeseries[2];

  const processed = [];

  for (let i = 0; i < periods.length; i++) {
    let good = bin0.densities[i] ?? 0;
    let ni   = bin1.densities[i] ?? 0;
    let poor = bin2.densities[i] ?? 0;

    // --- FIX: Normalize to keep sum <= 1 ---
    const total = good + ni + poor;
    if (total > 0) {
      good = good / total;
      ni   = ni   / total;
      poor = poor / total;
    }

    processed.push({
      xIndex: i,

      firstDate: periods[i].firstDate,
      lastDate: periods[i].lastDate,
      monthLabel: MONTH_NAMES[periods[i].firstDate.month - 1],

      bins: [
        { start: bin0.start, end: bin0.end, density: good },
        { start: bin1.start, end: bin1.end, density: ni },
        { start: bin2.start, end: bin2.end ?? Infinity, density: poor }
      ],

      good,
      ni,
      poor
    });
  }

  return processed;
};



