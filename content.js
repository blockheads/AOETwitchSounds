var obsereverManager;
var options;
var tauntPlayer;
var uiManager;

loadObserevers();

function loadObserevers(){

    // init our options here
    initOptions();

    // if we are enabled for non-aoe2 streams or not we wait for certian elements of twitch
    if(options.nonAoeOption){
        waitForChat();
    }
    else{
        waitForGame();
    }
    
}

function initOptions(){
    options = new Options();
}

function resetOptions(){
    options.maxTaunts = TAUNT_MAX_DEFAULT;
    options.tauntDelay = TAUNT_DELAY_DEFAULT;
    options.nonAoeOption = NON_AOE_OPTION_DEFAULT;
}

function launchObserevers(){

    if(!tauntPlayer)
        tauntPlayer = new TauntPlayer();

    // if we have old observers running kill them
    if(obsereverManager)
        obsereverManager.kill();

    obsereverManager = new ObserverManager();

    // inject our slider as well for now
    // update slider
    if(!uiManager)
        uiManager = new UIManager();
    else{
        // in our case we can just re-attach
        uiManager.show();
        uiManager.attach();
    }
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
            console.log("attempting to load chat now");
            waitForChat();
            
        }
        // we need to delete any left over graphics on the screen
        else{
            if(uiManager)
                uiManager.hide();

            // TODO: disconnect all old observers
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
    function (request, sender, sendResponse) {
        // listen for messages sent from background.js

        // every time we change the url just try to load observers
        if (request.message === 'changedURL') {
            loadObserevers();
        }

        if (request.message === NON_AOE_OPTION) {

            if (request.value != null) {
                options.nonAoeOption = request.value;
            }
            else {
                console.log("got getter, sending back response!");
                sendResponse(options.nonAoeOption);
                return true;
            }
        }

        if (request.message === TAUNT_DELAY) {
            if (request.value != null) {
                options.tauntDelay = request.value;
            }
            else {
                sendResponse(options.tauntDelay);
                return true;
            }
        }

        if (request.message === MAX_TAUNTS) {
            if (request.value != null) {
                options.maxTaunts = request.value;
            }
            else {
                sendResponse(options.maxTaunts);
                return true;
            }
        }

        if (request.message === RESET_BUTTON) {
            resetOptions();
        }
});



function extractChatMessage(chatNode){

    let messageNode = chatNode.querySelector(TWITCH_CHAT_MESSAGE_CLASS);
    if(messageNode == null)
        return "";

    return messageNode.textContent;
}


