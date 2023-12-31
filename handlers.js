
let hotkeyOriginalSpeed = 1;
// let originalSpeed = 1;
let isPeriodKeyDown = false, isCommaKeyDown = false, periodPressed = false, commaPressed = false, doubleTapAndHoldPeriod = false, doubleTapAndHoldComma = false, keydownTimer, lastPeriodKeyReleaseTime = 0, lastCommaKeyReleaseTime = 0;
let tempPause = false;

// ytp-settings-menu

function keydownHandler(e) {
    if (!extensionEnabled || !hotkeysEnabled) return;

    if (e.key === '.') {
        let currentTimeStamp = Date.now();
        let timeDifference = currentTimeStamp - lastPeriodKeyReleaseTime;

        if (timeDifference < 400) {
            doubleTapAndHoldPeriod = true;
        }

        // double tap and hold period will give us double speed, up to max of 16x
        if (doubleTapAndHoldPeriod) {
            isPeriodKeyDown = true;
            video.playbackRate = Math.min(periodKeySpeed * 2, 16);
            addIndicator(video, Math.min(periodKeySpeed * 2, 16));
        } else {
            video.playbackRate = periodKeySpeed;
            addIndicator(video, periodKeySpeed);
        }

    } else if (e.key === ',') {
        let currentTimeStamp = Date.now();
        let timeDifference = currentTimeStamp - lastCommaKeyReleaseTime;

        if (timeDifference < 400) {
            doubleTapAndHoldComma = true;
        }
        // double tap and hold comma will give us 0.75x speed
        if (doubleTapAndHoldComma) {
            isCommaKeyDown = true;
            video.playbackRate = 0.75;
            addIndicator(video, 0.75);
        } else {
            video.playbackRate = commaKeySpeed;
            addIndicator(video, commaKeySpeed);
        }
    }
};


function keyupHandler(e) {
    if (e.key === '.') {
        doubleTapAndHoldPeriod = false;
        lastPeriodKeyReleaseTime = Date.now();
        isPeriodKeyDown = false;
        indicator.style.display = 'none';
        if (!isPeriodKeyDown) {
            video.playbackRate = 1;
        }
    }
    if (e.key === ',') {
        doubleTapAndHoldComma = false;
        lastCommaKeyReleaseTime = Date.now();
        isCommaKeyDown = false;
        indicator.style.display = 'none';
        if (!isCommaKeyDown) {
            video.playbackRate = 1;
        }
    }
};



// MOUSE DOWN HANDLER
function mousedownHandler(moviePlayer, video, e) {
    log("mouse down", video);
    if (!extensionEnabled) return;
    if (longPressTimer) clearTimeout(longPressTimer);
    longPressFlag = false;
    mouseIsDown = true;

    initialX = e.clientX;
    initialY = e.clientY;
    setPersistentSpeed = false;

    const elements = document.elementsFromPoint(e.clientX, e.clientY);

    const classList = ['show', 'ytp-progress-bar-padding',];

    if (elements.some(el => classList.some(cls => el.classList.contains(cls)))) {
        log("mousedown return early element");
        return;
    }



    longPressTimer = setTimeout(async () => {
        if (!speedPersisting) {
            originalSpeed = video.playbackRate;
        }
        longPressFlag = true;
        addIndicator(video, mainSpeed);
        video.playbackRate = mainSpeed;
    }, 320);
}


// MOUSE UP HANDLER
function mouseupHandler(moviePlayer, video, e) {
    log("mouse up", video);
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
        log("long press");
        // longPressFlag = false;

        if (speedPersisting && !setPersistentSpeed) {
            video.playbackRate = originalSpeed;
            speedPersisting = false;

        } else if (setPersistentSpeed) {
            video.playbackRate = newPersistentSpeed;
            speedPersisting = true;
        } else {
            video.playbackRate = originalSpeed;
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
    log("click", video);
    log("setPersistentSpeed", setPersistentSpeed);
    if (!extensionEnabled) return;
    mouseIsDown = false;
    clearTimeout(longPressTimer);
    clearInterval(rewindInterval);
    rewindInterval = null;

    if (longPressFlag) {
        log("long press");
        longPressFlag = false;

        if (speedPersisting && !setPersistentSpeed) {
            video.playbackRate = originalSpeed;
            speedPersisting = false;

        } else if (setPersistentSpeed) {
            video.playbackRate = newPersistentSpeed;
            speedPersisting = true;
        } else {
            video.playbackRate = originalSpeed;
            speedPersisting = false;
        }

        e.stopPropagation();
        e.preventDefault();
    }
}


function handleMouseLeave(moviePlayer, video, e) {
    log("mouse leave");
    // get elements at mouse position
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    // if #movie_player is one of them, return early
    if (elements.some(el => el.id === 'movie_player')) {
        log("returning bc mouse is over movie player");
        return;
    } else {
        log("left Movie Player");
        indicator.style.display = 'none';
        mouseIsDown = false;
        clearInterval(rewindInterval);
        clearTimeout(longPressTimer);
        rewindInterval = null;
        firstRewind = true;
        if (longPressFlag) {

            if (speedPersisting && !setPersistentSpeed) {
                video.playbackRate = originalSpeed;
                speedPersisting = false;

            } else if (setPersistentSpeed) {
                video.playbackRate = newPersistentSpeed;
                speedPersisting = true;
            } else {
                video.playbackRate = originalSpeed;
                speedPersisting = false;
            }

            longPressFlag = false;
        }
    }
}


// MOUSE MOVE HANDLER
function handleMouseMove(moviePlayer, video, e) {
    if (!extensionEnabled || !longPressFlag) return;

    // make it a bit easier to work with smaller videos
    width = moviePlayer.clientWidth;
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
            }, 500);
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
        indicator.style.backgroundColor = 'rgba(60, 60, 60, 0.7)';
    } else {
        setPersistentSpeed = false;
        indicator.style.fontWeight = 'normal';
        indicator.style.backgroundColor = 'rgba(60, 60, 60, 0.35)';
    }
}

