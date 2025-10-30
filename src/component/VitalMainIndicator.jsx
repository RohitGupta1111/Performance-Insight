import React, { useState, useEffect } from 'react'
import styles from "./VitalMainIndicator.module.css";
import { getBarPosition } from '../utils';
import { VARIANT_LEVELS } from '../enums';

const VitalMainIndicator = ({good,poor,unit="",value, variant}) => {
  
  const [indicatorPosition, setIndicatorPosition] = useState(0);

  useEffect(() => {
    if(variant && value >= 0) {
        const { barPosition } = getBarPosition(value, VARIANT_LEVELS[variant].GOOD, VARIANT_LEVELS[variant].POOR, VARIANT_LEVELS[variant].MAX, 150);
        setIndicatorPosition(barPosition);
    }
  },[value]);

  return (
    <div className={styles.vitalMainIndicator}>
      { value >= 0 ? <div className='indicator' style={{left: `${indicatorPosition}px`}}></div> : null }
      <div className={styles.vitalIndicatorContainer}>
          <div className={styles.goodSection}>
              <div className={styles.goodText}>{`Good <${good}${unit}`}</div>
          </div>
          <div className={styles.needImprovementSection}>
              <div className={styles.needImprovementText}>{`Needs improvement`}</div>
          </div>
          <div className={styles.poorSection}>
              <div className={styles.poorText}>{`poor >${poor}${unit}`}</div>
          </div>
          
      </div>
      
    </div>
  )
}

export default VitalMainIndicator