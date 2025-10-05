import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";

window._getWebVitals = () => {
    const sendWebVitals = (metric) => {
        console.log(metric);
        chrome.runtime.sendMessage({ type: "web-vitals", data: metric});
    }
    onCLS(sendWebVitals);
    onFCP(sendWebVitals);
    onLCP(sendWebVitals);
    onINP(sendWebVitals);
    onTTFB(sendWebVitals);
}