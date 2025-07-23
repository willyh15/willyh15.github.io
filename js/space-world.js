console.log('[BOOT] space-world.js loaded');

import * as THREE from 'three';
import { OrbitControls } from 'three/controls/OrbitControls.js';
import { FontLoader } from 'three/loaders/FontLoader.js';
import { TextGeometry } from 'three/geometries/TextGeometry.js';

let scene, camera, renderer, raycaster, mouse, controls;
const planets = [];
let starfield;

let hoveredPlanet = null;

let isAnimatingCamera = false;
let animationStartTime = 0;
let animationDuration = 1500; // ms
let cameraStartPos = new THREE.Vector3();
let cameraEndPos = new THREE.Vector3();
let targetStartPos = new THREE.Vector3();
let targetEndPos = new THREE.Vector3();

const basePositions = [
  [-5, 1, -2],
  [0, -1, -5],
  [4, 2, 0],
  [2, -2, 3],
];

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-scene');
  if (!canvas) return console.error('[CANVAS] Missing #space-scene');

  init(canvas);
  animate();
});

function init(canvas) {
  scene = new THREE.Scene();

  // Adjust FOV for smaller screens
  const isMobile = window.innerWidth < 600;
  const fov = isMobile ? 90 : 75;

  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, isMobile ? 12 : 8);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 10, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  createStarfield();

  const sections = ['Projects', 'Skills', 'About', 'Contact'];

  // Adjust planet positions slightly on small screens
  const adjustedPositions = basePositions.map(pos =>
    isMobile
      ? [pos[0] * 0.7, pos[1] * 0.7, pos[2] * 0.7]
      : pos
  );

  const fontLoader = new FontLoader();
  fontLoader.load(
    'static/fonts/helvetiker_regular.typeface.json',
    font => {
      console.log('[FONT] Loaded successfully');

      sections.forEach((label, i) => {
        const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const planet = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 32, 32),
          material
        );
        planet.position.set(...adjustedPositions[i]);
        planet.name = label;
        planet.userData = { baseColor: material.color.clone(), material };
        scene.add(planet);
        planets.push(planet);

        const textGeo = new TextGeometry(label, {
          font: font,
          size: 0.3,
          height: 0.05,
          curveSegments: 12,
        });

        textGeo.computeBoundingBox();
        const centerOffset =
          -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

        const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const outlineGeo = textGeo.clone();
        outlineGeo.scale(1.05, 1.05, 1.05);
        const outlineMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side: THREE.BackSide,
        });

        const textMesh = new THREE.Mesh(textGeo, textMat);
        const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);

        textMesh.position.set(
          planet.position.x + centerOffset,
          planet.position.y + 1.2,
          planet.position.z
        );
        outlineMesh.position.copy(textMesh.position);

        scene.add(outlineMesh);
        scene.add(textMesh);
      });

      console.log('[SCENE] Loaded with', scene.children.length, 'children');
    },
    undefined,
    err => console.error('[FONT ERROR]', err)
  );

  window.addEventListener('click', onClick, false);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', onResize);
}

function createStarfield() {
  const starCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < starCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    sizeAttenuation: true,
    opacity: 0.7,
    transparent: true,
  });

  starfield = new THREE.Points(geometry, material);
  scene.add(starfield);
}

function onClick(event) {
  if (isAnimatingCamera) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    startCameraAnimation(planet.position);

    const name = planet.name;
    const card = document.createElement('floating-card');
    card.setAttribute('title', name);
    card.setAttribute(
      'content',
      `This is the ${name} section. Add your content here.`
    );
    document.body.appendChild(card);
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    const planet = intersects[0].object;
    if (hoveredPlanet !== planet) {
      if (hoveredPlanet) resetPlanetHover(hoveredPlanet);
      applyPlanetHover(planet);
      hoveredPlanet = planet;
    }
  } else {
    if (hoveredPlanet) {
      resetPlanetHover(hoveredPlanet);
      hoveredPlanet = null;
    }
  }
}

function applyPlanetHover(planet) {
  const mat = planet.userData.material;
  planet.scale.set(1.15, 1.15, 1.15);
  mat.emissive = new THREE.Color(0x00ffff);
  mat.emissiveIntensity = 0.6;
}

function resetPlanetHover(planet) {
  const mat = planet.userData.material;
  planet.scale.set(1, 1, 1);
  mat.emissive = new THREE.Color(0x000000);
  mat.emissiveIntensity = 0;
}

function startCameraAnimation(targetPos) {
  isAnimatingCamera = true;
  animationStartTime = performance.now();

  cameraStartPos.copy(camera.position);
  cameraEndPos.copy(targetPos).add(new THREE.Vector3(0, 1.5, 3));

  targetStartPos.copy(controls.target);
  targetEndPos.copy(targetPos);

  controls.autoRotate = false;
  controls.enabled = false;
}

function animate() {
  requestAnimationFrame(animate);

  planets.forEach(planet => {
    planet.rotation.y += 0.003;
  });

  if (isAnimatingCamera) {
    const elapsed = performance.now() - animationStartTime;
    const t = Math.min(elapsed / animationDuration, 1);

    const smoothT = t * t * (3 - 2 * t);

    camera.position.lerpVectors(cameraStartPos, cameraEndPos, smoothT);
    controls.target.lerpVectors(targetStartPos, targetEndPos, smoothT);
    controls.update();

    if (t === 1) {
      isAnimatingCamera = false;
      controls.enabled = true;
      controls.autoRotate = true;
    }
  }

  renderer.render(scene, camera);
}

function onResize() {
  // Adjust camera FOV and reposition planets on resize
  const isMobile = window.innerWidth < 600;

  camera.fov = isMobile ? 90 : 75;
  camera.updateProjectionMatrix();

  // Adjust planet positions dynamically on resize
  planets.forEach((planet, i) => {
    const basePos = basePositions[i];
    const scale = isMobile ? 0.7 : 1;
    planet.position.set(
      basePos[0] * scale,
      basePos[1] * scale,
      basePos[2] * scale
    );
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
}