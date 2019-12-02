/**
* @projectDescription Asteroid shooting game
*
* @author hanjin, suhwan, anyesseu, minyeong
* @version 10.1
*
* @sdoc js/css/main.css
* @sdoc js/models/asteroid.js
* @sdoc js/models/ExplosionPlane.js
* @sdoc js/models/Lazer.js
* @sdoc js/models/LazerSight.js
* @sdoc js/models/SpaceBackground.js
* @sdoc js/models/SpaceFighter.js
* @sdoc js/vendor/require.js
* @sdoc js/vendor/three.js
*/

/* background setting*/
var scene, camera, renderer;
/* spaceship movement */
var movingRight, movingLeft, movingUp, movingDown;
/* single objects */
var background, ship, shipCF, sights;
/* asteroid arrays and data */
var asteroidArray, asteroidCFArray, numOfAsteroids, explosionArray;
/*lazer objects*/
var shooting, lazerArray, shootDelay, lazerLength, lazerGun;
var lazerXDest, lazerYDest;
/* game data */
var totalScore, pointsForHit, level, timer, timeStart, timeLeft,
    timeIncrement, gameEnded, lazerShot, sightsMoved;
var playerHP, gameOvered;
const TIME_MAX = 20;

/* DOM objects */
var scoreElement, timeElement1, timeElement2, levelElement, gameStartElement1, gameStartElement2, gameOverElement;

init();
animate();

/**
* init : create objects
*
* @param {movingDown}  move spaceship with keyboard down 's';
* @param {movingLeft}  move spaceship with keyboard left 'a';
* @param {movingRight}  move spaceship with keyboard right 'd';
* @param {movingUp}  move spaceship 'w';
* @param {numOfAsteroids}  make initial asteroid
* @param {totalScore} totalScore, initailly 0
* @param {pointsForHit} shoot score, each 100
* @param {lazerShot} If shooted, return true
* @param {sightsMoved} ship angle follows lazer sights
* @param {explosionArray} asteroid array that is exploded
*
* @param {shooting} check wheter it is shooted
* @param {lazerArray} lazer array
* @param {lazerLength} lazerLength, initailly 220
* @param {lazerGun} gun that is launched from 4 poles
* @param {asteroidArray} asteroid array
* @param {asteroidCFArray} asteroid cf array
* @param {playerHP} playerHP, initially 3, and go up when level up like odd number round.
* @param {gameOvered} when game is overed, return true.
* @param {gameEnded} game ended setting, no playing status.
*/
function init() {

    //initialize variables
    movingRight = false;
    movingLeft = false;
    movingUp = false;
    movingDown = false;
    numOfAsteroids = 3;
    totalScore = 0;
    pointsForHit = 100;
    level = 1;
    lazerShot = false;
    sightsMoved = false;
    explosionArray = [];

    shooting = false;
    lazerArray = [];
    shootDelay = 0;
    lazerLength = 220
    lazerGun = 0;
    asteroidArray = [];
    asteroidCFArray = [];
    playerHP = 3;
    gameOvered = false;

    //game is not active at start
    gameEnded = true;

    //initialize scene
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    $(document).ready(mouseOver);
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mouseup", mouseUp, false);
    window.addEventListener("keydown", keyboardDownHandler, false);
    window.addEventListener("keyup", keyboardUpHandler, false);
    window.addEventListener('mousemove', mouseMove, false);

    //add lights
    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(10, 40, 100);
    scene.add(lightOne);
    const lightTwo = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    lightTwo.position.set(0, 40, -100);

    scene.add(lightTwo);

    //add space background
    background = new SpaceBackground();
    scene.add(background);

    //add ship
    shipCF = new THREE.Matrix4();
    ship = new SpaceFighter();
    scene.add(ship);
    sights = new LazerSights();
    scene.add(sights);

    //add asteroids
    createNewAsteroids(numOfAsteroids);

    //set camera and add renderer
    console.log(window.innerWidth + " : " + window.innerHeight);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 2000;
    document.body.appendChild(renderer.domElement);

    //Create score text
    scoreElement = document.createElement('span');
    scoreElement.innerHTML = 'SCORE: ' + totalScore;
    scoreElement.id = "score";
    document.body.appendChild(scoreElement);

    //Create level text
    levelElement = document.createElement('span');
    levelElement.innerHTML = 'Level ' + level;
    levelElement.id = "level";
    document.body.appendChild(levelElement);

    //Create time text
    timeElement1 = document.createElement('span');
    timeElement1.innerHTML = 'HP';
    timeElement1.id = "time1";
    document.body.appendChild(timeElement1);
    timeElement2 = document.createElement('span');
    timeElement2.innerHTML = playerHP;
    timeElement2.id = "time2";
    document.body.appendChild(timeElement2);

    //Create Game Start text
    gameStartElement1 = document.createElement('span');
    gameStartElement1.innerHTML = 'Waiting your request...';
    gameStartElement1.id = "gameStart1";
    document.body.appendChild(gameStartElement1);
    gameStartElement2 = document.createElement('span');
    gameStartElement2.innerHTML = 'Press [Spacebar] to begin';
    gameStartElement2.id = "gameStart2";
    document.body.appendChild(gameStartElement2);

    //Create Game Over text
    gameOverElement = document.createElement('span');
    gameOverElement.innerHTML = '';
    gameOverElement.id = "gameOver";
    document.body.appendChild(gameOverElement);

}
/**
* animate : draw scenes
*/
function animate() {

    requestAnimationFrame(animate);

    //ship angle follows lazer sights
    if (sightsMoved) {
        shipCF = new THREE.Matrix4();
        let shipRot = new THREE.Quaternion();
        const rotX = (0.65 * ((sights.position.y / (window.innerHeight / 2)) / Math.PI) + Math.PI * 1.5);
        const rotZ = 0.65 * (-(sights.position.x / (window.innerWidth / 2))) / Math.PI;
        shipRot.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotX);
        let quat2 = new THREE.Quaternion();
        quat2.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotZ);
        shipRot.multiply(quat2);
        ship.quaternion.copy(shipRot);

        sightsMoved = false;
    }

    //checks if ship should be moving
    adjustShipPostition();

    //rotate asteroids
    rotateAsteroids();
    moveAsteroids();

    scoreElement.innerHTML = 'SCORE: ' + totalScore;

    if (shooting == true) {
        if(shootDelay < 0){
            tempLazer = createLazer();
            lazerArray.push(tempLazer);
            shootDelay = 4;
        }
    }
    if(shootDelay >=0 ){
        shootDelay--;
    }

    //if lazer has been shot, move the lazer
    for (i = 0; i < lazerArray.length; i++) {
        moveLazer(lazerArray[i]);
    }

    //slowly rotates background
    background.rotation.y += 0.001;

    renderer.render(scene, camera);

}
/**
* resetGame: reset game setting
*/
function resetGame() {
    //initialize variables
    movingRight = false;
    movingLeft = false;
    movingUp = false;
    movingDown = false;
    numOfAsteroids = 3;
    totalScore = 0;
    pointsForHit = 100;
    level = 1;
    lazerShot = false;
    sightsMoved = false;
    explosionArray = [];

    shooting = false;
    lazerArray = [];
    shootDelay = 0;
    lazerLength = 220
    lazerGun = 0;
    asteroidArray = [];
    asteroidCFArray = [];
    playerHP = 3;
    gameOvered = false;

    //game is not active at start
    gameEnded = true;

    //reset asteroids
    for (var i = 0; i < asteroidArray.length; i++) {
        scene.remove(asteroidArray[i].object);
    }
    createNewAsteroids(numOfAsteroids);

    //Reset all text
    scoreElement.innerHTML = 'SCORE: ' + totalScore;
    levelElement.innerHTML = 'LEVEL ' + level;
    timeElement2.innerHTML = playerHP;
    gameStartElement1.innerHTML = 'Waiting your request...';
    gameStartElement2.innerHTML = 'Press [Spacebar] to begin';
    gameOverElement.innerHTML = '';

    //clear timer
    clearInterval(timer);
}

/**
* startTimer: set player's HP and reset
* show up with HTML DOM
*/
function startTimer() {
    gameEnded = false;

    timer = setInterval(function () {
        if (!gameEnded) {
            timeElement2.innerHTML = playerHP;
        }
        if (playerHP <= 0) {
            gameEnded = true;
            gameOvered = true;
            gameOverElement.innerHTML = 'Game Over';
        }
    }, 50);
}

/**
* createNewAsteroids: create new asteroids
* 
* Setting randomly and can't be overlapped.
* random number is setting with attemptCount.
* show only asteroids in asteroidCFarray.
*/
function createNewAsteroids(count) {
    for (var i = 0; i < count; i++) {
        //create asteroid
        let asteroid = new Asteroid();

        //randomize location (but don't overlap with another)
        let attemptCount = 0;
        while (true) {
            let xPos = Math.floor(Math.random() * ((4.1573 * window.innerWidth) - 1.5 * asteroid.values.radius) - (2.0787 * window.innerWidth) + 0.75 * asteroid.values.radius);
            let yPos = Math.floor(Math.random() * ((4.1573 * window.innerHeight) - 1.5 * asteroid.values.radius) - (2.0787 * window.innerHeight) + 0.75 * asteroid.values.radius);
            //they can't be overlapped
         if (!checkIfOverlapAsteroids(xPos, yPos, asteroid.values.radius)) {
                asteroid.object.position.x = xPos;
                asteroid.object.position.y = yPos;
                break;
            }
            //if it has taken too many attempts, there probably isn't a possible location, so just restart
            attemptCount++;
            if (attemptCount > 50) {
                for (let j = 0; j < asteroidArray.length; j++) {
                    scene.remove(asteroidArray[j].object);
                }
                return createNewAsteroids(count);
            }
        }
        //add asteroid to array
        asteroidArray.push(asteroid);

        //add CF and add to scene
        asteroidCFArray.push(new THREE.Matrix4());
        scene.add(asteroidArray[i].object);
    }
}
/**
* checkIfOverlapAsteroids: check overlap position in asteroid
*
* using x, y position and radius.
* return {true} when it is overlapped
* return {false} whed it is not overlapped
*/
function checkIfOverlapAsteroids(xPos, yPos, radius) {
    for (let i = 0; i < asteroidArray.length; i++) {
        //if within X Range of asteroid
        if (xPos + radius >= asteroidArray[i].object.position.x - asteroidArray[i].values.radius &&
            xPos - radius <= asteroidArray[i].object.position.x + asteroidArray[i].values.radius) {
            //if within Y Range of asteroid
            if (yPos + radius >= asteroidArray[i].object.position.y - asteroidArray[i].values.radius &&
                yPos - radius <= asteroidArray[i].object.position.y + asteroidArray[i].values.radius) {
                //there is overlap
                return true;
            }
        }
    }
    //no overlap
    return false;
}

/**
* checkIfOverlapLazers: check overlap position in lazer
*
* using x, y position and radius.
* return {true} when it is overlapped
* return {false} whed it is not overlapped
*/
function checkIfOverlapLazers(xPos, yPos, radius){
    for (let i = 0; i < lazerArray.length; i++) {
        //if within X Range of asteroid
        if (xPos + radius >= lazerArray[i].object.position.x - lazerLength &&
            xPos - radius <= lazerArray[i].object.position.x + lazerLength) {
            //if within Y Range of asteroid
            if (yPos + radius >= lazerArray[i].object.position.y - lazerLength &&
                yPos - radius <= lazerArray[i].object.position.y + lazerLength) {
                //there is overlap
                return true;
            }
        }
    }
    //no overlap
    return false;
}

/**
* moveAsteroids :move asteroids to user's sight with z axis, give them speed.
*
* Asteroid is removed after many shooting (from 1000HP to 0HP),
* Each shooting attacked them with 10HP.
* If removed, user gets point and can see score in HTML.
* 
* If user don't shoot asteroid (z axis<20), user's HP is decreased -1.
*/
function moveAsteroids() {
    for (let i = 0; i < asteroidArray.length; i++) {
        if (!(gameEnded)){
            asteroidArray[i].object.position.z += asteroidArray[i].speed;
            if (checkIfOverlapLazers(
                asteroidArray[i].object.position.x,
                asteroidArray[i].object.position.y,
                asteroidArray[i].values.radius
            )){
                asteroidArray[i].HP -= 10;
            }
            if (asteroidArray[i].HP < 0){
                asteroidArray[i].HP = 1000;

                scene.remove(asteroidArray[i].object);
                makeExplosion(asteroidArray[i].values.radius, asteroidArray[i].object.position.x, asteroidArray[i].object.position.y, asteroidArray[i].object.position.z);
                asteroidArray.splice(i, 1);
                asteroidCFArray.splice(i, 1);
    
                totalScore += pointsForHit;
                scoreElement.innerHTML = 'SCORE: ' + totalScore;

                //if all asteroids have been cleared, go to next level
                
                nextLevel();
            }
        }
        if(asteroidArray[i].object.position.z > 20){
            playerHP--;

            scene.remove(asteroidArray[i].object);
            asteroidArray.splice(i, 1);
            asteroidCFArray.splice(i, 1);

            nextLevel();
        }
    }
}

/**
* nextLevel :Level up and add HP when the game is odd-number round.
* Show up them in HTML and reset asteroid place.
*/
function nextLevel() {
    if (asteroidArray.length == 0) {
        level++;
        levelElement.innerHTML = 'LEVEL ' + level;
        if (level % 3 == 1) {
            numOfAsteroids += 1;
            playerHP += 1;
        }
        timeElement2.innerHTML = playerHP;
        createNewAsteroids(numOfAsteroids);
    }
}

/**
* mouseOver:  Recognize mouse over to use lazer sight.
*
* To shoot asteroid, take aim with lazer sight.
* Lazer sight is controlled by mouse.
*/
function mouseOver() {
    $(document).mousemove(function (event) {
        //mouse controls lazer sights
        document.body.style.cursor = 'none';
        sights.position.x = 3.55 * (-window.innerWidth / 2 + event.pageX);
        sights.position.y = 3.55 * (window.innerHeight / 2 - event.pageY);
        sightsMoved = true;
    });
}

/**
* mouseDown : When asteroid is shooted, it is valid if mouse is down.
*
* To shoot asteroid, take aim with lazer sight.
* Lazer sight is controlled by mouse.
* Reset if game is over.
* @return {true} when shoot.
*/
function mouseDown() {
    //can't shoot if game is over
    if (!gameEnded) {
        shooting = true;
    }
}

/**
* mouseUp : Recognize that mouse is clicked and up sign
*
* To shoot asteroid, take aim with lazer sight.
* Lazer sight is controlled by mouse.
* 
* Though asteroid is shooted, it is invalid if mouse is up.
*/
function mouseUp() {
    shooting = false;
}

/**
* mouseMove : Recognize that mouse is moving.
*
* To shoot asteroid,
* take aim with lazer sight.
* Lazer sight is controlled by mouse.
*/
function mouseMove(event) {
    lazerXDest = event.pageX;
    lazerYDest = event.pageY;
}

/**
* makeExplosion : make explosion effect
*
* If user shoot asteroid, make effect to change explosion effect
* like changing image, scaling and remove.
*/
function makeExplosion(radius, xPos, yPos, zPos) {
    let explosion = new ExplosionPlane(radius * 3, xPos, yPos, zPos);
    explosion.interval = 0;
    explosion.scaleResize = 0;
    explosion.scale.set(0, 0, 0);

    scene.add(explosion);
    explosionArray.push(explosion);

    var explosionInterval = setInterval(function () {
        if (explosion.interval == 15) {
            clearInterval(explosionInterval);
            scene.remove(explosion);
            explosionArray.slice(1);
        }
        if (explosion.interval < 5) {
            explosion.scaleResize += 0.2;
        } else {
            explosion.scaleResize += -0.1;
        }
        explosion.scale.set(explosion.scaleResize, explosion.scaleResize, explosion.scaleResize);
        explosion.interval++;
    }, 50);
}

/**
* keyboardDownHandler : recognize keyboard down sign from user
*
* following keyboard input.
*/
function keyboardDownHandler(event) {
    switch (event.key) {
        case "d":
            movingRight = true;
            break;
        case "a":
            movingLeft = true;
            break;
        case "w":
            movingUp = true;
            break;
        case "s":
            movingDown = true;
            break;
    }
}

/**
* function keyboardUpHandler :recognize keyboard up sign from user
*
* following keyboard input.
* If game is reset or over, reset setting.
*/
function keyboardUpHandler(event) {
    switch (event.key) {
        case "d":
            movingRight = false;
            break;
        case "a":
            movingLeft = false;
            break;
        case "w":
            movingUp = false;
            break;
        case "s":
            movingDown = false;
            break;
        case " ":
            if (!gameOvered && gameEnded) {
                gameStartElement1.innerHTML = '';
                gameStartElement2.innerHTML = '';
                gameOverElement.innerHTML = '';
                startTimer();
            } else if (gameOvered && gameEnded) {
                resetGame();
            }
            break;
    }
}

/**
* adjustShipPostition
*
* following keyboard input, ship is moving with x, y position
* and give them speed
* speed: 20
*/
function adjustShipPostition() {
    let shipSpeed = 20;
    if (movingRight) {
        if (ship.position.x <= (window.innerWidth)) {
            ship.position.x += shipSpeed;
        }
    }
    if (movingLeft) {
        if (ship.position.x >= (-window.innerWidth)) {
            ship.position.x += -shipSpeed;
        }

    }
    if (movingUp) {
        if (ship.position.y <= (window.innerHeight * 1.25)) {
            ship.position.y += shipSpeed;
        }
    }
    if (movingDown) {
        if (ship.position.y >= (-window.innerHeight * 1.25)) {
            ship.position.y += -shipSpeed;
        }
    }
}

/**
* rotateAsteroids
*
* Each of asteroids are rotated after translation and rotation
* using Quaternion and decompse function.
*/
function rotateAsteroids() {
    for (var i = 0; i < asteroidArray.length; i++) {
        let asteroidTrans = new THREE.Vector3();
        let asteroidRot = new THREE.Quaternion();
        const rotX = new THREE.Matrix4().makeRotationX(asteroidArray[i].values.xRot);
        const rotY = new THREE.Matrix4().makeRotationY(asteroidArray[i].values.yRot);
        asteroidCFArray[i].multiply(rotX);
        asteroidCFArray[i].multiply(rotY);
        asteroidCFArray[i].decompose(asteroidTrans, asteroidRot, new THREE.Vector3());  // decompose the coord frame

        asteroidArray[i].object.quaternion.copy(asteroidRot);
    }
}

/**
* createLazer :create lazer from 4 poles
*
* @param {lazerOffset} 100 numbers shoot for one click
*/
function createLazer() {
    lazer = new Lazer();
    let lazerOffset = 100;
    if (lazerGun == 0) {
        lazer.object.position.x = ship.position.x - 430;
        lazer.object.position.y = ship.position.y + 130;
        lazer.XDest = +lazerOffset;
        lazerGun = 1;
    } else if (lazerGun == 1) {
        lazer.object.position.x = ship.position.x + 430;
        lazer.object.position.y = ship.position.y + 130;
        lazer.XDest = -lazerOffset;
        lazerGun = 2;
    } else if (lazerGun == 2) {
        lazer.object.position.x = ship.position.x - 430;
        lazer.object.position.y = ship.position.y - 130;
        lazer.XDest = +lazerOffset;
        lazerGun = 3;
    } else if (lazerGun == 3) {
        lazer.object.position.x = ship.position.x + 430;
        lazer.object.position.y = ship.position.y - 130;
        lazer.XDest = -lazerOffset;
        lazerGun = 0;
    }
    
    lazer.object.position.z = -150;

    lazer.XDest += (3.18*(-window.innerWidth/2 + lazerXDest) - 0.45*ship.position.x);
    lazer.YDest = (3.18*(window.innerHeight/2 - lazerYDest + 70) - 0.45*500 - 0.45*ship.position.y);

    scene.add(lazer.object);
    return lazer;
}
/**
*function moveLazer : move lazer from spceship to shooting point
*
* with changing z axis
*/
function moveLazer(lazer) {
    let lazerLife = 30;
    lazer.object.position.x += lazer.XDest / 4;
    lazer.object.position.y += lazer.YDest / 4;
    lazer.object.position.z += lazer.ZDest / lazerLife;

    lazer.lazerAge++;
    //if lazer has gone its course
    if (lazer.lazerAge > lazerLife) {
        scene.remove(lazer.object);
        lazerArray.shift();
    }
}