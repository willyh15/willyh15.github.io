// File: js/space-world.js
console.log('[BOOT] space-world.js loaded');

let scene, camera, renderer, raycaster, mouse;
const planets = [];
const TextGeometry = THREE.TextGeometry;
const FontLoader = THREE.FontLoader;

try {
  if (typeof THREE === 'undefined') throw new Error('THREE is not defined');
  console.log('[THREE] OK');

  if (typeof TextGeometry === 'undefined') throw new Error('TextGeometry is undefined');
  if (typeof FontLoader === 'undefined') throw new Error('FontLoader is undefined');
  
  console.log('[THREE] TextGeometry and FontLoader assigned');
} catch (e) {
  console.error('[IMPORT FAIL]', e);
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('space-scene');
  if (!canvas) {
    console.error('[CANVAS] #space-scene not found');
    return;
  }
  console.log('[DOM] Canvas found');
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

  const fontLoader = new THREE.FontLoader();
  fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    font => {
      console.log('[FONT] Font loaded successfully');

      sections.forEach((label, i) => {
        const planet = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0x00ffff })
        );
        planet.position.set(...positions[i]);
        planet.name = label;
        scene.add(planet);
        planets.push(planet);

        const textGeo = new THREE.TextGeometry(label, {
          font: font,
          size: 0.3,
          height: 0.05,
        });
        const textMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textGeo.computeBoundingBox();
        const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
        textMesh.position.set(planet.position.x + centerOffset, planet.position.y + 1.2, planet.position.z);
        scene.add(textMesh);
      });

      console.log('[SCENE] Children count:', scene.children.length);
    },
    undefined,
    err => {
      console.error('[FONT ERROR]', err);
    }
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
  console.log('[ANIMATE] Frame rendered');
}