import { INDICATOR_LEVEL } from "./enums";

export const getBarPosition = (value, good, poor, max, firstBarPosition) => {
    let levelMin, levelMax, levelIndex, levelIndicator;
    if(value > max) value = max;

    if (value <= good) {
        levelIndex = 1;        // Good
        levelMin = 0;
        levelMax = good;
        levelIndicator = INDICATOR_LEVEL.GOOD;
    } else if (value <= poor) {
        levelIndex = 2;        // Average
        levelMin = good;
        levelMax = poor;
        levelIndicator = INDICATOR_LEVEL.NEEDS_IMPROVEMENT;
    } else {
        levelIndex = 3;        // Poor
        levelMin = poor;
        levelMax = max;
        levelIndicator = INDICATOR_LEVEL.POOR;
    }

    // Fraction within current level
    let levelFraction = (value - levelMin) / (levelMax - levelMin);

    // Map to full bar (3 levels)
    let barPosition = firstBarPosition * ((levelIndex - 1) + levelFraction);

    // Clamp between 0 and 1
    return { level: levelIndicator, barPosition : barPosition};
}

export const formatVitalValue = (value, variant) => {
    if(variant === "CLS") {
         return `${Number((value).toFixed(4))}`;
    } else if (value < 1000) {
        return `${Number((value).toFixed(3))}ms`;
    } else {
        const seconds = Number((value / 1000).toFixed(3));
        return `${seconds}s`;
    }
}
