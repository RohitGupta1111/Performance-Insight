import React, { useContext, useEffect, useState } from 'react'
import VitalMainIndicator from './VitalMainIndicator'
import WebVitalsContext from '../context/WebVitalsContext'
import styles from "./FCPComponent.module.css";
import { VitalHeadingContainer } from './VitalHeadingContainer';
import { DESCRIPTION_TEXT } from '../constants';
import VitalsTimelineBar from './VitalsTimeLineBar';

const FCPComponent = () => {
  const {webVitalsData} = useContext(WebVitalsContext);


  return (
    <div className={styles.lcpContainer}>
      <VitalHeadingContainer vitalType="FCP" value={`${webVitalsData["FCP"].value}ms`} description={DESCRIPTION_TEXT.FCP} />
        <VitalMainIndicator good={2.5} poor={4} unit="s" value={webVitalsData["FCP"].value}/>
        <VitalsTimelineBar />

    </div>
  )
}

export default FCPComponent