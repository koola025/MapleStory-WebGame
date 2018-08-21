var game = new Phaser.Game(800, 600, Phaser.Canvas, 'canvas');

game.global = {
    email: "",
    password: "",
    username: "Mapleboy",
    mapData : null,
    direction : 1,
    position : "woodmarble",
    previousPosition : null,
    damage : 17,
    familiarity : 0.6,
    HP : -1,
    maxHP : 50,
    MP : -1,
    maxMP : 50,
    EXP : -1,
    maxEXP : 10,
    level: 1,
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