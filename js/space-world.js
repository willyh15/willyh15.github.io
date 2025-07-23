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

// Define distinct colors for each planet for visual variety
const planetColors = [
  0x4db8ff, // bright cyan-blue
  0xffb84d, // warm orange
  0x99ff99, // soft green
  0xff4d4d, // vivid red
];

// Orbit parameters for planets [orbitRadius, orbitSpeed]
const planetOrbits = [
  { radius: 5, speed: 0.0012, angle: 0 }, // Projects
  { radius: 3.5, speed: 0.0018, angle: 0.5 }, // Skills
  { radius: 6, speed: 0.0009, angle: 1.0 }, // About
  { radius: 4, speed: 0.0015, angle: 1.5 }, // Contact
];

// Create and insert a loading spinner element into the DOM
const loadingSpinner = document.createElement('div');
loadingSpinner.id = 'loading-spinner';
loadingSpinner.style.position = 'fixed';
loadingSpinner.style.top = '50%';
loadingSpinner.style.left = '50%';
loadingSpinner.style.transform = 'translate(-50%, -50%)';
loadingSpinner.style.border = '8px solid #f3f3f3';
loadingSpinner.style.borderTop = '8px solid #00ffff';
loadingSpinner.style.borderRadius = '50%';
loadingSpinner.style.width = '60px';
loadingSpinner.style.height = '60px';
loadingSpinner.style.animation = 'spin 1s linear infinite';
loadingSpinner.style.zIndex = '1000';
document.body.appendChild(loadingSpinner);

// Add keyframes style for spinner animation
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-scene');
  if (!canvas) {
    console.error('[CANVAS] Missing #space-scene');
    loadingSpinner.remove();
    return;
  }

  init(canvas);
  animate();
});

function init(canvas) {
  scene = new THREE.Scene();

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

  const light = new THREE.PointLight(0xffffff, 1.2, 100);
  light.position.set(10, 10, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  createStarfield();

  const sections = ['Projects', 'Skills', 'About', 'Contact'];
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
      loadingSpinner.remove(); // Remove spinner on success

      sections.forEach((label, i) => {
        const material = new THREE.MeshStandardMaterial({
          color: planetColors[i],
          roughness: 0.4,
          metalness: 0.2,
          flatShading: false,
          // Add subtle emissive for glow effect
          emissive: new THREE.Color(planetColors[i]).multiplyScalar(0.2),
          emissiveIntensity: 0.3,
        });

        const planet = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 32, 32),
          material
        );
        // Start position at adjusted position for initial placement
        planet.position.set(...adjustedPositions[i]);
        planet.name = label;
        planet.userData = {
          baseColor: material.color.clone(),
          material,
          orbitRadius: planetOrbits[i].radius,
          orbitSpeed: planetOrbits[i].speed,
          orbitAngle: planetOrbits[i].angle,
          basePosition: adjustedPositions[i].slice(),
        };
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
    err => {
      console.error('[FONT ERROR]', err);
      loadingSpinner.remove(); // Remove spinner on error

      // Create fallback label with basic font
      const fallbackLabel = document.createElement('div');
      fallbackLabel.textContent = 'Font load failed. Using fallback font.';
      fallbackLabel.style.position = 'fixed';
      fallbackLabel.style.top = '10px';
      fallbackLabel.style.left = '50%';
      fallbackLabel.style.transform = 'translateX(-50%)';
      fallbackLabel.style.background = 'rgba(255,0,0,0.8)';
      fallbackLabel.style.color = '#fff';
      fallbackLabel.style.padding = '0.5rem 1rem';
      fallbackLabel.style.zIndex = '1000';
      document.body.appendChild(fallbackLabel);

      // Fallback: add simple planets without text geometry
      const fallbackSections = ['Projects', 'Skills', 'About', 'Contact'];
      fallbackSections.forEach((label, i) => {
        const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        const fallbackPlanet = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 32, 32),
          mat
        );
        fallbackPlanet.position.set(...adjustedPositions[i]);
        fallbackPlanet.name = label;
        scene.add(fallbackPlanet);
        planets.push(fallbackPlanet);
      });
    }
  );

  window.addEventListener('click', onClick, false);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', onResize);
}

function createStarfield() {
  const starCount = 1000;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const opacities = [];

  for (let i = 0; i < starCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
    opacities.push(Math.random()); // random opacity for twinkle effect
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    'opacity',
    new THREE.Float32BufferAttribute(opacities, 1)
  );

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    sizeAttenuation: true,
    transparent: true,
    vertexColors: false,
    opacity: 0.7,
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

  // Animate starfield twinkle by varying opacity attribute
  if (starfield) {
    const opacities = starfield.geometry.attributes.opacity.array;
    for (let i = 0; i < opacities.length; i++) {
      opacities[i] += (Math.random() - 0.5) * 0.02; // small random delta
      opacities[i] = THREE.MathUtils.clamp(opacities[i], 0.3, 1);
    }
    starfield.geometry.attributes.opacity.needsUpdate = true;
  }

  // Update planets rotation and orbit
  const deltaTime = 0.016; // approx 60fps, could use clock for accuracy
  planets.forEach((planet, idx) => {
    // Rotate on own axis
    planet.rotation.y += 0.005;

    // Orbit movement: update angle then calculate position
    planet.userData.orbitAngle += planet.userData.orbitSpeed;
    const angle = planet.userData.orbitAngle;
    const radius = planet.userData.orbitRadius;
    // Keep original Y from base position for vertical offset
    const baseY = planet.userData.basePosition[1];
    planet.position.x = Math.cos(angle) * radius;
    planet.position.z = Math.sin(angle) * radius;
    planet.position.y = baseY; // maintain Y axis height
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
  const isMobile = window.innerWidth < 600;

  camera.fov = isMobile ? 90 : 75;
  camera.updateProjectionMatrix();

  planets.forEach((planet, i) => {
    const basePos = basePositions[i];
    const scale = isMobile ? 0.7 : 1;
    planet.position.set(
      basePos[0] * scale,
      basePos[1] * scale,
      basePos[2] * scale
    );
    // Also update orbit radius for correct orbit on resize
    planet.userData.orbitRadius = basePositions[i][0] * scale;
    // Preserve original y height scaled
    planet.userData.basePosition[1] = basePositions[i][1] * scale;
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
}