import { useEffect, useRef, useState } from "react";
import styles from "./LinearIndicator.module.css";
import  { INDICATOR_LEVEL, VARIANT_LEVELS } from "../enums.js"
import { formatVitalValue, getBarPosition } from "../utils.js";

function LinearIndicator ({value, variant}) {
    const [indicatorLevel,setIndicatorLevel] = useState(INDICATOR_LEVEL.NOT_CALCULATED);
    const [indicatorPosition, setIndicatorPosition] = useState(0);

    // const getBarPosition = () => {
    //         let levelMin, levelMax, levelIndex, levelIndicator;
    //         const good = VARIANT_LEVELS[variant].GOOD;
    //         const poor = VARIANT_LEVELS[variant].POOR;
    //         const max = VARIANT_LEVELS[variant].MAX;

    //         if (value <= good) {
    //             levelIndex = 1;        // Good
    //             levelMin = 0;
    //             levelMax = good;
    //             levelIndicator = INDICATOR_LEVEL.GOOD;
    //         } else if (value <= poor) {
    //             levelIndex = 2;        // Average
    //             levelMin = good;
    //             levelMax = poor;
    //             levelIndicator = INDICATOR_LEVEL.NEEDS_IMPROVEMENT;
    //         } else {
    //             levelIndex = 3;        // Poor
    //             levelMin = poor;
    //             levelMax = max;
    //             levelIndicator = INDICATOR_LEVEL.POOR;
    //         }

    //         // Fraction within current level
    //         let levelFraction = (value - levelMin) / (levelMax - levelMin);

    //         // Map to full bar (3 levels)
    //         let barPosition = 100 * ((levelIndex - 1) + levelFraction);

    //         // Clamp between 0 and 1
    //         return { level: levelIndicator, barPosition : barPosition};
    //     }

    useEffect(() => {
        if(variant && value >= 0) {
            const {level, barPosition} = getBarPosition(value, VARIANT_LEVELS[variant].GOOD, VARIANT_LEVELS[variant].POOR, VARIANT_LEVELS[variant].MAX, 100);
            setIndicatorLevel(level);
            setIndicatorPosition(barPosition);
        }
        
    },[value]);


    return (
        <div className={styles.barComponentContainer}>
            <div className={styles.variantLabel}>{variant}</div>
            <div className='indicator' style={{left: `${indicatorPosition}px`}}></div>
            <div className={styles.barContainer}>
                <div className={`${styles.bar} ${styles.good}`}></div>
                <div className={`${styles.bar} ${styles.needsImprovement}`}></div>
                <div className={`${styles.bar} ${styles.poor}`}></div>
            </div>
             <div>{indicatorLevel}{(value > VARIANT_LEVELS[variant].MAX ? "+ " : "  " )}{indicatorLevel !== INDICATOR_LEVEL.NOT_CALCULATED ? `(${formatVitalValue(value,variant)})`: ""}</div>
        </div>
    );
}

export default LinearIndicator;