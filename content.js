
let lastVideoElement = null;
let indicator = null;
let initialX, initialY;
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
  const wasEnabled = extensionEnabled;
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['minSpeed', 'slowSpeed', 'mainSpeed', 'fastSpeed', 'maxSpeed', 'periodKeySpeed', 'commaKeySpeed', 'extensionEnabled', 'hotkeysEnabled'], function(data) {
      minSpeed = data.minSpeed !== undefined ? data.minSpeed : 1.1;
      slowSpeed = data.slowSpeed !== undefined ? data.slowSpeed : 1.2;
      mainSpeed = data.mainSpeed !== undefined ? data.mainSpeed : 1.5;
      fastSpeed = data.fastSpeed !== undefined ? data.fastSpeed : 2;
      maxSpeed = data.maxSpeed !== undefined ? data.maxSpeed : 3;
      periodKeySpeed = data.periodKeySpeed !== undefined ? data.periodKeySpeed : 4;
      commaKeySpeed = data.commaKeySpeed !== undefined ? data.commaKeySpeed : 1.5;
      extensionEnabled = data.extensionEnabled !== undefined ? data.extensionEnabled : true;
      hotkeysEnabled = data.hotkeysEnabled !== undefined ? data.hotkeysEnabled : true;

      if (wasEnabled !== extensionEnabled && extensionEnabled) {
        init();
      }

      resolve();
    });
  });
}

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
    log("found video element");
    if (lastVideoElement) {
      log("removing event listeners");
      video.removeEventListener('mousedown', mousedownHandler);
      video.removeEventListener('mouseup', mouseupHandler);
      video.removeEventListener('click', clickHandler);
      video.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('keydown', keydownHandler);
      video.removeEventListener('keyup', keyupHandler);
    }
      init(node);
  }
  if (node.shadowRoot) {
      node.shadowRoot.querySelectorAll('video').forEach(init);
  }
  // If has child nodes, search them all
  if (node.childNodes.length) {
      node.childNodes.forEach(searchForVideoElements);
  }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDomContentLoaded);
} else {
  onDomContentLoaded();
}



// URL observer
const urlObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
      // URL has changed
      const newURL = mutation.target.href;
      console.log('URL changed to:', newURL);
      // search for video elements in the new page
      searchForVideoElements(document.body);
    }
  });
});

// Configure the observer to watch for changes in the href attribute of the <a> element
const urlObserverConfig = {
  attributes: true,
  attributeFilter: ['href'],
  subtree: true,
};
urlObserver.observe(document.body, urlObserverConfig);



async function init(videoElement) {
  if (!extensionEnabled) return;
  log("init", videoElement);
  try {
    await syncSpeeds();
    log("syncSpeeds completed successfully");

    url = window.location.href;
    if (!url.includes('watch/')) { return; }
    log("is watch page");

    if (foundVideo) return;

    foundVideo = true; // we only want to init for one video, one time
    video = videoElement;
    lastVideoElement = videoElement;

    indicator = document.createElement('div');
    indicator.classList.add('indicator');
    const videoContainer = document.querySelector('.watch-video');
    videoContainer.appendChild(indicator);

    videoContainer.addEventListener('mousedown', mousedownHandler.bind(null, indicator, videoContainer, videoElement), true);
    videoContainer.addEventListener('mouseup', mouseupHandler.bind(null, videoContainer, videoElement), true);
    videoContainer.addEventListener('click', clickHandler.bind(null, videoContainer, videoElement), true);
    videoContainer.addEventListener('mousemove', handleMouseMove.bind(null, indicator, videoContainer, videoElement), true);

    videoContainer.addEventListener('keydown', keydownHandler.bind(null, indicator,), true);
    videoContainer.addEventListener('keyup', keyupHandler.bind(null, indicator), true);

    // videoContainer.addEventListener('keydown', keydownHandler);
    // videoContainer.addEventListener('keyup', keyupHandler);

  } catch (error) {
    console.error("Error in syncSpeeds:", error);
  }

}
