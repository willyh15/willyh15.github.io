console.log('[BOOT] space-world.js loaded');

import * as THREE from 'three';
import { OrbitControls } from 'three/controls/OrbitControls.js';
import { FontLoader } from 'three/loaders/FontLoader.js';
import { TextGeometry } from 'three/geometries/TextGeometry.js';

let scene, camera, renderer, raycaster, mouse, controls;
const planets = [];
const planetGroups = [];
let starfield;
let sun;

let hoveredPlanet = null;

let isAnimatingCamera = false;
let animationStartTime = 0;
let animationDuration = 1500; // ms
let cameraStartPos = new THREE.Vector3();
let cameraEndPos = new THREE.Vector3();
let targetStartPos = new THREE.Vector3();
let targetEndPos = new THREE.Vector3();

const baseOrbitRadii = [3, 5, 7, 9]; // spaced orbits for planets

// Planet color palette (more natural shades)
const planetColors = [
  0x4db8ff, // bright cyan-blue
  0xffb84d, // warm orange
  0x99cc66, // soft green
  0xff6666, // vivid red
];

// Orbit speeds, varying a bit for realism
const planetOrbits = [
  { speed: 0.0012, angle: 0 },
  { speed: 0.0010, angle: 1.5 },
  { speed: 0.0008, angle: 3.0 },
  { speed: 0.0015, angle: 4.5 },
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
  camera.position.set(0, 2, isMobile ? 14 : 10);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Lights: point light (sun-like) + ambient
  const light = new THREE.PointLight(0xffffff, 1.4, 100);
  light.position.set(0, 0, 0);
  light.castShadow = true;
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  createStarfield();
  createSun();

  const sections = ['Projects', 'Skills', 'About', 'Contact'];

  const fontLoader = new FontLoader();
  fontLoader.load(
    'static/fonts/helvetiker_regular.typeface.json',
    font => {
      console.log('[FONT] Loaded successfully');
      loadingSpinner.remove(); // Remove spinner on success

      sections.forEach((label, i) => {
        // Create group to hold planet + text + orbit ring
        const group = new THREE.Group();
        scene.add(group);
        planetGroups.push(group);

        // Planet material with bump map for surface depth
        const textureLoader = new THREE.TextureLoader();

        // Using simple built-in noise texture or solid color for demo
        // Replace below URL with your own planet texture images if desired
        const bumpMap = textureLoader.load(
          'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
        );

        const material = new THREE.MeshStandardMaterial({
          color: planetColors[i],
          roughness: 0.5,
          metalness: 0.1,
          bumpMap: bumpMap,
          bumpScale: 0.1,
          emissive: new THREE.Color(planetColors[i]).multiplyScalar(0.15),
          emissiveIntensity: 0.2,
        });

        // Planet mesh
        const planet = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 64, 64),
          material
        );
        planet.castShadow = true;
        planet.receiveShadow = true;

        // Position planet at orbit radius along x axis (y = 0)
        planet.position.set(baseOrbitRadii[i], 0, 0);
        planet.name = label;

        // Store orbit info in userData
        planet.userData = {
          orbitSpeed: planetOrbits[i].speed,
          orbitAngle: planetOrbits[i].angle,
          orbitRadius: baseOrbitRadii[i],
        };

        group.add(planet);
        planets.push(planet);

        // Text label geometry
        const textGeo = new TextGeometry(label, {
          font: font,
          size: 0.25,
          height: 0.05,
          curveSegments: 12,
        });
        textGeo.computeBoundingBox();
        const centerOffset =
          -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

        // Text mesh white with black outline
        const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const outlineGeo = textGeo.clone();
        outlineGeo.scale(1.05, 1.05, 1.05);
        const outlineMat = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side: THREE.BackSide,
        });

        const textMesh = new THREE.Mesh(textGeo, textMat);
        const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);

        // Position label above planet
        textMesh.position.set(
          planet.position.x + centerOffset,
          planet.position.y + 1.3,
          planet.position.z
        );
        outlineMesh.position.copy(textMesh.position);

        group.add(outlineMesh);
        group.add(textMesh);

        // Orbit ring visualization
        const ringGeometry = new THREE.RingGeometry(
          baseOrbitRadii[i] - 0.02,
          baseOrbitRadii[i] + 0.02,
          64
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x444444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.15,
        });
        const orbitRing = new THREE.Mesh(ringGeometry, ringMaterial);
        orbitRing.rotation.x = Math.PI / 2;
        scene.add(orbitRing);
      });

      console.log('[SCENE] Loaded with', scene.children.length, 'children');
    },
    undefined,
    err => {
      console.error('[FONT ERROR]', err);
      loadingSpinner.remove();

      // Fallback: create planets without labels or orbit rings
      const fallbackColors = planetColors;
      fallbackColors.forEach((color, i) => {
        const fallbackMat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.5,
          metalness: 0.1,
        });
        const fallbackPlanet = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 32, 32),
          fallbackMat
        );
        fallbackPlanet.position.set(baseOrbitRadii[i], 0, 0);
        fallbackPlanet.name = `Fallback ${i}`;
        scene.add(fallbackPlanet);
        planets.push(fallbackPlanet);
      });
    }
  );

  window.addEventListener('click', onClick, false);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', onResize);
}

// Create glowing sun at center
function createSun() {
  const sunGeometry = new THREE.SphereGeometry(1.5, 64, 64);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff66,
    emissive: 0xffff44,
    emissiveIntensity: 1,
  });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Add point light to simulate sun glow
  const sunLight = new THREE.PointLight(0xffffaa, 2, 50);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
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
    startCameraAnimation(planet.getWorldPosition(new THREE.Vector3()));

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
  cameraEndPos.copy(targetPos).add(new THREE.Vector3(0, 2, 5));

  targetStartPos.copy(controls.target);
  targetEndPos.copy(targetPos);

  controls.autoRotate = false;
  controls.enabled = false;
}

function animate() {
  requestAnimationFrame(animate);

  // Starfield twinkle by varying opacity attribute
  if (starfield) {
    const opacities = starfield.geometry.attributes.opacity.array;
    for (let i = 0; i < opacities.length; i++) {
      opacities[i] += (Math.random() - 0.5) * 0.02;
      opacities[i] = THREE.MathUtils.clamp(opacities[i], 0.3, 1);
    }
    starfield.geometry.attributes.opacity.needsUpdate = true;
  }

  // Update planet orbits and rotations
  planetGroups.forEach((group, i) => {
    const planet = planets[i];
    planet.userData.orbitAngle += planet.userData.orbitSpeed;

    const angle = planet.userData.orbitAngle;
    const radius = planet.userData.orbitRadius;

    // Update group position to orbit center around origin on XZ plane (y=0)
    group.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );

    // Rotate planet on its own axis for realism
    planet.rotation.y += 0.005;
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
  } else {
    controls.update();
  }

  renderer.render(scene, camera);
}

function onResize() {
  const isMobile = window.innerWidth < 600;

  camera.fov = isMobile ? 90 : 75;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update planet orbit radii for responsive design
  planetGroups.forEach((group, i) => {
    const scale = isMobile ? 0.6 : 1;
    const radius = baseOrbitRadii[i] * scale;
    planetOrbits[i].radius = radius; // Update stored radius
    group.position.set(
      Math.cos(planetOrbits[i].angle) * radius,
      0,
      Math.sin(planetOrbits[i].angle) * radius
    );
    planets[i].userData.orbitRadius = radius;
  });
}