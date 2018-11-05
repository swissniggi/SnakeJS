/* global snake, kijs */

// --------------------------------------------------------------
// snake.GameOver
// --------------------------------------------------------------
kijs.Class.define('snake.GameOver', {
    type: 'regular',     // regular, abstract, static oder singleton (default:regular)
    xtypes: [],          // Alternative Klassennamen zur Verwendung als xtype in Config-Objekten
    events: ['keydown'],          // Namen der Events dieser Klasse

    // --------------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------------
    construct: function(spielfeld, snakes, maxScore, highScore, msg) {
        this.base(arguments);
        this.spielfeld = spielfeld;
        this.dom = spielfeld.spielfeld;
        this.context = this.dom.getContext('2d');
        this.snakes = snakes;
        this.maxScore = maxScore;
        this.highScore = highScore;
        this.msg = msg;
    },

    // --------------------------------------------------------------
    // MEMBERS
    // --------------------------------------------------------------
    members: {
        eventhandler: null,
        highScore: null,
        maxScore: null,
        msg: null,
        snakes: null,


        // PUBLIC 
        newGameOK: function() {
            document.location.reload();
        },
        
        playGameOverSound: function(isNewScore) {
            if (!isNewScore) {
                var oops = new Audio('../sounds/gameover.mp3');
                oops.play();
            } else {
                var applaus = new Audio('../sounds/applaus.mp3');
                applaus.play();
                // Highscore-Eingabeoberfläche initialisieren
                var app = new snake.Highscore(this.spielfeld, this.snakes, this.maxScore);
                app.init();
            }
        },
        
        prepareMsg: function() {
            // Game-Over-Nachricht definieren
            if (this.highScore[9] === 'W') {
                this.msg = '<p style="font-size:150%">Game Over!</p>' + this.msg
                         + '<p class="highscore_new"><u>Neuer Wochen-Highscore!</u></p>';
                this.showGameOver(true);
            } else if (this.highScore[9] === 'M') {
                this.msg = '<p style="font-size:150%">Game Over!</p>' + this.msg
                         + '<p class="highscore_new"><u>Neuer Monats-Highscore!</u></p>';
                this.showGameOver(true);
            } else if (this.highScore[9] === 'Y') {
                this.msg = '<p style="font-size:150%">Game Over!</p>' + this.msg
                         + '<p class="highscore_new"><u>Neuer Jahres-Highscore!</u></p>';
                this.showGameOver(true);
            } else {
                this.msg = '<p class="highscore_gameover">Game Over!</p>' + this.msg
                         + '<p>Wochen-Highscore: <span class="highscore_score">' + this.highScore[0]
                         + ' Punkte</span><br /> aufgestellt von: <span class="highscore_name">'
                         + this.highScore[1] + '</span><br />am: ' + this.highScore[2]
                         + '</p><p>Monats-Highscore: <span class="highscore_score">' + this.highScore[3]
                         + ' Punkte</span><br /> aufgestellt von: <span class="highscore_name">'
                         + this.highScore [4] + '</span><br />am: ' + this.highScore[5]
                         + '</p><p>Jahres-Highscore: <span class="highscore_score">' + this.highScore[6]
                         + ' Punkte</span><br /> aufgestellt von: <span class="highscore_name">'
                         + this.highScore[7] + '</span><br />am: ' + this.highScore[8] + '</p>';
                this.showGameOver(false);
            }
        },
        
        resumeGame: function(el) {
            if (el.currentTarget.innerHTML.includes('Klar!')) {
                window.removeEventListener('keydown', this.eventhandler);
                document.body.removeChild(this.spielfeld.rules[this.snakes[0].no]);
                this.spielfeld.defineAnimationFrame(this.spielfeld);
                this.spielfeld.isRunning = true;
            } else if (el.currentTarget.innerHTML.includes('Keine Lust!')) {
                document.location.reload();
            }
        },
        
        setFocus: function(e) {
            if (e.key === this.snakes[0]['controlKeys']['L']) {
                document.getElementById('yes').focus();
            } else if (e.key === this.snakes[0]['controlKeys']['R']) {
                document.getElementById('no').focus();
            }
        },
        
        showGameOver: function(isNewScore) {
            // 'Kärtchen' mit Game-Over-Nachricht erstellen
            for (i = 0; i < this.snakes.length; i++) {
                if (this.snakes[i].basename === 'Snake') {
                    this.spielfeld.rules[this.snakes[i].no].innerHTML = this.msg;                
                    document.body.appendChild(this.spielfeld.rules[this.snakes[i].no]);
                }
            }
            // Button zum Starten eines neuen Spiels erstellen wenn kein neuer Highscore
            if (!isNewScore) {
                var button = document.createElement('button');
                if (this.snakes[0].no % 2 === 0) {
                    button.classList.add('buttonNewGameHorizontal');
                } else {
                    button.classList.add('buttonNewGameVertical');
                }
                if (!!window.chrome && !!window.chrome.webstore) {
                    button.innerHTML = '<p>Neues Spiel starten</p>';
                    /* writing-mode kann im Chrome/Chromium nicht auf Buttons angewendet werden.
                       Mit einem <p> kann das Problem umgangen werden.
                     */
                } else {
                    button.innerHTML = 'Neues Spiel starten';
                }
                this.eventhandler = kijs.createDelegate(this.newGameOK, this);
                button.addEventListener('click', this.eventhandler);
                this.spielfeld.rules[this.snakes[0].no].appendChild(button);
                button.focus();
            }
            this.playGameOverSound(isNewScore);
        },
        
        showPause: function() {
            this.spielfeld.isRunning = false;
            this.eventhandler = kijs.createDelegate(this.setFocus, this);
            window.addEventListener('keydown', this.eventhandler);
            var msgPause = '<p style="color:lawngreen"><u>Pause!</u></p><p>Weiterspielen?</p>';
            this.spielfeld.rules[this.snakes[0].no].innerHTML = msgPause;
            document.body.appendChild(this.spielfeld.rules[this.snakes[0].no]);
            // Buttons 'Klar!' und 'Keine Lust' einfügen
            var buttonYes = document.createElement('button');
            var buttonNo = document.createElement('button');

            if (this.snakes[0].no % 2 === 0) {
                buttonYes.classList.add('buttonNewGameHorizontal');
                buttonNo.classList.add('buttonNewGameHorizontal');
            } else {
                buttonYes.classList.add('buttonNewGameVertical');
                buttonNo.classList.add('buttonNewGameVertical');
            }
            buttonYes.classList.add('buttonPause');
            buttonYes.setAttribute('id', 'yes');
            buttonNo.classList.add('buttonPause');
            buttonNo.setAttribute('id', 'no');

            if (!!window.chrome && !!window.chrome.webstore) {
                buttonYes.innerHTML = '<p>Klar!</p>';
                buttonNo.innerHTML = '<p>Keine Lust!</p>';
                /* writing-mode kann im Chrome/Chromium nicht auf Buttons angewendet werden.
                   Mit einem <p> kann das Problem umgangen werden.
                 */
            } else {
                buttonYes.innerHTML = 'Klar!';
                buttonNo.innerHTML = 'Keine Lust!';
            }
            buttonYes.addEventListener('click', kijs.createDelegate(this.resumeGame, this));
            buttonNo.addEventListener('click', kijs.createDelegate(this.resumeGame, this));
            this.spielfeld.rules[this.snakes[0].no].appendChild(buttonYes);
            this.spielfeld.rules[this.snakes[0].no].appendChild(buttonNo);
            buttonYes.focus();
        }
    },

    // --------------------------------------------------------------
    // DESTRUCTOR
    // --------------------------------------------------------------
    destruct: function() {
        this.base(arguments);
    }
});
