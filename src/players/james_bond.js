var utils = require('../lib/utils.js');
var DIRECTIONS = ['north', 'east', 'south', 'west'];

var canBeKilledBy = (currentPlayerState = {}, enemyObject = {}) => {
  return enemyObject.isAlive && utils.isVisible(enemyObject.position, currentPlayerState.position, enemyObject.direction) && enemyObject.ammo;
};

var isPerpendicular = (a, b) => (DIRECTIONS.indexOf(a) - DIRECTIONS.indexOf(b) + 4) % 2


var james_bond = {
  info: {
    name: 'james_bond',
    style: 2
  },
  ai: (playerState, enemiesState, gameEnvironment) => {
    var closestBullet = gameEnvironment.ammoPosition.sort((ammo1, ammo2)=>
        utils.getDistance(ammo1, playerState.position) - utils.getDistance(ammo2, playerState.position)
      )[0];
    var closestBulletDirection = utils.fastGetDirection(playerState.position, closestBullet);

    // survival first
    var dangerousEnemy;
    if(dangerousEnemy = enemiesState.filter(x=> canBeKilledBy(playerState, x))[0]) {
      return isPerpendicular(dangerousEnemy.position, playerState.position) ? 'move' : 'shoot';
    };

    // easy kill
    if(utils.canKill(playerState, enemiesState) && playerState.ammo) return 'shoot';

    // 2-steps kill
    var weakEnemy = enemiesState.filter(x=> 
      (playerState.position[0] == x.position[0] || playerState.position[1] == x.position[1]) && isPerpendicular(playerState.position, x.position) && isPerpendicular(utils.getDirection(playerState.position, x.position), playerState.direction)
    )[0];
    if(weakEnemy) {
      return isPerpendicular(weakEnemy.position, playerState.position) ? 'move' : 'shoot';
    };

    // get ammo, last thing
    return closestBulletDirection == playerState.direction ? 'move' : closestBulletDirection;
  }
};

module.exports = james_bond;
