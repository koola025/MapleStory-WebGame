var game = new Phaser.Game(800, 600, Phaser.Canvas, 'canvas');

game.global = {
    username : "Mapleboy",
    completeTutorial : false,
    previousState : "boot",
    mapData : null,
    coordinate : {
        x: 0,
        y: 0
    },
    direction : 1,
    position : "tutorial",
    previousPosition : null,
    damage : 66666,
    familiarity : 1,
    HP : 99999,
    maxHP : 99999,
    MP : 99999,
    maxMP : 99999,
    EXP : 0,
    maxEXP : 10,
    level: 99,
    items: [],
    money: 0,
    missionList : [],
    nowMission : 0
}

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('login', loginState);
game.state.add('menu', menuState);
game.state.add('newUser', newUserState);
game.state.add('loadMapData', loadMapData);
game.state.add('play', playState);

game.state.start('boot');

