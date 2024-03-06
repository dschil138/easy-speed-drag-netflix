// chrome.runtime.onInstalled.addListener(function(details) {
//     if (details.reason === "install") {
//         chrome.tabs.create({url: "https://davidschiller.net/easy-speed-drag-for-netflix.html"});
//     }
// });




chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({url: "*://www.netflix.com/*"}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ["utils.js"]
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    files: ["handlers.js"]
                }, () => {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        files: ["content.js"]
                    }, () => {
                        // Now, insert CSS
                        chrome.scripting.insertCSS({
                            target: {tabId: tab.id},
                            files: ["styles.css"]
                        }, () => {
                            chrome.tabs.sendMessage(tab.id, {action: "runInit"});
                        });
                    });
                });
            });
        });
    });
});