var playState = {
    preload: function () {
        //地圖資料
        this.mapData = game.global.mapData;
        var image = this.mapData.image;
        var audio = this.mapData.audio;
        var tilemap = this.mapData.tilemap;
        var spritesheet = this.mapData.spritesheet;

        //載入資源
        game.load.tilemap(tilemap.name, tilemap.pos, null, Phaser.Tilemap.TILED_JSON);

        for(var i=0; i<image.length; i++){
            game.load.image(image[i].name, image[i].pos);
        }
        
        for(var i=0; i<audio.length; i++){
            game.load.audio(audio[i].name, audio[i].pos);
        }

        for(var i=0; i<spritesheet.length; i++){
            game.load.spritesheet(spritesheet[i].name, spritesheet[i].pos, spritesheet[i].width, spritesheet[i].height);
        }
    },
    create: function() {
        //地圖基本設置
        game.world.setBounds(0, 0, this.mapData.worldBounds.x, this.mapData.worldBounds.y);

        //背景音樂
        this.BGM = game.add.audio(this.mapData.bgm, 0.7);
        this.BGM.loop = true;
        this.BGM.play();

        //地圖建立
        this.createMap();

        //怪物建立
        this.createMob();

        //NPC建立
        this.createNPC();

        //導覽建立
        this.createTutorial();

        //玩家建立    座標( x ,  y )
        this.createPlayer(this.mapData.defaultPosition.x, this.mapData.defaultPosition.y);

        //掉落物
        this.createDropItemGroup();

        //傳送點建立
        this.createPortal();

        //控制
        this.cursor = game.input.keyboard.createCursorKeys();
        this.cursor.up.onDown.add(function(){playState.pushCommand('↑');});
        this.cursor.down.onDown.add(function(){playState.pushCommand('↓');});
        this.cursor.left.onDown.add(function(){playState.pushCommand('←');});
        this.cursor.right.onDown.add(function(){playState.pushCommand('→');});
        this.keyU = game.input.keyboard.addKey(Phaser.KeyCode.U);
        this.keyU.onDown.add(function(){
            var amount = game.global.maxEXP - game.global.EXP;
            console.log("EXP add " + amount);
            playState.increaseEXP(amount);
        });
        this.keyZ = game.input.keyboard.addKey(Phaser.KeyCode.Z);
        this.keyZ.onDown.add(function(){playState.pushCommand('Z');});
        this.keyX = game.input.keyboard.addKey(Phaser.KeyCode.X);
        this.keyX.onDown.add(function(){playState.pushCommand('X');});
        this.keyA = game.input.keyboard.addKey(Phaser.KeyCode.A);
        this.keyS = game.input.keyboard.addKey(Phaser.KeyCode.S);
        this.keyS.onDown.add(function(){console.log(game.global)});
        this.keySpace = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        this.keyEnter = game.input.keyboard.addKey(Phaser.KeyCode.ENTER);

        //視窗跟隨
        game.camera.setPosition(this.player.x - 400, this.player.y - 300);
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.025, 0.025);

        //畫面漸入
        game.camera.flash(0x000000, 800);

        this.currentKey = [];
        this.keyDown = false;
        this.upDown = false;
        this.downDown = false;
        this.leftDown = false;
        this.rightDown = false;
        this.enterDown = false;
        this.npcMissionSelect = 0;
        game.global.previousPosition = game.global.position;
        
        //starla
        this.createUI();
        //
    },

    update: function() {
        //背景
        for(var i=0; i<this.background.length; i++){
            if(this.background.children[i].type == 'relative'){
                this.background.children[i].x = (this.mapData.worldBounds.x - this.background.children[i].width) * game.camera.x / (this.mapData.worldBounds.x - 800);
                this.background.children[i].y = this.background.children[i].offsetCameraY + (this.mapData.worldBounds.y - (this.background.children[i].offsetCameraY + this.background.children[i].height)) * game.camera.y / (this.mapData.worldBounds.y - 600);
            }else if(this.background.children[i].type == 'fixedX'){
                this.background.children[i].x = game.camera.x;
                this.background.children[i].y = this.background.children[i].offsetCameraY + (this.mapData.worldBounds.y - (this.background.children[i].offsetCameraY + this.background.children[i].height)) * game.camera.y / (this.mapData.worldBounds.y - 600);
            }else{
                this.background.children[i].tilePosition.x -= this.background.children[i].speed;
                this.background.children[i].y = this.background.children[i].offsetCameraY + (this.background.children[i].offsetCameraY + this.mapData.worldBounds.y - this.background.children[i].height) * game.camera.y / (this.mapData.worldBounds.y - 600);
            }
        }

        //碰撞
        for(var i=0; i<this.floors.length - 1; i++){
            game.physics.arcade.collide(this.player, this.floors[i], this.touchFloor, null, this);
            game.physics.arcade.collide(this.mobs, this.floors[i]);
            game.physics.arcade.collide(this.drops, this.floors[i], function(drop, floor){
                if(drop.touchingDown == false){
                    drop.touchingDown = true;
                }else{
                    return;
                }
                var ny = drop.y;
                drop.body.gravity.y = 0;
                game.add.tween(drop).to({y: ny + 5}, 1000, null, true, 0, -1, true);
            }, null, this);
            game.physics.arcade.overlap(this.player, this.drops, this.pickUpItem, null, this);
        }
        game.physics.arcade.collide(this.mobs, this.floors[this.floors.length - 1]);

        //角色控制
        this.movePlayer();
        this.playerSpeedHandler();
        // this.playerAttackHandler();
        if(this.player.alertCount > 0)this.player.alertCount --;
        if(this.player.unbreakableCount > 0)this.player.unbreakableCount --;

        //UI
        // if(game.global.HP < game.global.maxHP) game.global.HP += 0.01;
        // this.healPlayer(0.01);
        this.redBar.updateCrop(this.cropRectHP);
        this.blueBar.updateCrop(this.cropRectMP);
        this.yellowBar.updateCrop(this.cropRectEXP);
        this.checkMenuBar();


        //繩梯
        this.player.touchConnect = false;
        game.physics.arcade.overlap(this.player, this.connect, this.touchConnect, null, this);        
        if(this.player.touchConnect == false){
            this.player.climbRope = false;
            this.player.climbLadder = false;
        }

        //碰撞怪物
        if(this.player.unbreakableCount == 0)
        game.physics.arcade.overlap(this.mobs, this.player, this.touchMob, null, this);

        //怪物擊中判定
        game.physics.arcade.overlap(this.mobs, this.hitboxes, this.hitMob, null, this);
        
        //傳送點判定
        game.physics.arcade.overlap(this.portals, this.player, this.atPortal, null, this);

        //玩家進入角色區判定
        game.physics.arcade.overlap(this.npcs, this.player, this.interactNpc, null, this);
        
        //指令陣列
        if(this.player.commandCount > 0){
            this.player.commandCount--;
            if(this.player.commandCount == 0){
                this.checkCommand();
            }
        }
        
    },

    createPlayer: function(_x, _y) {
        var x, y;
        var findPortal = false;
        var portals = this.mapData.portals;
        for(var i=0; i<portals.length; i++){
            if(game.global.previousPosition == portals[i].destination){
                x = portals[i].x;
                y = portals[i].y;
                findPortal = true;
            }
        }
        if(findPortal == false){
            x = _x;
            y = _y;
        }

        this.player = game.add.sprite(x, y, 'player');
        this.player.anchor.setTo(0.667, 0.48);
        this.player.scale.x = game.global.direction;

        //音效
        this.jumpSound = game.add.audio('jump', 0.5);
        this.levelUpSound = game.add.audio('levelUp', 0.5);
        this.portalSound = game.add.audio('portal', 0.5);
        this.swordLSound = game.add.audio('swordL', 0.6);

        //動作
        this.player.animations.add('stand', [0, 1, 2, 1], 2, true);
        this.player.animations.add('walk', [3, 4, 5, 6], 5, true);
        this.player.animations.add('alert', [7, 8, 9], 3, true);
        attack0 = this.player.animations.add('swing1', [10, 10, 11, 12, 12], 10, false);
        attack1 = this.player.animations.add('swing2', [13, 13, 14, 15, 15], 10, false);
        attack2 = this.player.animations.add('swing3', [16, 16, 17, 17, 18, 18], 10, false);
        attack3 = this.player.animations.add('swing4', [19, 20, 21, 22], 8, false);
        attack4 = this.player.animations.add('stab',   [23, 23, 23, 24, 24, 24], 10, false);
        this.player.animations.add('jump',   [25], 1, false);
        this.player.animations.add('climbLadder', [26, 26, 27, 27], 10, true);
        this.player.animations.add('climbRope',   [28, 28, 29, 29], 10, true);
        attack0.onComplete.add(function () {this.player.attacking = false;}, this);
        attack1.onComplete.add(function () {this.player.attacking = false;}, this);
        attack2.onComplete.add(function () {this.player.attacking = false;}, this);
        attack3.onComplete.add(function () {this.player.attacking = false;}, this);
        attack4.onComplete.add(function () {this.player.attacking = false;}, this);

        //屬性
        game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.gravity.y = 2300;
        this.player.body.collideWorldBounds=true;
        this.player.body.setSize(27, 65, 100, 37);
        this.player.familiarity = game.global.familiarity;
        this.player.speed = {x: 0,y: 0};
        this.player.speedAir = {x: 0,y: 0};
        this.player.alertCount = 0;
        this.player.unbreakableCount = 0;
        this.player.onBottom = false;
        this.player.touchConnect = false;
        this.player.climbRope = false;
        this.player.climbLadder = false;
        this.player.canJumpDown = true;
        this.player.canDoubleJump = true;
        this.player.commandCount = 0;
        this.player.commandArray = [];
        if(game.global.HP == -1){
            game.global.HP = game.global.maxHP;
            game.global.MP = 0;
            game.global.EXP = 0;
            game.global.level = 1;
        }

        //攻擊特效、範圍
        this.hitboxes = game.add.group();
        this.hitboxes.enableBody = true;
        this.player.addChild(this.hitboxes);

        this.swing1 = this.hitboxes.create(0, 0, 'swing1', 0, false);
        this.swing1.name = 'swing1'
        this.swing1.offsetx = -53;
        this.swing1.offsety = -13;
        this.swing1.animationType = 'swing1';
        this.swing1.scale.setTo(1.3, 1.3);
        this.swing1.body.setSize(64, 43, 9, 2);

        this.swing2 = this.hitboxes.create(0, 0, 'swing2', 0, false);
        this.swing2.name = 'swing2'
        this.swing2.offsetx = -39;
        this.swing2.offsety = 9;
        this.swing2.animationType = 'swing2';
        this.swing2.scale.setTo(1.3, 1.3);
        this.swing2.body.setSize(64, 45, 9, 4);

        this.swing3 = this.hitboxes.create(0, 0, 'swing3', 0, false);
        this.swing3.name = 'swing3'
        this.swing3.offsetx = -74;
        this.swing3.offsety = -2;
        this.swing3.animationType = 'swing3';
        this.swing3.scale.setTo(1.25, 1.25);
        this.swing3.body.setSize(58, 25, 9, 10);

        this.stab = this.hitboxes.create(0, 0, 'stab', 0, false);
        this.stab.name = 'stab'
        this.stab.offsetx = -70;
        this.stab.offsety = 6;
        this.stab.animationType = 'stab';

        this.skill4311003 = this.hitboxes.create(0, 0, '4311003_effect', 0, false);
        this.skill4311003.name = '4311003';
        this.skill4311003.offsetx = 0;
        this.skill4311003.offsety = 0;
        this.skill4311003.animationType = 'swing4';
        this.skill4311003.mpCost = 0;
        this.skill4311003.animations.add('effect', [0, 1, 2, 3, 4, 5], 12, false);
        this.skill4311003.body.setSize(109, 80, 13, 23);
        this.skill4311003.useSound = game.add.audio('4311003_use', 0.5);
        this.skill4311003.hitSound = game.add.audio('4311003_hit', 0.5);

        this.skill4331004 = this.hitboxes.create(0, 0, '4331004_effect', 0, false);
        this.skill4331004.name = '4331004';
        this.skill4331004.offsetx = -100;
        this.skill4331004.offsety = -65;
        this.skill4331004.animationType = 'swing1';
        this.skill4331004.mpCost = 30;
        this.skill4331004.animations.add('effect', [0, 1, 2, 3, 4, 5, 6], 14, false);
        this.skill4331004.body.setSize(160, 150, 30, 50);
        this.skill4331004.useSound = game.add.audio('4331004_use', 0.5);
        this.skill4331004.hitSound = game.add.audio('4331004_hit', 0.5);

        this.skill4341004 = this.hitboxes.create(0, 0, '4341004_effect', 0, false);
        this.skill4341004.name = '4341004';
        this.skill4341004.offsetx = -5;
        this.skill4341004.offsety = -30;
        this.skill4341004.animationType = 'swing4';
        this.skill4341004.mpCost = 0;
        this.skill4341004.animations.add('effect', [0, 1, 2, 3, 4, 5, 6, 7], 16, false);
        this.skill4341004.body.setSize(349, 123, 62, 42);
        this.skill4341004.useSound = game.add.audio('4331004_use', 0.5);
        this.skill4341004.hitSound = game.add.audio('4331004_hit', 0.5);


        this.hitboxes.setAll('anchor.x', 0.5);
        this.hitboxes.setAll('anchor.y', 0.5);

        this.doubleJumpSound = game.add.audio('4321003_use', 0.5);

        this.player.attacking = false;
        this.player.interactNpc = false;
    },

    createNPC: function() {
        if(this.mapData.npc == null)return;
        //建立group
        this.npcs = game.add.group();
        this.npcs.enableBody = true;

        //讀取全部角色資料
        var npcData = this.mapData.npc;
        var npcNum = npcData.length;

        if(npcData == null)return;

        for(var i=0; i<npcNum; i++){
            //讀取第i種角色資料
            var npcName = npcData[i].name;
            var spawnPos = npcData[i].spawnPosition;
            var animation = npcData[i].animation;            

            //產生角色
            var x = spawnPos.x;
            var y = spawnPos.y;
            var npc = this.npcs.create(x, y, npcName);
            npc.spawnX = x;
            npc.spawnY = y;
            npc.animations.add('stand', animation.frames, animation.speed, false);
            npc.name = npcData[i].name;
            npc.name_cht = npcData[i].name_cht;
            npc.frames = animation.frames;
            npc.speed = animation.speed;
            npc.startFrame = animation.startFrame;
            npc.content = npcData[i].content;
            npc.murmur = npcData[i].murmur;
            npc.body.setSize(npcData[i].bodySize.x*3,npcData[i].bodySize.y , -npcData[i].bodySize.x, 0);
            console.log(y+(npcData[i].bodySize.y)+10);
            this.namebox = game.add.image(x+(npcData[i].bodySize.x)/2, y+(npcData[i].bodySize.y)+3, 'namebox');
            this.namebox.anchor.setTo(0.5, 0);
            this.name = game.add.text(x+(npcData[i].bodySize.x)/2, y+(npcData[i].bodySize.y)+3, npc.name_cht, {
                font: "12px",
                fill: "#ffffff"
            });
            this.name.anchor.setTo(0.5, 0);
            game.time.events.loop(3000, function(npc){
                npc.animations.play('stand')
            }, this, npc);   
        }
    },

    createTutorial: function()
    {
        if(this.mapData.tutorial == null){
            return;
        }
        var tutorialData = this.mapData.tutorial;
        var tutorialNum = tutorialData.length;

        if(tutorialData == null)return;

        for(var i=0; i<tutorialNum; i++)
        {
            var pos = tutorialData[i].pos;
            var hint = game.add.sprite(pos.x, pos.y, tutorialData[i].name);
            hint.animations.add('animate', [0, 1, 2, 3, 4, 5], 10, true);
            hint.animations.play('animate');
        }
    },

    createMap: function() {
        var tilemap = this.mapData.tilemap;
        var tileData = this.mapData.tileData;
        var backgroundImage = this.mapData.backgroundImage;

        //背景
        this.background = game.add.group();
        for(var i=0; i<backgroundImage.length - 1; i++){
            if(backgroundImage[i].type == 'tile'){
                var image = game.add.tileSprite(0, 0, this.mapData.worldBounds.x, 600, backgroundImage[i].name);
                this.background.add(image);
                image.speed = backgroundImage[i].speed;
            }else if(backgroundImage[i].type == 'absolute'){
                var image = game.add.sprite(backgroundImage[i].x, backgroundImage[i].y, backgroundImage[i].name);
            }else{
                var image = this.background.create(0, 0 + backgroundImage[i].offsetY, backgroundImage[i].name);
            }
            image.type = backgroundImage[i].type;
            image.offsetCameraY = backgroundImage[i].offsetY;
        }
        // this.tile = game.add.tileSprite(0, 20, this.mapData.worldBounds.x, 213, 'c5');
        // this.tile.fixedToCamera = true;

        game.add.sprite(0, 0, backgroundImage[backgroundImage.length - 1].name);
        
        //tilemap
        map = game.add.tilemap(tilemap.name);
        map.addTilesetImage('block');
        this.floors = [];

        //建立Layer
        var bottom = map.createLayer(tileData.floor[0]);
        map.setCollision([tileData.firstgid], true, bottom);
        bottom.alpha = 0;
        this.floors.push(bottom);
        this.bottomName = bottom.layer.name;
        for(var i=1; i<tileData.floor.length; i++){
            var floor = map.createLayer(tileData.floor[i]);
            this.floors.push(floor);
            map.setCollision([tileData.firstgid], true, floor);
            //隱藏
            floor.alpha = 0;
            if(i < tileData.floor.length - 1){
                map.forEach(function(tile){
                    tile.collideLeft = false;
                    tile.collideRight = false;
                    tile.collideDown = false;
                }, undefined, undefined, undefined, undefined, undefined, floor);
            }
        }
        var connect = map.createLayer(tileData.connect);
        map.setCollision([tileData.firstgid], true, connect);
        map.setCollision([tileData.firstgid + 1], true, connect);
        connect.alpha = 0;
        var cArr = connect.getTiles(0, 0, this.mapData.worldBounds.x, this.mapData.worldBounds.x, true);
        this.connect = game.add.group();
        this.connect.enableBody = true;
        for(var i=0; i<cArr.length; i++){
            var tile;
            if(cArr[i].layer.offsetX || cArr[i].layer.offsetY){
                tile = this.connect.create(cArr[i].worldX + cArr[i].layer.offsetX, cArr[i].worldY + cArr[i].layer.offsetY, 'red');
            }else{
                tile = this.connect.create(cArr[i].worldX, cArr[i].worldY, 'red');
            }
            tile.alpha = 0;
            tile.body.setSize(5, 30, 20, 0);
            if(cArr[i].index == tileData.firstgid){
                tile.type = 'rope';
            }else{
                tile.type = 'ladder';
            }
        }
    },

    createPortal: function() {
        //載入地圖資料
        var portalArr = this.mapData.portals;

        //建立group
        this.portals = game.add.group();
        this.portals.enableBody = true;

        //建立傳送點
        for(var i=0; i<portalArr.length; i++){
            var portal = this.portals.create(portalArr[i].x - 5, portalArr[i].y + 34, 'portal');
            portal.anchor.setTo(0.5, 1);
            portal.body.setSize(20, 30, 33, 225);
            portal.destination = portalArr[i].destination;
            portal.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
            portal.animations.play('idle');
        }
    },

    createDropItemGroup: function(){
        this.drops = game.add.group();
        this.drops.enableBody = true;
    },

    //starla
    createUI: function() {
        this.UIgroup = game.add.group();

        this.bar = game.add.sprite(0, 0, 'bar');
        this.UIgroup.add(this.bar);


        //經驗條 (yellow)
        this.emptyEXP = game.add.sprite(112, 533, 'emptyEXP');
        this.UIgroup.add(this.emptyEXP);
        this.yellowBar = game.add.sprite(112, 533, 'yellowBar');
        this.UIgroup.add(this.yellowBar);
        this.cropRectEXP = new Phaser.Rectangle(0, 0, 16 + 148 * game.global.EXP / game.global.maxEXP, this.yellowBar.height);
        this.yellowBar.crop(this.cropRectEXP);

        //HP (red)
        this.emptyHP = game.add.sprite(40, 550, 'emptyBar');
        this.UIgroup.add(this.emptyHP);
        this.redBar = game.add.sprite(40, 550, 'redBar');
        this.UIgroup.add(this.redBar);
        this.cropRectHP = new Phaser.Rectangle(0, 0, 17 + 222 * game.global.HP / game.global.maxHP, this.redBar.height);
        this.redBar.crop(this.cropRectHP);

        //MP (blue)
        this.emptyMP = game.add.sprite(40, 567, 'emptyBar');
        this.UIgroup.add(this.emptyMP);
        this.blueBar = game.add.sprite(40, 567, 'blueBar');
        this.UIgroup.add(this.blueBar);
        this.cropRectMP = new Phaser.Rectangle(0, 0, 17 + 222 * game.global.MP / game.global.maxMP, this.blueBar.height);
        this.blueBar.crop(this.cropRectMP);


        //名字
        this.nameLabel = game.add.text(91, 495, game.global.username ,{ font: '15px monospace', fill: '#212121' }); 
        this.UIgroup.add(this.nameLabel);

        //地點
        this.locationLabel = game.add.text(105, 516, game.global.position ,{ font: '10px monospace', fill: '#212121' }); 
        this.UIgroup.add(this.locationLabel);

        //錢
        this.moneyLabel = game.add.text(213, 516, game.global.money ,{ font: '10px monospace', fill: '#212121' }); 
        this.UIgroup.add(this.moneyLabel);
        
        //等級
        this.levelLabel = game.add.text(59, 503, game.global.level ,{ font: '26px sans-serif', fill: '#ffffff' });
        this.levelLabel.anchor.setTo(0.5, 0);
        this.UIgroup.add(this.levelLabel);
        this.levelLabel2 = game.add.text(-22, 12, "Lv." ,{ font: '12px sans-serif', fill: '#ffffff' });
        this.levelLabel2.anchor.setTo(0.5, 0);
        this.levelLabel.addChild(this.levelLabel2);

        this.menuBarState = -1;

        this.mission = game.add.sprite(570, 520, 'menuBar');
        this.mission.scale.setTo(0.7,0.7);
        this.mission.inputEnabled = true;
        this.mission.animations.add('normal', [0], 1, false);
        this.mission.animations.add('onclick', [1], 1, false);
        this.mission.animations.add('clicked', [2], 1, false);
        this.UIgroup.add(this.mission);

        this.bag = game.add.sprite(645, 520, 'menuBar');
        this.bag.scale.setTo(0.7,0.7);
        this.bag.inputEnabled = true;
        this.bag.animations.add('normal', [3], 1, false);
        this.bag.animations.add('onclick', [4], 1, false);
        this.bag.animations.add('clicked', [5], 1, false);
        this.UIgroup.add(this.bag);

        this.skill = game.add.sprite(720, 520, 'menuBar');
        this.skill.scale.setTo(0.7,0.7);
        this.skill.inputEnabled = true;
        this.skill.animations.add('normal', [6], 1, false);
        this.skill.animations.add('onclick', [7], 1, false);
        this.skill.animations.add('clicked', [8], 1, false);
        this.UIgroup.add(this.skill);

        this.UIgroup.fixedToCamera = true;
    },
    
    checkMenuBar: function() {
        if (this.menuBarState == 0) {
            if (game.input.activePointer.leftButton.isDown 
                && !this.bag.input.pointerDown() 
                && !this.mission.input.pointerDown() && !this.missionBox.input.pointerDown()
                && !this.skill.input.pointerDown()) {
                this.menuBarState = -1;
            }
        }
        else if (this.menuBarState == 1) {
            if (game.input.activePointer.leftButton.isDown 
                && !this.bag.input.pointerDown() && !this.bagBox.input.pointerDown()
                && !this.mission.input.pointerDown() 
                && !this.skill.input.pointerDown()) {
                    if (this.bagItem) {
                        var anyDown = 0;
                        for(var i = 0; i < game.global.items.length; i++) {
                            if (this.bagItem[i].input.pointerDown()) {
                                anyDown = 1;
                                i = game.global.items.length;
                            }
                        }
                        if (!anyDown) this.menuBarState = -1;
                    }
                    else this.menuBarState = -1;
                
            }
        }
        else if (this.menuBarState == 2) {
            if (game.input.activePointer.leftButton.isDown 
                && !this.bag.input.pointerDown() 
                && !this.mission.input.pointerDown() 
                && !this.skill.input.pointerDown() && !this.skillBox.input.pointerDown()) {
                this.menuBarState = -1;
            }
        }
        

        this.checkMission();

        this.checkBag();

        this.checkSkill();



        
    },
    checkBag: function() {
        if (this.bag) {
            if (this.bag.input.pointerDown() && this.menuBarState != 1){
                this.bagClick = 1;
                this.bag.animations.play('clicked');
            }
            else if (this.bag.input.pointerDown() && this.menuBarState == 1){
                this.bagClick = 1;
                this.bag.animations.play('clicked');
            }
            else if (this.bag.input.pointerUp() && this.menuBarState != 1 && this.bagClick){
                this.bag.animations.play('clicked');
                this.menuBarState = 1;
                this.bagClick = 0;
                this.showBag();
            }
            else if (this.bag.input.pointerUp() && this.menuBarState == 1 && this.bagClick) {
                    this.bag.animations.play('onclick');
                    this.menuBarState = -1;
                    this.bagClick = 0;            
                    this.hideBag();
            }
            else if (this.bag.input.pointerOver() && this.menuBarState != 1) this.bag.animations.play('onclick');
            else if (this.menuBarState == 1) this.bag.animations.play('clicked');            
            else {
                this.bag.animations.play('normal');
                if (this.bagBox) this.hideBag();
                
            }
    
            if (this.bagItem) {
                for(var i = 0; i < game.global.items.length; i++) {
                    if (this.bagItem[i]) {
                        console.log("lent" + this.bagItem.length);
                        if (this.bagItem[i].input.pointerDown()) {
                            this.bagItemClick[i] = 1;
                        }
                        else if (this.bagItem[i].input.pointerUp() && this.bagItemClick[i] && game.global.items[i].type == 'consume') {
                            if(game.global.items[i].name == 'red_potion'){
                                this.healPlayer(50);
                            }
                            this.deleteItem(i, 1);
                        }
                    }
                }

            }

        }
        
        
        
            
    },
    checkMission: function() {
        if (this.mission.input.pointerDown() && this.menuBarState != 0){
            this.missionClick = 1;
            this.mission.animations.play('clicked');
        }
        else if (this.mission.input.pointerDown() && this.menuBarState == 0){
            this.missionClick = 1;
            this.mission.animations.play('clicked');
        }
        else if (this.mission.input.pointerUp() && this.menuBarState != 0 && this.missionClick){
            this.mission.animations.play('clicked');
            this.menuBarState = 0;
            this.missionClick = 0;
            this.showMission();
        }
        else if (this.mission.input.pointerUp() && this.menuBarState == 0 && this.missionClick) {
            this.mission.animations.play('onclick');
            this.menuBarState = -1;
            this.missionClick = 0;    
            if (this.missionBox) this.hideMission();
            
        }
        else if (this.mission.input.pointerOver() && this.menuBarState != 0) this.mission.animations.play('onclick');
        else if (this.menuBarState == 0) this.mission.animations.play('clicked');            
        else {
            this.mission.animations.play('normal');
            if (this.missionBox) this.hideMission();
            
        }

            
    },
    checkSkill: function() {
        if (this.skill.input.pointerDown() && this.menuBarState != 2){
            this.skillClick = 1;
            this.skill.animations.play('clicked');
        }
        else if (this.skill.input.pointerDown() && this.menuBarState == 2){
            this.skillClick = 1;
            this.skill.animations.play('clicked');
        }
        else if (this.skill.input.pointerUp() && this.menuBarState != 2 && this.skillClick){
            this.skill.animations.play('clicked');
            this.menuBarState = 2;
            this.skillClick = 0;
            this.showSkill();
        }
        else if (this.skill.input.pointerUp() && this.menuBarState == 2 && this.skillClick) {
            this.skill.animations.play('onclick');
            this.menuBarState = -1;
            this.skillClick = 0;    
            if (this.skillBox) this.hideSkill();
            
        }
        else if (this.skill.input.pointerOver() && this.menuBarState != 2) this.skill.animations.play('onclick');
        else if (this.menuBarState == 2) this.skill.animations.play('clicked');            
        else {
            this.skill.animations.play('normal');
            if (this.skillBox) this.hideSkill();
            
        }
    },
    showBag: function() {
        this.bagBox = game.add.sprite(570, 290, 'bagBox');
        this.bagBox.inputEnabled = true;
        
        this.bagBox.scale.setTo(0.4,0.4);
        this.UIgroup.add(this.bagBox); 

        this.showBagItem();
        
    },
    hideBag: function() {
        this.hideBagItem();
        this.bagBox.kill();
    },
    showBagItem: function() {
        this.bagItem = [];
        this.bagItemClick = [];
        this.itemNumLabel = [];
        for(var i = 0; i < game.global.items.length; i++) {
            this.bagItem[i] = game.add.sprite(593 + (i%4)*50, 311 + Math.floor(i/4)*50, game.global.items[i].name);
            this.bagItem[i].inputEnabled = true;
            this.itemNumLabel[i] = game.add.text(585 + (i%4)*50, 332 + Math.floor(i/4)*50, game.global.items[i].num ,{ font: '12px monospace', fill: '#212121' }); 
            this.UIgroup.add(this.bagItem[i]);
            this.UIgroup.add(this.itemNumLabel[i]);
            this.bagItemClick[i] = 0;
            
        }
    },
    hideBagItem: function() {
        this.bagItemClick = [];
        for(var i = 0; i < game.global.items.length; i++) {
            if (this.bagItem[i]) this.bagItem[i].kill();
            if (this.itemNumLabel[i]) this.itemNumLabel[i].kill();

        }
        this.bagItem = [];
        this.itemNumLabel = [];
    },
    showMission: function() {
        if (game.global.missionList[0]) {
            this.missionBox = game.add.sprite(497, 290, 'missionBox');
            this.missionBox.inputEnabled = true;
            this.missionBox.scale.setTo(0.4,0.4);
            this.UIgroup.add(this.missionBox);         

            this.missionTitleLabel = game.add.text(592, 309, game.global.missionList[0].title ,{ font: '15px monospace', fill: '#ffffff' }); 
            this.UIgroup.add(this.missionTitleLabel);

            this.missionRewardLabel = game.add.text(567, 338, game.global.missionList[0].reward[0].type + " " + game.global.missionList[0].reward[0].amount,{ font: '15px monospace', fill: '#ffffff' }); 
            this.UIgroup.add(this.missionRewardLabel);

            this.missionTargetLabel = game.add.text(567, 367, game.global.missionList[0].targetDisplayName + "  " + game.global.missionList[0].completeAmount + "/" + game.global.missionList[0].goalAmount ,{ font: '15px monospace', fill: '#ffffff' }); 
            this.UIgroup.add(this.missionTargetLabel);

            this.missionDescriptionLabel = game.add.text(515, 425, game.global.missionList[0].description ,{ font: '15px monospace', fill: '#ffffff' }); 
            this.UIgroup.add(this.missionDescriptionLabel);
        }
        else {
            this.missionBox = game.add.sprite(497, 290, 'noMissionBox');
            this.missionBox.inputEnabled = true;            
            this.missionBox.scale.setTo(0.4,0.4);
            this.UIgroup.add(this.missionBox);

            this.missionCat = game.add.sprite(575, 350, 'catStatue');
            this.missionCat.scale.setTo(0.75,0.75);
            this.missionCat.inputEnabled = true;
            this.missionCat.animations.add('blink', [0,1,2], 3, true);
            this.missionCat.animations.play('blink');
            this.UIgroup.add(this.missionCat);
        }
        
    },
    hideMission: function() {
        this.missionBox.kill();
        if (game.global.missionList[0]) {
            if (this.missionTitleLabel) this.missionTitleLabel.kill();
            if (this.missionRewardLabel)this.missionRewardLabel.kill();
            if (this.missionTargetLabel) this.missionTargetLabel.kill();
            if (this.missionDescriptionLabel) this.missionDescriptionLabel.kill();
        }
        else {
            if (this.missionCat) this.missionCat.kill();
        }
            
        
        

    },
    showSkill: function() {
        this.skillBox = game.add.sprite(505, 150, 'skillBox');
        this.skillBox.inputEnabled = true;            
        this.skillBox.scale.setTo(0.55,0.55);
        this.UIgroup.add(this.skillBox);

        this.skillTitle1 = game.add.text(572, 188, "狂刃風暴" ,{ font: '15px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillTitle1);

        this.skillTitle2 = game.add.text(572, 262, "技能二" ,{ font: '15px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillTitle2);

        this.skillTitle3 = game.add.text(572, 336, "技能三" ,{ font: '15px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillTitle3);

        this.skillTitle4 = game.add.text(572, 410, "二段跳" ,{ font: '15px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillTitle4);

        this.skillSubTitle1 = game.add.text(650, 193, "等級需求:5  MP消耗:30" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillSubTitle1);

        this.skillSubTitle2 = game.add.text(650, 267, "等級需求:10  MP消耗:30" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillSubTitle2);

        this.skillSubTitle3 = game.add.text(650, 341, "等級需求:20  MP消耗:30" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillSubTitle3);

        this.skillSubTitle4 = game.add.text(650, 413, "等級需求:10  MP消耗:20" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillSubTitle4);

        this.skillText1 = game.add.text(542, 214, "使用方法: 前前攻\n效果: 造成120%傷害2下" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillText1);

        this.skillText2 = game.add.text(542, 288, "使用方法: 前前攻\n效果: 造成120%傷害2下" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillText2);

        this.skillText3 = game.add.text(542, 362, "使用方法: 前前攻\n效果: 造成120%傷害2下" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillText3);

        this.skillText4 = game.add.text(542, 436, "使用方法: 在空中再按一次跳\n效果: 往前跳躍一段距離" ,{ font: '10px monospace', fill: '#ffffff' }); 
        this.UIgroup.add(this.skillText4);
    },
    hideSkill: function() {
        if (this.skillBox) this.skillBox.kill();
        if (this.skillTitle1) this.skillTitle1.kill();
        if (this.skillTitle2) this.skillTitle2.kill();
        if (this.skillTitle3) this.skillTitle3.kill();        
        if (this.skillTitle4) this.skillTitle4.kill();
        
        if (this.skillSubTitle1) this.skillSubTitle1.kill();
        if (this.skillSubTitle2) this.skillSubTitle2.kill();
        if (this.skillSubTitle3) this.skillSubTitle3.kill();  
        if (this.skillSubTitle4) this.skillSubTitle4.kill();
        
        if (this.skillText1) this.skillText1.kill();
        if (this.skillText2) this.skillText2.kill();
        if (this.skillText3) this.skillText3.kill();
        if (this.skillText4) this.skillText4.kill();

    },
    addItem: function(name, type, num) {
        if(this.bagBox && this.bagItem)this.hideBagItem();

        var index = -1;
        for (var i = 0 ; i < game.global.items.length; i++) {
            if (game.global.items[i].name == name) {
                index = i;
                i = game.global.items.length;
            }
            else index = -1;
        }
        if (index == -1) {
            var newItem = {
                name: name,
                type: type,
                num: num
            }
            game.global.items.push(newItem);
        }
        else {
            game.global.items[index].num = game.global.items[index].num + num;
        }
        if(this.bagBox && this.bagItem)this.showBagItem();
    },
    deleteItem: function(index, num) {
        this.hideBagItem();
        if (game.global.items[index].num > num){
            game.global.items[index].num -= num;
        }
        else {
            game.global.items.splice(index, 1);

        }
        
        this.showBagItem();
    },

    movePlayer: function() {
        //確保攻擊動畫不被中斷
        if (this.player.attacking || this.player.interactNpc) return;

        if(this.player.climbRope == true || this.player.climbLadder == true){
            this.player.canJumpDown = false;
            this.player.speed.x = 0;
            this.player.body.gravity.y = 0;
            if(this.player.climbLadder == true){
                this.player.animations.frame = Math.floor(26 + this.player.y % 40 / 20);
            }else{
                this.player.animations.frame = Math.floor(28 + this.player.y % 40 / 20);
            }
            if(this.cursor.up.isDown){
                this.player.speed.y = -90;
            }else if(this.cursor.down.isDown){
                this.player.speed.y = 90;
                if(this.player.body.onFloor() || this.player.body.touching.down){
                    this.player.climbRope = false;
                    this.player.climbLadder = false;
                }
            }else if(this.keyX.isDown){
                if(this.cursor.left.isDown){
                    this.player.body.gravity.y = 2300;
                    this.player.climbRope = false;
                    this.player.climbLadder = false;
                    this.player.body.velocity.x = -150;
                    this.player.body.velocity.y = -350;
                    this.player.animations.frame = 25;
                    this.jumpSound.play();
                    this.player.scale.x = 1;
                }else if(this.cursor.right.isDown){
                    this.player.body.gravity.y = 2300;
                    this.player.climbRope = false;
                    this.player.climbLadder = false;
                    this.player.body.velocity.x = 150;
                    this.player.body.velocity.y = -350;
                    this.player.animations.frame = 25;
                    this.jumpSound.play();
                    this.player.scale.x = -1;
                }
            }else{
                this.player.speed.y = 0;
            }
        }else{
            //左右 or 站立
            if(this.player.canJumpDown == false){
                game.time.events.add(300, function() {
                    this.player.canJumpDown = true;
                }, this);
            }
            this.player.body.gravity.y = 2300;
            this.player.speed.y = 0;
            if (this.cursor.left.isDown){
                if(this.player.body.onFloor() || this.player.body.touching.down){
                    this.player.speed.x += 30;
                    this.player.animations.play('walk');
                }else{
                    this.player.speedAir.x = 20;
                }
                if(this.player.scale.x < 0){
                    this.player.scale.x *= -1;
                }
            }else if(this.cursor.right.isDown){
                if(this.player.body.onFloor() || this.player.body.touching.down){
                    this.player.speed.x += 30;
                    this.player.animations.play('walk');
                }else{
                    this.player.speedAir.x = 20;
                }
                if(this.player.scale.x > 0){
                    this.player.scale.x *= -1;
                }
            }else if(this.player.body.onFloor() || this.player.body.touching.down){
                if(this.player.alertCount > 0){
                    this.player.animations.play('alert');
                }else{
                    this.player.animations.play('stand');
                }
                this.player.speed.x = 0;
                this.player.speedAir.x = 0;
            }
    
            //跳
            if(this.keyX.isDown && (this.player.body.onFloor() || this.player.body.touching.down)){
                this.player.body.velocity.y = -600;
                this.player.animations.play('jump');
                this.player.canDoubleJump = true;
                this.jumpSound.play();
            }else if(this.player.canJumpDown && this.cursor.down.isDown && this.player.onBottom == false && (this.player.body.onFloor() || this.player.body.touching.down)){
                this.player.body.y+=17;
                this.player.animations.play('jump');
                // this.jumpSound.play();
            }
        }
    },

    playerSpeedHandler: function() {
        //最高速度
        if(this.player.speed.x > 150 && !this.player.attacking) this.player.speed.x = 150;
        if(this.player.body.velocity.y > 900) this.player.body.velocity.y = 900;

        //根據角色方向給予速度
        if(this.player.body.onFloor() || this.player.body.touching.down){
            if(this.player.scale.x > 0){
                this.player.body.velocity.x = -this.player.speed.x;
            }else{
                this.player.body.velocity.x = this.player.speed.x;
            }
        }else{
            if(!this.player.climbRope && !this.player.climbLadder && this.player.body.velocity.x == 0){
                if(this.player.scale.x > 0){
                    this.player.body.velocity.x = -this.player.speedAir.x;
                }else{
                    this.player.body.velocity.x = this.player.speedAir.x;
                }
            }
        }

        //垂直速度
        if(this.player.body.gravity.y == 0){
            this.player.body.velocity.y = this.player.speed.y;
        }
    },

    playerAttackHandler: function() {
        if(this.currentKey.length == 0)return;
        if(!this.player.attacking && !this.player.climbRope && !this.player.climbLadder){
            console.log(this.currentKey);
            if(this.arrayCompare(this.currentKey, ['←', '←', 'Z']) || this.arrayCompare(this.currentKey, ['→', '→', 'Z'])){
                console.log('技能0');
                //技能4331004
                var hitbox = playState.hitboxes.getByName('4311003');

                //消耗魔力
                if(game.global.MP >= hitbox.mpCost){
                    game.global.MP -= hitbox.mpCost;
                    game.add.tween(this.cropRectMP).to({width: 17 + 222 * game.global.MP / game.global.maxMP}, 500, null, true);
                }else{
                    return;
                }
                hitbox.damage = Math.floor(game.global.damage * 1.2);
                hitbox.hit = 2;
                hitbox.valid = true;
                
                //角色進入戰鬥狀態
                this.player.alertCount = 180;
                
                //特效
                game.time.events.add(200, function(hitbox) {
                    hitbox.useSound.play();
                    hitbox.alpha = 1;
                    hitbox.reset(hitbox.offsetx, hitbox.offsety);
                    hitbox.animations.play('effect');
                    
                    game.time.events.add(400, function(hitbox) {
                        hitbox.valid = false;
                    }, this, hitbox);
                    game.time.events.add(700, function(hitbox) {
                        hitbox.kill();
                    }, this, hitbox);
                }, this, hitbox);

                this.player.speed.x = 450;
                this.player.animations.play(hitbox.animationType);
                this.player.attacking = true;
            }else if(this.arrayCompare(this.currentKey, ['←', '↑', 'Z']) || this.arrayCompare(this.currentKey, ['→', '↑', 'Z'])){
                console.log('技能1');
                //技能4331004
                var hitbox = playState.hitboxes.getByName('4331004');

                //消耗魔力
                if(game.global.MP >= hitbox.mpCost){
                    game.global.MP -= hitbox.mpCost;
                    game.add.tween(this.cropRectMP).to({width: 17 + 222 * game.global.MP / game.global.maxMP}, 500, null, true);
                }else{
                    return;
                }
                hitbox.damage = Math.floor(game.global.damage * 2.00);
                hitbox.hit = 3;
                hitbox.valid = true;
                
                //角色進入戰鬥狀態
                this.player.alertCount = 180;
                
                //特效
                game.time.events.add(200, function(hitbox) {
                    hitbox.useSound.play();
                    hitbox.alpha = 1;
                    hitbox.reset(hitbox.offsetx, hitbox.offsety);
                    hitbox.animations.play('effect');
                    
                    game.time.events.add(100, function(hitbox) {
                        hitbox.valid = false;
                    }, this, hitbox);
                    game.time.events.add(700, function(hitbox) {
                        hitbox.kill();
                    }, this, hitbox);
                }, this, hitbox);

                this.player.speed.x = 0;
                this.player.animations.play(hitbox.animationType);
                this.player.attacking = true;
            }else if(this.arrayCompare(this.currentKey, ['←', '→', 'Z']) || this.arrayCompare(this.currentKey, ['→', '←', 'Z'])){
                console.log('技能2');
                //技能4331004
                var hitbox = playState.hitboxes.getByName('4341004');

                //消耗魔力
                if(game.global.MP >= hitbox.mpCost){
                    game.global.MP -= hitbox.mpCost;
                    game.add.tween(this.cropRectMP).to({width: 17 + 222 * game.global.MP / game.global.maxMP}, 500, null, true);
                }else{
                    return;
                }
                hitbox.damage = Math.floor(game.global.damage * 1.50);
                hitbox.hit = 6;
                hitbox.valid = true;

                
                //角色進入戰鬥狀態
                this.player.alertCount = 180;
                
                //特效
                game.time.events.add(200, function(hitbox) {
                    this.player.y -= 30;
                    this.player.body.gravity.y = 0;
                    hitbox.useSound.play();
                    hitbox.alpha = 1;
                    hitbox.reset(hitbox.offsetx, hitbox.offsety);
                    hitbox.animations.play('effect');
                    
                    game.time.events.add(100, function(hitbox) {
                        hitbox.valid = false;
                    }, this, hitbox);
                    game.time.events.add(700, function(hitbox) {
                        hitbox.kill();
                    }, this, hitbox);
                }, this, hitbox);

                this.player.speed.x = 0;
                this.player.animations.play(hitbox.animationType);
                this.player.attacking = true;
            }else if(this.currentKey[this.currentKey.length - 1] == 'Z'){
                //普攻
                console.log('普攻');
                //隨機取得一種攻擊
                var name = game.rnd.pick(['swing1', 'swing2', 'swing3', 'stab']);
                var hitbox = playState.hitboxes.getByName(name);
                hitbox.damage = Math.floor(game.global.damage * 10.00);
                hitbox.hit = 1;
                hitbox.valid = true;

                //角色進入戰鬥狀態
                this.player.alertCount = 180;

                //音效
                game.time.events.add(180, function() {
                    this.swordLSound.play();
                }, this);

                //特效
                game.time.events.add(320, function(hitbox) {
                    hitbox.alpha = 0.8;
                    hitbox.reset(hitbox.offsetx, hitbox.offsety);
                    game.add.tween(hitbox).to({alpha: 0}, 200).start();

                    if(hitbox.key == 'stab')game.add.tween(hitbox).to({x:-85}, 50).start();
                    
                    game.time.events.add(100, function(hitbox) {
                        hitbox.valid = false;
                    }, this, hitbox);
                    game.time.events.add(200, function(hitbox) {
                        hitbox.kill();
                    }, this, hitbox);
                }, this, hitbox);

                this.player.speed.x = 0;
                this.player.animations.play(hitbox.animationType);
                this.player.attacking = true;
            }
        }
    },

    arrayCompare(arr1, arr2){
        if(arr1.length == arr2.length){
            for(var i=0; i<arr1.length; i++){
                if(arr1[i] != arr2[i]){
                    return false;
                }
            }
            return true;
        }else{
            return false;
        }
    },

    createMob: function() {
        //建立group
        this.mobs = game.add.group();
        this.mobs.enableBody = true;

        //讀取全部怪物資料
        var mobData = this.mapData.mob;
        var mobTypeNum = mobData.length;

        if(mobData == null)return;

        for(var i=0; i<mobTypeNum; i++){
            //讀取第i種怪物資料
            var EXP = mobData[i].EXP;
            var maxHP = mobData[i].maxHP;
            var damage = mobData[i].damage;
            var mobName = mobData[i].name;
            var itemDrop = mobData[i].itemDrop;
            var bodySize = mobData[i].bodySize;
            var spawnPos = mobData[i].spawnPosition;
            var moneyDrop = mobData[i].moneyDrop;
            var animation = mobData[i].animation;
            var moveSpeed = mobData[i].moveSpeed;
            var anchorPoint = mobData[i].anchorPoint;
    
            //音效
            var damageSound = game.add.audio(mobData[i].damageSound, 0.8);
            var dieSound = game.add.audio(mobData[i].dieSound, 0.8);
    
            //將怪物加進group
            for(var j=0; j<spawnPos.length; j++){
                var x = spawnPos[j].x;
                var y = spawnPos[j].y;
    
                //產生怪物
                var mob = this.mobs.create(x, y, mobName);
                mob.spawnX = x;
                mob.spawnY = y;
                mob.animations.add('stand', animation.stand.frames, animation.stand.speed, true);
                mob.animations.add('jump',  animation.jump.frames,  animation.jump.speed,  false);
                mob.animations.add('move',  animation.move.frames,  animation.move.speed,  true);
                hit = mob.animations.add('hit', animation.hit.frames, animation.hit.speed, false);
                die = mob.animations.add('die', animation.die.frames, animation.die.speed, false);
                hit.onComplete.add(function (mob) {mob.beingHit = false;this.mobStateHandler(mob);}, this, mob);
                die.onComplete.add(function (mob) {mob.kill();}, this, mob);

                mob.damageSound = damageSound;
                mob.dieSound = dieSound;
                mob.beingHit = false;
                mob.unbreakable = false;
                mob.alpha = 1;
    
                mob.body.gravity.y = 2000;
                mob.body.collideWorldBounds = true;
                mob.body.immovable = true;
                mob.body.setSize(bodySize.width, bodySize.height, bodySize.offsetX, bodySize.offsetY);
                mob.scale.x *= -1;
                mob.anchor.setTo(anchorPoint.x, anchorPoint.y);
                mob.animations.play('stand');
                mob.state = 'stand';
                mob.nextState = game.rnd.pick(['stand', 'stand', 'moveLeft', 'moveRight']);
                mob.timer = game.time.events.add(2000, this.mobStateHandler, this, mob);
                
                //屬性設定
                mob.HP = maxHP;
                mob.EXP = EXP;
                mob.name = mobName;
                mob.maxHP = maxHP;
                mob.damage = damage;
                mob.itemDrop = itemDrop;
                mob.moveSpeed = moveSpeed;
                mob.moneyDrop = moneyDrop;
            }
        }

        //怪物重生
        game.time.events.loop(5000, this.updateMob, this);
    },

    hitMob: function(mob, hitbox) {
        if(mob.beingHit == false && mob.unbreakable == false && hitbox.valid){
            mob.nextState = 'alert'
            mob.beingHit = true;
            mob.scale.x = -playState.player.scale.x;
            mob.body.velocity.x = -150 * playState.player.scale.x;
            if(hitbox.name == '4331004')mob.body.velocity.y = -500;
            var hit = hitbox.hit;
            var count = 0;
            game.add.tween(mob.body.velocity).to({x: 0}, 200 + 100 * hit - 1).start();
            
            //增加魔力
            game.global.MP += Math.floor(game.global.maxMP / 15);
            if(game.global.MP > game.global.maxMP) game.global.MP = game.global.maxMP;
            game.add.tween(this.cropRectMP).to({width: 17 + 222 * game.global.MP / game.global.maxMP}, 500, null, true);
            
            //傷害數字
            function displayDamage(data){
                var _damage = data.hitbox.damage;
                var mob = data.mob;
                var hit = data.hit;
                var count = data.count;
                var sound = hitbox.hitSound;
                mob.animations.play('hit');
                if(sound){
                    sound.play();
                }
                mob.damageSound.play();
                if(hit == 0){
                    if(mob.HP < 0){
                        mob.animations.play('die');
                        playState.dropItem(mob);
                        mob.dieSound.play();
                        game.add.tween(mob).to({alpha: 0}, 400).start();
                        playState.increaseEXP(mob.EXP);

                        //任務部分
                        for(var i=0; i<game.global.missionList.length; i++){
                            if(game.global.missionList[i].type == 'hunt' && game.global.missionList[i].target == mob.name){
                                if(game.global.missionList[i].completeAmount < game.global.missionList[i].goalAmount){
                                    game.global.missionList[i].completeAmount++;
                                    if(playState.missionBox){
                                        playState.hideMission();
                                        playState.showMission();
                                    }
                                    if(game.global.missionList[i].completeAmount == game.global.missionList[i].goalAmount){
                                        game.global.nowMission+=0.3;
                                    }
                                }
                            }
                        }
                    }
                    return;
                }
                hit--;
                var damage = Math.floor((Math.random() * (1 - playState.player.familiarity) + playState.player.familiarity) * _damage);
                var nx = mob.body.x + mob.body.width - 15*damage.toString().length;
                var ny = mob.body.y - 30*count;
                var damageNumber = game.add.bitmapText(nx, ny, 'NoRed1', damage, 30);
                damageNumber.anchor.setTo(0.5, 0.5)
                game.add.tween(damageNumber.getChildAt(0).scale).to({x: 1.03, y: 1.03}, 1, null, true);
                game.add.tween(damageNumber.getChildAt(0)).to({y: -21}, 1, null, true);
                for(var i=2; i<damage.toString().length; i+=2){
                    game.add.tween(damageNumber.getChildAt(i)).to({y: -18}, 1, null, true);
                }
                game.add.tween(damageNumber).to({y: ny - 30}, 1000, null, true);
                game.add.tween(damageNumber).to({alpha: 0}, 700, null, true, 300);
                damageNumber.lifespan = 1000;
                mob.HP -= damage;
                count++
                game.time.events.add(100, function(data) {
                    displayDamage(data);
                }, this, {hitbox: hitbox, mob: mob, hit: hit, count: count});
            }
            displayDamage({hitbox: hitbox, mob: mob, hit: hit, count: count});


        }
    },

    dropItem: function(mob) {
        var x = mob.x;
        var y = mob.y - mob.height/3;
        var money = this.drops.create(x, y, 'money0');
        money.name = "money";
        money.animations.add('roll', [0, 1, 2, 3], 8, true);
        money.animations.play('roll');
        money.body.gravity.y = 1500;
        money.body.velocity.y = -400;
        money.body.setSize(25, 21, 0, 0);
        money.touchingDown = false;
        money.bePickedUp = false;
        money.value = Math.floor(mob.moneyDrop * 0.7 + mob.moneyDrop * 0.3 * Math.random());

        var itemDrop = mob.itemDrop;
        for(var i=0; i<itemDrop.length; i++){
            var name = itemDrop[i].name;
            var type = itemDrop[i].type;
            var probability = itemDrop[i].probability;
            if(Math.random() * 100 <= probability){
                var drop = this.drops.create(x - 20 + 40 * Math.random(), y, name + '_raw');
                drop.name = name;
                drop.type = type;
                drop.body.gravity.y = 1500;
                drop.body.velocity.y = -400;
                drop.body.setSize(25, 21, 0, 0);
                drop.touchingDown = false;
            }
        }
    },

    pickUpItem: function(player, drop) {
        if(drop.touchingDown == false || drop.bePickedUp == true){
            return;
        }
        if(this.keyA.isDown){
            var sound = game.add.audio('pickUpItem', 0.5);
            sound.play();
            drop.bePickedUp = true;
            if(drop.name == 'money'){
                game.global.money += drop.value;
                this.moneyLabel.text = game.global.money;
            }else{
                this.addItem(drop.name, drop.type, 1);
            }
            game.add.tween(drop).to({
                x: player.x - 5 * player.scale.x  - 10,
                y: player.y - 20}, 
                200, 
                null, 
                true
            ).onComplete.add(function(drop){drop.destroy()}, this, drop)
            // drop.destroy();

            //任務部分
            for(var i=0; i<game.global.missionList.length; i++){
                if(game.global.missionList[i].type == 'collect' && game.global.missionList[i].target == drop.name){
                    if(game.global.missionList[i].completeAmount < game.global.missionList[i].goalAmount){
                        game.global.missionList[i].completeAmount++;
                        if(playState.missionBox){
                            playState.hideMission();
                            playState.showMission();
                        }
                        if(game.global.missionList[i].completeAmount == game.global.missionList[i].goalAmount){
                            game.global.nowMission+=0.3;
                        }
                    }
                }
            }
        }
    },

    updateMob: function() {

        for(var i=0; i<this.mobs.length; i++){
            var mob = this.mobs.getFirstDead();
            if(mob == null) break;

            mob.reset(mob.spawnX, mob.spawnY);
            mob.unbreakable = true;
            mob.beingHit = false;
            mob.HP = mob.maxHP;
            game.add.tween(mob).to({alpha: 1}, 400).start();
            game.time.events.add(400, function(mob) {
                mob.unbreakable = false;
            }, this, mob);
            mob.scale.x = -1;
            mob.animations.play('stand');
            mob.nextState = game.rnd.pick(['stand', 'stand', 'moveLeft', 'moveRight']);
            this.mobStateHandler(mob);
        }
        
    },

    touchMob: function(player, mob) {
        if(this.player.unbreakableCount > 0 || mob.alpha < 1)return;
        this.player.body.gravity.y = 2300;
        this.player.climbRope = false;
        this.player.climbLadder = false;
        if(!this.player.attacking){
            this.player.animations.frame = 25;
        }
        this.player.unbreakableCount = 84;
        this.player.alertCount = 180;
        var direction = this.player.x - mob.x > 0 ? 1 : -1
        this.player.body.velocity.x += 240 * direction;
        this.player.body.velocity.y -= 300;
        if(this.player.body.velocity.y < -600)this.player.body.velocity.y = -600;
        var count = 28;
        
        //傷害數字
        var damage = mob.damage;
        var nx = this.player.body.x + this.player.body.width - 12*damage.toString().length;
        var ny = this.player.body.y;
        var damageNumber = game.add.bitmapText(nx, ny, 'NoViolet1', damage, 30);
        damageNumber.anchor.setTo(0.5, 0.5)
        game.add.tween(damageNumber.getChildAt(0).scale).to({x: 1.03, y: 1.03}, 1, null, true);
        game.add.tween(damageNumber.getChildAt(0)).to({y: -21}, 1, null, true);
        for(var i=2; i<damage.toString().length; i+=2){
            game.add.tween(damageNumber.getChildAt(i)).to({y: -18}, 1, null, true);
        }
        game.add.tween(damageNumber).to({y: ny - 30}, 1000, null, true);
        game.add.tween(damageNumber).to({alpha: 0}, 700, null, true, 300);
        damageNumber.lifespan = 1000;

        if (game.global.HP > damage) {
            game.global.HP -= damage;
            game.add.tween(this.cropRectHP).to({width: 17 + 222 * game.global.HP / game.global.maxHP}, 500, null, true);
        }else{
            game.add.tween(this.cropRectHP).to({width: 17}, 500, null, true);
            this.playerDie();
        }
        
        //人物閃爍
        function func1(count){
            game.time.events.add(50, function(count) {
                if(count <= 0) return;
                count--;
                playState.player.tint = 0xa0a0a0;
                game.time.events.add(50, function(count) {
                    if(count <= 0) return;
                    count--;
                    playState.player.tint = 0xffffff;
                    func1(count);
                }, this, count);
            }, this, count);
        }

        func1(count);
    },

    mobStateHandler: function(mob) {
        if(!mob.alive || mob.beingHit)return;
        
        //更新Timer
        game.time.events.remove(mob.timer);

        //更新state
        mob.state = mob.nextState;
        if(mob.state == 'alert'){
            mob.nextState = 'alert';
        }else{
            mob.nextState = game.rnd.pick(['stand', 'stand', 'moveLeft', 'moveRight']);
        }


        //根據state動作
        if(mob.state == 'stand'){
            mob.body.velocity.x = 0;
            mob.animations.play('stand');
        }else if(mob.state == 'moveLeft'){
            mob.body.velocity.x = -mob.moveSpeed;
            mob.animations.play('move');
            if(mob.scale.x < 0)mob.scale.x *= -1;
        }else if(mob.state == 'moveRight'){
            mob.body.velocity.x = mob.moveSpeed;
            mob.animations.play('move');
            if(mob.scale.x > 0)mob.scale.x *= -1;
        }else if(mob.state == 'alert'){
            var direction = this.player.x > mob.x ? 1 : -1;
            mob.body.velocity.x = mob.moveSpeed * direction;
            mob.animations.play('move');
            mob.scale.x = -direction;
        }

        //下一次動作
        if(mob.state == 'alert'){
            mob.timer = game.time.events.add(1000, this.mobStateHandler, this, mob);
        }else{
            mob.timer = game.time.events.add(1000 + Math.floor(Math.random()*1000), this.mobStateHandler, this, mob);
        }
    },

    atPortal: function(player, portal) {
        if(this.cursor.up.isDown){
            //更改位置
            game.global.position =  portal.destination;
            console.log(portal.destination);  

            //畫面漸出
            this.portalSound.play();
            game.camera.fade(0x000000, 600);
            game.camera.onFadeComplete.add(playState.teleport, this);
        }
    },

    interactNpc: function(player, npc) {
        
        if(this.keySpace.isDown || this.keyEnter.isDown)
        {
            if(!this.keyDown)
            {
                this.keyDown = true;
                if(!this.player.interactNpc)
                {
                    this.player.interactNpc = true;
                    this.player.speed.x = 0;
                    this.npcMissionSelect = 0;
                    this.chatbox = game.add.image(400, 300, 'chatbox');
                    this.chatbox.anchor.setTo(0.5, 0.5);
                    this.chatbox.fixedToCamera = true;
                    this.chatNpc = game.add.sprite(190, 240, npc.name);
                    this.chatNpc.animations.add('stand', npc.frames, npc.speed);
                    this.chatNpc.animations.frame = npc.startFrame;
                    this.chatNpc.fixedToCamera = true;
                    game.time.events.loop(3000, function(){
                        this.chatNpc.animations.play('stand')
                    }, this);
                    this.name = game.add.text(216, 327, npc.name_cht, {
                        font: "12px",
                        fill: "#ffffff",
                        align: "center"
                    });
                    this.name.anchor.setTo(0.5, 0.5);
                    this.name.fixedToCamera = true;
                    this.btn_next = game.add.sprite(580, 365, 'bt_next');
                    this.btn_next.animations.add('press', [2, 1], 15, false);
                    this.btn_next.animations.frame = 1;
                    this.btn_next.fixedToCamera = true;
                    this.btn_close = game.add.sprite(160, 427, 'bt_close');
                    this.btn_close.animations.add('press', [2, 1], 15, false);
                    this.btn_close.animations.frame = 1;
                    this.btn_close.fixedToCamera = true;
                    this.btn_prev = null;
                    this.btn_yes = null;
                    this.btn_no = null;
                    this.btn_ok = null;
                    this.btn_reject = null;
                    this.exp = null;
                    this.expValue = null;
                    this.btnChoice = 'right';
                    this.text = [];
                    this.contentNum = [];
                    this.choiceNum = 0;
                    this.itemPic = [];
                    this.murmur = game.add.text(300,182,npc.murmur[game.rnd.integerInRange(0, 2)].text, {
                        font: '14px'
                    });
                    this.murmur.fixedToCamera = true;
                    for(var i = 0; i < npc.content.length; i++)
                    {
                        if(npc.content[i].missionNum.upperbound > game.global.nowMission && npc.content[i].missionNum.lowerbound < game.global.nowMission)
                        {
                            if(this.choiceNum == 0)
                            {
                                this.pointer = game.add.sprite(550, 240, 'pointer');
                                this.pointer.animations.add('point', [0,1], 5, true);
                                this.pointer.animations.play('point');
                                this.pointer.fixedToCamera = true;
                            }
                            if(npc.content[i].tag != 'item')
                            {
                                var tmp = game.add.text(300, 240+this.choiceNum*30, npc.content[i].title, {
                                    font: "16px",
                                    fill: "#483D8B",
                                    align: "center"
                                });
                            }
                            else
                            {
                                var tmp = game.add.text(340, 245+this.choiceNum*30, 'x'+npc.content[i].amount, {
                                    font: "16px",
                                    fill: "#483D8B",
                                    align: "center"
                                });
                                var tmpitem = game.add.image(300, 240+this.choiceNum*30, npc.content[i].itemName);
                                tmpitem.fixedToCamera = true;
                                this.itemPic.push(tmpitem);
                            }
                            tmp.fixedToCamera = true; 
                            this.text.push(tmp);
                            this.choiceNum++;
                            this.contentNum.push(i);
                        }
                    }
                    this.firstPage = 1;
                    this.nowPage = 0;
                }
                else
                {
                    if(this.firstPage)
                    {
                        if(this.btnChoice != 'right' && this.btnChoice != 'left')
                            return;
                        else if(this.btnChoice == 'left')
                        {
                            this.btn_close.animations.play('press');
                            this.murmur.destroy();
                            this.pointer.kill();
                            this.name.destroy();
                            this.chatNpc.kill();
                            this.chatbox.kill();
                            this.btn_next.kill();
                            this.btn_close.kill();
                            for(var i=0; i<this.text.length; i++)
                                this.text[i].destroy();
                            for(var i=0; i<this.itemPic.length; i++)
                                this.itemPic[i].kill();
                            this.player.interactNpc = false;
                            return;
                        }
                        this.pointer.kill();
                        this.murmur.destroy();
                        this.firstPage = 0;
                        this.endPage = npc.content[this.contentNum[this.npcMissionSelect]].text.length;
                        if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'item')
                            this.endPage--;
                        for(var i=0; i<this.text.length; i++)
                            this.text[i].destroy();
                        for(var i=0; i<this.itemPic.length; i++)
                            this.itemPic[i].kill();
                        this.text.length = 0;
                        var tmpText = npc.content[this.contentNum[this.npcMissionSelect]].text[this.nowPage++].page;
                        if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'item' && game.global.money >= npc.content[this.contentNum[this.npcMissionSelect]].money)
                        {
                            tmpText = npc.content[this.contentNum[this.npcMissionSelect]].text[0].page;
                            game.global.money -= npc.content[this.contentNum[this.npcMissionSelect]].money;
                            this.addItem(npc.content[this.contentNum[this.npcMissionSelect]].itemName, 'consume', npc.content[this.contentNum[this.npcMissionSelect]].amount)
                        }
                        else if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'item')
                            tmpText = npc.content[this.contentNum[this.npcMissionSelect]].text[1].page;
                        var tmp = '';
                        for(var i=0; i<tmpText.length; i+=19){
                            var tmp2 = tmpText.substring(i, i+19);
                            tmp += tmp2 + '\n';
                        }
                        tmp = game.add.text(314, 200, tmp, {
                            font: "16px",
                        })
                        tmp.fixedToCamera = true;
                        this.text.push(tmp);
                        if(this.endPage == 1)
                        {
                            if(this.btn_next != null)
                            this.btn_next.kill();
                            this.btn_next = null;
                            if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'quest' || npc.content[this.contentNum[this.npcMissionSelect]].tag == 'done'
                                || npc.content[this.contentNum[this.npcMissionSelect]].tag == 'tell' || npc.content[this.contentNum[this.npcMissionSelect]].tag == 'item')
                            {
                                if(this.btn_ok == null)
                                {
                                    this.btn_ok = game.add.sprite(595, 427, 'bt_ok');
                                    this.btn_ok.animations.add('press', [2, 1], 15, false);
                                    this.btn_ok.animations.frame = 1;
                                    this.btn_ok.fixedToCamera = true;
                                }
                                if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'done')
                                {
                                    if(this.exp == null && game.global.missionList[0].reward[0].type == 'EXP')
                                    {
                                        this.exp = game.add.sprite(314, 300, 'exp');
                                        this.exp.fixedToCamera = true;
                                        this.expValue = game.add.text(380, 303, game.global.missionList[0].reward[0].amount+'exp', {
                                            font: "12px"
                                        });
                                        this.expValue.fixedToCamera = true;
                                    }  
                                }

                            }
                            else if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'mission')
                            {
                                if(this.btn_yes == null)
                                {
                                    this.btn_yes = game.add.sprite(595, 427, 'bt_yes');
                                    this.btn_yes.animations.add('press', [2, 1], 15, false);
                                    this.btn_yes.animations.frame = 1;
                                    this.btn_yes.fixedToCamera = true;
                                }
                                if(this.exp == null && npc.content[this.contentNum[this.npcMissionSelect]].missionContent.reward[0].type == 'EXP')
                                {
                                    this.exp = game.add.sprite(314, 300, 'exp');
                                    this.exp.fixedToCamera = true;
                                    this.expValue = game.add.text(380, 303, npc.content[this.contentNum[this.npcMissionSelect]].missionContent.reward[0].amount+'exp', {
                                        font: "12px"
                                    });
                                    this.expValue.fixedToCamera = true;
                                }

                            }
                        }
                        this.btnChoice = 'down';
                        return;
                    }
                    if(this.btnChoice == 'left')
                    {
                        this.btn_close.animations.play('press');
                        this.name.destroy();
                        this.chatNpc.kill();
                        this.chatbox.kill();
                        for(var i=0; i<this.text.length; i++)
                            this.text[i].destroy();
                        this.player.interactNpc = false;
                        if(this.btn_next != null)
                            this.btn_next.kill();
                        if(this.btn_prev != null)
                            this.btn_prev.kill();
                        if(this.btn_yes != null)
                            this.btn_yes.kill();
                        if(this.btn_no != null)
                            this.btn_no.kill();
                        if(this.btn_ok != null)
                            this.btn_ok.kill();
                        this.btn_close.kill();
                        if(this.exp != null)
                            this.exp.kill();
                        if(this.expValue != null)
                            this.expValue.kill();
                        return;
                    }
                    for(var i = 0; i < this.text.length; i++)
                        this.text[i].destroy();
                    this.text.length = 0;
                    if(this.btnChoice == 'up')
                    {
                        if(this.nowPage -1 >= 1)
                            this.nowPage -= 1;
                    }
                    else if(this.btnChoice == 'down' ||this.btnChoice == 'right')
                    {
                        if(this.nowPage <= this.endPage)
                            this.nowPage++;
                    }
                    if(this.nowPage == this.endPage+1)
                    {
                        if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'mission'){
                            game.global.nowMission += 0.5;
                            game.global.missionList.push(npc.content[this.contentNum[this.npcMissionSelect]].missionContent);
                        }else if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'tell'){
                            game.global.nowMission += 1;

                        }else if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'done'){
                            game.global.nowMission += 0.2;
                            var reward = game.global.missionList[0].reward;
                            for(var k=0; k<reward.length; k++){
                                if(reward[k].type == 'EXP'){
                                    this.increaseEXP(reward[k].amount);
                                }
                            }
                            game.global.missionList.splice(0, 1);
                        }
                        this.name.destroy();
                        this.chatNpc.kill();
                        this.chatbox.kill();
                        this.player.interactNpc = false;
                        if(this.btn_next != null)
                            this.btn_next.kill();
                        if(this.btn_prev != null)
                            this.btn_prev.kill();
                        if(this.btn_yes != null)
                            this.btn_yes.kill();
                        if(this.btn_no != null)
                            this.btn_no.kill();
                        if(this.btn_ok != null)
                            this.btn_ok.kill();
                        if(this.btn_reject != null)
                            this.btn_reject.kill();
                        this.btn_close.kill();
                        if(this.exp != null)
                            this.exp.kill();
                        if(this.expValue != null)
                            this.expValue.kill();
                        return;
                    }
                    var tmpText = npc.content[this.contentNum[this.npcMissionSelect]].text[this.nowPage-1].page;
                    var tmp = '';
                    for(var i=0; i<tmpText.length; i+=19){
                        var tmp2 = tmpText.substring(i, i+19);
                        tmp += tmp2 + '\n';
                    }
                    tmp = game.add.text(314, 200, tmp, {
                        font: "16px",
                    })
                    tmp.fixedToCamera = true;
                    this.text.push(tmp);
                    this.btnChoice = 'down';
                    if(this.nowPage == this.endPage)
                    {
                        if(this.btn_next != null)
                            this.btn_next.kill();
                        this.btn_next = null;
                        if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'quest' || npc.content[this.contentNum[this.npcMissionSelect]].tag == 'done'
                            || npc.content[this.contentNum[this.npcMissionSelect]].tag == 'tell')
                        {
                            if(this.btn_ok == null)
                            {
                                this.btn_ok = game.add.sprite(595, 427, 'bt_ok');
                                this.btn_ok.animations.add('press', [2, 1], 15, false);
                                this.btn_ok.animations.frame = 1;
                                this.btn_ok.fixedToCamera = true;
                            }
                            if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'done')
                                {
                                    if(this.exp == null && game.global.missionList[0].reward[0].type == 'EXP')
                                    {
                                        this.exp = game.add.sprite(314, 300, 'exp');
                                        this.exp.fixedToCamera = true;
                                        this.expValue = game.add.text(380, 303, game.global.missionList[0].reward[0].amount+'exp', {
                                            font: "12px"
                                        });
                                        this.expValue.fixedToCamera = true;
                                    }  
                                }
                        }
                        else if(npc.content[this.contentNum[this.npcMissionSelect]].tag == 'mission')
                        {
                            if(this.btn_yes == null)
                            {
                                this.btn_yes = game.add.sprite(595, 427, 'bt_yes');
                                this.btn_yes.animations.add('press', [2, 1], 15, false);
                                this.btn_yes.animations.frame = 1;
                                this.btn_yes.fixedToCamera = true;
                            }
                            if(this.exp == null && npc.content[this.contentNum[this.npcMissionSelect]].missionContent.reward[0].type == 'EXP')
                            {
                                this.exp = game.add.sprite(314, 300, 'exp');
                                this.exp.fixedToCamera = true;
                                this.expValue = game.add.text(380, 303, npc.content[this.contentNum[this.npcMissionSelect]].missionContent.reward[0].amount+'exp', {
                                    font: "12px"
                                });
                                this.expValue.fixedToCamera = true;
                            }
                        }
                    }
                    else
                    {
                        if(this.btn_next == null)
                        {
                            this.btn_next = game.add.sprite(580, 365, 'bt_next');
                            this.btn_next.animations.add('press', [2, 1], 15, false);
                            this.btn_next.animations.frame = 1;
                            this.btn_next.fixedToCamera = true;
                        }  
                        if(this.btn_ok != null)
                            this.btn_ok.kill();
                        this.btn_ok = null;
                        if(this.btn_yes != null)
                            this.btn_yes.kill();
                        this.btn_yes = null;
                        if(this.exp != null)
                            this.exp.kill();
                        this.exp = null;
                        if(this.expValue != null)
                            this.expValue.kill();
                        this.expValue = null;
                    }
                    if(this.nowPage > 1)
                    {
                        if(this.btn_prev == null)
                        {
                            this.btn_prev = game.add.sprite(520, 365, 'bt_prev');
                            this.btn_prev.animations.add('press', [2, 1], 15, false);
                            this.btn_prev.animations.frame = 1;
                            this.btn_prev.fixedToCamera = true;
                        }
                    }
                    else
                    {
                        if(this.btn_prev != null)
                            this.btn_prev.kill();
                        this.btn_prev = null;
                    }
                }
            }
        }
        else
        {
            this.keyDown = false;
            if(this.player.interactNpc)
            {
                if(this.firstPage)
                {
                    if(this.cursor.up.isDown)
                    {
                        if(!this.upDown)
                        {
                            this.upDown = true;
                            if(this.npcMissionSelect > 0) this.npcMissionSelect--;
                            else this.npcMissionSelect = this.choiceNum - 1;
                            this.pointer.kill();
                            this.pointer = game.add.sprite(550, 240+this.npcMissionSelect*30, 'pointer');
                            this.pointer.animations.add('point', [0, 1], 5, true);
                            this.pointer.animations.play('point');
                            this.pointer.fixedToCamera = true;
                        }
                    }
                    else
                    {
                        this.upDown = false;
                    }
                    if(this.cursor.down.isDown)
                    {
                        if(!this.downDown)
                        {
                            this.downDown = true;
                            this.npcMissionSelect = (this.npcMissionSelect+1)%this.choiceNum;
                            this.pointer.kill();
                            this.pointer = game.add.sprite(550, 240+this.npcMissionSelect*30, 'pointer');
                            this.pointer.animations.add('point', [0, 1], 5, true);
                            this.pointer.animations.play('point');
                            this.pointer.fixedToCamera = true;
                        }
                    }
                    else
                    {
                        this.downDown = false;
                    }
                    if(this.cursor.right.isDown)
                    {
                        if(!this.rightDown)
                        {
                            this.rightDown = true;
                            this.btnChoice = 'right';
                        }
                    }
                    else
                    {
                        this.rightDown = false;
                    }
                    if(this.cursor.left.isDown)
                    {
                        if(!this.leftDown)
                        {
                            this.leftDown = true;
                            this.btnChoice = 'left';
                        }
                    }
                    else
                    {
                        this.leftDown = false;
                    }
                    if(this.btnChoice == 'right')
                        this.btn_next.animations.frame = 0;
                    else
                        this.btn_next.animations.frame = 1;
                    if(this.btnChoice == 'left')
                        this.btn_close.animations.frame = 0;
                    else
                        this.btn_close.animations.frame = 1;
                }
                else
                {
                    if(this.cursor.up.isDown)
                    {
                        if(!this.upDown)
                        {
                            this.upDown = true;
                            this.btnChoice = 'up';
                        }
                    }
                    else
                    {
                        this.upDown = false;
                    }
                    if(this.cursor.down.isDown)
                    {
                        if(!this.downDown)
                        {
                            this.downDown = true;
                            this.btnChoice = 'down';
                        }
                    }
                    else
                    {
                        this.downDown = false;
                    }
                    if(this.cursor.left.isDown)
                    {
                        if(!this.leftDown)
                        {
                            this.leftDown = true;
                            this.btnChoice = 'left';
                        }
                    }
                    else
                    {
                        this.leftDown = false;
                    }
                    if(this.cursor.right.isDown)
                    {
                        if(!this.rightDown)
                        {
                            this.rightDown = true;
                            this.btnChoice = 'right';
                        }
                    }
                    else
                    {
                        this.rightDown = false;
                    }
                    if(this.btnChoice == 'up')
                    {
                        if(this.btn_prev != null)
                            this.btn_prev.animations.frame = 0;
                        if(this.btn_next != null)
                            this.btn_next.animations.frame = 1;
                        if(this.btn_close != null)
                            this.btn_close.animations.frame = 1;
                        if(this.btn_ok != null)
                            this.btn_ok.animations.frame = 1;
                        if(this.btn_yes != null)
                            this.btn_yes.animations.frame = 1;
                    }
                    else if(this.btnChoice == 'down')
                    {
                        if(this.btn_next != null)
                            this.btn_next.animations.frame = 0;
                        if(this.btn_ok != null)
                            this.btn_ok.animations.frame = 0;
                        if(this.btn_yes != null)
                            this.btn_yes.animations.frame = 0;
                        if(this.btn_prev != null)
                            this.btn_prev.animations.frame = 1;
                        if(this.btn_close != null)
                            this.btn_close.animations.frame = 1;
                    }
                    else if(this.btnChoice == 'left')
                    {
                        if(this.btn_close != null)
                            this.btn_close.animations.frame = 0;
                        if(this.btn_prev != null)
                            this.btn_prev.animations.frame = 1;
                        if(this.btn_next != null)
                            this.btn_next.animations.frame = 1;
                        if(this.btn_ok != null)
                            this.btn_ok.animations.frame = 1;
                        if(this.btn_yes != null)
                            this.btn_yes.animations.frame = 1;
                    }
                    else if(this.btnChoice == 'right')
                    {
                        if(this.btn_ok != null)
                            this.btn_ok.animations.frame = 0;
                        if(this.btn_yes != null)
                            this.btn_yes.animations.frame = 0;
                        if(this.btn_next != null)
                            this.btn_next.animations.frame = 0;
                        if(this.btn_prev != null)
                            this.btn_prev.animations.frame = 1;
                        if(this.btn_close != null)
                            this.btn_close.animations.frame = 1;
                    }
                }
            }
        }
    },

    teleport: function() {
        this.BGM.stop();
        game.global.direction = this.player.scale.x;
        if (this.bagBox) this.hideBag();
        if (this.missionBox) this.hideMission();
        if (this.skillBox) this.hideSkill();
        game.state.start('loadMapData');
    },

    touchFloor: function(player, floor) {
        if(player.body.onFloor() || player.body.touching.down){
            if(floor.layer.name == this.bottomName){
                player.onBottom = true;
            }else{
                player.onBottom = false;
            }
        }
    },

    touchConnect: function(player, connect) {
        player.touchConnect = true;
        if((this.cursor.up.isDown || (this.cursor.down.isDown && !this.player.body.onFloor())) && player.climbRope == false && player.climbLadder == false){
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.x = connect.x + 45/2;
            player.scale.x = 1;
            if(connect.type == 'rope'){
                player.climbRope = true;
            }else{
                player.climbLadder = true;
            }
        }
    },

    levelUp: function(){
        game.global.level ++;
        game.global.maxEXP = game.global.level * game.global.level * 10;
        this.levelLabel.text = game.global.level;
        game.global.maxHP += Math.floor(Math.random() * 4 + 20);
        game.global.maxMP += Math.floor(Math.random() * 4 + 14);
        game.global.damage = Math.floor(Math.pow(game.global.level + 5, 2) / 2);
        game.global.HP = game.global.maxHP;
        game.add.tween(this.cropRectHP).to({width: 17 + 222 * game.global.HP / game.global.maxHP}, 500, null, true);
        game.add.tween(this.cropRectMP).to({width: 17 + 222 * game.global.MP / game.global.maxMP}, 500, null, true);
        // game.global.MP = game.global.maxMP;
        this.levelUpSound.play();
        var effect = game.add.sprite(this.player.x, this.player.y, 'levelUpEffect');
        effect.anchor.setTo(0.5, 0.85);
        effect.animations.add('animation', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 10, false);
        var animation = effect.animations.play('animation');
        animation.onComplete.add(function(effect) {
            effect.kill();
        }, this, effect);
    },

    pushCommand: function(command) {
        this.player.commandArray.push(command);
        if(command == 'X'){
            if(!(this.player.body.onFloor() || this.player.body.touching.down || this.player.climbRope || this.player.climbLadder) && this.player.canDoubleJump){
                // this.player.canDoubleJump = false;
                this.doubleJumpSound.play();
                var doubleJump = game.add.sprite(this.player.x, this.player.y, 'doubleJump');
                doubleJump.animations.add('effect', [0, 1, 2, 3, 4, 5, 6], 7, false);
                doubleJump.anchor.setTo(0.1, 0.5);
                doubleJump.scale.x = this.player.scale.x;
                doubleJump.animations.play('effect');
                doubleJump.lifespan = 1000;
                this.player.body.velocity.y -= 350;
                this.player.body.velocity.x -= this.player.scale.x * 400;
            }
        }
        if(command == 'z'){
            this.player.commandCount = 1;
        }else{
            this.player.commandCount = 10;
        }
    },

    checkCommand: function() {
        this.currentKey = this.player.commandArray;
        this.player.commandArray = [];
        this.playerAttackHandler();
    },

    increaseEXP: function(amount) {
        game.global.EXP += amount;
        if(game.global.EXP >= game.global.maxEXP){
            var overflowEXP = game.global.EXP - game.global.maxEXP;
            game.global.EXP = 0;
            playState.levelUp();
            game.add.tween(playState.cropRectEXP).to({width: 16 + 148}, 500, null, true);
            this.increaseEXP(overflowEXP);
        }else{
            game.add.tween(playState.cropRectEXP).to({width: 16 + 148 * game.global.EXP / game.global.maxEXP}, 500, null, true);
        }
    },

    healPlayer: function(amount) {
        game.global.HP += amount;
        if(game.global.HP > game.global.maxHP){
            game.global.HP = game.global.maxHP;
        }
        game.add.tween(playState.cropRectHP).to({width: 17 + 222 * game.global.HP / game.global.maxHP}, 500, null, true);
    },

    playerDie: function() {
        // this.player.kill();
        var tomb = game.add.sprite(this.player.x, game.camera.y, 'tomb');
        tomb.anchor.setTo(0.5, 1);
        tomb.animations.add('effect', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20, false);
        tomb.animations.play('effect');
        game.add.tween(tomb).to({y: this.player.y + 34}, 600, null, true);
    },

    render: function() {
        game.debug.text(game.time.fps || '--', 2, 14, "#00ff00"); 
        game.debug.text(Math.floor(this.player.x) + ', ' + Math.floor(this.player.y), 2, 30, "#00ff00"); 
        game.debug.text(this.player.commandArray, 2, 46, "#00ff00"); 
        game.debug.text(this.currentKey, 2, 62, "#00ff00"); 
        game.debug.text("HP: " + Math.floor(game.global.HP) +  ", MP: " + Math.floor(game.global.MP) + ", EXP: " + game.global.EXP +  ", damage: " + game.global.damage, 2, 78, "#00ff00"); 
        // game.debug.physicsGroup(this.drops);
        // game.debug.physicsGroup(this.portals);
        // game.debug.spriteBounds(this.background.children[1])
        //game.debug.physicsGroup(this.npcs);
        // game.debug.body(this.skill4311003);
    }
};