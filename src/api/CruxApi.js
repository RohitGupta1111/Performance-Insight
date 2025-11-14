import { HISTORY_API_METRICS } from "../constants";

export const fetchCRUXVisHistoricalData = async (formfactor) => {
    const API_KEY = import.meta.env.VITE_CRUX_API_KEY;
    const apiUrl = `https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord?key=${API_KEY}`;
    const [tab] = await chrome.tabs.query({
                    active: true,
                    currentWindow: true,
                });
    const origin = new URL(tab.url).origin;
    const body = {
    origin: origin, // you can pass a site origin dynamically
    formFactor: formfactor,
    metrics: [HISTORY_API_METRICS],
    collectionPeriodCount: 25
  };
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    })
    const data = await response.json();
    console.log(data);
    return data;
}