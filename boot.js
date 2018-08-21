var bootState = {
    preload: function () {
    },

    create: function() {
        game.time.advancedTiming = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#000000';
        game.renderer.renderSession.roundPixels = true;

        game.state.start('load');
    }
}; 