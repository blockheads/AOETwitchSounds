const NON_AOE_OPTION = "nonAoe2StreamOption";

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', () => {

    var nonAoeOption = document.getElementById(NON_AOE_OPTION);

    updateUiElement(NON_AOE_OPTION,nonAoeOption,updateCheckbox);

    // onClick's logic below:
    nonAoeOption.addEventListener('click', function() {
        sendContent(NON_AOE_OPTION, nonAoeOption.checked);
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
                alert("Please refresh twitch.tv to access the options menu! Your options will not be saved! " +
                "If this error persists after refreshing the window then please post a github issue ticket.");
                // we should also hide the popup menu
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
