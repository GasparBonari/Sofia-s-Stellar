import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

// green box

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// animation for green box

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
}
animate()

// Light

// const ambientLight = new THREE.AmbientLight(0xffffff);
// scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
directionLight.position.set(-30, 50, 0)
scene.add(directionLight)

const lightHelper = new THREE.PointLightHelper(directionLight, 5);
scene.add(lightHelper)

// ground

const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshBasicMaterial
({
  color: 0xFFFFFF,
  side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -0.5 * Math.PI;
scene.add(ground);

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper)

// add starts

function addStars()
{
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshBasicMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star)
}

Array(200).fill().forEach(addStars);

// display scene
renderer.render(scene, camera);