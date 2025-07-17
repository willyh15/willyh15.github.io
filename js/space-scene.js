import * as THREE from 'https://cdn.skypack.dev/three@0.153.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.153.0/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 20);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 🌌 Skybox
  const loader = new THREE.CubeTextureLoader();
  const skybox = loader.load([
    'static/sky/px.jpg',
    'static/sky/nx.jpg',
    'static/sky/py.jpg',
    'static/sky/ny.jpg',
    'static/sky/pz.jpg',
    'static/sky/nz.jpg'
  ]);
  scene.background = skybox;

  // ✨ Starfield
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 10000;
  const starVertices = [];
  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = -Math.random() * 2000;
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // 🚀 Shuttle (Placeholder Cube)
  const shuttleGeometry = new THREE.BoxGeometry(1, 1, 3);
  const shuttleMaterial = new THREE.MeshStandardMaterial({ color: 0x58a6ff });
  const shuttle = new THREE.Mesh(shuttleGeometry, shuttleMaterial);
  shuttle.position.y = 1;
  scene.add(shuttle);

  // ☀️ Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(20, 20, 20);
  scene.add(pointLight);

  // 🌠 Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);
    shuttle.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  // 📏 Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});