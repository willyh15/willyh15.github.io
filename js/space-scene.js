import * as THREE from 'https://cdn.skypack.dev/three@0.158.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000010);

// Camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 2, 6);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('space-scene') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.rotateSpeed = 0.5;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x00ffff, 2, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.05, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(80));
  star.position.set(x, y, z);
  scene.add(star);
}
Array(300).fill().forEach(addStar);

// Planet
const planetGeometry = new THREE.SphereGeometry(1.5, 64, 64);
const planetMaterial = new THREE.MeshStandardMaterial({
  color: 0x2222ff,
  emissive: 0x111133,
  roughness: 0.4,
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(-3, 1, -5);
scene.add(planet);

// Space Shuttle Model
let shuttle;
const loader = new GLTFLoader();
loader.load('static/models/shuttle.glb', (gltf) => {
  shuttle = gltf.scene;
  shuttle.scale.set(0.4, 0.4, 0.4);
  shuttle.position.set(1, 0.5, 0);
  scene.add(shuttle);
}, undefined, (error) => {
  console.error('Error loading GLB model:', error);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  planet.rotation.y += 0.001;

  if (shuttle) {
    shuttle.rotation.y += 0.005;
    shuttle.position.y = 0.5 + Math.sin(Date.now() * 0.001) * 0.2;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});