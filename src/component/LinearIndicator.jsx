import { useEffect, useRef, useState } from "react";
import "./LinearIndicator.css";
import  { INDICATOR_LEVEL, VARIANT_LEVELS } from "../enums.js"

function LinearIndicator ({value, variant}) {
    const [indicatorLevel,setIndicatorLevel] = useState(INDICATOR_LEVEL.NOT_CALCULATED);
    const [indicatorPosition, setIndicatorPosition] = useState(0);
    const [isAboveMax, setAboveMax] = useState(false);

    const getBarPosition = () => {
            let levelMin, levelMax, levelIndex, levelIndicator;
            const good = VARIANT_LEVELS[variant].GOOD;
            const poor = VARIANT_LEVELS[variant].POOR;
            const max = VARIANT_LEVELS[variant].MAX;

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
            let barPosition = 100 * ((levelIndex - 1) + levelFraction);

            // Clamp between 0 and 1
            return { level: levelIndicator, barPosition : barPosition};
        }

    useEffect(() => {
        if(variant && value >= 0) {
            const {level, barPosition} = getBarPosition();
            setIndicatorLevel(level);
            setAboveMax(barPosition > 300);
            console.log(barPosition);
            setIndicatorPosition(barPosition > 300 ? 300 : barPosition);
        }
        
    },[value]);


    return (
        <div className="bar-component-container">
            <div className="variant-label">{variant}</div>
            <div className="indicator" style={{left: `${indicatorPosition}px`}}></div>
            <div className="bar-container">
                <div className="bar good"></div>
                <div className="bar needs-improvement"></div>
                <div className="bar poor"></div>
            </div>
             <div>{indicatorLevel}{(isAboveMax ? "+ " : "  " )}{`(${value})`}</div>
        </div>
    );
}

export default LinearIndicator;