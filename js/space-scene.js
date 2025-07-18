import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 2, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('space-scene') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxDistance = 30;
controls.minDistance = 5;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

// 🌌 Stars background
function createStars(count = 500) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < count; i++) {
    positions.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}
createStars();

// 🪐 Planet
const planetGeometry = new THREE.SphereGeometry(2, 32, 32);
const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x2266ff });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(-5, 0, -10);
scene.add(planet);

// 🛰️ Shuttle (Placeholder Cube for now)
const shuttleGeometry = new THREE.BoxGeometry(1, 0.5, 2);
const shuttleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const shuttle = new THREE.Mesh(shuttleGeometry, shuttleMaterial);
shuttle.position.set(0, 0, 0);
scene.add(shuttle);

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Rotate planet
  planet.rotation.y += 0.002;

  // Float shuttle gently
  shuttle.position.y = Math.sin(Date.now() * 0.001) * 0.5;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});