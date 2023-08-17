import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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


// set sun

let sun;

const gltfLoader = new GLTFLoader();

gltfLoader.load("./objects/sun.gltf", (gltf) => 
{
  sun = gltf;

  sun.scene.position.y = 50;
  sun.scene.position.x = -450;
  sun.scene.position.z = -400;
  gltf.scene.scale.set(7, 7, 7)

  scene.add(gltf.scene);
})



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

  // animation character
  if(mixer) 
  {
    mixer.update(0.01);
  }

  // animation sun
  if(sun)
  {
    sun.scene.rotation.x += 0.001;
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