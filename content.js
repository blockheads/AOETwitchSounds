var obsereverManager;
var options;
var tauntPlayer;
var uiManager;

// adding these to stop the waits
var chatInt;
var gameInt;

loadObserevers();

function loadObserevers(){

    // debugging first time run
    //localStorage.clear();

    // init our options here
    initOptions();

    if(!tauntPlayer)
        tauntPlayer = new TauntPlayer();

    launchUi();

    // if we are enabled for non-aoe2 streams or not we wait for certian elements of twitch
    if(options.nonAoeOption){
        // so our UI hides just when we start swapping maybe
        waitForChat();
    }
    else{
        waitForGame();
    }
    
}

function initOptions(){
    if(!options)
        options = new Options();
}

function launchUi(){
    // inject our slider as well for now
    // update slider
    if(!uiManager)
        uiManager = new UIManager();

}

function launchObserevers(){

    // if we have old observers running kill them
    if(obsereverManager)
        obsereverManager.kill();

    obsereverManager = new ObserverManager();
}

/*
We only load our app if the game is AOE2 :)
*/
function waitForGame() {

    if(gameInt){
        //console.log("clearing old game wait");
        clearInterval(gameInt);
    }

    const time0 = Date.now();
    gameInt = setInterval(() => {
        if (Date.now() - time0 > 10 * 1000) clearInterval(gameInt);
        var game = Array.from(document.querySelectorAll('span'))
        .find(el => el.textContent.toUpperCase().startsWith("AGE OF"));
 
        if (game) {
            clearInterval(gameInt);
            // now we can load in the observers
            //console.log("AOE sounds found AOE, loading chat.");
            //console.log("attempting to load chat now");
            
            uiManager.attach();
            uiManager.show();

            waitForChat();
            
        }
        // we need to delete any left over graphics on the screen
        else{
            if(uiManager)
                uiManager.hide();

     
            // TODO: disconnect all old observers
        }
    }, 1000);
}

function waitForChat() {

    if(chatInt){
        //console.log("clearing old chat wait");
        clearInterval(chatInt);
    }

    const time0 = Date.now();
    chatInt = setInterval(() => {
        if (Date.now() - time0 > 10 * 1000) clearInterval(chatInt);
        chat = document.querySelector(TWITCH_CHAT_CLASS);
        //console.log("AOE2 Sounds unable to find chat.");
        if (chat) {

            if(options.nonAoeOption){
                uiManager.attach();
                uiManager.show();
            }
            
            clearInterval(chatInt);
            launchObserevers();
           
        }
       
    }, 1000);

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
            options.reset();
        }
});



function extractChatMessage(chatNode){

    let messageNode = chatNode.querySelector(TWITCH_CHAT_MESSAGE_CLASS);
    if(messageNode == null)
        return "";

    return messageNode.textContent;
}


