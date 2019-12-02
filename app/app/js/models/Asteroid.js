var transformation;

// Create Asteroid
class Asteroid {
    constructor () {
        const asteroidGroup = new THREE.Group();

        //pick a random asteroid texture
        let asteroidType = Math.floor(Math.random() * 5);
        const textureArray = [
            "https://i.ibb.co/8bpxPpx/asteroid-Texture1.jpg",
            "https://i.ibb.co/rfJ5ZDN/asteroid-Texture2.jpg",
            "https://i.ibb.co/HKSKsjv/asteroid-Texture3.jpg",
            "https://i.ibb.co/L5cm7HH/asteroid-Texture4.jpg",
            "https://i.ibb.co/tJcR6BJ/asteroid-Texture5.jpg"
        ];

        const myUrl = textureArray[asteroidType];

        const asteroidTexture = new THREE.TextureLoader()
        asteroidTexture.crossOrigin = "Anonymous"
        const myTexture = asteroidTexture.load(myUrl)

        // Texture wrapping
        myTexture.wrapS = THREE.RepeatWrapping;
        myTexture.wrapT = THREE.RepeatWrapping;

        //pick a random asteroid size
        let asteroidSize = Math.floor(Math.random() * 200 + 125);

        //pick random rotations and translations
        transformation = {
            radius : asteroidSize,
            xRot : Math.random() * (Math.PI/200) - (Math.PI/400),
            yRot : Math.random() * (Math.PI/200) - (Math.PI/400)
        }

        //create object mesh
        var asteroidGeo = new THREE.SphereGeometry(asteroidSize,20,20);
        var asteroidMat = new THREE.MeshPhongMaterial({shininess: 0});
        asteroidMat.map = myTexture;

        var asteroid = new THREE.Mesh(asteroidGeo,asteroidMat);
        asteroid.material.side = THREE.DoubleSide;
        asteroidGroup.add(asteroid);

        asteroidGroup.position.z = -6500;
        var speed = Math.random() * 5 + 5;
        var HP = 1000;

        return {object: asteroidGroup, values: transformation, speed: speed, HP: HP};
    }
}
