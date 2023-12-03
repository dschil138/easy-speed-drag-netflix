
let lastVideoElement = null;
let indicator, initialX, initialY;
let foundVideo = false;


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "runInit") {
      syncSpeeds();
    }
  }
);





function syncSpeeds() {
  log("sync speeds");
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'periodKeySpeed', 'commaKeySpeed', 'extensionEnabled', 'hotkeysEnabled'], function(data) {
      minSpeed = data.minSpeed !== undefined ? data.minSpeed : 1.2;
      slowSpeed = data.slowSpeed !== undefined ? data.slowSpeed : 1.5;
      mainSpeed = data.mainSpeed !== undefined ? data.mainSpeed : 2;
      fastSpeed = data.fastSpeed !== undefined ? data.fastSpeed : 3;
      maxSpeed = data.maxSpeed !== undefined ? data.maxSpeed : 5;
      periodKeySpeed = data.periodKeySpeed !== undefined ? data.periodKeySpeed : 5;
      commaKeySpeed = data.commaKeySpeed !== undefined ? data.commaKeySpeed : 2;
      extensionEnabled = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
      hotkeysEnabled = data.hotkeysEnabled !== undefined ? data.hotkeysEnabled : true;
      resolve();
    });
  });
}


// function onDomContentLoaded() {
//   let observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//       if (mutation.addedNodes) {
//         Array.from(mutation.addedNodes).forEach((node) => {
//           if (node.tagName === 'VIDEO') {
//             init(node);
//           }
//         });
//       }
//     });
//   });
//   observer.observe(document.body, { childList: true, subtree: true });
// }


// shadow DOM
function onDomContentLoaded() {
  let observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
          if (mutation.addedNodes) {
              Array.from(mutation.addedNodes).forEach((node) => {
                  searchForVideoElements(node);
              });
          }
      });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Initial search in the main document
  searchForVideoElements(document.body);
}

function searchForVideoElements(node) {
  if (node.tagName === 'VIDEO') {
      init(node);
  }
  if (node.shadowRoot) {
      node.shadowRoot.querySelectorAll('video').forEach(init);
  }
  // If the node has child nodes, search each one (this makes the search recursive)
  if (node.childNodes.length) {
      node.childNodes.forEach(searchForVideoElements);
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDomContentLoaded);
} else {
  onDomContentLoaded();
}


indicator = document.createElement('div');



async function init(videoElement) {
  if (!extensionEnabled || foundVideo) return;
  log("init", videoElement);
  await syncSpeeds();

  url = window.location.href;
  if (!url.includes('watch/')) { return; }

  foundVideo = true; // we only want to init for one video, one time
  video = videoElement;
  video = document.querySelector('video');

  if (lastVideoElement !== video && video !== null) {
    log("in IF");
    indicator.classList.add('indicator');
    video.parentElement.appendChild(indicator);
    video.playbackRate = 0.5;
    const videoContainer = document.querySelector('.watch-video');

    window.addEventListener('mousedown', mousedownHandler.bind(null, videoContainer, videoElement), true);
    window.addEventListener('mouseup', mouseupHandler.bind(null, videoContainer, videoElement), true);
    window.addEventListener('click', clickHandler.bind(null, videoContainer, videoElement), true);
    window.addEventListener('mousemove', handleMouseMove.bind(null, videoContainer, videoElement), true);
    window.addEventListener('mouseleave', handleMouseLeave.bind(null, videoContainer, videoElement));

    videoContainer.addEventListener('keydown', keydownHandler);
    videoContainer.addEventListener('keyup', keyupHandler);
  }
}


setTimeout(() => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    init(videoElement);
  }
}, 100);


