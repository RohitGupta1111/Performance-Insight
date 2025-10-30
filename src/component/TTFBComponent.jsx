import React, { useContext, useEffect, useMemo, useState } from 'react'
import VitalMainIndicator from './VitalMainIndicator'
import WebVitalsContext from '../context/WebVitalsContext'
import styles from "./TTFBComponent.module.css";
import DebugInfoConatainer from './DebugInfoConatainer';
import { VitalHeadingContainer } from './VitalHeadingContainer';
import { DESCRIPTION_TEXT } from '../constants';

const TTFBComponent = () => {
  const {webVitalsData} = useContext(WebVitalsContext);
  const [ttfbDebugInfo,setTTFBDebugInfo] = useState({});

  const debugInfoFromEntry = useMemo(() => {
    const ttfbData = webVitalsData?.TTFB;
    const entry = ttfbData?.entries?.[0];
    if (!entry) return null;

    const {
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      connectEnd,
      secureConnectionStart,
      requestStart,
      responseStart,
      nextHopProtocol,
      transferSize,
      encodedBodySize,
      decodedBodySize,
      responseStatus,
      type,
    } = entry;

    const dns = domainLookupEnd - domainLookupStart;
    const connect = connectEnd - connectStart;
    const tls = secureConnectionStart > 0 ? connectEnd - secureConnectionStart : 0;
    const serverWait = responseStart - requestStart;
    const ttfb = responseStart;
    const serverProcessing = responseStart - connectEnd;

    return {
      ttfb,
      dns,
      connect,
      tls,
      serverWait,
      serverProcessing,
      protocol: nextHopProtocol,
      transferSize,
      encodedBodySize,
      decodedBodySize,
      responseStatus,
      navigationType: type,
    };
  }, [webVitalsData?.TTFB]);

  useEffect(() => {
    setTTFBDebugInfo((debugInfo) => ({...debugInfo,navigationType: webVitalsData["TTFB"].navigationType,...debugInfoFromEntry}));
  },[debugInfoFromEntry]);



  return (
    <div className={styles.lcpContainer}>
      <VitalHeadingContainer vitalType="TTFB" value={`${webVitalsData["TTFB"].value}ms`} description={DESCRIPTION_TEXT.TTFB} />
        <VitalMainIndicator good={2.5} poor={4} unit="s" value={webVitalsData["TTFB"].value}/>
        <DebugInfoConatainer debugInfo={ttfbDebugInfo}/>
    </div>
  )
}

export default TTFBComponent