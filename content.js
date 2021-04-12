waitForChat();

// this is how many taunts we have available, we assume that we have 
// 1- this specified number of taunts all initialized in the 'sounds' folder.
TAUNT_SIZE = 12;

// this is what we use to observer the DOM to get twitch chat updates.
TWITCH_CHAT_CLASS = ".chat-scrollable-area__message-container";
TWITCH_CHAT_MESSAGE_CLASS = ".text-fragment";

// path to our sounds folder
SOUNDS_PATH = "sounds/"
// OGG suffix
SOUND_FILE_SUFFIX = ".ogg"

function initiateObservers() {

    var target = document.querySelector(TWITCH_CHAT_CLASS);

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
                else
                    console.log("message did not contain a taunt.");
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

function documentOnLoad(){
    initiateObservers();
}

function waitForChat() {
    const time0 = Date.now();
    const int = setInterval(() => {
        if (Date.now() - time0 > 10 * 1000) clearInterval(int);
        chat = document.querySelector(TWITCH_CHAT_CLASS);

        if (chat) {
            clearInterval(int);
            documentOnLoad();
        }
    }, 500);
}

// this function attempts to parse a message ad executure the corresponding AOE sound
function parseMessage(message){

    // go through and find the first taunt matching our string

    // I decided to use a parseInt to make it behave true to the way
    // aoe taunts appear to work, we can do other behaviors later
    var potentialTaunt = parseInt(message);
    // first we check the front
    for(var i=TAUNT_SIZE; i >= 1; i--){

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
    tauntAudio.volume = .2;
    tauntAudio.play();

}