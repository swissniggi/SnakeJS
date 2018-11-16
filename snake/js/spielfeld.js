/* global snake, kijs */

// --------------------------------------------------------------
// snake.Spielfeld
// --------------------------------------------------------------
kijs.Class.define('snake.Spielfeld', {
    type: 'singleton',     // regular, abstract, static oder singleton (default:regular)
    xtypes: [],          // Alternative Klassennamen zur Verwendung als xtype in Config-Objekten
    events: ['keydown'],          // Namen der Events dieser Klasse

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    construct: function() {
        this.base(arguments);
        this.fruits = [];
        this.snakes = [];
        this.obstacles = [];
        this.balken = [];
        this.rules = [];
    },

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    members: {
        balken: null,
        dom: null,
        eventhandler: null,
        fruits: null,
        fruitsCount: 20,
        height: 0,
        highscore: null,
        isRunning: false,
        magicSnakeOne: false,
        magicSnakeTwo: false,
        magicSnakeThree: false,
        magicSnakeFour: false,
        maxScore: null,
        msg: null,
        obstacles: null,
        rules: null,
        snakemusic: null,
        snakes: null,
        snakeOne: false,
        snakeTwo: false,
        snakeThree: false,
        snakeFour: false,
        speed: 6,
        spielfeld: null,
        spielfeldwrapper: null,
        width: 0,
        _loopHandle: null,


        // PUBLIC
        init: function() {
            // Spielfeldwrapper und Spielfeld erstellen
            this.spielfeldwrapper = document.createElement('div');
            this.spielfeldwrapper.classList.add('spielfeldwrapper');
            document.body.appendChild(this.spielfeldwrapper);

            this.spielfeld = document.createElement('canvas');
            this.spielfeldwrapper.appendChild(this.spielfeld);
            
            // Anweisungen und Scorebalken erstellen
            for (i = 0; i < 4; i++) {
                var el = document.createElement('section');
                var ru = document.createElement('div');
                ru.innerHTML = 'Bewege den Joystick nach oben um mitzuspielen<br /><br />Druecke den schwarzen Button fuer einen CPU-Spieler';
                ru.innerHTML += '<br /><br />Druecke den roten Button um das Spiel zu starten';
                el.classList.add('balken','punkte'+(i+1));
                ru.classList.add('balken','rules'+(i+1));
                this.balken.push(el);
                this.rules.push(ru);
                document.body.appendChild(ru);
                document.body.appendChild(el);
            }
            this.speed = window.localStorage.speed ? parseInt(window.localStorage.speed) : 6;
            var difficulty = '';
            switch (this.speed) {
                case 3: difficulty = 'leicht'; break;
                case 6: difficulty = 'mittel'; break;
                case 9: difficulty = 'schwer'; break;
            }
            this.balken[0].innerHTML = 'Schwierigkeit: '+difficulty;
            this.eventhandler = kijs.createDelegate(this.setPlayers, this);
            window.addEventListener('keydown', this.eventhandler);
        },
        
        defineAnimationFrame: function(_this) {
            var loopWrapper = function() {
                _this.loop.call(_this);
                if (_this.isRunning) {
                    _this._loopHandle = window.requestAnimationFrame(loopWrapper);
                }
            };
            this._loopHandle = window.requestAnimationFrame(loopWrapper);
        },
        
        gameOver: function(lastSnake) {
            this.snakemusic.pause();
            this.snakemusic = null;
            this.msg = '';
            var maxScore = 0;
            var s_names = ['Rote', 'Gelbe', 'Blaue', 'Gruene'];

            kijs.Array.each(this.snakes, function(snake) {
                if (snake.basename === 'Snake') {
                    if (snake.score > maxScore) {
                        maxScore = snake.score;
                    }
                    this.msg += '<p><span style=\"color: ' + snake.borderColor + '\">' + s_names[snake.no] 
                             + '</span> Schlange: <span class="highscore_score">' + snake.score + ' Punkte</span></p>';
                }
            }, this);

            if ((this.snakes.length > 1 && !this.magicMode) || (this.snakes.length > 2 && this.magicMode)) {
                this.msg += '<p>Die <span style="color: ' + lastSnake.borderColor + '">' + s_names[lastSnake.no] + '</span> Schlange hat am laengsten ueberlebt!</p>';
                //-> das Font 'Silkscreen' hat keine Umlaute, d.h. ä = ae, ü = ue
            }
            this.maxScore = maxScore;

            // Highscore auslesen
            var config = {
                url:"http://127.0.0.1/spieltisch/snake/gameserver.php",
                postData:{score:maxScore, name:''},
                method:'POST',
                format:'json',
                fn:kijs.createDelegate(this.getResponse, this)
            };
            kijs.Ajax.request(config);
            this.isRunning = false;
        },
        
        getResponse: function(response) {
            this.highscore = response.split(';');
            var gameOver = new snake.GameOver(this, this.snakes, this.maxScore, this.highscore, this.msg);
            gameOver.prepareMsg();
        },
        
        loop: function() {
            // Spielfeld zeichnen
            this.paint();

            // Hindernisse zeichnen
            kijs.Array.each(this.obstacles, function(obstacle) {
                obstacle.paint();
            }, this);
            
            // Früchte zeichnen
            kijs.Array.each(this.fruits, function(fruit) {
                fruit.paint();                
            }, this);

            // Schlangen zeichnen
            var length = -1;
            kijs.Array.each(this.snakes, function(snake) {
                snake.paint();
                if (this.isRunning && !snake.isGameOver && snake.score > length) {
                    length = snake.score;
                    this.longestSnake = snake;
                }
            }, this);
            
            // Krone zeichnen
            this.longestSnake.paintCrown();
        },
        
        paint: function() {
            if (!this.dom) {
                this.dom = this.spielfeld;
            }            
            this.dom.width = this.width;
            this.dom.height = this.height;
        },
        
        playAudio: function() {
            this.snakemusic.play();
        },
        
        prepare: function() {
            // Höhe und Breite des Spielfelds festlegen
            this.width = this.spielfeldwrapper.offsetWidth;
            this.height = this.spielfeldwrapper.offsetHeight;      
            
            // Spielfeldgrösse anpassen
            if (this.snakeOne) {
                this.height -= 25;
            }
            if (this.snakeTwo) {
                this.width -= 25;
            }
            if (this.snakeThree) {
                this.height -= 25;
            }
            if (this.snakeFour) {
                this.width -= 25;
            }

            var _this = this;

            window.addEventListener('keydown', function(e) {
                _this.raiseEvent('keydown', e);
            }, false);

            // Snakes erstellen
             if (this.snakeOne) {
                this.spielfeldwrapper.style.marginBottom = "25px";
                this.snakes.push(new snake.Snake(this, 0, this.width/2-17, this.height-35, 'U', '#FF0000', {R:'ArrowRight', L:'ArrowLeft', D:'ArrowDown', U:'ArrowUp', Enter:'q'}));                               
            }
            if (this.snakeTwo) {
                this.spielfeldwrapper.style.marginLeft = "25px";
                this.snakes.push(new snake.Snake(this, 1, 35, this.height/2-17, 'R', '#FFE000', {D:'d', U:'a', L:'s', R:'w', Enter:'x'}));                                
            }
            if (this.snakeThree) {
                this.spielfeldwrapper.style.marginTop = "25px";
                this.snakes.push(new snake.Snake(this, 2, this.width/2-17, 35, 'D', '#0080FF', {L:'6', R:'4', U:'2', D:'8', Enter:'y'}));                               
            }
            if (this.snakeFour) {
                this.spielfeldwrapper.style.marginRight = "25px";
                this.snakes.push(new snake.Snake(this, 3, this.width-35, this.height/2-17, 'L', '#01DF3A', {U:'l', D:'j', R:'k', L:'i', Enter:'z'}));                                
            }
                        
            if (this.magicSnakeOne) {
                this.snakes.push(new snake.MagicSnake(this, this.width/4-17, this.height/4*3-17, 'R', '#C0C0C0'));
            }
            
            if (this.magicSnakeOne) {
                this.snakes.push(new snake.MagicSnake(this, this.width/4-17, this.height/4-17, 'D', '#8A2BE2'));
            }
            
            if (this.magicSnakeOne) {
                this.snakes.push(new snake.MagicSnake(this, this.width/4*3-17, this.height/4-17, 'R', '#00FFFF'));
            }
            
            if (this.magicSnakeOne) {
                this.snakes.push(new snake.MagicSnake(this, this.width/4*3-17, this.height/4*3-17, 'U', '#FF1493'));
            }
            
            kijs.Array.each(this.snakes, function(snake) {
                snake.speed = this.speed;
            }, this);
		
	    window.localStorage.setItem('speed', this.speed);
            
            // Hindernisse erstellen
            for (i = 0; i < 8; i++) {
                var obstacle = new snake.Obstacle(this);
                this.obstacles.push(obstacle);
                // Koordinaten des Hindernisses neu berechnen wenn auf anderem Hindernis
                for (j = 0; j < this.obstacles.length; j++) {
                    if (obstacle !== this.obstacle[j] && (obstacle.x<=this.obstacles[j].x+this.obstacles[j].width && obstacle.x+obstacle.width>=this.obstacles[j].x) &&
                            (obstacle.y<=this.obstacles[j].y+this.obstacles[j].height && obstacle.y+obstacle.height>=this.obstacles[j].y)) {
                        obstacle.replace();
                        j = 0;
                    }
                }
            }
            
            // Fruits erstellen
            for (i = 0; i < this.fruitsCount; i++) {
                var fruit = new snake.Fruit(this);
                this.fruits.push(fruit);
                // Frucht neu platzieren wenn auf Hindernis
                for (j = 0; j < this.obstacles.length; j++) {
                    if ((fruit.x<=this.obstacles[j].x+this.obstacles[j].width && fruit.x+fruit.width>=this.obstacles[j].x) &&
                            (fruit.y<=this.obstacles[j].y+this.obstacles[j].height && fruit.y+fruit.height>=this.obstacles[j].y)) {
                        fruit.replace();
                        j = 0;
                    }
                }
            }
            
            this.updateScores();

            // Loop starten
            this.defineAnimationFrame(_this);
            
            // Musik starten
            this.snakemusic = new Audio('../sounds/snakemusic.mp3');
            this.snakemusic.addEventListener('ended', kijs.createDelegate(this.playAudio, this));
            this.snakemusic.play();
            this.isRunning = true;
        },
        
        setPlayers: function(e) {
            var difficulty = '';
            
			if (!e.repeat) {
				switch (e.keyCode) {
                    case 37:
                        // Schwierigkeit runter
                        if (this.speed > 3) {
                            this.speed -= 3;
                        }                                     
                        switch (this.speed) {
                            case 3: difficulty = 'leicht'; break;
                            case 6: difficulty = 'mittel'; break;
                        }
                        this.balken[0].innerHTML = 'Schwierigkeit: ' + difficulty;
                        break;
                    case 38:
                        // roter Balken aktivieren
                        this.balken[0].classList.add('slidefrombottom');
                        this.balken[3].classList.add('redSnakeVisible');
                        this.snakeOne = true;
                        break;
                    case 39:
                        // Schwierigkeit hoch
                        if (this.speed < 9) {
                            this.speed += 3;
                        }
                        switch (this.speed) {
                            case 6: difficulty = 'mittel'; break;
                            case 9: difficulty = 'schwer'; break;
                        }
                        this.balken[0].innerHTML = 'Schwierigkeit: ' + difficulty;
                        break;
                    case 40:
                        // roter Balken deaktivieren
                        this.balken[0].classList.remove('slidefrombottom');
                        this.balken[3].classList.remove('redSnakeVisible');
                        this.snakeOne = false;
                        break;
                    case 83:
                        // gelber Balken aktivieren
                        this.balken[1].classList.remove('slidefromleft');
                        this.snakeTwo = false;
                        break;
                    case 87:
                        // gelber Balken deaktivieren
                        this.balken[1].classList.add('slidefromleft');
                        this.snakeTwo = true;;
						break;
                    case 98:
                        // blauer Balken aktivieren
                        this.balken[2].classList.remove('slidefromtop');
                        this.snakeThree = false;
                        break;
                    case 104:
                        // blauer Balken deaktivieren
                        this.balken[2].classList.add('slidefromtop');
                        this.snakeThree = true;
						break;
                    case 73:
                        // grüner Balken aktivieren
                        this.balken[3].classList.add('slidefromright');
                        this.snakeFour = true;
                        break;
                    case 75:
                        // grüner Balken deaktivieren
                        this.balken[3].classList.remove('slidefromright');
                        this.snakeFour = false;
                        break;
                    case 81:
                        this.magicSnakeOne = true;
                        break;
                    case 88:
                        this.magicSnakeTwo = true;
                        break;
                    case 89:
                        this.magicSnakeThree = true;
                        break;
                    case 90:
                        this.magicSnakeFour = true;
                        break;
					case 13:
                        if (this.snakeOne) {
                            for (i = 0; i < this.rules.length; i++) {
                                document.body.removeChild(this.rules[i]);
                            }
                            window.removeEventListener('keydown', this.eventhandler);
                            this.prepare();
                        }
						break;
				}                
			}
        },
        
        updateScores: function() {
            for (i = 0; i < this.snakes.length; i++) {
                if (this.snakes[i].basename === 'Snake') {
                    var html = '';                
                    html += '<span>Score: ' + this.snakes[i].score + ' Punkte</span>';
                    this.balken[this.snakes[i].no].innerHTML = html;
                }
            }
        }
    },

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        if (this._loopHandle) {
            window.cancelAnimationFrame(this._loopHandle);
        }
        this.base(arguments);
    }
});
