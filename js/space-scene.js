// File: js/space-scene.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let scene, camera, renderer, shuttle, controls, planets = [], planetLabels = [];

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.querySelector('#space-scene') });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(25, 50, 25);
  scene.add(pointLight);

  createStarfield();
  createShuttle();
  createPlanets();
  create3DText();

  window.addEventListener('resize', onWindowResize);
}

function createStarfield() {
  const starsGeometry = new THREE.BufferGeometry();
  const starVertices = [];
  for (let i = 0; i < 5000; i++) {
    starVertices.push(THREE.MathUtils.randFloatSpread(200)); // x
    starVertices.push(THREE.MathUtils.randFloatSpread(200)); // y
    starVertices.push(THREE.MathUtils.randFloatSpread(200)); // z
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0x8888ff });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
}

function createShuttle() {
  const geometry = new THREE.ConeGeometry(0.3, 1.2, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xddddff });
  shuttle = new THREE.Mesh(geometry, material);
  shuttle.rotation.x = Math.PI / 2;
  shuttle.position.set(0, 0, 0);
  scene.add(shuttle);
}

function createPlanets() {
  const planetData = [
    { label: "Projects", position: [-8, 1, -6], color: 0xffaa00 },
    { label: "Skills", position: [5, -2, -4], color: 0x66ccff },
    { label: "About", position: [2, 4, -3], color: 0x99ff66 },
    { label: "Contact", position: [-4, -3, -7], color: 0xff6699 }
  ];

  planetData.forEach(data => {
    const geo = new THREE.SphereGeometry(1.2, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ color: data.color });
    const planet = new THREE.Mesh(geo, mat);
    planet.position.set(...data.position);
    scene.add(planet);
    planets.push({ mesh: planet, label: data.label });

    // Optional orbit ring
    const ringGeo = new THREE.RingGeometry(1.5, 1.6, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(...data.position);
    scene.add(ring);
  });
}

function create3DText() {
  const loader = new FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
    const geometry = new TextGeometry('Will Harrison', {
      font: font,
      size: 1,
      height: 0.3,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.05,
      bevelOffset: 0,
      bevelSegments: 5
    });
    const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-4, 4, -5);
    scene.add(mesh);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  planets.forEach(({ mesh }) => mesh.rotation.y += 0.005);
  controls.update();
  renderer.render(scene, camera);
}