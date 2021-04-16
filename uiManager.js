// here is the class for the volume slider, I want to add my custom volume slider for AOE sound effects next to it
TWITCH_VOLUME_CONTROLS_DIV = ".player-controls__left-control-group";

AOE2_SLIDER_CLASS = ".aoe2soundslider";

class UIManager{

    // this sucks I know sorry.
    constructor(){

        // var copy_slider = document.querySelector(".volume-slider__slider-container").cloneNode(true);

        // couldn't figure out how to copy the twitch slider so just making my own with the same css LOL
        // if you are reading this and are like WTF, yeah this is pretty bad LOL

        var div = document.createElement("div");
        div.className = "tw-flex";
        div.classList.add(["tw-full-width", "tw-relative", "tw-z-above"]);
        
        this.slider = document.createElement("input");
        this.slider.className = "aoe2soundslider";
        // slider.classList.add("tw-range");
        this.slider.id = "player-volume-slider-AOE2TauntSounds";
        this.slider.type = "range"
        this.slider.min = "0";
        this.slider.max = "1";
        this.slider.step = "0.01";
        this.slider.dataset.target = "player-volume-slider";
        this.slider.dataset.visible = "true";
        this.slider.value = tauntPlayer.aoeSound_volume;
    
        // might be able to get rid of this
        var label = document.createElement("label");
        label.htmlFor = "player-volume-slider-AOE2TauntSounds";
        label.className = "tw-hide-accessible";
        label.innerHTML = "Volume";

        var parentDiv = document.createElement("div");
        parentDiv.className = "tw-align-items-center";
        parentDiv.classList.add(["tw-flex", "tw-full-height"]);
        

        div.appendChild(this.slider);
        // div.appendChild(lowerDiv);

        parentDiv.appendChild(div);
        parentDiv.appendChild(label);
        
        this.superParent = document.createElement("div");
        this.superParent.className = "superParent";
        this.superParent.classList = ["tw-transition", "volume-slider__slider-container"];

        this.superParent.appendChild(parentDiv);

        // add in the icon
        this.aoe2SoundIcon = document.createElement("img");
        this.aoe2SoundIcon.className = "aoe2SliderButton";
        this.aoe2SoundIcon.src = chrome.extension.getURL("images/aoe_icon_active.png");

        // if we are muted just set these values to 0

        this.hiddenMessage = document.createElement("span");
        this.hiddenMessage.innerHTML = "Mute(m)";

        // console.log("child: " + child.id);
        // if(child.id == 'aoeVolSlider'){
        //     return;
        // }

        // making a custom div for effects similar to twitch's volume control


        // tooltip for sound icon
        this.tooltip = document.createElement("div");
        this.tooltip.className = "hoverbubble";

        
        this.tooltip.appendChild(this.aoe2SoundIcon);
        this.tooltip.appendChild(this.hiddenMessage);

        this.attach();

        console.log("appended slider..");

        // for(var child=volumeControls.firstChild; child!==null; child=child.nextSibling) {
            
        //     return;
        // }

        // update our mute value
        this.showMute();

        // here we update our value based on the slider input
        this.slider.oninput = function() {
            tauntPlayer.aoeSound_volume = this.value;
            tauntPlayer.updateVolume(uiManager.slider);
        }

        // here we update the key value store for the slider
        this.slider.onchange = function(){
            
            if(tauntPlayer.aoeSound_muted){
                tauntPlayer.updateMute(false,uiManager.slider);
                uiManager.showMute();
            }
            else{
                if(tauntPlayer.aoeSound_volume == 0){
                    tauntPlayer.updateMute(true,uiManager.slider);
                    uiManager.showMute();
                    return;
                }
            }

            localStorage['aoeSoundVolume'] = tauntPlayer.aoeSound_volume;
            console.log('Slider value is cached to ' + tauntPlayer.aoeSound_volume);

        }

        // this is just for the css to display the slider when hovering the sound icon
        this.aoe2SoundIcon.onmouseover = function(){
            uiManager.slider.style.opacity = 1;
        }
        
        this.aoe2SoundIcon.onmouseleave = function(){
            uiManager.slider.style.opacity = 0;
        }

        // for muting
        this.aoe2SoundIcon.onclick = function(){
            tauntPlayer.updateMute(!tauntPlayer.aoeSound_muted,uiManager.slider);
            uiManager.showMute();
        }

        this.slider.onmouseover = function(){
            uiManager.slider.style.opacity = 1;
        }
        
        this.slider.onmouseleave = function(){
            uiManager.slider.style.opacity = 0;
        }
    
    }

    showMute(){
        if(tauntPlayer.aoeSound_muted === true){
            console.log("displaying muted");
            this.hiddenMessage.innerHTML = "Unmute (m)";
            this.aoe2SoundIcon.src = chrome.extension.getURL("images/aoe_icon_muted_4.png");
        }
        else{
            console.log("displaying unmuted");
            this.hiddenMessage.innerHTML = "Mute (m)";
            this.aoe2SoundIcon.src = chrome.extension.getURL("images/aoe_icon.png");
        }

    }

    /*
    This actually attaches or appends our exsiting elements to the Twitch GUI
    */
   attach(){
        var volumeControls = document.querySelector(TWITCH_VOLUME_CONTROLS_DIV);
        if(volumeControls){
            volumeControls.appendChild(this.tooltip);
            volumeControls.appendChild(this.superParent);
        }
        else{
            console.log("failed to attach controls! Couldn't find volume controls.");
        }
        
   }

    /*
    Hide's our UI
    */
    hide(){
        
        this.superParent.style.display = "none";
        this.tooltip.style.display = "none";
        this.slider.style.display = "none";

    }

    /*
    Show's our UI
    */
    show(){
        this.superParent.style.display = "inline";
        this.tooltip.style.display = "inline";
        this.slider.style.display = "inline";
    }

}
