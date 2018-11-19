/* global kijs, snake */

// --------------------------------------------------------------
// snake.Snake
// --------------------------------------------------------------
kijs.Class.define('snake.Snake', {
    type: 'regular',     // regular, abstract, static oder singleton (default:regular)
    xtypes: [],          // Alternative Klassennamen zur Verwendung als xtype in Config-Objekten
    events: [],          // Namen der Events dieser Klasse

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    construct: function(spielfeld, no, x, y, direction, borderColor, controlKeys) {
        this.base(arguments);
        this.spielfeld = spielfeld;
        this.no = no;
        this.borderColor = borderColor;
        this.dom = spielfeld.spielfeld;
        this.context = this.dom.getContext('2d');
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.controlKeys = controlKeys;
        this.snakeCircles = [];
        this.snakeCircleHeight = 35;
        this.snakeCircleWidth = 35;        
        this.snakeRectangles = [];
        this.directions = [this.direction];
        this.crashmusic = new Audio('../sounds/crash.mp3');
        this.uauamusic = new Audio('../sounds/uaua.mp3');

        this.snakeCircles.push({x:this.initX, y:this.initY, direction:this.direction});

        var color = '';
        
        switch(this.no) {
            case 0: color = 'Red'; break;
            case 1: color = 'Yellow'; break;
            case 2: color = 'Blue'; break;
            case 3: color = 'Green'; break;
        }

        var el = new snake.EventListener();
        this.spielfeld.on('keydown', el._onSnakeKeyDown, el);
        window.addEventListener('stick'+color, this._onStickEvent.bind(this), true);
        
        this.calculateColor();
    },

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    members: {
        border: 8,
        borderColor: null,
        context: null,
        controlKeys: null,
        direction: null,
        directions: null,
        initX: null,
        initY: null,
        isGameOver: false,
        newColor: null,
        crashMusic: null,
        uauaMusic: null,
        no: null,
        score: 0,
        snakeCircles: null,
        snakeRectangles: null,
        snakeCircleHeight: 0,
        snakeCircleWidth: 0,
        speed: 6,
        spielfeld: null,
        waitTurns: 0,
        x: null,
        y: null,


        // PUBLIC
        calculateColor: function() {
            // zweite Farbe für Farbverlauf berechnen
            var colorArray = this.borderColor.split('');
            var r = colorArray[1] + colorArray[2];
            var g = colorArray[3] + colorArray[4];
            var b = colorArray[5] + colorArray[6];
            
            var newR = Math.round(parseInt(r, 16) * 0.75);
            var newG = Math.round(parseInt(g, 16) * 0.75);
            var newB = Math.round(parseInt(b, 16) * 0.75);
            
            newR = newR.toString(16).length > 1 ? newR.toString(16) : '0' + newR.toString(16);
            newG = newG.toString(16).length > 1 ? newG.toString(16) : '0' + newG.toString(16);
            newB = newB.toString(16).length > 1 ? newB.toString(16) : '0' + newB.toString(16);
            
            this.newColor = '#' + newR + newG + newB;
        },
        
        checkCollision() {
            // Ausserhalb des Spielfelds
            if (this.snakeCircles[0].x <= 0 || this.snakeCircles[0].x+this.snakeCircleWidth >= this.spielfeld.width ||
                    this.snakeCircles[0].y <= 0 || this.snakeCircles[0].y+this.snakeCircleHeight >= this.spielfeld.height) {
                this.gameOver();
                this.playSounds();
            }

            // Frucht
            kijs.Array.each(this.spielfeld.fruits, function(fruit) {
                if (fruit.checkCollision(this)) {                   
                    this.score++;
                    this.spielfeld.updateScores();
                    this.waitTurns = 6;
                }
            }, this);

            // Hindernis
            for (i = 0; i < this.spielfeld.obstacles.length; i++) {
                if (this.spielfeld.obstacles[i].checkCollision(this)) {
                    this.gameOver();
                    this.playSounds();
                    break;
                }
            }

            // Kollision mit sich selber
            if (this.snakeCircles.length > 2) {
                for (i = 2; i < this.snakeRectangles.length; i++) {
                    if ((this.snakeCircles[0].x<=this.snakeRectangles[i].x+this.snakeRectangles[i].width && this.snakeCircles[0].x+this.snakeCircleWidth>=this.snakeRectangles[i].x) &&
                            (this.snakeCircles[0].y<=this.snakeRectangles[i].y+this.snakeRectangles[i].height && this.snakeCircles[0].y+this.snakeCircleHeight>=this.snakeRectangles[i].y)) {
                        this.gameOver();
                        this.playSounds();
                        break;
                    }
                }
            }
            
            // Kollision mit anderen Schlangen
            kijs.Array.each(this.spielfeld.snakes, function(snake) {
                if (snake !== this && !snake.isGameOver) {
                    for (i = 0; i < snake.snakeRectangles.length; i++) {
                        if ((this.snakeCircles[0].x<snake.snakeRectangles[i].x+snake.snakeRectangles[i].width && this.snakeCircles[0].x+snake.snakeCircleWidth>snake.snakeRectangles[i].x) &&
                                (this.snakeCircles[0].y<snake.snakeRectangles[i].y+snake.snakeRectangles[i].height && this.snakeCircles[0].y+snake.snakeCircleHeight>snake.snakeRectangles[i].y)) {
                            this.gameOver();
                            this.playSounds();
                            break;
                        }
                    }
                }
            }, this);
        },
        
        gameOver: function() {
            this.isGameOver = true;
            var allGameOver = true;
            kijs.Array.each(this.spielfeld.snakes, function(snake) {
                if (snake.basename === 'Snake' && !snake.isGameOver) {
                    allGameOver = false;
                    return false;
                }
            }, this);

            if (allGameOver) {
                this.spielfeld.gameOver(this);
            }
        },

        paint: function() {
            
            if (this.isGameOver) {
                return;
            }
            
            this.setSnake();
            
            this.snakeRectangles = [];
            
            if (this.waitTurns > 0) {
                this.waitTurns--;
            }

            // Snake zeichnen            
            for (i = this.snakeCircles.length-1; i >= 0; i--) {
                                
                if (i === 0 || (i === this.snakeCircles.length-1 && this.waitTurns === 0)) {
                    switch (this.snakeCircles[i].direction) {
                        case 'R': this.snakeCircles[i].x += this.speed;
                                  break;
                        case 'L': this.snakeCircles[i].x -= this.speed;
                                  break;
                        case 'U': this.snakeCircles[i].y -= this.speed;
                                  break;
                        case 'D': this.snakeCircles[i].y += this.speed;
                                  break;
                    }
                }                               
                
                // Kreis zeichnen
                this.context.fillStyle = this.borderColor;
                this.context.beginPath();
                this.context.arc(this.snakeCircles[i].x+(this.snakeCircleWidth/2), this.snakeCircles[i].y+(this.snakeCircleHeight/2), this.snakeCircleWidth/2, 0, 2*Math.PI);
                this.context.fill();
                
                var rectHeight = 0;
                var rectWidth = 0;
                var supx = 0;
                var supy = 0;               

                // Rechteck zeichnen, wenn nicht Kopf
                if (i < this.snakeCircles.length-1) {
                    if (this.snakeCircles[i+1].direction === 'R' || this.snakeCircles[i+1].direction === 'L') {
                        rectHeight = 35;
                        rectWidth = this.snakeCircles[i+1].x - this.snakeCircles[i].x;
                        supx = 17;
                    } else {
                        rectWidth = 35;
                        rectHeight = this.snakeCircles[i+1].y - this.snakeCircles[i].y;
                        supy = 17;
                    }
                    
                    var rectX = this.snakeCircles[i].x+supx;
                    var rectY = this.snakeCircles[i].y+supy;
                    
                    this.context.fillStyle = this.borderColor;
                    this.context.fillRect(rectX, rectY, rectWidth, rectHeight);
                     
                    if (rectWidth < 0) {
                        rectWidth *= -1;
                        rectX -= rectWidth;
                    } 
                    
                    if (rectHeight < 0) {
                        rectHeight *= -1;
                        rectY -= rectHeight;
                    }
                    
                    this.snakeRectangles[i] = {x:rectX, y:rectY, width:rectWidth, height:rectHeight};
                    
                    if (i === this.snakeCircles.length-2 && i > 0 && (rectWidth === 0 || rectHeight === 0)) {
                        this.snakeCircles.splice(this.snakeCircles.length-1, 1);
                    }
                }                               
            }
            this.context.save();
            
            // Linie zeichnen
            this.context.beginPath();                    
            this.context.setLineDash([10,5]);
            this.context.filter = 'blur(4px)';
            this.context.strokeStyle = this.newColor;
            this.context.lineWidth = 10;

            for (i = this.snakeCircles.length-2; i >= 0; i--) {
                if (this.snakeRectangles[i].height === 35) {
                    this.context.moveTo(this.snakeCircles[i].x+17, this.snakeCircles[i].y+17);
                    this.context.lineTo(this.snakeCircles[i+1].x+17, this.snakeCircles[i].y+17);
                } else {
                    this.context.moveTo(this.snakeCircles[i].x+17, this.snakeCircles[i].y+17);
                    this.context.lineTo(this.snakeCircles[i].x+17, this.snakeCircles[i+1].y+17);
                }                   
                this.context.stroke();
            }
            this.context.restore();
            
            // Schablone mit Augen über Kopfelement legen
            var img = new Image();
            switch(this.direction) {
                case 'R': img.src = '../pictures/eyes_right.png';
                          break;
                case 'L': img.src = '../pictures/eyes_left.png';
                          break;
                case 'U': img.src = '../pictures/eyes_up.png';
                          break;
                case 'D': img.src = '../pictures/eyes_down.png';

                          break;
            }
            this.context.drawImage(img, this.snakeCircles[0].x, this.snakeCircles[0].y, this.snakeCircleWidth, this.snakeCircleHeight);

            // Kollisionserkennung
            this.checkCollision();
        },
        
        paintCrown() {
            var x = 0, y = 0;
            var img = new Image();
            switch(this.direction) {
                case 'R': img.src = '../pictures/crownR.png';
                          x = -11;
                          break;
                case 'L': img.src = '../pictures/crownL.png';
                          x = 11;
                          break;
                case 'U': img.src = '../pictures/crownU.png';
                          y = 11;
                          break;
                case 'D': img.src = '../pictures/crownD.png';
                          y = -11;
                          break;
            }
            this.context.drawImage(img, this.snakeCircles[0].x+x, this.snakeCircles[0].y+y, this.snakeCircleWidth, this.snakeCircleHeight);
        },
        
        playSounds() {
            this.crashmusic.play();
            this.uauamusic.play();
        },
        
        setSnake() {
            // Werte des Kopfelements bei Spielbeginn definieren
            if (this.snakeCircles[0].x === null) {
                this.snakeCircles[0] = {x:this.x, y:this.y, direction:this.direction};
                switch (this.direction) {
                    case 'R': this.snakeCircles[1] = {x:this.x-(12*this.speed), y:this.y, direction:this.direction}; break;
                    case 'L': this.snakeCircles[1] = {x:this.x+(12*this.speed), y:this.y, direction:this.direction}; break;
                    case 'U': this.snakeCircles[1] = {x:this.x, y:this.y+(12*this.speed), direction:this.direction}; break;
                    case 'D': this.snakeCircles[1] = {x:this.x, y:this.y-(12*this.speed), direction:this.direction}; break;
                }
            }
            this.directions[0] = this.direction;
        },

        // EVENTS
        //--------
        _onStickEvent: function(e) {
			if (this.spielfeld.isRunning) {
				// gedrückte Taste ermitteln
				if (e.detail === 'L' && ['R', 'L'].indexOf(this.direction) === -1) {
					this.direction = 'L';
					this.snakeCircles.unshift({x:this.snakeCircles[0].x, y:this.snakeCircles[0].y, direction:this.direction});
					this.snakeCircles[1].direction = this.direction;
				} else if (e.detail === 'R' && ['R', 'L'].indexOf(this.direction) === -1) {
					this.direction = 'R';
					this.snakeCircles.unshift({x:this.snakeCircles[0].x, y:this.snakeCircles[0].y, direction:this.direction});
					this.snakeCircles[1].direction = this.direction;
				} else if (e.detail === 'U' && ['U', 'D'].indexOf(this.direction) === -1) {
					this.direction = 'U';
					this.snakeCircles.unshift({x:this.snakeCircles[0].x, y:this.snakeCircles[0].y, direction:this.direction});
					this.snakeCircles[1].direction = this.direction;
				} else if (e.detail === 'D' && ['U', 'D'].indexOf(this.direction) === -1) {
					this.direction = 'D';
					this.snakeCircles.unshift({x:this.snakeCircles[0].x, y:this.snakeCircles[0].y, direction:this.direction});
					this.snakeCircles[1].direction = this.direction;
				} else if (e.detail === 'Pause') {
					// Spiel pausieren
					var gameOver = new snake.GameOver(this.spielfeld, this.spielfeld.snakes, null, null, null);
					gameOver.showPause();
				}
			}
	    }
	},

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        this.base(arguments);
    }
});
