
// Set Background
class SpaceBackground {
    constructor () {
        const spaceBGGroup = new THREE.Group();
        const myUrl = 'https://i.ibb.co/DKy7M8k/space-Background.jpg'

        const spaceTexture = new THREE.TextureLoader()
        spaceTexture.crossOrigin = "Anonymous"
        const myTexture = spaceTexture.load(myUrl)

        myTexture.repeat.set(5,3);
        myTexture.wrapS = THREE.RepeatWrapping;
        myTexture.wrapT = THREE.RepeatWrapping;

        var spacesphereGeo = new THREE.SphereGeometry(6000,20,20);
        var spacesphereMat = new THREE.MeshBasicMaterial();
        spacesphereMat.map = myTexture;

        var spacesphere = new THREE.Mesh(spacesphereGeo,spacesphereMat);
        spacesphere.material.side = THREE.DoubleSide;
        spaceBGGroup.add(spacesphere);

        return spaceBGGroup;
    }
}
