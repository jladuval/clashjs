var utils = require('../lib/utils.js');
var DIRECTIONS = ['north', 'east', 'south', 'west'];

var javierbyte = {
  info: {
    name: 'Tis Just a Scratch',
    style: 3
  },
  ai: (playerState, enemiesState, gameEnvironment) => {
    function invertDirection() {
        switch (playerState.direction) {
            case DIRECTIONS[0]:
                return DIRECTIONS[2];
            case DIRECTIONS[1]:
                return DIRECTIONS[3];
            case DIRECTIONS[2]:
                return DIRECTIONS[0];
            case DIRECTIONS[3]:
                return DIRECTIONS[1];
        }
    }

    function newMovePosition() {
        var position = [playerState.position[0],playerState.position[1]];

        switch (playerState.direction) {
            case DIRECTIONS[0]:
                position[0]--;
                break;
            case DIRECTIONS[1]:
                position[1]++;
                break;
            case DIRECTIONS[2]:
                position[0]++;
                break;
            case DIRECTIONS[3]:
                position[1]--;
                break;
            default:
                break;
        }
        return position;
    }

    function avoidLasers() {
        var action = 'move';

        var problem = false;
        var bigProblem = false;

        var newPosition = newMovePosition();
        for (var i = 0; i < enemiesState.length; i++) {
            var enemy = enemiesState[i];
            if (!enemy.ammo) {
                continue;
            }
            var enemyPosition = enemy.position;
            var enemyDirection = enemy.direction;

            var xThreat = [-1,-1];
            var yThreat = [-1,-1];
            switch (enemyDirection) {
                case DIRECTIONS[0]:
                    yThreat = [-1000,enemyPosition[1]];
                    break;
                case DIRECTIONS[1]:
                    xThreat = [enemyPosition[0],1000];
                    break;
                case DIRECTIONS[2]:
                    yThreat = [enemyPosition[1],1000];
                    break;
                case DIRECTIONS[3]:
                    xThreat = [-1000,enemyPosition[0]];
                    break;
                default:
                    break;
            }
            if (newPosition[0] > xThreat[0] &&
                newPosition[0] < xThreat[1]) {
                problem = true;
            }
            if (newPosition[1] > yThreat[0] &&
                newPosition[1] < yThreat[1]) {
                problem = true;
            }

            if (playerState.position[0] > xThreat[0] &&
                playerState.position[0] < xThreat[1]) {
                bigProblem = true;
            }
            if (playerState.position[1] > yThreat[0] &&
                playerState.position[1] < yThreat[1]) {
                bigProblem = true;
            }

        }

        if (problem) {
            //panic
            action = invertDirection();
        }
        if (bigProblem) {
            action = 'move';
        }
        return action;
    }

    function evenSaferRandomMove() {
        var action = Math.random() > 0.5 ? 'move' : DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

        if (action == 'move') {
           action = avoidLasers();
        }

        return action;
    }

    var fastGetDirection = (start = [], end = []) => {
        var diffVertical = Math.abs(start[0] - end[0]);
        var diffHorizontal = Math.abs(start[1] - end[1]);
    
        if (diffVertical > diffHorizontal) {
            return (start[0] - end[0] > 0) ? 'north' : 'south';
        }
        return (start[1] - end[1] > 0) ? 'west' : 'east';
    };

    if (utils.canKill(playerState, enemiesState) && playerState.ammo) {
      return 'shoot';
    }

    if (!playerState.ammo) {
        //get ammo
        if (gameEnvironment.ammoPosition.length) {
            var closestAmmoIndex = 0;
            var closesAmmoDistance = 99999999999;
            for (var i = 0; i < gameEnvironment.ammoPosition.length; i++) {
                var distance = utils.getDistance(playerState.position, gameEnvironment.ammoPosition[i]);
                if (distance <= closesAmmoDistance) {
                    closesAmmoDistance = distance;
                    closestAmmoIndex = i;
                }
            }

            var directionToAmmo = utils.fastGetDirection(playerState.position, gameEnvironment.ammoPosition[closestAmmoIndex]);

            if (directionToAmmo !== playerState.direction) return directionToAmmo;
            return avoidLasers();
        }
    } else {
        //aim
        var closestEnemyIndex = 0;
        var closesEnemyDistance = 99999999999;
        var diffVertical;
        var diffHorizontal;

        for (var i = 0; i < enemiesState.length; i++) {
            var enemy = enemiesState[i];
            diffVertical = Math.abs(playerState.position[0] - enemy.position[0]);
            diffHorizontal = Math.abs(playerState.position[1] - enemy.position[1]);

            var distance = Math.min(diffHorizontal,diffVertical);
            if (distance <= closesEnemyDistance) {
                closesEnemyDistance = distance;
                closestEnemyIndex = i;
            }
        }
        var desiredDirection = fastGetDirection(playerState.position, enemiesState[closestEnemyIndex].position);

        if (desiredDirection == playerState.direction) {
            
            if(enemiesState[closestEnemyIndex].ammo) {
                if ((diffVertical > 1 && (desiredDirection == 'north' || desiredDirection == 'south')) ||
                    (diffHorizontal > 1 && (desiredDirection == 'east' || desiredDirection == 'west'))) {
                    return 'move'
                }
            } else {
                return 'move';
            }
            
        }

        return desiredDirection;
    }


    return evenSaferRandomMove();
  }
};

module.exports = javierbyte;
