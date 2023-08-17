// import * as THREE from "three";

// // COLORS
// const Colors = {
//   red: 0xf25346,
//   white: 0xd8d0d1,
//   brown: 0x59332e,
//   pink: 0xF5986E,
//   brownDark: 0x23190f,
//   blue: 0x68c3c0,
// };

// // THREEJS RELATED VARIABLES
// let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container;

// // SCREEN & MOUSE VARIABLES
// let HEIGHT, WIDTH, mousePos = { x: 0, y: 0 };

// // INIT THREE JS, SCREEN AND MOUSE EVENTS
// function createScene() {
//   HEIGHT = window.innerHeight;
//   WIDTH = window.innerWidth;

//   scene = new THREE.Scene();
//   aspectRatio = WIDTH / HEIGHT;
//   fieldOfView = 60;
//   nearPlane = 1;
//   farPlane = 1000;

//   camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
//   scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
//   camera.position.set(0, 100, 200);

//   renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//   renderer.setSize(WIDTH, HEIGHT);
//   renderer.shadowMap.enabled = true;

//   container = document.getElementById('world');
//   container.appendChild(renderer.domElement);

//   window.addEventListener('resize', handleWindowResize);
// }

// // HANDLE SCREEN EVENTS
// function handleWindowResize() {
//   HEIGHT = window.innerHeight;
//   WIDTH = window.innerWidth;
//   renderer.setSize(WIDTH, HEIGHT);
//   camera.aspect = WIDTH / HEIGHT;
//   camera.updateProjectionMatrix();
// }

// // LIGHTS
// let hemisphereLight, shadowLight;

// function createLights() {
//   hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
//   shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

//   shadowLight.position.set(150, 350, 350);
//   shadowLight.castShadow = true;
//   shadowLight.shadow.camera.left = -400;
//   shadowLight.shadow.camera.right = 400;
//   shadowLight.shadow.camera.top = 400;
//   shadowLight.shadow.camera.bottom = -400;
//   shadowLight.shadow.camera.near = 1;
//   shadowLight.shadow.camera.far = 1000;
//   shadowLight.shadow.mapSize.width = 2048;
//   shadowLight.shadow.mapSize.height = 2048;

//   scene.add(hemisphereLight);
//   scene.add(shadowLight);
// }

// class AirPlane {
//   constructor() {
//     this.mesh = new THREE.Object3D();
//     this.mesh.name = 'airPlane';

//     // Create the cabin
//     const geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
//     const matCockpit = new THREE.MeshPhongMaterial({
//       color: Colors.red,
//       flatShading: true,
//     });

//     const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
//     cockpit.castShadow = true;
//     cockpit.receiveShadow = true;
//     this.mesh.add(cockpit);

//     // Create Engine
//     const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
//     const matEngine = new THREE.MeshPhongMaterial({
//       color: Colors.white,
//       flatShading: true,
//     });

//     const engine = new THREE.Mesh(geomEngine, matEngine);
//     engine.position.x = 40;
//     engine.castShadow = true;
//     engine.receiveShadow = true;
//     this.mesh.add(engine);

//     // Create Tailplane
//     const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
//     const matTailPlane = new THREE.MeshPhongMaterial({
//       color: Colors.red,
//       flatShading: true,
//     });

//     const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
//     tailPlane.position.set(-35, 25, 0);
//     tailPlane.castShadow = true;
//     tailPlane.receiveShadow = true;
//     this.mesh.add(tailPlane);

//     // Create Wing
//     const geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
//     const matSideWing = new THREE.MeshPhongMaterial({
//       color: Colors.red,
//       flatShading: true,
//     });

//     const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
//     sideWing.position.set(0, 0, 0);
//     sideWing.castShadow = true;
//     sideWing.receiveShadow = true;
//     this.mesh.add(sideWing);

//     // Propeller
//     const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
//     const matPropeller = new THREE.MeshPhongMaterial({
//       color: Colors.brown,
//       flatShading: true,
//     });

//     this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
//     this.propeller.castShadow = true;
//     this.propeller.receiveShadow = true;

//     // Blades
//     const geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
//     const matBlade = new THREE.MeshPhongMaterial({
//       color: Colors.brownDark,
//       flatShading: true,
//     });

//     const blade = new THREE.Mesh(geomBlade, matBlade);
//     blade.position.set(8, 0, 0);
//     blade.castShadow = true;
//     blade.receiveShadow = true;
//     this.propeller.add(blade);
//     this.propeller.position.set(50, 0, 0);
//     this.mesh.add(this.propeller);
//   }
// }



// class Sky {
//   constructor() {
//     this.mesh = new THREE.Object3D();
//     this.nClouds = 20;
//     this.clouds = [];

//     const stepAngle = Math.PI * 2 / this.nClouds;

//     for (let i = 0; i < this.nClouds; i++) {
//       const cloud = new Cloud();
//       this.clouds.push(cloud);

//       const angle = stepAngle * i;
//       const height = 750 + Math.random() * 200;

//       cloud.mesh.position.y = Math.sin(angle) * height;
//       cloud.mesh.position.x = Math.cos(angle) * height;
//       cloud.mesh.position.z = -400 - Math.random() * 400;
//       cloud.mesh.rotation.z = angle + Math.PI / 2;

//       const scale = 1 + Math.random() * 2;
//       cloud.mesh.scale.set(scale, scale, scale);

//       this.mesh.add(cloud.mesh);
//     }
//   }
// }

// class Sea {
//   constructor() {
//     const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
//     geom.rotateX(-Math.PI / 2);

//     const mat = new THREE.MeshPhongMaterial({
//       color: Colors.blue,
//       transparent: true,
//       opacity: 0.6,
//       flatShading: true,
//     });

//     this.mesh = new THREE.Mesh(geom, mat);
//     this.mesh.receiveShadow = true;
//   }
// }

// class Cloud {
//   constructor() {
//     this.mesh = new THREE.Object3D();
//     this.mesh.name = 'cloud';

//     const geom = new THREE.BoxGeometry(20, 20, 20);
//     const mat = new THREE.MeshPhongMaterial({ color: Colors.white });

//     const numBlocks = 3 + Math.floor(Math.random() * 3);

//     for (let i = 0; i < numBlocks; i++) {
//       const blockMesh = new THREE.Mesh(geom.clone(), mat);
//       blockMesh.position.x = i * 15;
//       blockMesh.position.y = Math.random() * 10;
//       blockMesh.position.z = Math.random() * 10;
//       blockMesh.rotation.z = Math.random() * Math.PI * 2;
//       blockMesh.rotation.y = Math.random() * Math.PI * 2;

//       const scale = 0.1 + Math.random() * 0.9;
//       blockMesh.scale.set(scale, scale, scale);

//       blockMesh.castShadow = true;
//       blockMesh.receiveShadow = true;

//       this.mesh.add(blockMesh);
//     }
//   }
// }



// let sea, airplane, sky;

// function createPlane() {
//   airplane = new AirPlane();
//   airplane.mesh.scale.set(.25,.25,.25);
//   airplane.mesh.position.y = 100;
//   scene.add(airplane.mesh);
// }

// function createSea() {
//   sea = new Sea();
//   sea.mesh.position.y = -600;
//   scene.add(sea.mesh);
// }

// function createSky() {
//   sky = new Sky();
//   sky.mesh.position.y = -600;
//   scene.add(sky.mesh);
// }

// function loop() {
//   updatePlane();
//   sea.mesh.rotation.z += 0.005;
//   sky.mesh.rotation.z += 0.01;
//   renderer.render(scene, camera);
//   requestAnimationFrame(loop);
// }

// function updatePlane(){
//   var targetY = normalize(mousePos.y,-.75,.75,25, 175);
//   var targetX = normalize(mousePos.x,-.75,.75,-100, 100);
//   airplane.mesh.position.y = targetY;
//   airplane.mesh.position.x = targetX;
//   airplane.propeller.rotation.x += 0.3;
// }

// function normalize(v,vmin,vmax,tmin, tmax){
//   var nv = Math.max(Math.min(v,vmax), vmin);
//   var dv = vmax-vmin;
//   var pc = (nv-vmin)/dv;
//   var dt = tmax-tmin;
//   var tv = tmin + (pc*dt);
//   return tv;
// }

// function init(event){
//   document.addEventListener('mousemove', handleMouseMove, false);
//   createScene();
//   createLights();
//   createPlane();
//   createSea();
//   createSky();
//   loop();
// }

// // HANDLE MOUSE EVENTS

// mousePos = { x: 0, y: 0 };

// // HANDLE MOUSE EVENTS
// function handleMouseMove(event) {
//   const tx = -1 + (event.clientX / WIDTH) * 2;
//   const ty = 1 - (event.clientY / HEIGHT) * 2;
//   mousePos = { x: tx, y: ty };
// }

// window.addEventListener('load', init, false);
















import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// Declare character position and movement speed
let characterPosition = new THREE.Vector3(0, 0, 0);
const movementSpeed = 0.4; // Adjust the movement speed as needed

// creating scene

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

// creating renderer

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// CAMERA

const controls = new OrbitControls(camera, renderer.domElement)

camera.position.z = 5

// lights

const directLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directLight)

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight)


// set character

let mixer;

const loader = new FBXLoader();
loader.load("./objects/character.fbx", (fbx) => 
{
  fbx.scale.setScalar(0.1);
  fbx.traverse(e => {
    e.castShadow = true;
  });

  const animLoader = new FBXLoader();
  animLoader.load("./objects/floating.fbx", (animationData) => 
  {
    mixer = new THREE.AnimationMixer(fbx);
    const idle = mixer.clipAction(animationData.animations[0]);
    idle.play();
  });

  // Change the position and rotation of the character
  fbx.rotation.set(0, Math.PI, 0);

  scene.add(fbx);

  document.addEventListener("keydown", (event) => {
    // Left arrow key (key code: 37)
    if (event.key === "ArrowLeft") {
      characterPosition.x -= movementSpeed;
      fbx.rotation.set(0, -Math.PI / 2, 0); // Turn left
    }
    // Right arrow key (key code: 39)
    else if (event.key === "ArrowRight") {
      characterPosition.x += movementSpeed;
      fbx.rotation.set(0, Math.PI / 2, 0); // Turn right
    }
    // Up arrow key (key code: 38)
    else if (event.key === "ArrowUp") {
      fbx.rotation.set(0, Math.PI, 0); // Face forward
    }
    else if (event.key === "ArrowDown") {
      fbx.rotation.set(0, 0, 0); // Face backwards
    }

    // Update character's position
    fbx.position.copy(characterPosition);
  });
});






// Create an array to store the star objects
const stars = [];

// Add stars
function addStars() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const sideX = Math.random() < 0.5 ? -1 : 1;
  const sideY = Math.random() < 0.5 ? -1 : 1;
  const sideZ = Math.random() < 0.5 ? -1 : 1;

  const [x, y, z] = [
    THREE.MathUtils.randFloatSpread(500) * sideX,
    THREE.MathUtils.randFloatSpread(500) * sideY,
    THREE.MathUtils.randFloatSpread(500) * sideZ
  ];

  star.position.set(x, y, z);
  scene.add(star);

  stars.push(star); // Add star to the array
}

Array(1000).fill().forEach(addStars);


function animate() {
  requestAnimationFrame(animate)

  // Update animation mixer
  if (mixer) {
    mixer.update(0.01);
  }

  // Move stars forward along their current direction
  stars.forEach(star => {
    const speed = 0.1; // Adjust the speed as needed
    star.position.z += speed;
    if (star.position.z < -400) {
      // Reset star's position if it goes too far
      star.position.set(
        THREE.MathUtils.randFloatSpread(1000),
        THREE.MathUtils.randFloatSpread(1000),
        100
      );
    }
  });

 // Remove stars that are too far from the camera
  for (let i = stars.length - 1; i >= 0; i--) {
    if (stars[i].position.z > 100) {
      scene.remove(stars[i]);
      stars.splice(i, 1);
      addStars(); // Add new star
    }
  }

  renderer.render(scene, camera);
}

animate();