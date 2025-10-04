chrome.tabs.onUpdated.addListener( async (tabId, changeInfo, tab) => {
    if(changeInfo.status === "complete") {
        

        await chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ["web-vital-bundle-script.js"]
        });

        chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: () => window._getWebVitals()
        })
    }
})

chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    console.log(message);
    if(message.type === "web-vitals") {
        chrome.storage.local.set({[message.data.name] : message.data.value});
    }
})