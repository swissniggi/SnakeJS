/* global kijs */

// --------------------------------------------------------------
// snake.Menu
// --------------------------------------------------------------
kijs.Class.define('spieltisch.Menu', {
    type: 'singleton',
    

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    construct: function() {
        this.base(arguments);
        
        this.buttons = [
            { caption: 'Snake', href: 'snake/snake.html', el: null },
            { caption: 'Pong', href: 'pong/pong.html', el: null },
            { caption: 'Pac-Man<br /><img src="pictures/pacman.gif">', href: 'pacman/pacman.html', el: null },
            { caption: 'Bomberman', href: 'bomberman/bomberman.html', el: null }
        ];
    },


    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    members: {
        buttons: null,
        music: null,
        viewPort: null,
         
        
        // PUBLIC
        init: function() {
            this.music = new Audio('sounds/menu.mp3');
            this.music.play();
            
            this.viewPort = new kijs.gui.ViewPort({
                headerCaption: 'Spieltisch',
                headerCls: 'title',
                cls: ['kijs-flexcolumn','spieltisch'],
                elements: [
                    {
                        xtype: 'kijs.gui.BoxElement',
                        html: 'Spieltisch',
                        cls: 'title'
                    }
                ]
            });
            
            // Buttons generieren
            for (var i = 0; i < this.buttons.length; i++) {
                this.buttons[i].el = new kijs.gui.Button({
                    xtype: 'kijs.gui.Button',
                    caption: this.buttons[i].caption,
                    href: this.buttons[i].href,
                    on: {
                        click: function(e, el) {
							if (!e.repeat) {
								window.location.href = el.href;
							}
                        },
                        context: this
                    }                    
                });
                this.viewPort.add(this.buttons[i].el);
            }            
            
            // render
            this.viewPort.render();
            
            // Tasten-Events
            this.viewPort.addKeyEvent(kijs.KeyMap.UP_ARROW, this.onViewPortArrowUpPress, this);
            this.viewPort.addKeyEvent(kijs.KeyMap.DOWN_ARROW, this.onViewPortArrowDownPress, this);
            
            // Focus auf 1. Button
            this.buttons[0].el.focus();
        },
        
         // Fokus auf nächster/vorheriger Button
        focusNextEl: function(previous) {
            var curButton = document.activeElement;
            var ok = false;
            
            if (curButton) {
                if (!previous && curButton.nextSibling && curButton.nextSibling.tabIndex !== -1) {
                    curButton.nextSibling.focus();
                    ok = true;
                }
                if (previous && curButton.previousSibling && curButton.previousSibling.tabIndex !== -1) {
                    curButton.previousSibling.focus();
                    ok = true;
                }
            }
            
            if (!ok) {
                if (previous) {
                    this.buttons[this.buttons.length-1].el.focus();
                } else {
                    this.buttons[0].el.focus();
                }
            }
        },
        
        // EVENTS
        onViewPortArrowDownPress: function(e) {
			if (!e.repeat) {
				this.focusNextEl(false);
			}
			setTimeout(function(){return;}, 500);
        },
        
        onViewPortArrowUpPress: function(e) {
			if (!e.repeat) {
				this.focusNextEl(true);
			}
			setTimeout(function(){return;}, 500);
        }     
    },


    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        this.base(arguments);
    }
});