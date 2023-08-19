import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// CREATE SCENE

const scene = new THREE.Scene()

// CREATE RENDERER

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


// CAMERA

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.z = 5

const controls = new OrbitControls(camera, renderer.domElement)


// LIGHTS

// sun light
const sunIntensity = 1.2;
const sunColor = 0xffeedd; 

const directLight = new THREE.DirectionalLight(sunColor, sunIntensity);
directLight.position.set(-1, 1, -1);
scene.add(directLight);

directLight.castShadow = true;
directLight.shadow.mapSize.width = 1024;
directLight.shadow.mapSize.height = 1024;
directLight.shadow.camera.near = 0.5;
directLight.shadow.camera.far = 150;

// ambient light
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);


// spot light for character
let distance = 50;
let angle = Math.PI / 6;
let penumbra = 1;
let decay = 1.0;

const lightC = new THREE.SpotLight(sunColor, 200, distance, angle, penumbra, decay);
lightC.position.set(0, 10, 340);
lightC.castShadow = true;
scene.add(lightC);

// spot light helper
const lightHelper = new THREE.SpotLightHelper(lightC);
scene.add(lightHelper);


// SET SUN

let sun;

const gltfSun = new GLTFLoader();

gltfSun.load("./objects/sun/sun.gltf", (gltf) => 
{
  sun = gltf;

  sun.scene.position.y = 50;
  sun.scene.position.x = -400;
  sun.scene.position.z = -150;
  sun.scene.scale.set(7, 7, 7)

  scene.add(gltf.scene);
})


// SET ASTEROIDS

let asteroids = [];
let asteroid;

const asteroidSpeed = 0.4;

const gltfAsteroid = new GLTFLoader();

gltfAsteroid.load("./objects/asteroid/asteroid.gltf", (gltf1) => 
{
  asteroid = gltf1;

  asteroid.scene.scale.set(0.05, 0.05, 0.05);

  // Create multiple instances of the asteroid
  for (let i = 0; i < 100; i++) {
    const clonedAsteroid = gltf1.scene.clone();
    // Set random positions within the range of stars
    const [x, y, z] = [
      THREE.MathUtils.randFloatSpread(500),
      THREE.MathUtils.randFloatSpread(500),
      THREE.MathUtils.randFloatSpread(500)
    ];
    clonedAsteroid.position.set(x, y, z);
    scene.add(clonedAsteroid);
    asteroids.push(clonedAsteroid);
  }
});


// SET STARS

const stars = [];

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

  stars.push(star);
}

Array(1000).fill().forEach(addStars);



// SET CHARACTER

// Declare character position and movement speed
let characterPosition = new THREE.Vector3(0, 0, 300);
const initialBoxPosition = new THREE.Vector3(0, 12, 300);
const offset = initialBoxPosition.clone().sub(characterPosition);
const movementSpeed = 1.5;

let character;
let characterCollisionSphereMesh;

const loader = new FBXLoader();
loader.load("./objects/character.fbx", (fbx) => 
{
  fbx.scale.setScalar(0.1);
  fbx.traverse(e => {
    e.castShadow = true;
    e.receiveShadow = true;
  });

  // flaoting animation
  const animLoaderFloating = new FBXLoader();
  animLoaderFloating.load("./objects/floating.fbx", (animationData) => 
  {
    character = new THREE.AnimationMixer(fbx);
    const idle = character.clipAction(animationData.animations[0]);
    idle.play();
  });

  // Change the position and rotation of the character
  fbx.position.set(0, 0, 300);
  fbx.rotation.set(0, Math.PI, 0);

  // Copy character position to camera position
  camera.position.copy(characterPosition);

  scene.add(fbx);

  // Create a geometry for the collision sphere visualization
  const characterCollisionGeometry = new THREE.BoxGeometry(7, 15, 8);  
  const characterCollisionMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
  characterCollisionSphereMesh = new THREE.Mesh(characterCollisionGeometry, characterCollisionMaterial);

  characterCollisionSphereMesh.position.set(0, 12, 300);
  scene.add(characterCollisionSphereMesh);

  document.addEventListener("keydown", (event) => {

    const minX = -100; // Minimum x-axis boundary
    const maxX = 100;  // Maximum x-axis boundary

    if (event.key === "ArrowLeft") 
    {
      characterPosition.x = Math.max(characterPosition.x - movementSpeed, minX);
      fbx.rotation.set(0, -Math.PI / 2, 0);
    } 
    else if (event.key === "ArrowRight") 
    {
      characterPosition.x = Math.min(characterPosition.x + movementSpeed, maxX);
      fbx.rotation.set(0, Math.PI / 2, 0);
    } 
    else if (event.key === "ArrowUp") 
    {
      fbx.rotation.set(0, Math.PI, 0);
    } 
    else if (event.key === "ArrowDown") 
    {
      fbx.rotation.set(0, 0, 0);
    }

    // Update character's position
    fbx.position.copy(characterPosition);
  });

});

// ANIMATION

function animate() {

  // animation character
  if(character) 
  {
    character.update(0.01);
    lightC.position.copy(characterPosition.clone().add(new THREE.Vector3(0, 10, 40)));

    // Update camera's position to follow the character
    const cameraOffset = new THREE.Vector3(0, 15, 20);
    const cameraPosition = characterPosition.clone().add(cameraOffset);
    camera.position.copy(cameraPosition);

    // Calculate the updated position for the box
    const updatedBoxPosition = characterPosition.clone().add(offset);
    characterCollisionSphereMesh.position.copy(updatedBoxPosition);

    // Create a bounding box for the character's collision sphere
    const characterBoundingBox = new THREE.Box3().setFromObject(characterCollisionSphereMesh);

    // Check for collision with asteroids
    asteroids.forEach(asteroid => {
      const asteroidBoundingBox = new THREE.Box3().setFromObject(asteroid);

      if (characterBoundingBox.intersectsBox(asteroidBoundingBox)) {
        console.log("Collision detected");
      }
    });
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
    if (star.position.z < -1000) {
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
    if (stars[i].position.z > 500) {
      scene.remove(stars[i]);
      stars.splice(i, 1);
      addStars(); // Add new star
    }
  }

  // Move asteroids forward along their current direction
  asteroids.forEach(asteroid => {
    asteroid.position.z += asteroidSpeed;
    asteroid.rotation.x += 0.005;
    asteroid.rotation.y += 0.005;
    if (asteroid.position.z > 500) {
      // Reset asteroid's position if it goes too far
      asteroid.position.set(
        THREE.MathUtils.randFloatSpread(500),
        THREE.MathUtils.randFloatSpread(500),
        THREE.MathUtils.randFloatSpread(500)
      );
    }
  });

  // Update light helper positions
  lightHelper.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate)
}

animate();