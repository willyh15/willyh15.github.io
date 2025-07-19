import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, stars = [];

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('space-scene'), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Stars
  const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < 600; i++) {
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100)
    );
    scene.add(star);
    stars.push(star);
  }

  // Shuttle
  const shuttleGeometry = new THREE.ConeGeometry(0.1, 0.4, 8);
  const shuttleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, flatShading: true });
  const shuttle = new THREE.Mesh(shuttleGeometry, shuttleMaterial);
  shuttle.rotation.x = Math.PI / 2;
  shuttle.position.set(0, 0, 0);
  scene.add(shuttle);

  // Lighting
  const light = new THREE.PointLight(0x00ffff, 1, 100);
  light.position.set(0, 0, 5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x222222);
  scene.add(ambient);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  window.addEventListener('resize', () => {
    const { innerWidth, innerHeight } = window;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}