/*
This class handles everything involved with playing a taunt
*/

// this is how many taunts we have available, we assume that we have 
// 1- this specified number of taunts all initialized in the 'sounds' folder.
// these are the first 42 taunts in the initial edition of the game
OLD_TAUNT_SIZE = 42;

// new taunts, I am only using 3 right now maybe add more but a lot of them don't get use
// very often in the chat
NEW_TAUNTS = [103,104,105];

// path to our sounds folder
SOUNDS_PATH = "sounds/"
// OGG suffix
SOUND_FILE_SUFFIX = ".ogg"

class TauntPlayer{

    constructor(){
        // handles storing the time from the previous taunt
        this.prevTauntTimer = 0;
        this._tauntsPlaying = new Set();
        this.sound_volume = 0.0;
        this.aoeSound_volume = 0.5;
        if(localStorage['aoeSoundVolume']){
            this.aoeSound_volume = localStorage['aoeSoundVolume'];
        }
        // mute button for aoeSound
        this.aoeSound_muted = false;
        if(localStorage['aoeSoundMuted'])
            this.aoeSound_muted = localStorage['aoeSoundMuted'];
    }

    // this function attempts to parse a message ad executure the corresponding AOE sound
    parseMessage(message){

        // go through and find the first taunt matching our string

        // I decided to use a parseInt to make it behave true to the way
        // aoe taunts appear to work, we can do other behaviors later
        var potentialTaunt = parseInt(message);

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

    play(message){

        // first parse the message
        let tauntString = this.parseMessage(message);

        if(tauntString === "")
            return;

        //let tauntString = this.generateRandomTaunt();

        // obviously we don't want to play audio if the stream is paused
        if(this.streamIsPaused){
            console.log("stream is paused");
            return;
        }
    
        // alternatively could make a queue here but I believe that's a bad idea
        // this prevents too many taunts from layering at once
        if(this.tauntsPlaying.size > options.maxTaunts){
            console.log("MAX TAUNTS OF: " + options.maxTaunts + " already playing, failed to play taunt " + tauntString);
            return;
        }
    
        // we have a window of this time in which we can play a new taunt
        // this prevents too much spam
        let timer = new Date();
        //let temp = timer.getTime() - prevTauntTimer;
        //console.log("current time: " + temp);
        if(timer.getTime() - this.prevTauntTimer < options.tauntDelay){
            console.log("skipping taunt " + tauntString + " not enough time waited ");
            return;
        }
    
    
        // alternatively we can load each taunt on startup...
        let filePath = SOUNDS_PATH + tauntString + SOUND_FILE_SUFFIX;
        console.log("playing taunt: " + filePath);
        
        var tauntAudio = new Audio(chrome.extension.getURL(filePath));
        console.log("sound volume: " + this.sound_volume + " aoeSound volume: " + this.aoeSound_volume);
        tauntAudio.volume = this.sound_volume * this.aoeSound_volume;
    
        tauntAudio.addEventListener("ended", function(){
            console.log("event handled called, deleting audio, size is: " + tauntPlayer.tauntsPlaying.size);
            tauntPlayer.tauntsPlaying.delete(tauntAudio);
            console.log("event handled called, deleting audio, size is now updated to: " + tauntPlayer.tauntsPlaying.size);
        });
    
        this.tauntsPlaying.add(tauntAudio);
    
        tauntAudio.play();
    
        this.prevTauntTimer = timer.getTime();
    
    }

    /* 
    Little helper function for handling the mute value
    */
    updateMute(muted,slider){

        if(typeof(muted) === "undefined"){
            muted = this.aoeSound_muted;
        }
        else{
            // have to deal with webpage caching of booleans lol
            if(muted == "true"){
                muted = true;
            }
            else if(muted == "false"){
                muted = false;
            }

            this.aoeSound_muted = muted;
            localStorage['aoeSoundMuted'] = this.aoeSound_muted;
            console.log("muted is cached to: " + this.aoeSound_muted);
        }
        

        if(this.aoeSound_muted){
            this.aoeSound_volume = 0;
        }
        else{
            if(this.aoeSound_volume == 0 && localStorage['aoeSoundVolume']){
                this.aoeSound_volume = localStorage['aoeSoundVolume'];
                console.log("got cached slider value of " + this.aoeSound_volume);
            }
 

        }

        this.updateVolume(slider);
        
    }

    updateVolume(slider){
        // javascript method overloading lol :) bleh this code sux
        if(typeof(slider) !== "undefined")
            slider.value = this.aoeSound_volume;
    
        for (let taunt of this.tauntsPlaying){
            if(this.streamIsPaused){
                taunt.volume = 0;
            }
            else{
                taunt.volume = this.sound_volume * this.aoeSound_volume;
            }
        }
    }

    // for testing generates a random taunt
    generateRandomTaunt(){
        // just using old taunts because im lazy :)
        var temp = Math.floor(Math.random() * OLD_TAUNT_SIZE) + 1;
        return String(temp);
    }

      /*
    get's if the stream is paused or not
    */
    get streamIsPaused(){
        return this._streamIsPaused;
    }

    set streamIsPaused(value){
        this._streamIsPaused = value; 
    }

    get tauntsPlaying(){
        return this._tauntsPlaying
    }

}



