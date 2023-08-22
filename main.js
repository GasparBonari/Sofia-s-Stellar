import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Selectors

const oxygenBar = document.getElementById("oxygen-bar");
const btnStart = document.querySelector("#btn-start");
const startScreen = document.querySelector("#start-screen");
const loadingScreen = document.querySelector("#loading-screen");

let gameOver = false;
let gameLoop;
let oxygenBarWidth = 100;


// Classes

class Character 
{
  constructor(scene, camera, oxygen, asteroids, lightC) 
  {
    this.scene = scene;
    this.camera = camera;
    this.oxygen = oxygen;
    this.asteroids = asteroids;
    this.lightC = lightC;

    this.characterPosition = new THREE.Vector3(0, 0, 300);
    const initialBoxPosition = new THREE.Vector3(0, 12, 300);
    this.offset = initialBoxPosition.clone().sub(this.characterPosition);
    this.movementSpeed = 1.5;

    this.characterCollisionSphereMesh = null;
    this.keysBlocked = false;

    // Show loading screen when assets start loading
    loadingScreen.style.display = "flex";

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
        this.character = new THREE.AnimationMixer(fbx);
        const idle = this.character.clipAction(animationData.animations[0]);
        idle.play();
      });
  
      // Change the position and rotation of the character
      fbx.position.set(0, 0, 300);
      fbx.rotation.set(0, Math.PI, 0);
  
      // Copy character position to camera position
      this.camera.position.copy(this.characterPosition);
  
      this.scene.add(fbx);

      // Create a geometry for the collision sphere visualization
      const characterCollisionGeometry = new THREE.BoxGeometry(7, 15, 8);  
      const characterCollisionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0,
        transparent: true,
      });
      this.characterCollisionSphereMesh = new THREE.Mesh(characterCollisionGeometry, characterCollisionMaterial);
  
      this.characterCollisionSphereMesh.position.set(0, 12, 300);
      this.scene.add(this.characterCollisionSphereMesh);
  
      document.addEventListener("keydown", (event) => 
      {
        if(!this.keysBlocked) 
        {
          const minX = -100;
          const maxX = 100;
          const minY = -100;
          const maxY = 100;
      
          if(event.key === "ArrowLeft") 
          {
            this.characterPosition.x = Math.max(this.characterPosition.x - this.movementSpeed, minX);
            fbx.rotation.set(0, -Math.PI / 2, 0);
          } 
          else if(event.key === "ArrowRight") 
          {
            this.characterPosition.x = Math.min(this.characterPosition.x + this.movementSpeed, maxX);
            fbx.rotation.set(0, Math.PI / 2, 0);
          } 
          else if(event.key === "ArrowUp") 
          {
            this.characterPosition.y = Math.min(this.characterPosition.y + this.movementSpeed, maxY);
            fbx.rotation.set(0, Math.PI, 0);
          }
          else if(event.key === "ArrowDown") 
          {
            this.characterPosition.y = Math.max(this.characterPosition.y - this.movementSpeed, minY);
            fbx.rotation.set(0, Math.PI, 0);
          }
      
          // Update character's position
          fbx.position.copy(this.characterPosition);
        }
      });
    });
  }

  update() 
  {
    if(this.character) 
    {
      this.character.update(0.01);
  
      // Update camera's position to follow the character
      const cameraOffset = new THREE.Vector3(0, 15, 20);
      const cameraPosition = this.characterPosition.clone().add(cameraOffset);
      this.camera.position.copy(cameraPosition);
  
      // Calculate the updated position
      const updatedBoxPosition = this.characterPosition.clone().add(this.offset);
      this.characterCollisionSphereMesh.position.copy(updatedBoxPosition);
  
      // Create a bounding box for the character's collision sphere
      const characterBoundingBox = new THREE.Box3().setFromObject(this.characterCollisionSphereMesh);
  
      // Check for collision

      for(let i = this.oxygen.oxygens.length - 1; i >= 0; i--) 
      {
        const oxygen = this.oxygen.oxygens[i];
        const oxygenBoundingBox = new THREE.Box3().setFromObject(oxygen);
  
        if(characterBoundingBox.intersectsBox(oxygenBoundingBox)) 
        {
          console.log("Character intersects with an oxygen object");
          
          oxygenBarWidth = 100;
          this.scene.remove(oxygen);
          this.oxygen.oxygens.splice(i, 1);
        }
      }

      if(oxygenBarWidth > 0) 
      {
        oxygenBarWidth -= 0.01;
        oxygenBar.style.width = oxygenBarWidth + "%";
      } 
      else 
      {
        gameOver = true;
      }
  
      // Check for collision with asteroids
      if(!gameOver) 
      {
        this.asteroids.asteroids.forEach(asteroid => 
        {
          const asteroidBoundingBox = new THREE.Box3().setFromObject(asteroid);
  
          if(characterBoundingBox.intersectsBox(asteroidBoundingBox)) 
          {
            this.keysBlocked = true;
            console.log("Collision detected");
  
            if(!gameOver) 
            {
              this.characterPosition.z -= 20;
              this.camera.position.z -= 20;
  
              setTimeout(() => {
                gameOver = true;
                cancelAnimationFrame(gameLoop);
              }, 500); 
            }
          }
        });
      }

      // Update light position
      this.lightC.position.copy(this.characterPosition.clone().add(new THREE.Vector3(0, 10, 40)));

      loadingScreen.style.display = "none";
    }
  }
}

class Asteroids 
{
  constructor(scene) 
  {
    this.scene = scene;
    this.asteroids = [];

    const gltfAsteroid = new GLTFLoader();
    gltfAsteroid.load("./objects/asteroid/asteroid.gltf", (gltf1) => 
    {
      this.asteroid = gltf1;

      this.asteroid.scene.scale.set(0.05, 0.05, 0.05);

      // Create multiple instances of the asteroid
      for(let i = 0; i < 100; i++) 
      {
        const clonedAsteroid = gltf1.scene.clone();
        // Set random positions within the range of stars
        const [x, y, z] = 
        [
          THREE.MathUtils.randFloatSpread(500),
          THREE.MathUtils.randFloatSpread(500),
          THREE.MathUtils.randFloatSpread(500)
        ];

        clonedAsteroid.position.set(x, y, z);
        this.scene.add(clonedAsteroid);
        this.asteroids.push(clonedAsteroid);
      }
    });
  }

  update() 
  {
    this.asteroids.forEach(asteroid => 
    {
      asteroid.position.z += 0.4;
      asteroid.rotation.x += 0.005;
      asteroid.rotation.y += 0.005;
      if(asteroid.position.z > 500) 
      {
        // Reset asteroid's position if it goes too far
        asteroid.position.set(
          THREE.MathUtils.randFloatSpread(500),
          THREE.MathUtils.randFloatSpread(500),
          THREE.MathUtils.randFloatSpread(500)
        );
      }
    });
  }
}

class Stars 
{
  constructor(scene, numStars = 1000) 
  {
    this.scene = scene;
    this.stars = [];

    this.addStars(numStars);
  }

  addStars(numStars) 
  {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for(let i = 0; i < numStars; i++) 
    {
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
      this.scene.add(star);
      this.stars.push(star);
    }
  }

  update() 
  {
    this.stars.forEach(star => 
    {
      const speed = 0.1;

      star.position.z += speed;
      if(star.position.z < -1000) {
        // Reset star's position if it goes too far
        star.position.set(
          THREE.MathUtils.randFloatSpread(1000),
          THREE.MathUtils.randFloatSpread(1000),
          100
        );
      }
    });

    // Remove stars far from the camera
    for(let i = this.stars.length - 1; i >= 0; i--) 
    {
      if(this.stars[i].position.z > 500) {
        this.scene.remove(this.stars[i]);
        this.stars.splice(i, 1);
        this.addStars(1); // Add new star
      }
    }
  }
}

class Oxygen 
{
  constructor(scene) 
  {
    this.scene = scene;
    this.oxygens = [];

    const gltfNewObject = new GLTFLoader();
    gltfNewObject.load("./objects/oxigen/oxigen.gltf", (gltf2) => 
    {
      this.oxygen = gltf2;
      this.oxygen.scene.scale.set(0.02, 0.02, 0.02);

      // Create oxygen objects
      for(let i = 0; i < 30; i++) 
      {
        const clonedOxygen = gltf2.scene.clone();

        const [x, y, z] = 
        [
          THREE.MathUtils.randFloatSpread(300),
          THREE.MathUtils.randFloatSpread(500),
          THREE.MathUtils.randFloatSpread(700)
        ];
        clonedOxygen.position.set(x, y, z);

        clonedOxygen.traverse(child => 
        {
          if(child.isMesh) 
          {
            child.material = new THREE.MeshStandardMaterial({
              map: child.material.map,
              color: 0xadd8e6,
              roughness: 0.1,
              metalness: 0.5,
            });
          }
        });

        this.scene.add(clonedOxygen);
        this.oxygens.push(clonedOxygen);
      }
    });
  }

  update() 
  {
    this.oxygens.forEach(oxygen => 
    {
      oxygen.position.z += 0.4;
      oxygen.rotation.x += 0.005;
      oxygen.rotation.y += 0.005;

      if(oxygen.position.z > 500) 
      {
        oxygen.position.set(
          THREE.MathUtils.randFloatSpread(500),
          THREE.MathUtils.randFloatSpread(500),
          THREE.MathUtils.randFloatSpread(500)
        );
      }
    });
  }
}

class Sun 
{
  constructor(scene) 
  {
    this.scene = scene;
    this.sun = null;

    const gltfSun = new GLTFLoader();
    gltfSun.load("./objects/sun/sun.gltf", (gltf) => 
    {
      this.sun = gltf;
      this.sun.scene.position.y = 50;
      this.sun.scene.position.x = -400;
      this.sun.scene.position.z = -150;
      this.sun.scene.scale.set(7, 7, 7);

      this.scene.add(gltf.scene);
    });
  }

  update() 
  {
    if (this.sun) this.sun.scene.rotation.y += 0.001;
  }
}

class Game 
{
  constructor() 
  {
    // Create the scene
    this.scene = new THREE.Scene();

    // Create the camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // Create the renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // spot light for character
    let distance = 50;
    let angle = Math.PI / 6;
    let penumbra = 1;
    let decay = 1.0;
    
    // Create lights
    const sunIntensity = 1.2;
    const sunColor = 0xffeedd;
    const directLight = new THREE.DirectionalLight(sunColor, sunIntensity);
    directLight.position.set(-1, 1, -1);
    this.scene.add(directLight);

    const lightC = new THREE.SpotLight(sunColor, 200, distance, angle, penumbra, decay);
    lightC.position.set(0, 10, 340);
    this.scene.add(lightC);

    // Create character, asteroids, oxygen, stars, and sun
    this.asteroids = new Asteroids(this.scene);
    this.oxygen = new Oxygen(this.scene);
    this.stars = new Stars(this.scene, 1000);
    this.sun = new Sun(this.scene);
    this.character = new Character(this.scene, this.camera, this.oxygen, this.asteroids, lightC);

    // Add camera
    this.scene.add(this.camera);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Start the animation loop
    this.animate();
  }

  animate() 
  {
    // Update components
    this.asteroids.update();
    this.oxygen.update();
    this.stars.update();
    this.sun.update();
    this.character.update();

    // OrbitControls
    this.controls.update();

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    if (gameOver) return;

    if(this.assetsLoadedCallback) 
    {
      this.assetsLoadedCallback();
    }

    // Call the animate function all times
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener("DOMContentLoaded", function()
{
  btnStart.addEventListener("click", function()
  {
    oxygenBar.style.display = "block";
    startScreen.style.display = "none";

    const game = new Game();
  })
})