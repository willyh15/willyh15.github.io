console.log('[BOOT] space-world.js loaded');

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/geometries/TextGeometry.js';


let scene, camera, renderer, raycaster, mouse;
const planets = [];

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-scene');
  if (!canvas) return console.error('[CANVAS] Missing #space-scene');

  init(canvas);
  animate();
});

function init(canvas) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 8);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 10, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  const sections = ['Projects', 'Skills', 'About', 'Contact'];
  const positions = [
    [-5, 1, -2],
    [0, -1, -5],
    [4, 2, 0],
    [2, -2, 3],
  ];

  const fontLoader = new FontLoader();
  fontLoader.load(
    'static/fonts/helvetiker_regular.typeface.json',
    font => {
      console.log('[FONT] Loaded successfully');

      sections.forEach((label, i) => {
        const planet = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0x00ffff })
        );
        planet.position.set(...positions[i]);
        planet.name = label;
        scene.add(planet);
        planets.push(planet);

        const textGeo = new TextGeometry(label, {
          font: font,
          size: 0.3,
          height: 0.05,
        });

        textGeo.computeBoundingBox();
        const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

        const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textMesh.position.set(planet.position.x + centerOffset, planet.position.y + 1.2, planet.position.z);
        scene.add(textMesh);
      });

      console.log('[SCENE] Loaded with', scene.children.length, 'children');
    },
    undefined,
    err => console.error('[FONT ERROR]', err)
  );

  window.addEventListener('click', onClick, false);
  window.addEventListener('resize', onResize);
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const name = intersects[0].object.name;
    const card = document.createElement('floating-card');
    card.setAttribute('title', name);
    card.setAttribute('content', `This is the ${name} section. Add your content here.`);
    document.body.appendChild(card);
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}