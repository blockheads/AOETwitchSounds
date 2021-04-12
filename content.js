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

// path to our sounds folder
SOUNDS_PATH = "sounds/"
// OGG suffix
SOUND_FILE_SUFFIX = ".ogg"

// this is the sound volume of each taunt, just default to 0 until the plugin
sound_volume = 0.0;

tauntObserverRunning=false;
volumeObserverRunning=false;

SLEEP_TIMEOUT = 1000;

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
    console.log("attempting to load observers")
    if(!volumeObserverRunning)
        volumeObserver();
    if(!tauntObserverRunning)
        waitForChat();
}

// this is our listener for URL changes
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // listen for messages sent from background.js

      // every time we change the url just try to load observers
      if (request.message === 'changedURL') {
            volumeObserverRunning = false;
            tauntObserverRunning = false;
            loadObserevers();
      }
  });

/*
    This function is used to observer the overall volume of the twitch stream
    DOM, and edit the taunt volume based on the volume slider
*/
function volumeObserver(){
    var target = document.querySelector(TWITCH_VOLUME_SLIDER_CLASS);
    if(target)
        volumeObserverRunning = true;
    else{
        console.log("got null target for volume...");
        return;

    }

    console.log("got volume obserever target: " + target);

    // initialize our volume to this target
    sound_volume = target.getAttribute("value");

    var observer = new MutationObserver(function(mutations) {  
        mutations.forEach(function(mutation) {
            sound_volume = mutation.target.getAttribute("value");
        });
    });

    // configuration of the observer:
    var config = { attributes: true, childList: false, characterData: false };

    observer.observe(target, config);
}

/*
    Determines the proper taunt to play by monitoring every twitch chat
    message.
*/
async function tauntObserver() {


    var target = document.querySelector(TWITCH_CHAT_CLASS);
    if(target)
        tauntObserverRunning = true;
    else{
        console.log("got null target for taunt...");
        return;
    }

    console.log("got taunt obserever target: " + target);

    var observer = new MutationObserver(function(mutations) {  
        mutations.forEach(function(mutation) {
            //console.log(mutation.type);

            // here we extract each new chat message
            for (var i = 0; i < mutation.addedNodes.length; i++){
                let chatNode = mutation.addedNodes[i];
                
                // extract the chat message
                var message = extractChatMessage(chatNode);
                var taunt = "";

                // now we can pass our message to get the taunt if there is one
                if(!(message === "")){
                    taunt = parseMessage(message);
                }

                // play the audio corresponding to the taunt
                if(!(taunt === "")){
                    playTaunt(taunt);
                }
                //else
                    //console.log("message did not contain a taunt.");
            }
                
                
        });    
    });
    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true };

    observer.observe(target, config);

}

function extractChatMessage(chatNode){

    let messageNode = chatNode.querySelector(TWITCH_CHAT_MESSAGE_CLASS);
    if(messageNode == null)
        return "";

    return messageNode.textContent;
}


function waitForChat() {
    const time0 = Date.now();
    const int = setInterval(() => {
        if (Date.now() - time0 > 3 * 2000) clearInterval(int);
        chat = document.querySelector(TWITCH_CHAT_CLASS);
        console.log("waited for chat failed.");
        if (chat) {
            clearInterval(int);
            console.log("waited for chat succesfull.");
            tauntObserver();
        }
    }, 2000);
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

function playTaunt(tauntString){

    // alternatively we can load each taunt on startup...
    let filePath = SOUNDS_PATH + tauntString + SOUND_FILE_SUFFIX;
    console.log("playing taunt: " + filePath);
    
    var tauntAudio = new Audio(chrome.extension.getURL(filePath));
    tauntAudio.volume = sound_volume;
    tauntAudio.play();

}