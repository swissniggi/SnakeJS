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
        this.snakeElements = [];
        this.directionChanges = [];
        this.directions = [this.direction];

        for (var i = 0; i < this.snakeElementCount; i++) {
            this.snakeElements.push({x:this.initX, y:this.initY, testCollision:false});
        }
        
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
        currentTime: null,
        direction: null,
        directionChanges: null,
        directions: null,
        initX: null,
        initY: null,
        isGameOver: false,
        lastTime: (new Date()).getTime(),
        newColor: null,
        no: null,
        score: 0,
        snakeElements: null,
        snakeElementCount: 1,
        snakeElementHeight: 35,
        snakeElementWidth: 35,
        speed: 4,
        spielfeld: null,
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
            if (this.snakeElements[0].x <= 0 || this.snakeElements[0].x+this.snakeElementWidth >= this.spielfeld.width ||
                    this.snakeElements[0].y <= 0 || this.snakeElements[0].y+this.snakeElementHeight >= this.spielfeld.height) {
                this.gameOver();
            }

            // Frucht
            kijs.Array.each(this.spielfeld.fruits, function(fruit) {
                if ((this.snakeElements[0].x<=fruit.x+fruit.width && this.snakeElements[0].x+this.snakeElementWidth>=fruit.x) &&
                        (this.snakeElements[0].y<=fruit.y+fruit.height && this.snakeElements[0].y+this.snakeElementHeight>=fruit.y)) {
                    fruit.replace();
                    this.score++;
                    this.spielfeld.updateScores();
                    this.grow(3);
                    return false;
                }
            }, this);

            // Hindernis
            for (i = 0; i < 8; i++) {
                if ((this.snakeElements[0].x<=this.spielfeld.obstacles[i].x+this.spielfeld.obstacles[i].width && this.snakeElements[0].x+this.snakeElementWidth>=this.spielfeld.obstacles[i].x) &&
                        (this.snakeElements[0].y<=this.spielfeld.obstacles[i].y+this.spielfeld.obstacles[i].height && this.snakeElements[0].y+this.snakeElementHeight>=this.spielfeld.obstacles[i].y)) {
                    this.gameOver();
                    break;
                }
            }            

            // Kollision mit sich selber
            if (this.snakeElementCount > 1) {
                for (i = 1; i < this.snakeElementCount; i++) {
                    if (this.snakeElements[i].testCollision && (this.snakeElements[0].x<=this.snakeElements[i].x+this.snakeElementWidth && this.snakeElements[0].x+this.snakeElementWidth>=this.snakeElements[i].x &&
                            this.snakeElements[0].y<=this.snakeElements[i].y+this.snakeElementHeight && this.snakeElements[0].y+this.snakeElementHeight>=this.snakeElements[i].y)) {
                        this.gameOver();
                        break;
                    }
                }
            }

            // Kollision mit anderen Schlangen
            kijs.Array.each(this.spielfeld.snakes, function(snake) {
                if (snake !== this && !snake.isGameOver) {
                    for (i = 1; i < snake.snakeElementCount; i++) {
                        if (snake.snakeElements[i].testCollision && (this.snakeElements[0].x<snake.snakeElements[i].x+snake.snakeElementWidth && this.snakeElements[0].x+snake.snakeElementWidth>snake.snakeElements[i].x) &&
                                (this.snakeElements[0].y<snake.snakeElements[i].y+snake.snakeElementHeight && this.snakeElements[0].y+snake.snakeElementHeight>snake.snakeElements[i].y)) {
                            this.gameOver();
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

        grow: function(count) {
            while (count > 0) {
                var lastElementX = this.snakeElements[this.snakeElementCount-1].x;
                var lastElementY = this.snakeElements[this.snakeElementCount-1].y;
                var lastElementDirection = this.directions[this.directions.length-1];

                this.directions.push(lastElementDirection);

                for (i = 0; i < this.directionChanges.length; i++) {
                    this.directionChanges[i].count++;
                }
                // Abstand zum nächsten Element festlegen
                // ACHTUNG! Abstand muss durch 'speed' teilbar sein!
                switch (lastElementDirection) {
                    case 'R': lastElementX -= 12;
                              break;
                    case 'L': lastElementX += 12;
                              break;
                    case 'U': lastElementY += 12;
                              break;
                    case 'D': lastElementY -= 12;
                              break;
                }
                this.snakeElements.push({x:lastElementX, y:lastElementY, testCollision:false});
                this.snakeElementCount++;
                count--;
            }
        },

        paint: function() {
            var i, width, height;
            if (this.isGameOver) {
                return;
            }
            
            this.setSnake();

            // Snake aussen zeichnen
            for (i = 0; i < this.snakeElementCount; i++) {
                if (this.directionChanges.length > 0 && i > 0) {
                    for (j = 0; j < this.directionChanges.length; j++) {
                        if (this.snakeElements[i].x === this.directionChanges[j].x &&
                                this.snakeElements[i].y === this.directionChanges[j].y) {
                            this.directions[i] = this.directionChanges[j].direction;
                            this.directionChanges[j].count--;
                        }
                        // nicht mehr benötigte Elemente aus directionChanges löschen
                        if (this.directionChanges[j].count === 0 && i === this.snakeElementCount-1) {
                            this.directionChanges.splice(j, 1);
                        }
                    }
                }

                switch (this.directions[i]) {
                    case 'R': this.snakeElements[i].x += this.speed;
                              break;
                    case 'L': this.snakeElements[i].x -= this.speed;
                              break;
                    case 'U': this.snakeElements[i].y -= this.speed;
                              break;
                    case 'D': this.snakeElements[i].y += this.speed;
                              break;
                }

                this.context.fillStyle = 'black';
                this.context.beginPath();
                this.context.globalAlpha = 0.4;
                this.context.arc(this.snakeElements[i].x+(this.snakeElementWidth/2), this.snakeElements[i].y+(this.snakeElementHeight/2), this.snakeElementWidth/2, 0, 2*Math.PI);
                this.context.fill();
                this.context.globalAlpha = 1;
            }

            // Snake innen zeichnen
            for (i = this.snakeElementCount-1; i >= 0; i--) {
                width = this.snakeElementWidth - this.border;
                if (width < 1) {
                    width = 1;
                }
                height = this.snakeElementHeight - this.border;
                if (height < 1) {
                    height = 1;
                }

                var grd = this.context.createRadialGradient(this.snakeElements[i].x+((width+this.border)/2), this.snakeElements[i].y+((height+this.border)/2),3, this.snakeElements[i].x+((width+this.border)/2),this.snakeElements[i].y+((height+this.border)/2),15);
                grd.addColorStop(0, this.borderColor);
                grd.addColorStop(1, this.newColor);
                this.context.fillStyle = grd;
                this.context.beginPath();
                this.context.arc(this.snakeElements[i].x+((width+this.border)/2), this.snakeElements[i].y+((height+this.border)/2), width/2, 0, 2*Math.PI);
                this.context.fill();
                
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
        },
        
        setSnake() {
            // Snake-Elemente mit Kollisionserkennung ermitteln
            if (this.snakeElementCount > 1) {
                for (i = 1; i < this.snakeElementCount; i++) {
                    if (i <= 6) {
                        this.snakeElements[i].testCollision = false;
                    } else {
                        this.snakeElements[i].testCollision = true;
                    }
                }
            }
            
            // Werte des Kopfelements bei Spielbeginn definieren
            if (this.snakeElements[0].x === null) {
                this.snakeElements[0] = {x:this.x, y:this.y, testCollision:false};
                // this.grow() zwei Mal ausführen für Initiallänge(3)
                this.grow(2);
            }
            this.directions[0] = this.direction;
        },

        // EVENTS
        //--------
        _onStickEvent: function(e) {
            this.currentTime = (new Date()).getTime();

            if (this.currentTime - this.lastTime > 25) {
                if (this.spielfeld.isRunning) {
                    // gedrückte Taste ermitteln
                    if (e.detail === 'L' && ['R', 'L'].indexOf(this.direction) === -1) {
                        this.direction = 'L';
                        this.directionChanges.unshift({x:this.snakeElements[0].x, y:this.snakeElements[0].y, direction:this.direction, count:this.snakeElementCount-1});
                    } else if (e.detail === 'R' && ['R', 'L'].indexOf(this.direction) === -1) {
                        this.direction = 'R';
                        this.directionChanges.unshift({x:this.snakeElements[0].x, y:this.snakeElements[0].y, direction:this.direction, count:this.snakeElementCount-1});
                    } else if (e.detail === 'U' && ['U', 'D'].indexOf(this.direction) === -1) {
                        this.direction = 'U';
                        this.directionChanges.unshift({x:this.snakeElements[0].x, y:this.snakeElements[0].y, direction:this.direction, count:this.snakeElementCount-1});
                    } else if (e.detail === 'D' && ['U', 'D'].indexOf(this.direction) === -1) {
                        this.direction = 'D';
                        this.directionChanges.unshift({x:this.snakeElements[0].x, y:this.snakeElements[0].y, direction:this.direction, count:this.snakeElementCount-1});
                    } else if (e.detail === 'Pause') {
                        // Spiel pausieren
                        var gameOver = new snake.GameOver(this.spielfeld, this.spielfeld.snakes, null, null, null);
                        gameOver.showPause();
                    }
                }
            }
            this.lastTime = this.currentTime;
		}
	},

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        this.base(arguments);
    }
});
