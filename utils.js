let isDebugMode = false;
let video, moviePlayer;
let longPressTimer, longPressFlag = false;
let originalSpeed = 1, minSpeed = 1.1, slowSpeed = 1.2, mainSpeed = 1.5, fastSpeed = 2, maxSpeed = 3, periodKeySpeed = 5, commaKeySpeed = 2;
let setPersistentSpeed = false, speedPersisting = false, newPersistentSpeed;
let firstRewind = true;
let rewindInterval = null;

let extensionEnabled = true, hotkeysEnabled = true;
const tier1 = 50;
const tier2 = 180;
const tier3 = 330;
const verticalTier = 90;
let dynamicTier1 = tier1, dynamicTier2 = tier2, dynamicTier3 = tier3, dynamicVerticalTier = verticalTier;
let url = '';
let mouseIsDown = false;

// uncomment to enable debug mode
// isDebugMode = true;



const overlayDiv = document.querySelector('.ytp-doubletap-ui-legacy');


function log(...args) {
    if (isDebugMode) {
        console.log(...args);
    }
}

function newSpeed(findicator, video, rate) {
    // let findicator = document.querySelector('.indicator');
    // video.parentElement.querySelectorAll('.indicator').forEach((el) => {
    //     findicator = el;
    // });
    video.playbackRate = rate;
    findicator.innerText = `${rate}x Speed`;
    clearInterval(rewindInterval);
    rewindInterval = null;
    firstRewind = true;
}


function addIndicator(findicator, fvideo, rate) {
    // query selector to find div with class 'indicator'
    // let findicator = document.querySelector('.indicator');

    // search parent element for div with class 'indicator'. then assign it to "findicator" variable
    // fvideo.parentElement.querySelectorAll('.indicator').forEach((el) => {
    //     findicator = el;
    // });

    // log('findicator1', findicator);

    // if (!findicator) {
    //     log("in if for findicator")
    //     findicator = document.createElement('div');
    //     findicator.classList.add('indicator');
    //     fvideo.parentElement.appendChild(findicator);
    //     log('findicator2', findicator);
    // }

    findicator.innerText = `${rate}x Speed${rate === 16 ? ' (max)' : ''}`;
    findicator.style.fontSize = '2.5em';
    findicator.style.fontWeight = 'normal';
    findicator.style.backgroundColor = 'rgba(50, 50, 50, 0.45)';
    findicator.style.display = 'block';
    findicator.style.zIndex = '9999';
    let offset = fvideo.clientHeight / 12
    findicator.style.top = `${offset}px`;
}


function addHotkeyIndicator(video, rate) {
    indicator.innerText = `${rate}x Speed${rate === 16 ? ' (max)' : ''}`;
    indicator.style.fontWeight = 'bold';
    indicator.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
    indicator.style.display = 'block';
    indicator.style.zIndex = '9999';
    let offset = video.clientHeight / 30
    indicator.style.top = `${offset}px`;
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 1250);
}

function findOriginalSpeed() {
    return new Promise(resolve => {
        const label = Array.from(document.querySelectorAll('.ytp-menuitem-label'))
            .find(el => el.textContent === 'Playback speed');
        const content = label ? label.nextElementSibling.textContent.toLowerCase() : '1';
        const originalSpeed = content === 'normal' ? '1' : content;
        resolve(originalSpeed);
    });
}

function delayedSetPlayback(video, rate, delay) {
    setTimeout(() => {
        video.playbackRate = rate;
    }, delay);
}

function simulateLeftArrowKeyPress(fvideo) {
    if (!extensionEnabled) return;
    log('simulateLeftArrowKeyPress');

    fvideo.focus();
    const leftArrowKeyCode = 37;
    const downEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        keyCode: leftArrowKeyCode,
        which: leftArrowKeyCode,
        bubbles: true,
        cancelable: true
    });
    fvideo.dispatchEvent(downEvent);

    const upEvent = new KeyboardEvent('keyup', {
        key: 'ArrowLeft',
        code: 'ArrowLeft',
        keyCode: leftArrowKeyCode,
        which: leftArrowKeyCode,
        bubbles: true,
        cancelable: true
    });
    fvideo.dispatchEvent(upEvent);
}

function simulateCommaKeyPress() {
    if (!extensionEnabled) return;

    video.focus();
    const commaKeyCode = 188;

    const downEvent = new KeyboardEvent('keydown', {
        key: ',',
        code: 'Comma',
        keyCode: commaKeyCode,
        which: commaKeyCode,
        bubbles: true,
        cancelable: true
    });
    video.dispatchEvent(downEvent);

    const upEvent = new KeyboardEvent('keyup', {
        key: ',',
        code: 'Comma',
        keyCode: commaKeyCode,
        which: commaKeyCode,
        bubbles: true,
        cancelable: true
    });
    video.dispatchEvent(upEvent);
}

function simulateSpaceKeyPress() {
    if (!extensionEnabled) return;

    video.focus();
    const spaceKeyCode = 32;

    const downEvent = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: spaceKeyCode,
        which: spaceKeyCode,
        bubbles: true,
        cancelable: true
    });
    video.dispatchEvent(downEvent);

    const upEvent = new KeyboardEvent('keyup', {
        key: ' ',
        code: 'Space',
        keyCode: spaceKeyCode,
        which: spaceKeyCode,
        bubbles: true,
        cancelable: true
    });
    video.dispatchEvent(upEvent);
}