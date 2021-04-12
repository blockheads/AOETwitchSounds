waitForChat();

// this is what we use to observer the DOM to get twitch chat updates.
TWITCH_CHAT_CLASS = ".chat-scrollable-area__message-container";

function initiateObservers() {

    console.log("initiating observer for chat!");

    var target = document.querySelector(".chat-scrollable-area__message-container");

    var observer = new MutationObserver(function(mutations) {  
        mutations.forEach(function(mutation) {
            //console.log(mutation.type);

            // here we extract each new chat message
            for (var i = 0; i < mutation.addedNodes.length; i++){
                let chatNode = mutation.addedNodes[i];
                
                // extract the chat message
                var message = extractChatMessage(chatNode);

                // now we can pass our message into whatever to play audio
                parseMessage(message);
            }
                
                
        });    
    });
    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true };

    observer.observe(target, config);

}

function extractChatMessage(chatNode){
    return chatNode.querySelector(".text-fragment").textContent;
}

function documentOnLoad(){
    initiateObservers();
}

function playSound(){

    var audio = new Audio(chrome.extension.getURL("sounds/Yes.ogg"));
    audio.play();

}
function waitForChat() {
    const time0 = Date.now();
    const int = setInterval(() => {
        if (Date.now() - time0 > 10 * 1000) clearInterval(int);
        chat = document.querySelector(".chat-scrollable-area__message-container");
        console.log("found chat " +  chat);
        if (chat) {
            clearInterval(int);
            documentOnLoad();
        }
    }, 500);
}

// this function attempts to parse a message ad executure the corresponding AOE sound
function parseMessage(message){

    var audio = null;

    if(message.startsWith("1") || message.endsWith("1")){
        var audio = new Audio(chrome.extension.getURL("sounds/Yes.ogg"));
    }

    if(!audio){
        console.log("Message didn't contain an emote");
        return;
    }

    audio.play();

}