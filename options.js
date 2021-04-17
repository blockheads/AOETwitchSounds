// for the popup config options
const NON_AOE_OPTION_DEFAULT = false;
const TAUNT_DELAY_DEFAULT = 1.0;
const MAX_TAUNTS_DEFAULT = 5;

/*
These values store all the values which are configurable in the popup.js options menu
*/
class Options{

    get nonAoeOption(){
        if(localStorage[NON_AOE_OPTION]){
            var isTrueSet = (localStorage[NON_AOE_OPTION] == 'true'); 
            return isTrueSet;
        }
        return NON_AOE_OPTION_DEFAULT;
    }
    
    set nonAoeOption(value){
        localStorage[NON_AOE_OPTION] = value;
    }
    
    get tauntDelay(){
        if(localStorage[TAUNT_DELAY]){
            return localStorage[TAUNT_DELAY];
        }
        return TAUNT_DELAY_DEFAULT;
    }
    
    set tauntDelay(value){
        localStorage[TAUNT_DELAY] = value;
    }
    
    get maxTaunts(){
        if(localStorage[MAX_TAUNTS]){
            return localStorage[MAX_TAUNTS];
        }
        return MAX_TAUNTS_DEFAULT;
    }
    
    set maxTaunts(value){
        localStorage[MAX_TAUNTS] = value;
    }
}


