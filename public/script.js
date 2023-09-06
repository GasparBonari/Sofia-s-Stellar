import * as THREE from 'three';

// Specifications for stars
const particles = 5000;
const speed = 40;
const dim = 200;
let vertices = [];

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({canvas, preserveDrawingBuffer: true, alpha: true});
renderer.autoClearColor = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, canvas.width/canvas.height, 0.1, 1000);


for(let i = 0; i < particles; i++) 
{
	const x = dim*8 * (Math.random() - 0.5);
	const y = dim*2 * (Math.random() - 0.5);
	const z = -dim * Math.random();

	vertices.push( x, y, z );
}

// Creating particles object
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));

let starMat = new THREE.PointsMaterial({
	color: 0xffffff,
	size: .5,
	transparent: true,
	depthTest: false
});

const starPoints = new THREE.Points( starGeo, starMat );
const fadeGeo = new THREE.PlaneGeometry(1, 1);
const fadeMat = new THREE.MeshBasicMaterial({
	color: 0x000000,
	transparent: true,
	opacity: 0.4,
})

const fadePlate = new THREE.Mesh(fadeGeo, fadeMat);
fadePlate.material.renderOrder = -1;
fadePlate.position.z = -.1;

scene.add(fadePlate);
scene.add(starPoints);
requestAnimationFrame(draw);

// Draw particles on canvas
function draw()
{
	if(canvas.height !== canvas.clientHeight || canvas.width !== canvas.clientWidth)
    {
		camera.aspect = canvas.clientWidth/canvas.clientHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
	}

	starGeo.attributes.position.needsUpdate = true;
	let positionArray = starGeo.attributes.position.array;

	for(let i = 0; i < positionArray.length; i+=3) 
    {
		const x = Math.abs(positionArray[i]);
		const y = Math.abs(positionArray[i+1]);
		const z = positionArray[i+2];

		if(z >= 0) 
        {
			positionArray[i] = dim*8 * (Math.random() - 0.5);
			positionArray[i+1] = dim*2 * (Math.random() - 0.5);
			positionArray[i+2] = -dim;
		} 
        else 
        {
			positionArray[i+2] += -speed/positionArray[i+2];
		}
	}
	
	renderer.render(scene, camera);

	requestAnimationFrame(draw);
}