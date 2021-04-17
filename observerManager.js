// this is what we use to observer the DOM to get twitch chat updates.
TWITCH_CHAT_CLASS = ".chat-scrollable-area__message-container";
TWITCH_CHAT_MESSAGE_CLASS = ".text-fragment";
// DOM for volume slider
TWITCH_VOLUME_SLIDER_CLASS = ".tw-range"
TWITCH_PAUSE_BUTTON = "[data-a-target='player-play-pause-button']";
TWITCH_PLAYER_CONTROLS = "[data-a-target='player-controls']";
TWTICH_OVERLAY = ".video-player__overlay";
TWITCH_PLAYER_STATE = "data-a-player-state";

class ObserverManager{

    constructor(){
        this.tauntObserver = this.runTauntObserver();
        if(!this.tauntObserver){
            //console.log("couldn't get taunt observer for AOE sounds.");
            return;
        }
        this.overlayObserver = this.runOverlayObserver();
        this.pauseObserver = this.runPauseObserver();
        
        this.volumeObserver = this.runVolumeObserver();
    }

    /*
        checks the DOM for the pause button on twitch to change our taunt volume.
    */
    runPauseObserver(){
        var target = document.querySelector(TWITCH_PAUSE_BUTTON);

        if(!target){
            //console.log("got null target for pause...");
            return;
        }

        if(this.pauseObserver){
            this.pauseObserver.disconnect();
        }

        //console.log("got pause observer: " + target);
        this.updatePaused(target);

        var observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {

                obsereverManager.updatePaused(mutation.target);

            });
        });
    
        // configuration of the observer:
        var config = { attributes: true, childList: false, characterData: false };
        
        if(!observer)
            return;
    
        observer.observe(target, config);

        return observer;
        
    }

    /*
    This ensures that we can inject our volume controls ect, if not then we also basically disable our extension
    */
    runOverlayObserver(){

        var target = document.querySelector(TWTICH_OVERLAY);

        if(!target){
            //console.log("got null target for overlayObserver...");
            return;
        }

        if(this.overlayObserver){
            this.overlayObserver.disconnect();
        }

        var observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {

                for (var i = 0; i < mutation.addedNodes.length; i++){

                    if(mutation.addedNodes[i].querySelector(TWITCH_PLAYER_CONTROLS)){
                        //console.log("added back player controls");
                        // in this case we need to reinitialize our volume observer
                        // volumeObserver();
                        // streamIsPaused = false;
                        //uiManager.show();

                        // here we actually need to re-attach our controls
                        uiManager.attach();
                        uiManager.show();
                    }
                }

                for (var i = 0; i < mutation.removedNodes.length; i++){
        
                    if(mutation.removedNodes[i].querySelector(TWITCH_PLAYER_CONTROLS)){
                        //console.log("removed player controls");
                        // here we are just going to mute our extension currently, the chat isn't displayed on the screen anyways
                        // we can just use this variable
                        // streamIsPaused = true;
                        // updateVolume();
                        //uiManager.hide();
                    }
                }

            });
        });

        if(!observer)
            return;
    
        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: false };
    
        observer.observe(target, config);

        return observer;
    }

    /*
    This function is used to observer the overall volume of the twitch stream
    DOM, and edit the taunt volume based on the volume slider
    */
    runVolumeObserver(){
        var target = document.querySelector(TWITCH_VOLUME_SLIDER_CLASS);

        if(!target){
            //console.log("got null target for volume...");
            return;
        }

        if(this.volumeObserver)
            this.volumeObserver.disconnect();

        //console.log("got volume obserever target: " + target);

        // initialize our volume to this target
        tauntPlayer.sound_volume = target.getAttribute("value");
        tauntPlayer.updateVolume();

        var observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {
                tauntPlayer.sound_volume = mutation.target.getAttribute("value");
                tauntPlayer.updateVolume();
            });
        });

        // configuration of the observer:
        var config = { attributes: true, childList: false, characterData: false };

        if(!observer)
            return;

        observer.observe(target, config);

        return observer;

    }

    /*
    Determines the proper taunt to play by monitoring every twitch chat
    message.
    */
    runTauntObserver() {


        var target = document.querySelector(TWITCH_CHAT_CLASS);
        if(!target){
            //console.log("got null target for taunt...");
            return;
        }

        if(this.tauntObserver)
            this.tauntObserver.disconnect();

        //console.log("got taunt obserever target: " + target);

        var observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {
                //console.log(mutation.type);

                // here we extract each new chat message
                for (var i = 0; i < mutation.addedNodes.length; i++){

                    //playTaunt(generateRandomTaunt());
                    let chatNode = mutation.addedNodes[i];
                    
                    // extract the chat message
                    var message = extractChatMessage(chatNode);
                    tauntPlayer.play(message);
                    
                }
                    
                    
            });    
        });
        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true };

        if(!observer)
            return;

        observer.observe(target, config);

        return observer;

    }

    /*
    Helper method to update if the stream is paused or not
    */
    updatePaused(target){
        //console.log("Pausing AOE2 Sounds");

        var playing = target.getAttribute(TWITCH_PLAYER_STATE);

        if(playing === "playing"){
            //console.log("stream is playing");
            tauntPlayer.streamIsPaused = false;
        }
        else{
            //console.log("stream is paused");
            tauntPlayer.streamIsPaused = true;
        }
        
        tauntPlayer.updateVolume();
    }
    
    /* 
    This kill's all our old observers which are still running
    */
    kill(){
        //console.log("killing old AOE2 observers");
        if(this.tauntObserver)
            this.tauntObserver.disconnect();
        if(this.pauseObserver)
            this.pauseObserver.disconnect();
        if(this.overlayObserver)
            this.overlayObserver.disconnect();
        if(this.volumeObserver)
            this.volumeObserver.disconnect();

    }
}

