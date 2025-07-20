import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/geometries/TextGeometry.js';

let scene, camera, renderer, controls;
let planets = {};
const planetLabels = ['Projects', 'Skills', 'About', 'Contact'];
const uiCard = document.getElementById('ui-card');
const cardTitle = document.getElementById('card-title');

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1, 6);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('space-scene'), alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.enableZoom = false;
  controls.enablePan = false;

  // Stars
  const starGeo = new THREE.SphereGeometry(0.03, 12, 12);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 500; i++) {
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.set(
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100),
      THREE.MathUtils.randFloatSpread(100)
    );
    scene.add(star);
  }

  // Shuttle
  const shuttleMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  const shuttleGeo = new THREE.ConeGeometry(0.15, 0.5, 12);
  const shuttle = new THREE.Mesh(shuttleGeo, shuttleMat);
  shuttle.rotation.x = Math.PI / 2;
  shuttle.position.set(0, 0, 0);
  scene.add(shuttle);

  // Lighting
  scene.add(new THREE.AmbientLight(0x222222));
  const pointLight = new THREE.PointLight(0x00ffff, 2, 50);
  pointLight.position.set(0, 5, 5);
  scene.add(pointLight);

  // Planets
  const planetGeo = new THREE.SphereGeometry(0.4, 32, 32);
  const planetMat = new THREE.MeshStandardMaterial({ color: 0x1111ff, emissive: 0x001144 });

  planetLabels.forEach((label, i) => {
    const planet = new THREE.Mesh(planetGeo, planetMat.clone());
    const angle = i * (Math.PI / 2);
    planet.position.set(Math.cos(angle) * 3, Math.sin(angle) * 2, -3);
    scene.add(planet);
    planets[label] = planet;

    // Add label
    new FontLoader().load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
      const textGeo = new TextGeometry(label, {
        font: font,
        size: 0.2,
        height: 0.02
      });
      const textMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const text = new THREE.Mesh(textGeo, textMat);
      text.position.copy(planet.position.clone().add(new THREE.Vector3(-0.6, 0.6, 0)));
      text.lookAt(camera.position);
      scene.add(text);
    });
  });

  // Mouse click detection
  window.addEventListener('click', onClick);

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Close button
  document.getElementById('close-btn').onclick = () => uiCard.classList.add('hidden');
}

function onClick(event) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(Object.values(planets));
  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    const label = Object.keys(planets).find(key => planets[key] === clicked);
    openUICard(label);
  }
}

function openUICard(label) {
  cardTitle.textContent = label;
  uiCard.classList.remove('hidden');
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}