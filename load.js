var loadState = {
    preload: function () {
        game.load.spritesheet('player', 'assets/character/player4.png', 180, 155);
        game.load.spritesheet('portal', 'assets/map/portal.png', 86, 255);
        game.load.spritesheet('levelUpEffect', 'assets/effect/levelUp.png', 296, 386);
        game.load.spritesheet('doubleJump', 'assets/character/doubleJump.png', 170, 115);
        game.load.spritesheet('4311003_effect', 'assets/character/4311003_effect.png', 165, 144);
        game.load.spritesheet('4331004_effect', 'assets/character/4331004_effect.png', 225, 200);
        game.load.spritesheet('4341004_effect', 'assets/character/4341004_effect.png', 477, 197);
        game.load.spritesheet('money0','assets/item/money0.png', 25, 24);
        game.load.spritesheet('tomb','assets/effect/tomb.png', 100, 47);
        game.load.image('guide', 'assets/guide.png');
        game.load.image('swing1', 'assets/character/swing1.png');
        game.load.image('swing2', 'assets/character/swing2.png');
        game.load.image('swing3', 'assets/character/swing3.png');
        game.load.image('swing4', 'assets/character/swing4.png');
        game.load.image('swing4', 'assets/character/swing4.png');
        game.load.image('stab',   'assets/character/stab.png');
        game.load.image('block', 'assets/blocks.png');
        game.load.image('red', 'assets/red.png');
        game.load.image('red_potion', 'assets/item/red_potion.png');
        game.load.image('red_potion_raw', 'assets/item/red_potion_raw.png');
        game.load.image('branch', 'assets/item/branch.png');
        game.load.image('dragon_angle', 'assets/item/dragon_angle.png');
        game.load.image('green_water', 'assets/item/green_water.png');
        game.load.image('paper', 'assets/item/paper.png');
        game.load.image('pig_head', 'assets/item/pig_head.png');
        game.load.image('shell', 'assets/item/shell.png');
        game.load.image('snake_skin', 'assets/item/snake_skin.png');
        game.load.image('tail', 'assets/item/tail.png');
        game.load.image('shark_teeth', 'assets/item/shark_teeth.png');
        game.load.image('ovum', 'assets/item/ovum.png');
        game.load.image('glass', 'assets/item/glass.png');
        game.load.image('prawn', 'assets/item/prawn.png');
        game.load.image('branch_raw', 'assets/item/branch_raw.png');
        game.load.image('dragon_angle_raw', 'assets/item/dragon_angle_raw.png');
        game.load.image('green_water_raw', 'assets/item/green_water_raw.png');
        game.load.image('paper_raw', 'assets/item/paper_raw.png');
        game.load.image('pig_head_raw', 'assets/item/pig_head_raw.png');
        game.load.image('shell_raw', 'assets/item/shell_raw.png');
        game.load.image('snake_skin_raw', 'assets/item/snake_skin_raw.png');
        game.load.image('tail_raw', 'assets/item/tail_raw.png');
        game.load.image('shark_teeth_raw', 'assets/item/shark_teeth_raw.png');
        game.load.image('ovum_raw', 'assets/item/ovum_raw.png');
        game.load.image('glass_raw', 'assets/item/glass_raw.png');
        game.load.image('prawn_raw', 'assets/item/prawn_raw.png');

        //starla
        game.load.spritesheet('menuBar', 'assets/UI/menuBar.png', 100, 100);
        game.load.image('bar','assets/UI/UIbar.png');
        game.load.image('emptyBar','assets/UI/empty_bar.png');  
        game.load.image('emptyEXP','assets/UI/empty_exp.png');   
        game.load.image('yellowBar','assets/UI/yellow_bar.png');     
        game.load.image('redBar','assets/UI/red_bar.png');      
        game.load.image('blueBar','assets/UI/blue_bar.png');
        game.load.image('bagBox','assets/UI/bagBox.png');
        game.load.image('missionBox','assets/UI/missionBox.png');
        game.load.image('noMissionBox','assets/UI/noMission.png');
        game.load.image('skillBox','assets/UI/skillBox.png');
        game.load.image('HPdrug','assets/UI/hp_raw.png');
        game.load.image('saveComplete', 'assets/UI/saveComplete.png');
        game.load.image('pickHint', 'assets/UI/pickHint.png');
        game.load.image('exp', 'assets/exp.png');
        
        
        
        
        
        game.load.spritesheet('loginBtn','assets/UI/login/loginBtn.png', 50, 50);
        game.load.spritesheet('signupBtn','assets/UI/login/signupBtn.png', 69, 30);
        game.load.spritesheet('googleBtn','assets/UI/login/googleBtn.png', 69, 30);
        game.load.spritesheet('scroll','assets/UI/login/scroll.png', 354, 259);
        game.load.spritesheet('sureBtn','assets/UI/login/sure.png', 65, 21);
        game.load.spritesheet('yesButton','assets/UI/login/yesButton.png', 81, 41);
        game.load.spritesheet('charBeam','assets/UI/login/beam.png', 71, 333);
        game.load.spritesheet('charSparkle','assets/UI/login/sparkle.png', 49, 132);
        game.load.spritesheet('catStatue','assets/UI/catStatue.png', 80, 111);
        
        
        
        game.load.image('frame','assets/UI/login/frame.png');
        game.load.image('loginBackground','assets/UI/login/loginBackground.png');
        game.load.image('signBoard','assets/UI/login/signBoard.png');
        game.load.image('charName','assets/UI/login/charName.png');
        
        


        game.add.plugin(PhaserInput.Plugin);
        //


        //monster
        


        //


        game.load.audio('jump', 'assets/sound/jump.wav');
        game.load.audio('swordL', 'assets/sound/swordL.wav');
        game.load.audio('portal', 'assets/sound/portal.wav');
        game.load.audio('playerDie', 'assets/sound/playerDie.wav');
        game.load.audio('gameIn', 'assets/sound/gameIn.wav');
        game.load.audio('pickUpItem', 'assets/sound/pickUpItem.wav');
        game.load.audio('dropItem', 'assets/sound/dropItem.wav');
        game.load.audio('levelUp', 'assets/sound/levelUp.wav');
        game.load.audio('4311003_use', 'assets/sound/4311003_use.wav');
        game.load.audio('4311003_hit', 'assets/sound/4311003_hit.wav');
        game.load.audio('4321003_use', 'assets/sound/4321003_use.wav');
        game.load.audio('4331004_use', 'assets/sound/4331004_use.wav');
        game.load.audio('4331004_hit', 'assets/sound/4331004_hit.wav');
        game.load.audio('title', 'assets/BGM/title.wav');

        game.load.bitmapFont('NoRed1', 'assets/font/NoRed1_0.png', 'assets/font/NoRed1.fnt');
        game.load.bitmapFont('NoBlue1', 'assets/font/NoBlue1_0.png', 'assets/font/NoBlue1.fnt');
        game.load.bitmapFont('NoViolet1', 'assets/font/NoViolet1_0.png', 'assets/font/NoViolet1.fnt');
    },

    create: function() {
        game.state.start('login');
    }
}; 