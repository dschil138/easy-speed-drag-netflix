
let hotkeyOriginalSpeed = 1;
let isPeriodKeyDown = false, isCommaKeyDown = false, periodPressed = false, commaPressed = false, doubleTapAndHoldPeriod = false, doubleTapAndHoldComma = false, keydownTimer, lastPeriodKeyReleaseTime = 0, lastCommaKeyReleaseTime = 0;
let tempPause = false;




let tapTimeoutPeriod;
let wasPeriodKeyHeld = false;
let tapTimeoutComma;
let wasCommaKeyHeld = false;

// if video is paused, hotkeys do nothing (preserves native hotkey function of frame scrubbing). If video is playing, a tap on the hot keys will initiate fine speed control. Holding the hot keys will initiate tier1 speeds, tap-hold will initiate tier2 speeds.
function keydownHandler(e) {
    if (!extensionEnabled || !hotkeysEnabled) return;

    const video = document.querySelector('video');
    if (video.paused) return;


    if (e.key === '.') {
        clearTimeout(tapTimeoutPeriod); // Clear any existing timeout to prevent interference

        let currentTimeStamp = Date.now();
        let timeDifference = currentTimeStamp - lastPeriodKeyReleaseTime;

        if (timeDifference < 400) {
            doubleTapAndHoldPeriod = true;
        }

        if (doubleTapAndHoldPeriod) {
            isPeriodKeyDown = true;
            video.playbackRate = maxSpeed;
            addIndicator(video, maxSpeed);
            wasPeriodKeyHeld = true;
        } else {
            tapTimeoutPeriod = setTimeout(() => {
                wasPeriodKeyHeld = true;
                video.playbackRate = fastSpeed;
                addIndicator(video, fastSpeed);
            }, 200);
        }

    } else if (e.key === ',') {
        clearTimeout(tapTimeoutComma);

        let currentTimeStamp = Date.now();
        let timeDifference = currentTimeStamp - lastCommaKeyReleaseTime;

        if (timeDifference < 400) {
            doubleTapAndHoldComma = true;
        }

        if (doubleTapAndHoldComma) {
            isCommaKeyDown = true;
            video.playbackRate = minSpeed;
            addIndicator(video, minSpeed);
            wasCommaKeyHeld = true;
        } else {
            tapTimeoutComma = setTimeout(() => {
                wasCommaKeyHeld = true;
                video.playbackRate = slowSpeed;
                addIndicator(video, slowSpeed);
            }, 200);
        }
    }

    else if (e.key === 'r') {
        video.playbackRate = 1;
        addHotkeyIndicator(video, 1);
    }

};


function keyupHandler(e) {
    if (video.paused) return;

    // PERIOD KEY
    if (e.key === '.') {
        lastPeriodKeyReleaseTime = Date.now();

        clearTimeout(tapTimeoutPeriod);
        if (!wasPeriodKeyHeld) {
            setTimeout(() => {
                if (Date.now() - lastPeriodKeyReleaseTime >= 350) {
                    if (!doubleTapAndHoldPeriod) {
                        let adjustedSpeed = video.playbackRate + 0.05;
                        adjustedSpeed = Math.round(adjustedSpeed * 100) / 100;

                        newSpeed(adjustedSpeed);
                        addHotkeyIndicator(video, adjustedSpeed);
                    }
                }
            }, 350); 
        }
        else {
            indicator.style.display = 'none';
            video.playbackRate = 1;
        }
        doubleTapAndHoldPeriod = false;
        isPeriodKeyDown = false;
        wasPeriodKeyHeld = false;
    }
    // COMMA KEY
    if (e.key === ',') {
        lastCommaKeyReleaseTime = Date.now();

        clearTimeout(tapTimeoutComma);
        if (!wasCommaKeyHeld) {
            setTimeout(() => {
                if (Date.now() - lastCommaKeyReleaseTime >= 350) {
                    if (!doubleTapAndHoldComma) {
                    let adjustedSpeed = video.playbackRate - 0.05;
                    adjustedSpeed = Math.round(adjustedSpeed * 100) / 100;

                    newSpeed(adjustedSpeed);
                    addHotkeyIndicator(video, adjustedSpeed);
                    }
                }
            }, 350); 
            
        }
        else {
            indicator.style.display = 'none';
            video.playbackRate = 1;
        }
        doubleTapAndHoldComma = false;
        isCommaKeyDown = false;
        wasCommaKeyHeld = false;
    }
};



function getOriginalSpeed() {
    return new Promise((resolve, reject) => {
        if (!speedPersisting) {
            log("mousedown NOT speedPersisting. Original speed:", originalSpeed);
            originalSpeed = video.playbackRate;
            log("mousedown set originalSpeed to:", originalSpeed);
        }
        resolve();
    });
}


// MOUSE DOWN HANDLER
async function mousedownHandler(moviePlayer, video, e) {
    log("mouse down");
    await getOriginalSpeed();
    if (!extensionEnabled) return;
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressFlag = false;
    mouseIsDown = true;

    initialX = e.clientX;
    initialY = e.clientY;
    setPersistentSpeed = false;

    const elements = document.elementsFromPoint(e.clientX, e.clientY);

    const classList = ['show'];

    if (elements.some(el => classList.some(cls => el.classList.contains(cls)))) {
        log("mousedown return early element");
        return;
    }


    longPressTimer = setTimeout(async () => {
        
        log("long press");
        longPressFlag = true;
        addIndicator(video, mainSpeed);
        video.playbackRate = mainSpeed;
    }, 320);
}


// MOUSE UP HANDLER
function mouseupHandler(moviePlayer, video, e) {
    log("mouse up");
    log("setPersistentSpeed", setPersistentSpeed);


    mouseIsDown = false;
    if (tempPause) {
        simulateSpaceKeyPress();
        tempPause = false;
    }
    clearTimeout(longPressTimer);
    firstRewind = true;
    clearInterval(rewindInterval);
    rewindInterval = null;
    deltax = 0;
    deltay = 0;

    if (setPersistentSpeed) {
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 1250);
    } else {
        indicator.style.display = 'none';
    }

    if (longPressFlag) {
        if (setPersistentSpeed) { //speed wasn't persisting but we're trying to set it to persist now
            delayedSetPlayback(video, newPersistentSpeed, 50);
            speedPersisting = true;
        } else { //speed wasn't persisting and we didn't set it to persist, go back to original speed
            log("mouseup ELSE. Original speed:", originalSpeed);
            delayedSetPlayback(video, originalSpeed, 50);
            speedPersisting = false;
        }

        e.stopPropagation();
        e.preventDefault();
    }

    setTimeout(() => {
        longPressFlag = false;
    }, 100);
}


// CLICK HANDLER
function clickHandler(moviePlayer, video, e) {
    log("mouseclick");
    if (!extensionEnabled) return;
    mouseIsDown = false;
    clearTimeout(longPressTimer);
    clearInterval(rewindInterval);
    rewindInterval = null;

    if (longPressFlag) {
        log("ending long press");
        longPressFlag = false;

        e.stopPropagation();
        e.preventDefault();
    }
}


// MOUSE MOVE HANDLER
function handleMouseMove(moviePlayer, video, e) {
    if (!extensionEnabled || !longPressFlag) return;

    // make it a bit easier to work with smaller videos
    width = video.clientWidth;
    if (width < 450) {
        dynamicTier1 = tier1 / 1.8;
        dynamicTier2 = tier2 / 1.8;
        dynamicTier3 = tier3 / 1.8;
        dynamicVerticalTier = verticalTier / 1.8;
    } else {
        dynamicTier1 = tier1;
        dynamicTier2 = tier2;
        dynamicTier3 = tier3;
        dynamicVerticalTier = verticalTier;
    }

    const deltaX = e.clientX - initialX;
    const deltaY = e.clientY - initialY;

    // X Axis will set the speed
    if (deltaX > dynamicTier2) {
        newSpeed(maxSpeed);
    } else if (deltaX > dynamicTier1 && deltaX < dynamicTier2) {
        newSpeed(fastSpeed);
    } else if (deltaX < -dynamicTier3) {
        indicator.innerText = `REWIND`;
        if (firstRewind) {
            firstRewind = false;
            simulateLeftArrowKeyPress()
        }
        if (!rewindInterval) {
            rewindInterval = setInterval(() => {
                simulateLeftArrowKeyPress()
            }, 800);
        }
    } else if (deltaX < -dynamicTier2) {
        newSpeed(minSpeed);
    } else if (deltaX < -dynamicTier1) {
        newSpeed(slowSpeed);
    } else {
        newSpeed(mainSpeed);
    }

    // Y Axis will decide if speed is persistent after releasing click
    if (deltaY > dynamicVerticalTier || deltaY < -dynamicVerticalTier) {
        setPersistentSpeed = true;
        newPersistentSpeed = video.playbackRate;
        indicator.style.fontWeight = 'bold';
        indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    } else {
        setPersistentSpeed = false;
        indicator.style.fontWeight = 'normal';
        indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
    }
}

