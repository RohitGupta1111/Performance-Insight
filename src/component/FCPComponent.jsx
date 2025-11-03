import React, { useContext, useEffect, useState } from 'react'
import VitalMainIndicator from './VitalMainIndicator'
import WebVitalsContext from '../context/WebVitalsContext'
import { VitalHeadingContainer } from './VitalHeadingContainer';
import { DESCRIPTION_TEXT } from '../constants';
import VitalsTimelineBar from './VitalsTimeLineBar';

const FCPComponent = () => {
  const {webVitalsData} = useContext(WebVitalsContext);


  return (
    <div>
      <VitalHeadingContainer vitalType="FCP" value={webVitalsData["FCP"].value} description={DESCRIPTION_TEXT.FCP}/>
        <VitalMainIndicator good={1} poor={2} unit="s" value={webVitalsData["FCP"].value} variant="FCP"/>
        {
          webVitalsData["FCP"].value >= 0 ?
          <VitalsTimelineBar />:null
        }

    </div>
  )
}

export default FCPComponent