var menuState = {
    preload: function () {
    },
    create: function() {
        this.background = game.add.sprite(0, 0, 'loginBackground');
        this.background.alpha = 0.5;
        this.addScroll();
        this.addButton();
        this.addText();
        this.addPlayer();
        game.add.sprite(0, 0, 'frame');   
        this.beam.animations.play('shine');
        this.sparkle.animations.play('spark');
        scroll = this.scroll.animations.play('open');
        scroll.onComplete.add(function () {
            game.add.tween(this.nameLabel).to( { alpha: 1 }, 400, Phaser.Easing.Linear.None, true, 0, 0, false);
            game.add.tween(this.levelLabel).to( { alpha: 1 }, 400, Phaser.Easing.Linear.None, true, 0, 0, false);
            game.add.tween(this.locationLabel).to( { alpha: 1 }, 400, Phaser.Easing.Linear.None, true, 0, 0, false);
            game.add.tween(this.moneyLabel).to( { alpha: 1 }, 400, Phaser.Easing.Linear.None, true, 0, 0, false);            
            game.add.tween(this.sureButton).to( { alpha: 1 }, 400, Phaser.Easing.Linear.None, true, 0, 0, false);
        }, this); 
        

        //game.state.start('play');        
    },

    update: function() {
        this.checkButton();
        this.player.animations.play('stand');
        
    },
    addScroll: function() {
        this.scroll = game.add.sprite(370, 170, 'scroll');
        this.scroll.animations.add('open', [0, 2], 4, false);
        this.scroll.animations.add('close', [1, 0], 4, false);
        
    },
    addText: function() {
        this.nameLabel = game.add.text(413, 216, game.global.username ,{ font: '15px monospace', fill: '#664422' }); 
        this.levelLabel = game.add.text(413, 236, "Lv. " + game.global.level ,{ font: '15px monospace', fill: '#664422' }); 
        this.locationLabel = game.add.text(413, 256, "Location: " + game.global.position ,{ font: '15px monospace', fill: '#664422' }); 
        this.moneyLabel = game.add.text(413, 276, "Money: $" + game.global.money ,{ font: '15px monospace', fill: '#664422' }); 
        this.nameLabel.alpha = 0;
        this.levelLabel.alpha = 0;
        this.locationLabel.alpha = 0;
        this.moneyLabel.alpha = 0;
    },
    addButton: function() {
        

        this.sureButton = game.add.sprite(630, 380, 'sureBtn');
        this.sureButton.alpha = 0;
        this.sureButton.inputEnabled = true;
        this.sureButton.animations.add('disabled', [0], 1, false);
        this.sureButton.animations.add('normal', [1], 1, false);
        this.sureButton.animations.add('hover', [2], 1, false);
        this.sureButton.animations.add('clicked', [3], 1, false);
        this.sureClicked = 0;
    },
    addPlayer: function() {
        this.beam =  game.add.sprite(164, -150, 'charBeam');
        this.beam.scale.setTo(1.5,1.5);        
        this.beam.animations.add('shine', [0, 1, 2, 3], 4, false);

        this.sparkle =  game.add.sprite(180, 100, 'charSparkle');
        this.sparkle.scale.setTo(1.5,1.5);        
        this.sparkle.animations.add('spark', [0, 1, 2, 3, 4], 4, true);
        
        
        
        
        this.player = game.add.sprite(20, 230, 'player');
        this.player.scale.setTo(1.7,1.7);        
        this.player.animations.add('stand', [0, 1, 2, 1], 2, true);
        
    },
    checkButton: function() {
        if (this.sureButton.input.pointerDown()) {
            this.sureButton.animations.play('clicked');
            this.sureClicked = 1;
        }
        else if (this.sureButton.input.pointerUp() && this.sureClicked == 1) {
            this.sureClicked = 0;
            this.sureButton.kill();
            this.nameLabel.kill();
            this.levelLabel.kill();
            this.locationLabel.kill();
            this.moneyLabel.kill();
            this.scroll.animations.play('close');
            game.camera.fade(0x000000, 600);
            game.camera.onFadeComplete.add(function() {game.state.start('loadMapData');}, this);
        }
        else if (this.sureButton.input.pointerOver()) {
            this.sureButton.animations.play('hover'); 
        }
        else this.sureButton.animations.play('normal');
    }
}; 

var loadMapData = {
    preload: function(){
        game.load.json('mapData', "assets/map/" + game.global.position + "/data.json");
    },
    create: function(){
        game.global.mapData = game.cache.getJSON('mapData');
        game.state.start('play');
    }
}



var loginState = {
    preload: function () {
        
    },
    create: function() {
        //game.stage.backgroundColor = 'cdebe3'; 
        game.add.sprite(0, 0, 'loginBackground');
        game.add.sprite(0, 0, 'frame');        
        this.signboard = game.add.sprite(280, 240, 'signBoard');

        
        

        this.addButton();
        this.addTextBox();
      
    },

    update: function() {
        this.checkLoginButton();
        this.checkSignupButton();
        this.checkGoogleButton();

        
    },

    addButton: function() {
        this.loginButton = game.add.sprite(464, 255, 'loginBtn');
        this.loginButton.inputEnabled = true;
        this.loginButton.animations.add('disabled', [0], 1, false);
        this.loginButton.animations.add('normal', [1], 1, false);
        this.loginButton.animations.add('hover', [2], 1, false);
        this.loginButton.animations.add('clicked', [3], 1, false);
        this.loginClicked = 0;

        this.signupButton = game.add.sprite(320, 320, 'signupBtn');
        this.signupButton.inputEnabled = true;
        this.signupButton.animations.add('disabled', [0], 1, false);
        this.signupButton.animations.add('normal', [1], 1, false);
        this.signupButton.animations.add('hover', [2], 1, false);
        this.signupButton.animations.add('clicked', [3], 1, false);
        this.signupClicked = 0;
        
        this.googleButton = game.add.sprite(410, 320, 'googleBtn');
        this.googleButton.inputEnabled = true;
        this.googleButton.animations.add('normal', [0], 1, false);
        this.googleButton.animations.add('hover', [1], 1, false);
        this.googleButton.animations.add('clicked', [2], 1, false);
        this.googleClicked = 0;

        

    },

    addTextBox: function() {
        this.emailBox = game.add.inputField(300, 260, {
            font: '15px monospace',
            fill: '#664422',
            fillAlpha: 0,
            cursorColor:'#664422',
            width: 145,
            height: 15,
            text: 'sddfsa',
            placeHolder: 'Email...',
            placeHolderColor: '#664422'
        });

        this.passwordBox = game.add.inputField(300, 285, {
            font: '15px monospace',
            fill: '#664422',
            fillAlpha: 0,
            cursorColor:'#664422',
            width: 145,
            height: 15,
            placeHolderColor: '#664422',
            placeHolder: 'Password...',
            type: PhaserInput.InputType.password
        });

        

    },

    checkLoginButton: function() {
        if (this.emailBox.value && this.passwordBox.value) {
            if (this.loginButton.input.pointerDown()) {
                this.loginButton.animations.play('clicked');
                this.loginClicked = 1;
            }
            else if (this.loginButton.input.pointerUp() && this.loginClicked == 1) {
                this.loginClicked = 0;
                game.global.email = this.emailBox.value;
                game.global.password = this.passwordBox.value;
                game.camera.fade(0x000000, 600);
                game.camera.onFadeComplete.add(function() {game.state.start('menu');}, this);
                  
                // console.log(game.global.email + " " + game.global.password);
            }
            else if (this.loginButton.input.pointerOver()) {
                this.loginButton.animations.play('hover'); 
            }
            else this.loginButton.animations.play('normal');
        }
        else this.loginButton.animations.play('disabled');
    },

    checkSignupButton: function() {
        if (this.emailBox.value && this.passwordBox.value) {
            if (this.signupButton.input.pointerDown()) {
                this.signupButton.animations.play('clicked');
                this.signupClicked = 1;
            }
            else if (this.signupButton.input.pointerUp() && this.signupClicked == 1) {
                this.signupClicked = 0;
                game.global.email = this.emailBox.value;
                game.global.password = this.passwordBox.value;
                game.state.start('newUser');

                // console.log(game.global.email + " " + game.global.password);

            }
            else if (this.signupButton.input.pointerOver()) {
                this.signupButton.animations.play('hover'); 
            }
            else this.signupButton.animations.play('normal');
        }
        else this.signupButton.animations.play('disabled');
    },

    checkGoogleButton: function() {
        if (this.googleButton.input.pointerDown()) {
            this.googleButton.animations.play('clicked');
            this.googleClicked = 1;
        }
        else if (this.googleButton.input.pointerUp() && this.googleClicked == 1) {
            this.googleClicked = 0;
            game.camera.fade(0x000000, 600);
            game.camera.onFadeComplete.add(function() {game.state.start('menu');}, this);
        }
        else if (this.googleButton.input.pointerOver()) {
            this.googleButton.animations.play('hover'); 
        }
        else this.googleButton.animations.play('normal');
    }

    
    

    

    

}

var newUserState = {
    preload: function() {

    },
    create: function() {
        game.add.sprite(0, 0, 'loginBackground');
        game.add.sprite(0, 0, 'frame');
        this.addCharName();
    },
    update: function() {
        this.checkYesButton();
    },
    addCharName: function() {
        this.charName = game.add.sprite(290, 160, 'charName');
        this.nameBox = game.add.inputField(322, 267, {
            font: '15px monospace',
            fill: '#ffffff',
            fillAlpha: 0,
            cursorColor:'#ffffff',
            width: 140,
            height: 15,
            placeHolderColor: '#ffffff',
            placeHolder: 'Name...'

        });

        this.yesButton = game.add.sprite(353, 339, 'yesButton');
        this.yesButton.inputEnabled = true;
        this.yesButton.animations.add('disabled', [0], 1, false);
        this.yesButton.animations.add('normal', [1], 1, false);
        this.yesButton.animations.add('hover', [2], 1, false);
        this.yesButton.animations.add('clicked', [3], 1, false);
        this.yesClicked = 0;

    },

    checkYesButton: function() {
        if (this.nameBox.value) {
            if (this.yesButton.input.pointerDown()) {
                this.yesButton.animations.play('clicked');
                this.yesClicked = 1;
            }
            else if (this.yesButton.input.pointerUp() && this.yesClicked == 1) {
                this.yesClicked = 0;
                game.global.username = this.nameBox.value;
                game.camera.fade(0x000000, 600);
                game.camera.onFadeComplete.add(function() {game.state.start('menu');}, this);
            }
            else if (this.yesButton.input.pointerOver()) {
                this.yesButton.animations.play('hover'); 
            }
            else this.yesButton.animations.play('normal');
        }
        else this.yesButton.animations.play('disabled');
    }
}