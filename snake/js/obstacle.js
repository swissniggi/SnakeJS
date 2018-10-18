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
        paint: function() {
            // Hindernis zeichnen
            this.context.drawImage(this.image, this.x, this.y, this.width, this.height);
        },
        
        setCoordinates: function() {            
            this.x = Math.floor(Math.random() * ((this.spielfeld.width - (this.width + 100)) - 150)) + 150;
            this.y = Math.floor(Math.random() * ((this.spielfeld.height - (this.height + 100)) - 150)) + 150;
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
