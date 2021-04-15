// this is how many taunts we have available, we assume that we have 
// 1- this specified number of taunts all initialized in the 'sounds' folder.
// these are the first 42 taunts in the initial edition of the game
OLD_TAUNT_SIZE = 42;

// new taunts, I am only using 3 right now maybe add more but a lot of them don't get use
// very often in the chat
NEW_TAUNTS = [103,104,105];

// this is what we use to observer the DOM to get twitch chat updates.
TWITCH_CHAT_CLASS = ".chat-scrollable-area__message-container";
TWITCH_CHAT_MESSAGE_CLASS = ".text-fragment";
// DOM for volume slider
TWITCH_VOLUME_SLIDER_CLASS = ".tw-range"

TWTICH_PAUSE_BUTTON = "[data-a-target='player-play-pause-button']";

// path to our sounds folder
SOUNDS_PATH = "sounds/"
// OGG suffix
SOUND_FILE_SUFFIX = ".ogg"

// this is the sound volume of each taunt, just default to 0 until the plugin
sound_volume = 0.0;

aoeSound_volume = 0.5;

// mute button for aoeSound
aoeSound_muted = false;

// scalar to volume, probably add slider for this
VOLUME_SCALAR = 2.0;

AOE2_SLIDER_CLASS = ".aoe2soundslider";

// here is the class for the volume slider, I want to add my custom volume slider for AOE sound effects next to it
TWITCH_VOLUME_CONTROLS_DIV = ".player-controls__left-control-group";

const taunts_playing = new Set();

SLEEP_TIMEOUT = 1000;

// how long can each taunt be spammed in between each other in ms
TAUNT_COOLDOWN_TIME = 500;

// measure's previous taunts time since played
prevTauntTimer = 0;

// maximum amount of taunts allowed to layer at the same time
TAUNT_MAX = 5;

// for the popup config options
const NON_AOE_OPTION_DEFAULT = false;
const TAUNT_DELAY_DEFAULT = 1.0;
const MAX_TAUNTS_DEFAULT = 5;

const NON_AOE_OPTION = "nonAoe2StreamOption";
const TAUNT_DELAY = "tauntDelay";
const MAX_TAUNTS = "maxTaunts";

var launched = false;

var streamIsPaused=false;

function getNonAoeOption(){
    if(localStorage[NON_AOE_OPTION]){
        var isTrueSet = (localStorage[NON_AOE_OPTION] == 'true'); 
        return isTrueSet;
    }
    return NON_AOE_OPTION_DEFAULT;
}

function setNonAoeOption(value){
    localStorage[NON_AOE_OPTION] = value;
}

function getTauntDelay(){
    if(localStorage[TAUNT_DELAY]){
        return localStorage[TAUNT_DELAY];
    }
    return TAUNT_DELAY_DEFAULT;
}

function setTauntDelay(value){
    TAUNT_COOLDOWN_TIME = value;
    localStorage[TAUNT_DELAY] = value;
}


function getMaxTaunts(){
    if(localStorage[MAX_TAUNTS]){
        return localStorage[MAX_TAUNTS];
    }
    return MAX_TAUNTS_DEFAULT;
}

function setMaxTaunts(value){
    TAUNT_MAX = value;
    localStorage[MAX_TAUNTS] = value;
}

//rootObserver();

// here we observe the root to switch on our other obserevers if possible
/*
    There might be a better way to detect updates on the webpage than using this pattern
    but whatever...
*/
// async function rootObserver(){

//     // we just observer the whole webpage with the root observer
//     var target = document;

//     console.log("loaded root observer: " + target);

//     var observer = new MutationObserver(function(mutations) {  
//         mutations.forEach(function(mutation) {

//             //console.log("found change in root owo");
//             if(!tauntObserverRunning){

//                 // attempt to get element needed for taunt Observer on modification to DOM
//                 tauntObserver();

//             }
//             else if(!volumeObserverRunning){
//                 volumeObserver();
//             }
//             else{
//                 // kill our observer
//                 console.log("closing root observer...");
//                 observer.disconnect();
//             }
//         });
//     });

//     var config = { attributes: true, childList: true, characterData: true, subtree: true };
//     observer.observe(target, config);
// }

loadObserevers();

function loadObserevers(){

    // init our options here
    initOptions();

    // if we are enabled for non-aoe2 streams or not we wait for certian elements of twitch
    if(getNonAoeOption()){
        waitForChat();
    }
    else{
        waitForGame();
    }
    
}

function initOptions(){
    TAUNT_MAX = getMaxTaunts();
    TAUNT_COOLDOWN_TIME = getTauntDelay();
}

function launchObserevers(){
    if(localStorage['launched'])
        return;
    localStorage['launched'] = true;

    console.log("launched");

    volumeObserver();
    tauntObserver();
    pauseObserver();
}

/*
We only load our app if the game is AOE2 :)
*/
function waitForGame() {
    const time0 = Date.now();
    const int = setInterval(() => {
        if (Date.now() - time0 > 3 * 2000) clearInterval(int);
        var game = Array.from(document.querySelectorAll('span'))
        .find(el => el.textContent.toUpperCase().startsWith("AGE OF"));

        console.log("waited for game failed.");
        if (game) {
            clearInterval(int);
            // now we can load in the observers
            console.log("waited for game succesfull.");
            console.log("attempting to load observers");
            launchObserevers();
        }
        // we need to delete any left over graphics on the screen
        else{
            var volumeControls = document.querySelector(TWITCH_VOLUME_CONTROLS_DIV);

            if(volumeControls){
                // check if we already initialized, don't make another one otherwise
                var superParent = document.querySelector(".superParent");

                // just return out if we already have initialized the ui of course
                if(superParent)
                    superParent.style.display = "none";
                

                var tooltip = document.querySelector(".hoverbubble");

                if(tooltip)
                    tooltip.style.display = "none";

                var slider = document.querySelector(".aoe2soundslider");
                if(slider){
                    slider.style.display = "none";
                }

            }
        }
    }, 2000);
}

function waitForChat() {
    const time0 = Date.now();
    const int = setInterval(() => {
        if (Date.now() - time0 > 3 * 2000) clearInterval(int);
        chat = document.querySelector(TWITCH_CHAT_CLASS);
        console.log("waited for chat failed.");
        if (chat) {
            clearInterval(int);
            launchObserevers();
        }
    }, 2000);
}

// this is our listener for URL changes
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // listen for messages sent from background.js

      // every time we change the url just try to load observers
      if (request.message === 'changedURL') {
            loadObserevers();
      }

      if(request.message === NON_AOE_OPTION){

          if(request.value != null){
              console.log("got setter");
            setNonAoeOption(request.value);
          }
          else{
            console.log("got getter, sending back response!");
            sendResponse(getNonAoeOption());
            return true;
          }
      }

      if(request.message === TAUNT_DELAY){
        if(request.value != null){
            setTauntDelay(request.value)
        }
        else{
            console.log("IN GETTER 1");
          sendResponse(getTauntDelay());
          return true;
        }
      }

      if(request.message === MAX_TAUNTS){
        if(request.value != null){
            setMaxTaunts(request.value)
        }
        else{
            console.log("IN GETTER 2");
          sendResponse(getMaxTaunts());
          return true;
        }
      }
  });


function displayVolumeSlider(){

    var volumeControls = document.querySelector(TWITCH_VOLUME_CONTROLS_DIV);

    if(volumeControls){
        var superParent = document.querySelector(".superParent");

        // just return out if we already have initialized the ui of course

        var done = false;

        if(superParent){
            superParent.style.display = "block";
            done = true;
        }

        var tooltip = document.querySelector(".hoverbubble");

        if(tooltip){
            done = true
            tooltip.style.display = "block";
        }

        var slider = document.querySelector(".aoe2soundslider");
        if(slider){
            done = true;
            slider.style.display = "block";
        }

        if(done) return;
        

       // var copy_slider = document.querySelector(".volume-slider__slider-container").cloneNode(true);

        // couldn't figure out how to copy the twitch slider so just making my own with the same css LOL
        // if you are reading this and are like WTF, yeah this is pretty bad LOL

        var div = document.createElement("div");
        div.className = "tw-flex";
        div.classList.add(["tw-full-width", "tw-relative", "tw-z-above"]);
        
        var slider = document.createElement("input");
        slider.className = "aoe2soundslider";
        // slider.classList.add("tw-range");
        slider.id = "player-volume-slider-AOE2TauntSounds";
        slider.type = "range"
        slider.min = "0";
        slider.max = "1";
        slider.step = "0.01";
        slider.dataset.target = "player-volume-slider";
        slider.dataset.visible = "true";

        // no idea why I got rid of this code????
        if(localStorage['aoeSoundVolume']){
            aoeSound_volume = localStorage['aoeSoundVolume'];
            updateVolume();
        }
        else
            slider.value = .5;

        // idk more div shit
        var lowerDiv = document.createElement("div");
        lowerDiv.className = "tw-absolute";
        lowerDiv.classList.add(["tw-border-radius-large", "tw-bottom-0", "tw-flex", 
        "tw-flex-column", "tw-full-width", "tw-justify-content-center", "tw-range__fill", 
        "tw-range__fill--overlay", "tw-top-0", "tw-z-below"]);
      
        var lowerDiv2 = document.createElement("div");
        lowerDiv2.className = "tw-border-radius-large";
        lowerDiv2.classList = ["tw-range__fill-container"];

        var lowerDiv3 = document.createElement("div");
        lowerDiv3.className = "tw-range__fill-value-selector";

        lowerDiv.appendChild(lowerDiv3);
        lowerDiv.appendChild(lowerDiv2);

        var label = document.createElement("label");
        label.htmlFor = "player-volume-slider-AOE2TauntSounds";
        label.className = "tw-hide-accessible";
        label.innerHTML = "Volume";

        var parentDiv = document.createElement("div");
        parentDiv.className = "tw-align-items-center";
        parentDiv.classList.add(["tw-flex", "tw-full-height"]);
        

        div.appendChild(slider);
        div.appendChild(lowerDiv);

        parentDiv.appendChild(div);
        parentDiv.appendChild(label);
        
        var superParent = document.createElement("div");
        superParent.className = "superParent";
        superParent.classList = ["tw-transition", "volume-slider__slider-container"];

        superParent.appendChild(parentDiv);

        // add in the icon
        var aoe2SoundIcon = document.createElement("img");
        aoe2SoundIcon.className = "aoe2SliderButton";
        aoe2SoundIcon.src = chrome.extension.getURL("images/aoe_icon_active.png");

        // if we are muted just set these values to 0

        var hiddenMessage = document.createElement("span");
        hiddenMessage.innerHTML = "Mute(m)";
        
        mute(aoe2SoundIcon, slider, hiddenMessage, localStorage['aoeSoundMuted']);
        

        // console.log("child: " + child.id);
        // if(child.id == 'aoeVolSlider'){
        //     return;
        // }

        // making a custom div for effects similar to twitch's volume control


        // tooltip for sound icon
        var tooltip = document.createElement("div");
        tooltip.className = "hoverbubble";

        
        tooltip.appendChild(aoe2SoundIcon);
        tooltip.appendChild(hiddenMessage);
        volumeControls.appendChild(tooltip);
        volumeControls.appendChild(superParent);
        

        console.log("appended slider..");

        // for(var child=volumeControls.firstChild; child!==null; child=child.nextSibling) {
            
        //     return;
        // }

        // here we update our value based on the slider input
        slider.oninput = function() {
            aoeSound_volume = this.value;
            updateVolume(slider);
        }

        // here we update the key value store for the slider
        slider.onchange = function(){
            
            if(aoeSound_muted){
                mute(aoe2SoundIcon, slider, hiddenMessage, false);
            }
            else{
                if(aoeSound_volume == 0){
                    mute(aoe2SoundIcon, slider, hiddenMessage, true);
                    return;
                }
            }

            localStorage['aoeSoundVolume'] = aoeSound_volume;
            console.log('Slider value is cached to ' + aoeSound_volume);

        }

        // this is just for the css to display the slider when hovering the sound icon
        aoe2SoundIcon.onmouseover = function(){
            slider.style.opacity = 1;
        }
        
        aoe2SoundIcon.onmouseleave = function(){
            slider.style.opacity = 0;
        }

        // for muting
        aoe2SoundIcon.onclick = function(){
            aoeSound_muted = !aoeSound_muted;
            mute(aoe2SoundIcon, slider, hiddenMessage, aoeSound_muted);
            
        }

        slider.onmouseover = function(){
            slider.style.opacity = 1;
        }
        
        slider.onmouseleave = function(){
            slider.style.opacity = 0;
        }
    }
}

/* 
Little helper function for handling the mute value
*/
function mute(aoe2SoundIcon, slider, hiddenMessage, muted){

    // have to deal with webpage caching of booleans lol
    if(muted == "true"){
        muted = true;
    }
    else if(muted == "false"){
        muted = false;
    }

    aoeSound_muted = muted;
    localStorage['aoeSoundMuted'] = aoeSound_muted;
    console.log("muted is cached to: " + aoeSound_muted);

    if(aoeSound_muted === true){
        console.log("displaying muted");
        hiddenMessage.innerHTML = "Unmute (m)";
        aoe2SoundIcon.src = chrome.extension.getURL("images/aoe_icon_muted_4.png");
    }
    else{
        console.log("displaying unmuted");
        hiddenMessage.innerHTML = "Mute (m)";
        aoe2SoundIcon.src = chrome.extension.getURL("images/aoe_icon.png");
    }

    if(aoeSound_muted){
        aoeSound_volume = 0;
    }
    else{
        if(aoeSound_volume == 0 && localStorage['aoeSoundVolume']){
            aoeSound_volume = localStorage['aoeSoundVolume'];
            console.log("got cached slider value of " + aoeSound_volume);
        }
        else
            console.log("slider cache value failed or special case :)");

    }
    

    updateVolume(slider);
    
}

/*
    This function is used to observer the overall volume of the twitch stream
    DOM, and edit the taunt volume based on the volume slider
*/
function volumeObserver(){
    var target = document.querySelector(TWITCH_VOLUME_SLIDER_CLASS);

    if(!target){
        console.log("got null target for volume...");
        return;
    }
    // update slider
    displayVolumeSlider();

    console.log("got volume obserever target: " + target);

    // initialize our volume to this target
    sound_volume = target.getAttribute("value");

    var observer = new MutationObserver(function(mutations) {  
        mutations.forEach(function(mutation) {
            sound_volume = mutation.target.getAttribute("value");
            updateVolume();
        });
    });

    // configuration of the observer:
    var config = { attributes: true, childList: false, characterData: false };

    observer.observe(target, config);

}

/*
    checks the DOM for the pause button on twitch to change our taunt volume.
*/
function pauseObserver(){
    var target = document.querySelector(TWTICH_PAUSE_BUTTON);

    if(!target){
        console.log("got null target for pause...");
        return;
    }

    console.log("got pause observer: " + target);

    // target.addEventListener('click', function(){
    //     streamIsPaused = !streamIsPaused;
    //     console.log("stream is paused");
    //     updateVolume();
    // });

    var observer = new MutationObserver(function(mutations) {  
        mutations.forEach(function(mutation) {
            var playing = mutation.target.getAttribute("data-a-player-state");

            if(playing == "playing"){
                streamIsPaused = false;
            }
            else{
                streamIsPaused = true;
            }
            updateVolume();
        });
    });
  
      // configuration of the observer:
      var config = { attributes: true, childList: false, characterData: false };
  
      observer.observe(target, config);


}

// function aoeVolumeObserver(){
    
//     // observer for the aoe volume slider
//     var target = document.querySelector(AOE2_SLIDER_CLASS);

//     console.log("aoe volume target: " + target)

//     var observer = new MutationObserver(function(mutations) {  
//         mutations.forEach(function(mutation) {
//             console.log("got mutation for aoe volume.");
//             aoeSound_volume = mutation.target.getAttribute("value");
//             // cache our value as well
//             chrome.storage.local.set({'aoeSoundVolume': aoeSound_volume}, function() {
//                 console.log('Value is set to ' + value);
//             });
//         });
//     });

//     // configuration of the observer:
//     var config = { attributes: true, childList: false, characterData: true };

//     observer.observe(target, config);
// }

/*
    Determines the proper taunt to play by monitoring every twitch chat
    message.
*/
async function tauntObserver() {


    var target = document.querySelector(TWITCH_CHAT_CLASS);
    if(!target){
        console.log("got null target for taunt...");
        return;
    }

    console.log("got taunt obserever target: " + target);

    var observer = new MutationObserver(function(mutations) {  
        mutations.forEach(function(mutation) {
            //console.log(mutation.type);

            // here we extract each new chat message
            for (var i = 0; i < mutation.addedNodes.length; i++){
                playTaunt(generateRandomTaunt());
                // let chatNode = mutation.addedNodes[i];
                
                // // extract the chat message
                // var message = extractChatMessage(chatNode);
                // var taunt = "";

                // // now we can pass our message to get the taunt if there is one
                // if(!(message === "")){
                //     taunt = parseMessage(message);
                // }

                // // play the audio corresponding to the taunt
                // if(!(taunt === "")){
                //     playTaunt(taunt);
                // }
                // else
                //     console.log("message did not contain a taunt.");
            }
                
                
        });    
    });
    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true };

    observer.observe(target, config);

}

// for testing generates a random taunt
function generateRandomTaunt(){
    // just using old taunts because im lazy :)
    var temp = Math.floor(Math.random() * OLD_TAUNT_SIZE) + 1;
    return String(temp);
    
}

function extractChatMessage(chatNode){

    let messageNode = chatNode.querySelector(TWITCH_CHAT_MESSAGE_CLASS);
    if(messageNode == null)
        return "";

    return messageNode.textContent;
}


// this function attempts to parse a message ad executure the corresponding AOE sound
function parseMessage(message){

    // go through and find the first taunt matching our string

    // I decided to use a parseInt to make it behave true to the way
    // aoe taunts appear to work, we can do other behaviors later
    var potentialTaunt = parseInt(message);
    let new_taunt_size = NEW_TAUNTS.length - 1;

    // first we check the new taunts as they are the largest
    for(var i=NEW_TAUNTS[NEW_TAUNTS.length - 1]; i >= 0; i--){
        if(i == potentialTaunt)
            return String(i);
    }

    // first we check the front
    for(var i=OLD_TAUNT_SIZE; i >= 1; i--){

        if(i == potentialTaunt)
            return String(i);
        
    }

    // then the back, I decided to detect taunts that were at the end
    // of messages since some chatters preffer that
    // deleting this for now to make it act like the game, maybe add back later
    // for(var i=TAUNT_SIZE; i >= 1; i--){
    //     var tauntString = String(i);

    //     if(message.endsWith(tauntString))
    //         return tauntString;
        
    // }
    
    // just return the empty string otherwise...
    return "";

}


function updateVolume(slider){
    // javascript method overloading lol :) bleh this code sux
    if(typeof(slider) !== "undefined")
        slider.value = aoeSound_volume;

    for (let taunt of taunts_playing){
        if(streamIsPaused){
            taunt.volume = 0;
        }
        else{
            taunt.volume = sound_volume * aoeSound_volume;
        }
    }
}

function playTaunt(tauntString){

    // obviously we don't want to play audio if the stream is paused
    if(streamIsPaused)
       return;

    // alternatively could make a queue here but I believe that's a bad idea
    // this prevents too many taunts from layering at once
    if(taunts_playing.size > TAUNT_MAX){
        //console.log("MAX TAUNTS OF: " + TAUNT_MAX + " already playing, failed to play taunt " + tauntString);
        return;
    }

    // we have a window of this time in which we can play a new taunt
    // this prevents too much spam
    let timer = new Date();
    let temp = timer.getTime() - prevTauntTimer;
    //console.log("current time: " + temp);
    if(timer.getTime() - prevTauntTimer < TAUNT_COOLDOWN_TIME){
        //console.log("skipping taunt " + tauntString + " not enough time waited ");
        return;
    }


    // alternatively we can load each taunt on startup...
    let filePath = SOUNDS_PATH + tauntString + SOUND_FILE_SUFFIX;
    console.log("playing taunt: " + filePath);
    
    var tauntAudio = new Audio(chrome.extension.getURL(filePath));
    tauntAudio.volume = sound_volume * aoeSound_volume;

    tauntAudio.addEventListener("ended", function(){
        taunts_playing.delete(tauntAudio);
    });

    taunts_playing.add(tauntAudio);

    tauntAudio.play();

    prevTauntTimer = timer.getTime();

}