// chrome.runtime.onInstalled.addListener(() => {
//     chrome.tabs.onActivated.addListener(handleTabActivation);
// });

// function handleTabActivation(activeInfo) {
//     chrome.tabs.get(activeInfo.tabId, (tab) => {
//         if (tab && tab.url && tab.url.includes("://www.netflix.com/")) {
//             chrome.scripting.executeScript({
//                 target: {tabId: tab.id},
//                 files: ["utils.js"]
//             }, () => {
//                 chrome.scripting.executeScript({
//                     target: {tabId: tab.id},
//                     files: ["handlers.js"]
//                 }, () => {
//                     chrome.scripting.executeScript({
//                         target: {tabId: tab.id},
//                         files: ["content.js"]
//                     }, () => {
//                         // Now, insert CSS
//                         chrome.scripting.insertCSS({
//                             target: {tabId: tab.id},
//                             files: ["styles.css"]
//                         }, () => {
//                             chrome.tabs.sendMessage(tab.id, {action: "runInit"});
//                         });
//                     });
//                 });
//             });
//         }
//     });
// }