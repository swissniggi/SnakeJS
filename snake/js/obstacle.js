/* global kijs */

// --------------------------------------------------------------
// snake.Obstacle
// --------------------------------------------------------------
kijs.Class.define('snake.Obstacle', {
    type: 'regular',     // regular, abstract, static oder singleton (default:regular)
    xtypes: [],          // Alternative Klassennamen zur Verwendung als xtype in Config-Objekten
    events: [],          // Namen der Events dieser Klasse

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    construct: function(spielfeld) {
        this.base(arguments);
        this.spielfeld = spielfeld;
        this.dom = spielfeld.spielfeld;
        this.context = this.dom.getContext('2d');
        this.setImage();
        this.setCoordinates();
    },

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    members: {
        context: null,
        dom: null,
        height: null,
        image: null,
        width: null,
        x: null,
        y: null,
        
        
        // PUBLIC
        checkCollision: function(snake) {
            if ((snake.snakeCircles[0].x<=this.x+this.width && snake.snakeCircles[0].x+snake.snakeCircleWidth>=this.x) &&
                        (snake.snakeCircles[0].y<=this.y+this.height && snake.snakeCircles[0].y+snake.snakeCircleHeight>=this.y)) {
                return true;
            } else {
                return false;
            }
        },
        
        paint: function() {
            // Hindernis zeichnen
            this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        },
        
        setCoordinates: function() {
            this.x = 0;
            // x-Koordinate: min 50 vom Rand und von der Mitte entfernt
            while (this.x < 50 || this.x > this.spielfeld.width - (this.width+50)) {
                this.x = Math.floor(Math.random() * (this.spielfeld.width / 2 - (this.width+50))
                    + ((Math.floor(Math.random() * 2) === 0) ? this.spielfeld.width/2 + 50 : 0));
            }
            
            this.y = 0;
            // y-Koordinate: min. 50 vom Rand und von der Mitte entfernt
            while (this.y < 50 || this.y > this.spielfeld.height - (this.height+50)) {
                this.y = Math.floor(Math.random() * (this.spielfeld.height / 2 - (this.height+50))
                    + ((Math.floor(Math.random() * 2) === 0) ? this.spielfeld.height/2 + 50 : 0));
            }
        },

        setImage: function() {
            var img = new Image();
            var rnd = Math.floor(Math.random() * 10);

            if (rnd % 2 === 0) {
                img.src = '../pictures/obstacle2.png';
                this.width = 225;
                this.height = 30;
            } else {
                img.src = '../pictures/obstacle1.png';
                this.width = 30;
                this.height = 225;
            }
            this.image = img;
        }
    },

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        this.base(arguments);
    }
});