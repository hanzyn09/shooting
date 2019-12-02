
var explosionAnimation, explosionTexture, clock;

// Explosive effect shot down
class ExplosionPlane {
    constructor (radius, xPos, yPos, zPos) {
        clock = new THREE.Clock();
        const explosionGroup = new THREE.Group();

        // Explosion image
        const explosionGeo = new THREE.PlaneGeometry(radius, radius);
        const myUrl = 'https://i.ibb.co/v3FLsvc/explosion-img.png'

        const explosionTexture = new THREE.TextureLoader()
        explosionTexture.crossOrigin = "Anonymous"
        const myTexture =explosionTexture.load(myUrl)
        
        const explosionMat = new THREE.MeshBasicMaterial({transparent: true});
        explosionMat.map = myTexture;
        const explosion = new THREE.Mesh(explosionGeo, explosionMat);
        explosionGroup.add(explosion);


        // Get explosive position
        explosionGroup.position.x = xPos;
        explosionGroup.position.y = yPos;
        explosionGroup.position.z = zPos;

        return explosionGroup;
    }
}
