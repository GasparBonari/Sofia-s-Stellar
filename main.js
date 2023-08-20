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


// SET OXIGEN

let oxigens = [];
let oxigen;

const gltfNewObject = new GLTFLoader();

gltfNewObject.load("./objects/oxigen/oxigen.gltf", (gltf2) => 
{
  oxigen = gltf2;

  oxigen.scene.scale.set(0.02, 0.02, 0.02);

  // Create multiple instances of the new object
  for (let i = 0; i < 30; i++) {
    const clonedOxigen = gltf2.scene.clone();
    // Set random positions within the range of stars
    const [x, y, z] = [
      THREE.MathUtils.randFloatSpread(300),
      THREE.MathUtils.randFloatSpread(500),
      THREE.MathUtils.randFloatSpread(700)
    ];
    clonedOxigen.position.set(x, y, z);

    // Update the material to use MeshStandardMaterial
    clonedOxigen.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: child.material.map,
          color: 0xadd8e6,
          roughness: 0.1,
          metalness: 0.5,
        });
      }
    });

    scene.add(clonedOxigen);
    oxigens.push(clonedOxigen);
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
    const minY = -100;    // Minimum y-axis boundary (floor)
    const maxY = 100;  // Maximum y-axis boundary (ceiling)

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
      characterPosition.y = Math.min(characterPosition.y + movementSpeed, maxY);
    } 
    else if (event.key === "ArrowDown") 
    {
      characterPosition.y = Math.max(characterPosition.y - movementSpeed, minY);
    }

    // Update character's position
    fbx.position.copy(characterPosition);
  });

});

// ANIMATION

let collisionDetected = false;
let progressBarWidth = 100;

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


     // Iterate through oxigen objects to check for intersections
    for (let i = oxigens.length - 1; i >= 0; i--) {
      const oxigen = oxigens[i];
      const oxigenBoundingBox = new THREE.Box3().setFromObject(oxigen);

      if (characterBoundingBox.intersectsBox(oxigenBoundingBox)) {
        console.log("Character intersects with an oxigen object");
        
        progressBarWidth = 100;
        scene.remove(oxigen);
        oxigens.splice(i, 1);
      }
    }

    if (progressBarWidth > 0) {
      progressBarWidth -= 0.01; // Adjust the rate of decrease as needed
      const progressBar = document.getElementById("progress-bar");
      progressBar.style.width = progressBarWidth + "%";
    } else {
      // Handle the progress bar reaching zero
    }


    // Check for collision with asteroids
    asteroids.forEach(asteroid => {
      const asteroidBoundingBox = new THREE.Box3().setFromObject(asteroid);

      if (characterBoundingBox.intersectsBox(asteroidBoundingBox)) {
        console.log("Collision detected");
        collisionDetected = true;
      }
    });
  }

  if (collisionDetected) {

    characterPosition.z -= 10;
    camera.position.z -= 10;
    
    collisionDetected = false;
  }

  // animation sun
  if(sun)
  {
    sun.scene.rotation.x += 0.001;
  }

  // Move stars
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

  // Move asteroids
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

  // Move oxigens
  oxigens.forEach(oxigen => {
    oxigen.position.z += asteroidSpeed;
    oxigen.rotation.x += 0.005;
    oxigen.rotation.y += 0.005;
    if (oxigen.position.z > 500) {
      // Reset object's position if it goes too far
      oxigen.position.set(
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