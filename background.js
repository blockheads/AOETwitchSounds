let color = '#3aa757';

chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      chrome.tabs.sendMessage( tabId, {
        message: 'changedURL',
        url: changeInfo.url
      })
    }
  }
);
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     if (changeInfo.status == 'complete') {
//       if (tab.url.indexOf("twitch.tv") != -1) {
//         console.log("twitch load complete");
        
//         //playSound();

//         // chrome.scripting.executeScript({
//         //   // injection: chrome.scripting.ScriptInjection({files: 'test.js'})
//         //     files: ['test.js'],
//         //     target: {tabId: tabId}
//         // });

//         //

//         waitForChat();
      
        
//       }
//     }
//   });


// chrome.runtime.onMessage.addListener((message, callback) => {

//   console.log("on message");
//   if (message == "runContentScript"){
//     console.log("running content script.");
//     chrome.scripting.executeScript({
//       file: 'test.js'
//     });
//   }
// });


