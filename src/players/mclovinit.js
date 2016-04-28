var utils = require('../lib/utils.js');
var cpl = require('../lib/codingpains-logic.js');

var mclovinit = {
  info: {
    name: 'mclovinit',
    style: 2
  },
  ai: (playerState, enemiesState, gameEnvironment) => {
    if (cpl.inDanger(playerState, enemiesState)) {
      cpl.getSafestMove(playerState, enemiesState, gameEnvironment);
    }

    if (utils.canKill(playerState, enemiesState) && playerState.ammo) {
      return 'shoot';
    }

    if (gameEnvironment.ammoPosition.length) {
      var ammoPos = cpl.getClosestAmmo(playerState, gameEnvironment.ammoPosition);
      var directionToAmmo = utils.fastGetDirection(playerState.position, ammoPos);

      if (directionToAmmo !== playerState.direction) return directionToAmmo;
      return 'move';
    }

    return utils.safeRandomMove();
  }
};

module.exports = mclovinit;
