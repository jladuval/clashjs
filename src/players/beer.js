var utils = require('../lib/utils.js');
var DIRECTIONS = ['north', 'east', 'south', 'west'];

var Beer = {
  info: {
    name: 'Beer',
    style: 3
  },
  ai: (playerState, enemiesStates, gameEnvironment) => {
    console.log('Beer will kick your arse')

    if (playerState.ammo > 0 && utils.canKill(playerState, enemiesStates)) {
      return 'shoot'
    }

    var killer = enemiesStates.find(function(state){
      var canKill = utils.canKill(state, [playerState]);
      var hasAmmo = state.ammo;
      return canKill && hasAmmo && state.isAlive;
    });

    if (killer) {
      var dir = utils.fastGetDirection(playerState.position, killer.position);
      var ourDir = playerState.direction;
      var i = DIRECTIONS.indexOf(dir);
      var newDir = DIRECTIONS[(i + 1) % 4];
      if (ourDir === newDir) return 'move';
      return newDir;
    }

    if (playerState.ammo) {
      var enemy = enemiesStates.find(function(e){
        var xDiff = e.position[0] - playerState.position[0];
        var yDiff = e.position[1] - playerState.position[1];

        return Math.abs(yDiff) === 1 || Math.abs(xDiff) === 1;
      });

      if (enemy) {
        var dir = enemy.direction;
        var xDiff = enemy.position[0] - playerState.position[0];
        var yDiff = enemy.position[1] - playerState.position[1];

        if (xDiff === -1 && dir === 'east') {
          if (yDiff < 0) return 'north';
          return 'south';
        }

        if (xDiff === 1 && dir === 'west') {
          if (yDiff < 0) return 'north';
          return 'south';
        }

        if (yDiff === -1 && dir === 'south') {
          if (xDiff < 0) return 'west';
          return 'east';
        }

        if (yDiff === 1 && dir === 'south') {
          if (xDiff < 0) return 'west';
          return 'east';
        }
      }
    }

    var ammos = gameEnvironment.ammoPosition
      .map(function (ammo) {
        return {
          distance: utils.getDistance(playerState.position, ammo),
          ammo: ammo
        }
      })
      .sort(function(a, b) {
        return a.distance - b.distance;
      })


    if (ammos.length === 0 ) {
      return utils.safeRandomMove()
    }

    var ammo = ammos[0].ammo

    var ammoDirection = utils.getDirection(playerState.position, ammo)

    if (ammoDirection !== playerState.direction) {
      return ammoDirection
    }

    var ourPos = playerState.position;
    var ourDir = playerState.direction;
    var nextPos;

    if (ourDir === 'north') nextPos =  [ourPos[0], ourPos[1]-1];
    if (ourDir === 'south') nextPos =  [ourPos[0], ourPos[1]+1];
    if (ourDir === 'east') nextPos = [ourPos[0]+1, ourPos[1]];
    if (ourDir === 'west') nextPos = [ourPos[0]-1, ourPos[1]];

    playerState.position = nextPos;

    var killer = enemiesStates.find(function(state){
      var canKill = utils.canKill(state, [playerState]);
      var hasAmmo = state.ammo;
      return canKill && hasAmmo && state.isAlive;
    });

    if (killer) {
      return playerState.direction;
    }

    return 'move'
  }
};

module.exports = Beer;
