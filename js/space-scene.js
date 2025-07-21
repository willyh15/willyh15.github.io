import * as THREE from './three.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { FontLoader } from './loaders/FontLoader.js';
import { TextGeometry } from './geometries/TextGeometry.js';

const canvas = document.getElementById('space-scene');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Stars
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = [];

for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 100;
  const y = (Math.random() - 0.5) * 100;
  const z = (Math.random() - 0.5) * 100;
  starPositions.push(x, y, z);
}

starGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Load Shuttle Model
const loader = new GLTFLoader();
loader.load(
  './static/models/shuttle.glb',
  (gltf) => {
    const shuttle = gltf.scene;
    shuttle.scale.set(0.5, 0.5, 0.5);
    shuttle.position.set(0, 0, 0);
    scene.add(shuttle);
  },
  undefined,
  (error) => {
    console.error('GLTF load error:', error);
  }
);

// Load Font and Create 3D Text
const fontLoader = new FontLoader();
fontLoader.load('./static/fonts/helvetiker_regular.typeface.json', (font) => {
  const textGeo = new TextGeometry('Will Harrison', {
    font: font,
    size: 0.5,
    height: 0.05,
    curveSegments: 12,
  });

  const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  const textMesh = new THREE.Mesh(textGeo, mat);
  textMesh.position.set(-2.5, 2.2, 0);
  scene.add(textMesh);

  const subTextGeo = new TextGeometry('🚀 DevOps • Cybersecurity • Full Stack', {
    font: font,
    size: 0.2,
    height: 0.01,
    curveSegments: 12,
  });

  const subText = new THREE.Mesh(subTextGeo, mat);
  subText.position.set(-2.5, 1.7, 0);
  scene.add(subText);
});

// Handle Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  camera.rotation.y += 0.0005;
  stars.rotation.y += 0.0003;
  renderer.render(scene, camera);
}
animate();