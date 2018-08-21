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
        

        
        game.global.previousState = 'menu';      
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

        var displayName;
        if(game.global.position == 'woodmarble')displayName = '弓箭手村';
        else if(game.global.position == 'woodmarble_mob')displayName = '銀蓮花叢林';
        else if(game.global.position == 'woodmarble_mob_2')displayName = '可疑的山丘';
        else if(game.global.position == 'darkwood')displayName = '奇幻村';
        else if(game.global.position == 'darkwood_mob')displayName = '黑森林通道';
        else if(game.global.position == 'darkwood_mob_2')displayName = '森林迷宮';
        else if(game.global.position == 'victown')displayName = '維多利亞港';
        else if(game.global.position == 'grassymap')displayName = '海岸草叢';
        else if(game.global.position == 'grassland')displayName = '森林小徑';
        else if(game.global.position == 'tutorial')displayName = '原來的世界';
        else if(game.global.position == 'tutorial2')displayName = '戰爭平原';
        else if(game.global.position == 'bossroom')displayName = '噩夢';
        this.locationLabel = game.add.text(413, 256, "Location: " + displayName ,{ font: '15px monospace', fill: '#664422' }); 
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
            var sound = game.add.audio('gameIn', 0.5);
            sound.play();
            game.camera.fade(0x000000, 600);
            loginState.BGM.stop();
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
        if(game.global.previousPosition == 'tutorial2' && game.global.position != 'tutorial2'){
            game.global.completeTutorial = true;
            game.global.HP = -1;
            game.global.maxHP = 50;
            game.global.maxMP = 50;
            game.global.level = 1;
            game.global.damage = 17;
            game.global.money = 0;
            game.global.familiarity = 0.7;
        }
        game.global.mapData = game.cache.getJSON('mapData');
        if(game.global.HP == 0){
            game.global.HP = game.global.maxHP / 2;
        }
        if(game.global.previousState == 'play'){
            var portal = game.global.mapData.portals;
            for(var i=0; i<portal.length; i++){
                if(portal[i].destination == game.global.previousPosition){
                    game.global.coordinate.x = portal[i].x;
                    game.global.coordinate.y = portal[i].y;
                }
            }
        }
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                firebase.database().ref('users/' + user.uid).set(
                    game.global
                ).then(function() {
                    game.state.start('play');
                }).catch(function(error){
                    console.error("寫入使用者資訊錯誤",error);
                });
            }
        });
        
    }
}



var loginState = {
    preload: function () {
        this.BGM = game.add.audio('title', 0.7);
        this.BGM.play();
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

                //firebase
                var email = this.emailBox.value;
                var password = this.passwordBox.value;
                firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
                    console.log(user);
                    var database = firebase.database().ref('users/' + user.user.uid);
                    database.once('value', function(snapshot) {
                        game.global = snapshot.val();
                        game.global.firstLogin = false;
                        game.camera.fade(0x000000, 600);
                        game.camera.onFadeComplete.add(function() {game.state.start('menu');}, this);
                    });
                }).catch(function(e){ 
                    console.log(e.message)
                });
                //

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


                //firebase
                var email = this.emailBox.value;
                var password = this.passwordBox.value;
                firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
                    firebase.database().ref('users/' + user.user.uid).set(
                        game.global
                    ).then(function() {
                        game.state.start('newUser');
                    }).catch(function(error){
                        console.error("寫入使用者資訊錯誤",error);
                    });

                }).catch(function(e){ 
                    console.log(e.message)
                });
                //



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
        
            var provider = new firebase.auth.GoogleAuthProvider();
        
            console.log('signInWithPopup');
            firebase.auth().signInWithPopup(provider).then(function (result) {
                var token = result.credential.accessToken;
                var user = result.user;
                console.log(result);

                if(result.additionalUserInfo.isNewUser){
                    firebase.database().ref('users/' + user.uid).set(
                        game.global
                    ).then(function() {
                        game.camera.fade(0x000000, 600);
                        game.camera.onFadeComplete.add(function() {game.state.start('newUser');}, this);
                    }).catch(function(error){
                        console.error("寫入使用者資訊錯誤",error);
                    });
                }else{
                    var database = firebase.database().ref('users/' + user.uid);
                    database.once('value', function(snapshot) {
                        game.global = snapshot.val();
                        game.camera.fade(0x000000, 600);
                        game.camera.onFadeComplete.add(function() {game.state.start('menu');}, this);
                    });
                }

            }).catch(function (error) {
                console.log('error: ' + error.message);
            });

            

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