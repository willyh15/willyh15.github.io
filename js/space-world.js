console.log('[BOOT] space-world.js loaded');

import * as THREE from 'three';
import { OrbitControls } from 'three/controls/OrbitControls.js';
import { FontLoader } from 'three/loaders/FontLoader.js';
import { TextGeometry } from 'three/geometries/TextGeometry.js';

let scene, camera, renderer, raycaster, mouse, controls;
const planets = [];

let isAnimatingCamera = false;
let animationStartTime = 0;
let animationDuration = 1500; // ms
let cameraStartPos = new THREE.Vector3();
let cameraEndPos = new THREE.Vector3();
let targetStartPos = new THREE.Vector3();
let targetEndPos = new THREE.Vector3();

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-scene');
  if (!canvas) return console.error('[CANVAS] Missing #space-scene');

  init(canvas);
  animate();
});

function init(canvas) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 8);

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
        const centerOffset =
          -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

        const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textMesh.position.set(
          planet.position.x + centerOffset,
          planet.position.y + 1.2,
          planet.position.z
        );
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
  if (isAnimatingCamera) return; // Ignore clicks during animation

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    startCameraAnimation(planet.position);
    
    // Show floating card as before
    const name = planet.name;
    const card = document.createElement('floating-card');
    card.setAttribute('title', name);
    card.setAttribute('content', `This is the ${name} section. Add your content here.`);
    document.body.appendChild(card);
  }
}

function startCameraAnimation(targetPos) {
  isAnimatingCamera = true;
  animationStartTime = performance.now();

  cameraStartPos.copy(camera.position);
  cameraEndPos.copy(targetPos).add(new THREE.Vector3(0, 1.5, 3)); // Offset to stand back & above

  targetStartPos.copy(controls.target);
  targetEndPos.copy(targetPos);

  controls.autoRotate = false;
  controls.enabled = false;
}

function animate() {
  requestAnimationFrame(animate);

  if (isAnimatingCamera) {
    const elapsed = performance.now() - animationStartTime;
    const t = Math.min(elapsed / animationDuration, 1);

    // Smoothstep easing
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}