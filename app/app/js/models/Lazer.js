class Lazer {
    constructor () {
        const lazerGroup = new THREE.Group();

        // Set initial lazer position
        const lazerGeo = new THREE.SphereGeometry(20, 10, 10);
        const lazerMat = new THREE.MeshBasicMaterial({color: 0xff0000});
        const lazer = new THREE.Mesh(lazerGeo, lazerMat);
        lazerGroup.add(lazer);
        
        var lazerAge = 0;
        var XDest = 0;
        var YDest = 0;
        var ZDest = -6000;

        return {object:lazerGroup, lazerAge: lazerAge, XDest: XDest, YDest: YDest, ZDest: ZDest};
    }
}
