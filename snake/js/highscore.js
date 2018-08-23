// --------------------------------------------------------------
// snake.Highscore
// --------------------------------------------------------------
kijs.Class.define('snake.Highscore', {
    type: 'regular',     // regular, abstract, static oder singleton (default:regular)
    xtypes: [],          // Alternative Klassennamen zur Verwendung als xtype in Config-Objekten
    events: ['keydown'],          // Namen der Events dieser Klasse

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    construct: function(spielfeld, snakes, maxScore) {
        this.base(arguments);
        this.spielfeld = spielfeld;
        this.dom = spielfeld.spielfeld;
        this.context = this.dom.getContext('2d');
        this.snakes = snakes;
        this.maxScore = maxScore;
        this.frames = [];
        this.keys = [];
        this.chars = [];
    },

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    members: {
        backframe: null,
        chars: null,
        frames: null,
        keys: null,
        maxScore: null,
        name: '',
        selectedCharIndex: 0,
        selectedFrameIndex: 0,
        snakes: null,


        // PUBLIC
        init: function() {
            this.spielfeld.spielfeldwrapper.removeChild(this.spielfeld.spielfeld);

            this.backframe = document.createElement('div');
            this.backframe.classList.add('backframe');
            this.spielfeld.spielfeldwrapper.appendChild(this.backframe);

            for (i=0; i<5; i++) {
                var frameX = {};
                frameX.frontframe = document.createElement('div');
                frameX.frontframe.classList.add('frontframe');
                this.backframe.appendChild(frameX.frontframe);

                frameX.charframe = document.createElement('div');
                frameX.charframe.classList.add('charframe');
                frameX.frontframe.appendChild(frameX.charframe);

                frameX.underline = document.createElement('div');
                frameX.underline.classList.add('underline');
                frameX.frontframe.appendChild(frameX.underline);

                this.frames.push(frameX);
            }

            this.frames[this.selectedFrameIndex].underline.style.backgroundColor = 'red';
            this.frames[this.selectedFrameIndex].charframe.innerHTML = 'A';

            var index = 0;
            for (var i = 0; i < this.snakes.length; i++) {
                if (this.snakes[i].score === this.maxScore) {
                    index = i;
                    break;
                }
            }
            this.keys = this.snakes[index].controlKeys;
            
            switch(this.snakes[index].no) {
                case 1: this.backframe.classList.add('backYellow'); this.changeKeys('y'); break;
                case 2: this.backframe.classList.add('backBlue'); this.changeKeys('b'); break;
                case 3: this.backframe.classList.add('backGreen'); this.changeKeys('g'); break;
            }

            // Array füllen (Alphabet, 0-9 + ' ')
            this.fillAlphabet();
            this.chars.push(1,2,3,4,5,6,7,8,9,0,' ');
            document.body.addEventListener('keydown', kijs.createDelegate(this.inputChar, this))
        },
        
        // Belegung ändern, damit anschliessend die korrekten Funktionen ausgeführt werden
        changeKeys: function(char) {
            switch(char) {
                case 'y': [this.keys.L, this.keys.D] = [this.keys.D, this.keys.L]; [this.keys.R, this.keys.U] = [this.keys.U, this.keys.R]; break;
                case 'b': [this.keys.U, this.keys.D] = [this.keys.D, this.keys.U]; [this.keys.R, this.keys.L] = [this.keys.L, this.keys.R]; break;
                case 'g': [this.keys.L, this.keys.U] = [this.keys.U, this.keys.L]; [this.keys.R, this.keys.D] = [this.keys.D, this.keys.R]; break;
            }
        },
        
        // 'unendliches' Auswahlrad für Namenseingabe
        displayChar: function(isUp) {
            if (isUp && this.selectedCharIndex < 36) {
                this.selectedCharIndex++;
            } else if (isUp && this.selectedCharIndex === 36) {
                this.selectedCharIndex = 0;
            } else if (!isUp && this.selectedCharIndex > 0) {
                this.selectedCharIndex--;
            } else {
                this.selectedCharIndex = 36;                
            }
            this.frames[this.selectedFrameIndex].charframe.innerHTML = this.chars[this.selectedCharIndex];
        },

        // Array mit allen Buchstaben des Alphabets füllen
        fillAlphabet: function() {
            var i = 65, j = 90;
            for (; i<=j; ++i) {
                this.chars.push(String.fromCharCode(i));
            }
        },
        
        // Spiel neu laden nach Speicherung des HS
        getResponse: function() {
            document.location.reload();
        },

        inputChar: function(e) {
			if (!e.repeat) {
				switch (e.key) {
					case this.keys.L:
						if (this.selectedFrameIndex > 0) {
							this.frames[this.selectedFrameIndex].underline.style.backgroundColor = 'white';
							this.selectedFrameIndex--;
							this.frames[this.selectedFrameIndex].underline.style.backgroundColor = 'red';
                            // bei Framewechsel Inhalt nur ändern wenn leer; sonst selectedCharIndex richtig setzen
							if (this.frames[this.selectedFrameIndex].charframe.innerHTML === '') {
                                this.selectedCharIndex = 0;
                                this.frames[this.selectedFrameIndex].charframe.innerHTML = this.chars[this.selectedCharIndex];
                            } else {
                                this.selectedCharIndex = this.chars.indexOf(this.frames[this.selectedFrameIndex].charframe.innerHTML);
                            }
						}
						break;
					case this.keys.R:
						if (this.selectedFrameIndex < 4) {
							this.frames[this.selectedFrameIndex].underline.style.backgroundColor = 'white';
							this.selectedFrameIndex++;
							this.frames[this.selectedFrameIndex].underline.style.backgroundColor = 'red';
                            // bei Framewechsel Inhalt nur ändern wenn leer; sonst selectedCharIndex richtig setzen
							if (this.frames[this.selectedFrameIndex].charframe.innerHTML === '') {
                                this.selectedCharIndex = 0;
                                this.frames[this.selectedFrameIndex].charframe.innerHTML = this.chars[this.selectedCharIndex];
                            } else {
                                this.selectedCharIndex = this.chars.indexOf(this.frames[this.selectedFrameIndex].charframe.innerHTML);
                            }						
						}
						break;
					case this.keys.U:
						this.displayChar(true);
						break;
					case this.keys.D:
						this.displayChar(false);
						break;
					case 'Enter':
						if (this.frames[1].charframe.innerHTML !== '') {
                            document.body.removeEventListener('keydown', kijs.createDelegate(this.inputChar, this));
                            this.saveScore();
                        }
				}
			}
        },

        saveScore: function() {
            for (i=0; i<5; i++) {
                this.name += this.frames[i].charframe.innerHTML;
            }
            var config = {
                url:"http://127.0.0.1/spieltisch/snake/gameserver.php",
                postData:{score:this.maxScore, name:this.name},
                method:'POST',
                format:'json',
                fn:kijs.createDelegate(this.getResponse, this)
            };
            kijs.Ajax.request(config);
        }     
    },

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        this.base(arguments);
    }
});