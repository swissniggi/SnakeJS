
/* global snake */

snake.EventListener = class snake_EventListener {
    
    constructor() {
        
        this.stickRedKeys = {
            'ArrowRight' : 'R',
            'ArrowLeft' : 'L',
            'ArrowDown' : 'D',
            'ArrowUp' : 'U',
            'Shift' : 'Pause'
        };
        
        this.stickYellowKeys = {
            'd' : 'D',
            'a' : 'U',
            's' : 'L',
            'w' : 'R'
        };
        
        this.stickBlueKeys = {
            '6' : 'L',
            '4' : 'R',
            '2' : 'U',
            '8' : 'D''
        };
        
        this.stickGreenKeys = {
            'l' : 'U',
            'j' : 'D',
            'k' : 'R',
            'i' : 'L'
        };
    }
    
    _onSnakeKeyDown(e) {
        
        if (this.stickRedKeys.hasOwnProperty(e.key)) {
            this.dispatchStickRedEvent(e.key);
        }
        
        if (this.stickYellowKeys.hasOwnProperty(e.key)) {
            this.dispatchStickYellowEvent(e.key);
        }
        
        if (this.stickBlueKeys.hasOwnProperty(e.key)) {
            this.dispatchStickBlueEvent(e.key);
        }
        
        if (this.stickGreenKeys.hasOwnProperty(e.key)) {
            this.dispatchStickGreenEvent(e.key);
        }        
    }
    
    dispatchStickRedEvent(key) {
        var event = new CustomEvent('stickRed', {detail : this.stickRedKeys[key]});
        window.dispatchEvent(event);
    }
    
    dispatchStickYellowEvent(key) {
        var event = new CustomEvent('stickYellow', {detail : this.stickYellowKeys[key]});
        window.dispatchEvent(event);
    }
    
    dispatchStickBlueEvent(key) {
        var event = new CustomEvent('stickBlue', {detail : this.stickBlueKeys[key]});
        window.dispatchEvent(event);
    }
    
    dispatchStickGreenEvent(key) {
        var event = new CustomEvent('stickGreen', {detail : this.stickGreenKeys[key]});
        window.dispatchEvent(event);
    }
};
