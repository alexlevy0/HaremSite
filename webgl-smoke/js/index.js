var camera, scene, renderer,
    geometry, material, mesh,
    mouse, raycaster;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var mouseX = 0;
var mouseY = 0;

init();
animate();
 
function init() {
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    //document.body.appendChild(stats.domElement);

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
 
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    scene.add(camera);

    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshLambertMaterial( { color: 0xaa6666, wireframe: false } );

    mesh = new THREE.Mesh( geometry, material );
    //scene.add( mesh );
    cubeSineDriver = 0;
 
    textGeo = new THREE.PlaneBufferGeometry(100,100);
    THREE.ImageUtils.crossOrigin = '';
    textTexture = THREE.ImageUtils.loadTexture('quickText.png');
    textMaterial = new THREE.MeshLambertMaterial({
        color: 0x00FFFFFF,
        opacity: 1,
        map: textTexture,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    text = new THREE.Mesh(textGeo,textMaterial);
    text.position.z = 800;
    scene.add(text);

    light = new THREE.DirectionalLight(0xffffff,0.6);
    light.position.set(-1,0,1);
    scene.add(light);
  
    smokeTexture = THREE.ImageUtils.loadTexture('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
    smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        opacity: 0.23,
        map: smokeTexture,
        transparent: true
    });
    smokeGeo = new THREE.PlaneBufferGeometry(300,300);
    smokeParticles = [];


    for (p = 0; p < 150; p++) {
        var particle = new THREE.Mesh(smokeGeo,smokeMaterial);
        particle.position.set(Math.random()*500-250,Math.random()*500-250,Math.random()*1000-100);
        particle.rotation.z = Math.random() * 360;
        scene.add(particle);
        smokeParticles.push(particle);
    }

    /*Event*/
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
//    window.addEventListener( 'resize', onWindowResize, false );

    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', function(eventData) {
            console.log("DeviceMotionEvent supported");
            console.log(eventData);
        }, false);
    } else {
        console.log("DeviceMotionEvent Not supported");
    }
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(eventData) {
            console.log("DeviceOrientationEvent supported");
            // gamma is the left-to-right tilt in degrees, where right is positive
            var tiltLR = eventData.gamma;
            console.log(tiltLR);

            // beta is the front-to-back tilt in degrees, where front is positive
            var tiltFB = eventData.beta;
            console.log(tiltFB);

            // alpha is the compass direction the device is facing in degrees
            var dir = eventData.alpha;
            console.log(dir);

            console.log(eventData);
            //deviceOrientationHandler(tiltLR, tiltFB, dir);
        }, false);
    } else {
        console.log("DeviceOrientationEvent Not supported");
    }

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, camera.aspect = window.innerWidth / window.innerHeight;
//        windowHalfX = window.innerWidth,
            windowHalfY = window.innerHeight,
            camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();
        effect.setSize( window.innerWidth, window.innerHeight );
    }
    function onDocumentTouchStart(event) {
        event.preventDefault();
        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;

        mouseX = ( event.clientX - windowHalfX ) / 10;
        mouseY = ( event.clientY - windowHalfY ) / 10;
        onDocumentMouseDown(event);
    }
    function onDocumentMouseMove(event) {
        mouseX = ( event.clientX - windowHalfX ) / 10;
        mouseY = ( event.clientY - windowHalfY ) / 10;
    }
    function onDocumentMouseDown( event ) {
        event.preventDefault();
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var objects = [];
        objects.push(text);
        var intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            //textMaterial.opacity = 0.5 + 0.5*Math.sin(new Date().getTime() * .0025);
            TweenLite.to(textMaterial, 2, {opacity: 0});
            TweenLite.to(camera.position, 5, {z: 750});
        }
    }
    document.body.appendChild( renderer.domElement );
}

function animate() {
 
    // note: three.js includes requestAnimationFrame shim
    stats.begin();
    delta = clock.getDelta();
    requestAnimationFrame( animate );
    evolveSmoke();
    render();
    stats.end();
}
 
function evolveSmoke() {
    var sp = smokeParticles.length;
    while(sp--) {
        smokeParticles[sp].rotation.z += (delta * 0.2);
    }
}

function render() {

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y += ( - mouseY - camera.position.y ) * .05;

    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
    cubeSineDriver += .01;
    mesh.position.z = 100 + (Math.sin(cubeSineDriver) * 500);
    renderer.render( scene, camera );
 
}