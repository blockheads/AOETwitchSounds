const NON_AOE_OPTION = "nonAoe2StreamOption";
const TAUNT_DELAY = "tauntDelay";
const MAX_TAUNTS = "maxTaunts";
const RESET_BUTTON = "resetButton";

const TAUNT_DELAY_LABEL = "tauntDelayLabel";
const MAX_TAUNTS_LABEL = "maxTauntsLabel";

var WARNING_MESSAGE_DISPLAYED = false;

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', () => {

    // non aoe stream option
    var nonAoeOption = document.getElementById(NON_AOE_OPTION);
    updateUiElement(NON_AOE_OPTION,nonAoeOption,updateCheckbox);

    // onClick's logic below:
    nonAoeOption.addEventListener('click', function() {
        sendContent(NON_AOE_OPTION, nonAoeOption.checked);
    });

    // taunt delay option
    var tauntDelay = document.getElementById(TAUNT_DELAY);
    updateUiElement(TAUNT_DELAY,tauntDelay,updateSlider);

    tauntDelay.addEventListener('change', function() {
        sendContent(TAUNT_DELAY, tauntDelay.value);
    });

    // taunt delay text box
    // the update UI element function might not of been the best idea now that I think about it...
    var tauntDelayLabel = document.getElementById(TAUNT_DELAY_LABEL);
    updateUiElement(TAUNT_DELAY, tauntDelayLabel, updateLabel);

    // this updates the textbox
    tauntDelay.addEventListener('input', function() {
        updateLabel(tauntDelayLabel,tauntDelay.value);
    });

    // max taunts option
    var maxTaunts = document.getElementById(MAX_TAUNTS);
    updateUiElement(MAX_TAUNTS,maxTaunts,updateSlider);
    
    maxTaunts.addEventListener('change', function() {
        sendContent(MAX_TAUNTS, maxTaunts.value);
    });

    var maxTauntsLabel = document.getElementById(MAX_TAUNTS_LABEL);
    updateUiElement(MAX_TAUNTS, maxTauntsLabel, updateLabel);

    // this updates the textbox
    maxTaunts.addEventListener('input', function() {
        updateLabel(maxTauntsLabel,maxTaunts.value);
    });

    var resetButton = document.getElementById(RESET_BUTTON);

    resetButton.addEventListener('click', function(){
        sendContent(RESET_BUTTON, "toggle");
    });
    
});

/*
This function passed a message to our message handler in content.js so we can actually
do things with the options being changed from the default_popup window
*/
function sendContent(messageContent, messageValue){
    
    // loads in when we are loaded
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: messageContent, value: messageValue});
    });
    
}

/* 
This function takes in the message to send to the content script in order to return some response
whcih then get's sent to a function specified as the second paramater in the function.
*/
async function updateUiElement(messageContent, uiElement, func){

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: messageContent}, function(response){
            if (window.chrome.runtime.lastError) {
                // do you work, that's it. No more unchecked error
                if(!WARNING_MESSAGE_DISPLAYED)
                    alert("Please refresh twitch.tv to access the options menu! Your options will not be saved! " +
                "If this error persists after refreshing the window then please post a github issue ticket.");
                // we should also hide the popup menu
                WARNING_MESSAGE_DISPLAYED = true;
                return;
              }
              
              func(uiElement,response);
              
        });
    });

}

/*
This function updates a checkbox checked property
*/
function updateCheckbox(checkbox, value){
    // javascript :)
    checkbox.checked = value;
}

// updates a slider
function updateSlider(slider, value){
    // javascript :)
    slider.value = value;
}

function updateLabel(label, value){
    label.value = value;
}