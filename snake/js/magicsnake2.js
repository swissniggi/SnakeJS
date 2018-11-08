/* global kijs, snake */

// --------------------------------------------------------------
// snake.Snake
// --------------------------------------------------------------
kijs.Class.define('snake.MagicSnake', {
    type: 'regular',     // regular, abstract, static oder singleton (default:regular)
    xtypes: [],          // Alternative Klassennamen zur Verwendung als xtype in Config-Objekten
    events: [],          // Namen der Events dieser Klasse

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    construct: function(spielfeld, x, y, direction, borderColor) {
        this.base(arguments);
        this.spielfeld = spielfeld;
        this.borderColor = borderColor;
        this.dom = spielfeld.spielfeld;
        this.context = this.dom.getContext('2d');
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.snakeElements = [];
        this.directions = [this.direction];

        this.snakeElements.push({x:this.initX, y:this.initY, direction:this.direction});
        
        this.calculateColor();
    },

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    members: {
        border: 8,
        borderColor: null,
        context: null,
        currentTime: null,
        direction: null,
        directions: null,
        initX: null,
        initY: null,
        isGameOver: false,
        lastTime: (new Date()).getTime(),
        newColor: null,
        obstacleTouched: null,
        onBorder: false,
        snakeElements: null,
        snakeElementHeight: 35,
        snakeElementWidth: 35,
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
        
        changeDirection: function(dir) {
            this.direction = dir;
            this.snakeElements.unshift({x:this.snakeElements[0].x, y:this.snakeElements[0].y, direction:this.direction});
            this.snakeElements[1].direction = this.direction;
        },
        
        checkCollision() {
            // Frucht
            kijs.Array.each(this.spielfeld.fruits, function(fruit) {
                if ((this.snakeElements[0].x<=fruit.x+fruit.width && this.snakeElements[0].x+this.snakeElementWidth>=fruit.x) &&
                        (this.snakeElements[0].y<=fruit.y+fruit.height && this.snakeElements[0].y+this.snakeElementHeight>=fruit.y)) {
                    fruit.replace();
                    this.waitTurns = 12;
                    return false;
                }
            }, this);

            // Hindernis
            for (i = 0; i < 8; i++) {
                if ((this.snakeElements[0].x<=this.spielfeld.obstacles[i].x+this.spielfeld.obstacles[i].width && this.snakeElements[0].x+this.snakeElementWidth>=this.spielfeld.obstacles[i].x) &&
                        (this.snakeElements[0].y<=this.spielfeld.obstacles[i].y+this.spielfeld.obstacles[i].height && this.snakeElements[0].y+this.snakeElementHeight>=this.spielfeld.obstacles[i].y)) {
                    if (this.spielfeld.obstacles[i] !== this.obstacleTouched) {
                        this.lastTime = (new Date()).getTime();
                        this.obstacleTouched = this.spielfeld.obstacles[i];
                        
                        if (this.direction === 'R') {
                            this.changeDirection('U');
                        } else if (this.direction === 'L') {
                            this.changeDirection('D');
                        } else if (this.direction === 'U') {
                            this.changeDirection('L');
                        } else if (this.direction === 'D') {
                            this.changeDirection('R');
                        }
                    }
                    break;
                } else if (i === 7) {
                    this.obstacleTouched = null;
                }
            }

            // Kollision mit sich selber
            if (this.snakeElements.length > 2) {
                for (i = 2; i < this.snakeElements.length-1; i++) {
                    // nach oben
                    if (this.snakeElements[i].x === this.snakeElements[i+1].x && this.snakeElements[i].y < this.snakeElements[i+1].y) {
                        if ((this.snakeElements[0].x >= this.snakeElements[i].x && this.snakeElements[0].x <= this.snakeElements[i].x+35)
                        && (this.snakeElements[0].y >= this.snakeElements[i].y && this.snakeElements[0].y <= this.snakeElements[i+1].y+17)) {                    
                            this.gameOver();
                            break;
                        }
                    // nach unten
                    } else if (this.snakeElements[i].x === this.snakeElements[i+1].x && this.snakeElements[i].y > this.snakeElements[i+1].y) {
                        if ((this.snakeElements[0].x >= this.snakeElements[i].x && this.snakeElements[0].x <= this.snakeElements[i].x+35)
                        && (this.snakeElements[0].y+this.snakeElementHeight <= this.snakeElements[i].y && this.snakeElements[0].y+this.snakeElementHeight >= this.snakeElements[i+1].y+17)) {                    
                            this.gameOver();
                            break;
                        }
                    //nach links
                    } else if (this.snakeElements[i].y === this.snakeElements[i+1].y && this.snakeElements[i].x < this.snakeElements[i+1].x) {
                        if ((this.snakeElements[0].x+this.snakeElementWidth >= this.snakeElements[i].x+this.snakeElementWidth && this.snakeElements[0].x <= this.snakeElements[i+1].x+17)
                        && (this.snakeElements[0].y >= this.snakeElements[i].y && this.snakeElements[0].y <= this.snakeElements[i].y+35)) {                    
                            this.gameOver();
                            break;
                        }
                    // nach rechts
                    } else if (this.snakeElements[i].y === this.snakeElements[i+1].y && this.snakeElements[i].x > this.snakeElements[i+1].x) {
                        if ((this.snakeElements[0].x <= this.snakeElements[i].x && this.snakeElements[0].x >= this.snakeElements[i+1].x)
                        && (this.snakeElements[0].y >= this.snakeElements[i].y && this.snakeElements[0].y <= this.snakeElements[i].y+35)) {                    
                            this.gameOver();
                            break;
                        }
                    }
                }
            }

            // Kollision mit anderen Schlangen
            kijs.Array.each(this.spielfeld.snakes, function(snake) {
                if (snake !== this && !snake.isGameOver) {
                    for (i = 0; i < snake.snakeElements.length-1; i++) {
                        // nach oben
                        if (snake.snakeElements[i].x === snake.snakeElements[i+1].x && snake.snakeElements[i].y < snake.snakeElements[i+1].y) {
                            if ((this.snakeElements[0].x >= snake.snakeElements[i].x && this.snakeElements[0].x <= snake.snakeElements[i].x+35)
                            && (this.snakeElements[0].y >= snake.snakeElements[i].y && this.snakeElements[0].y <= snake.snakeElements[i+1].y+17)) {
                                this.gameOver();
                                break;
                            }
                        // nach unten
                        } else if (snake.snakeElements[i].x === snake.snakeElements[i+1].x && snake.snakeElements[i].y > snake.snakeElements[i+1].y) {
                            if ((this.snakeElements[0].x+this.snakeElementWidth >= snake.snakeElements[i].x+this.snakeElementWidth && this.snakeElements[0].x <= snake.snakeElements[i].x+35)
                            && (this.snakeElements[0].y <= snake.snakeElements[i].y && this.snakeElements[0].y >= snake.snakeElements[i+1].y+17)) {
                                this.gameOver();
                                break;
                            }
                        // nach links
                        } else if (snake.snakeElements[i].y === snake.snakeElements[i+1].y && snake.snakeElements[i].x < snake.snakeElements[i+1].x) {
                            if ((this.snakeElements[0].x >= snake.snakeElements[i].x && this.snakeElements[0].x <= snake.snakeElements[i+1].x+17)
                            && (this.snakeElements[0].y >= snake.snakeElements[i].y && this.snakeElements[0].y <= snake.snakeElements[i].y+35)) {
                                this.gameOver();
                                break;
                            }
                        // nach rechts
                        } else if (snake.snakeElements[i].y === snake.snakeElements[i+1].y && snake.snakeElements[i].x > snake.snakeElements[i+1].x) {
                            if ((this.snakeElements[0].x <= snake.snakeElements[i].x && this.snakeElements[0].x >= snake.snakeElements[i+1].x+17)
                            && (this.snakeElements[0].y+this.snakeElementHeight >= snake.snakeElements[i].y && this.snakeElements[0].y+this.snakeElementHeight <= snake.snakeElements[i].y+35)) {
                                this.gameOver();
                                break;
                            }
                        }
                    }
                }
            }, this);
        },
        
        checkPosition: function() {
            if (this.direction === 'R' && this.spielfeld.width - this.snakeElements[0].x < 50) {
                this.changeDirection('U');
                this.lastTime = (new Date()).getTime();
                this.onBorder = true;
            } else if (this.direction === 'U' && this.snakeElements[0].y < 15) {
                this.changeDirection('L');
                this.lastTime = (new Date()).getTime();
                this.onBorder = true;
            } else if (this.direction === 'L' && this.snakeElements[0].x < 15) {
                this.changeDirection('D');
                this.lastTime = (new Date()).getTime();
                this.onBorder = true;
            } else if (this.direction === 'D' && this.spielfeld.height - this.snakeElements[0].y < 50) {
                this.changeDirection('R');
                this.lastTime = (new Date()).getTime();
                this.onBorder = true;
            }
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

            // Snake zeichnen            
            for (i = this.snakeElements.length-1; i >= 0; i--) {
                // Kreis zeichnen
                this.context.fillStyle = this.borderColor;
                this.context.beginPath();
                this.context.arc(this.snakeElements[i].x+(this.snakeElementWidth/2), this.snakeElements[i].y+(this.snakeElementHeight/2), this.snakeElementWidth/2, 0, 2*Math.PI);
                this.context.fill();
                
                if (i === 0 || (i === this.snakeElements.length-1 && this.waitTurns === 0)) {
                    switch (this.snakeElements[i].direction) {
                        case 'R': this.snakeElements[i].x += this.speed;
                                  break;
                        case 'L': this.snakeElements[i].x -= this.speed;
                                  break;
                        case 'U': this.snakeElements[i].y -= this.speed;
                                  break;
                        case 'D': this.snakeElements[i].y += this.speed;
                                  break;
                    }
                }
                
                if (this.waitTurns > 0) {
                    this.waitTurns--;
                }
                
                var h = 0;
                var w = 0;
                var supx = 0;
                var supy = 0;
                

                // Rechteck zeichnen, wenn nicht Kopf
                if (i < this.snakeElements.length-1) {
                    if (this.snakeElements[i+1].direction === 'R' || this.snakeElements[i+1].direction === 'L') {
                        h = 35;
                        w = this.snakeElements[i+1].x - this.snakeElements[i].x;
                        supx = 17;
                    } else {
                        w = 35;
                        h = this.snakeElements[i+1].y - this.snakeElements[i].y;
                        supy = 17;
                    }
                    
                    this.context.fillStyle = this.borderColor;
                    this.context.fillRect(this.snakeElements[i].x+supx, this.snakeElements[i].y+supy, w, h);
                    this.context.save();  
                    
                    // Linie zeichnen
                    this.context.beginPath();                    
                    this.context.setLineDash([6,6]);
                    this.context.filter = 'blur(1px)';
                    this.context.strokeStyle = this.newColor;
                    this.context.lineWidth = 6;
                    
                    if (supx > 0) {
                        this.context.moveTo(this.snakeElements[i].x+17, this.snakeElements[i].y+17);
                        this.context.lineTo(this.snakeElements[i+1].x+17, this.snakeElements[i].y+17);
                    } else {
                        this.context.moveTo(this.snakeElements[i].x+17, this.snakeElements[i].y+17);
                        this.context.lineTo(this.snakeElements[i].x+17, this.snakeElements[i+1].y+17);
                    }                   
                    this.context.stroke();
                    this.context.restore();
                    
                    if (i === this.snakeElements.length-2 && i > 0 && (w === 0 || h === 0)) {
                        this.snakeElements.splice(this.snakeElements.length-1, 1);
                    }
                }
                
                // Schablone mit Augen über Kopfelement legen
                if (i === 0) {
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
                    this.context.drawImage(img, this.snakeElements[i].x, this.snakeElements[i].y, this.snakeElementWidth, this.snakeElementHeight);
                }
            }

            // Kollisionserkennung
            this.checkCollision();
            
            this.checkPosition();
            // Zufälligen Richtungswechsel kalkulieren
            this.randomTurn();
        },
        
        randomTurn: function() {
            var now = (new Date()).getTime();
            
            if (now % 7 === 0 && now - this.lastTime > 2000 && !this.onObstacle) {
                if (Math.round(Math.random()) === 0 || this.onBorder) {
                    if (this.direction === 'R') {
                        this.changeDirection('U');
                    } else if (this.direction === 'L') {
                        this.changeDirection('D');
                    } else if (this.direction === 'U') {
                        this.changeDirection('L');
                    } else if (this.direction === 'D') {
                        this.changeDirection('R');
                    }
                } else {
                    if (this.direction === 'R') {
                        this.changeDirection('D');
                    } else if (this.direction === 'L') {
                        this.changeDirection('U');
                    } else if (this.direction === 'U') {
                        this.changeDirection('R');
                    } else if (this.direction === 'D') {
                        this.changeDirection('L');
                    }
                }
                this.onBorder = false;
                this.lastTime = now;
            }
        },
        
        setSnake() {
            // Werte des Kopfelements bei Spielbeginn definieren
            if (this.snakeElements[0].x === null) {
                this.snakeElements[0] = {x:this.x, y:this.y, direction:this.direction};
                switch (this.direction) {
                    case 'R': this.snakeElements[1] = {x:this.x-72, y:this.y, direction:this.direction}; break;
                    case 'L': this.snakeElements[1] = {x:this.x+72, y:this.y, direction:this.direction}; break;
                    case 'U': this.snakeElements[1] = {x:this.x, y:this.y+72, direction:this.direction}; break;
                    case 'D': this.snakeElements[1] = {x:this.x, y:this.y-72, direction:this.direction}; break;
                }
                this.lastTime = (new Date()).getTime();
            }
            this.directions[0] = this.direction;
        }
	},

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        this.base(arguments);
    }
});
