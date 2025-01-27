import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Selectors

const btnInstructions = document.querySelector(".btn--open-modal");
const btnCloseInstructions = document.querySelector(".btn--close-modal");
const instructions = document.querySelector(".modal");
const overlay = document.querySelector(".overlay")
const btnStart = document.querySelector("#btn-start");
const startScreen = document.querySelector(".start-game");
const loadingScreen = document.querySelector("#loading-screen");
const oxygenBar = document.querySelector("#oxygen-bar");
const oxygenContainer = document.querySelector("#oxygen-container");
const scoreContainer = document.querySelector("#score-container");
const scoreLabel = document.querySelector(".score");
const gameOverScreen = document.querySelector("#game-over-screen");
const finalScore = document.querySelector(".final-score");
const winScreen = document.querySelector("#win-screen");
const btnGameOverRestart = document.querySelector(".gameOver-restart");
const btnWinRestart = document.querySelector(".win-restart");

let gameOver = false;
let gameLoop;
let scoreInterval;
let oxygenBarWidth = 90;
let score = 0;


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

    this.cameraAngle = 0;
    this.targetAngle = 0;
    this.cameraRotationSpeed = 2;
    this.prevTime = performance.now(); 

    this.characterPosition = new THREE.Vector3(0, 0, 300);
    const initialBoxPosition = new THREE.Vector3(0, 12, 300);
    this.offset = initialBoxPosition.clone().sub(this.characterPosition);
    this.movementSpeed = 1;

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
            this.targetAngle = Math.PI / 2;
          } 
          else if(event.key === "ArrowRight") 
          {
            this.characterPosition.x = Math.min(this.characterPosition.x + this.movementSpeed, maxX);
            fbx.rotation.set(0, Math.PI / 2, 0);
            this.targetAngle = -Math.PI / 2;
          } 
          else if(event.key === "ArrowUp") 
          {
            this.characterPosition.y = Math.min(this.characterPosition.y + this.movementSpeed, maxY);
            fbx.rotation.set(0, Math.PI, 0);
            this.targetAngle = 0;
          } 
          else if(event.key === "ArrowDown") 
          {
            this.characterPosition.y = Math.max(this.characterPosition.y - this.movementSpeed, minY);
            fbx.rotation.set(0, Math.PI, 0);
            this.targetAngle = 0;
          }
          else if (event.key === "Shift") 
          {
            this.targetAngle = Math.PI;
          }
      
          // Update character's position
          fbx.position.copy(this.characterPosition);
        }
      });
    });

    // Getting the angle of camera back when key shift is released
    document.addEventListener("keyup", (event) => 
    {
      if (!this.keysBlocked && event.key === "Shift") 
      {
        this.targetAngle = 0;
      }
    });
  }

  handleGameOver()
  {
    gameOverScreen.style.display = "flex";
    finalScore.textContent = score;
  }

  update() 
  {
    if(this.character) 
    {
      this.character.update(0.01);
  
      // Update camera position and lookAt
      const cameraOffset = new THREE.Vector3(0, 25, 35).applyEuler(
        new THREE.Euler(0, this.cameraAngle, 0)
      );
      const cameraPosition = this.characterPosition.clone().add(cameraOffset);
      this.camera.position.copy(cameraPosition);
      this.camera.lookAt(this.characterPosition);

      // Calculate time since last frame
      const currentTime = performance.now();
      const deltaTime = (currentTime - this.prevTime) / 1000; // Convert to seconds
      this.prevTime = currentTime;

      // Smoothly interpolate camera angle towards the target angle
      this.cameraAngle = THREE.MathUtils.lerp(
        this.cameraAngle,
        this.targetAngle,
        this.cameraRotationSpeed * deltaTime
      );
  
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
          
          oxygenBarWidth = 90;
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
        this.handleGameOver();
      }
  
      // Check for collision with asteroids
      if(!gameOver) 
      {
        this.asteroids.asteroids.forEach(asteroid => 
        {
          const asteroidBoundingBox = new THREE.Box3().setFromObject(asteroid);
  
          if(characterBoundingBox.intersectsBox(asteroidBoundingBox)) 
          {
            this.handleGameOver();
            this.keysBlocked = true;
            clearInterval(scoreInterval);

            console.log("Collision detected");
  
            if(!gameOver) 
            {
              this.characterPosition.z -= 100;
              this.camera.position.z -= 100;
  
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

class BlackHole 
{
  constructor(scene) 
  {
    this.scene = scene;
    this.blackHole = null;

    const gltfSun = new GLTFLoader();
    gltfSun.load("./objects/black-hole/blackHole.gltf", (gltf) => 
    {
      this.blackHole = gltf;
      this.blackHole.scene.position.set(0, -200, 300);
      this.blackHole.scene.scale.set(200, 200, 200);

      this.scene.add(gltf.scene);

      // Brightness by increasing emissive intensity
      const emissiveIntensity = 5;

      this.blackHole.scene.traverse((child) => 
      {
        if(child.isMesh) 
        {
          if(child.material.emissive !== undefined) 
          {
            child.material.emissiveIntensity = emissiveIntensity;
          }
        }
      });
    });
  }

  update() 
  {
    if(this.blackHole) this.blackHole.scene.rotation.z += 0.003;
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
    this.blackHole = new BlackHole(this.scene);
    this.character = new Character(this.scene, this.camera, this.oxygen, this.asteroids, lightC);

    // Add camera
    this.scene.add(this.camera);

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
    this.blackHole.update();
    this.character.update();

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    if(gameOver) return;

    if(this.assetsLoadedCallback) 
    {
      this.assetsLoadedCallback();
    }

    // Call the animate function all times
    requestAnimationFrame(() => this.animate());
  }
}

// Event listeners for hanlding buttons
document.addEventListener("DOMContentLoaded", function()
{
  btnStart.addEventListener("click", function()
  {
    oxygenContainer.style.display = "flex";
    scoreContainer.style.display = "flex"
    startScreen.style.display = "none";

    const game = new Game();

    scoreInterval = setInterval(() => 
    {
      if(!gameOver && loadingScreen.style.display == "none") 
      {
        score++;
        scoreLabel.textContent = score;

        if(score >= 100)
        {
          gameOver = true;
          winScreen.style.display = "flex";
          clearInterval(scoreInterval);
        }
      }
    }, 1000);
  })
})

btnGameOverRestart.addEventListener("click", () =>
{
  window.location.reload();
})

btnWinRestart.addEventListener("click", () =>
{
  window.location.reload();
})

btnInstructions.addEventListener("click", () =>
{
  overlay.classList.remove("hidden");
  instructions.classList.remove("hidden");
})

function closeModal()
{
  overlay.classList.add("hidden");
  instructions.classList.add("hidden");
}

btnCloseInstructions.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => 
{
  if(e.key === "Escape")
  {
    closeModal();
  }
})