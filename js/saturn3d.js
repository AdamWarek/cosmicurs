/**
 * Renders a spinning 3D Saturn globe with rings into #saturn-3d canvas using Three.js.
 * Textures from images/3d/saturn/: saturnmap.jpg (planet), saturnringcolor.jpg + saturnringpattern.gif (rings).
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const PLANET_TEXTURE_PATH = 'images/3d/saturn/saturnmap.jpg';
const RING_COLOR_PATH = 'images/3d/saturn/saturnringcolor.jpg';
const RING_PATTERN_PATH = 'images/3d/saturn/saturnringpattern.gif';
const ROTATION_SPEED = 0.003;
const RING_INNER_RADIUS = 1.2;
const RING_OUTER_RADIUS = 2.3;
const RING_TILT = (26.7 * Math.PI) / 180;

/**
 * Remaps RingGeometry UVs so that U = radial position (inner→outer).
 * Saturn ring textures are horizontal strips where left→right = inner→outer band colors,
 * so U must follow the radius for concentric ring bands.
 */
function applyRadialUVs(geometry, innerRadius, outerRadius) {
  const pos = geometry.attributes.position;
  const uvs = geometry.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uvs.setXY(i, (r - innerRadius) / (outerRadius - innerRadius), 0.5);
  }
  uvs.needsUpdate = true;
}

function initSaturn3D() {
  const container = document.querySelector('.planet-saturn');
  const canvas = document.getElementById('saturn-3d');
  if (!container || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 7.0;

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  sunLight.position.set(-2, 1.5, 2);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const segments = window.innerWidth < 768 ? 32 : 64;
  const planetGeometry = new THREE.SphereGeometry(1, segments, segments);
  const planetTexture = new THREE.TextureLoader().load(PLANET_TEXTURE_PATH);
  planetTexture.colorSpace = THREE.SRGBColorSpace;
  const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planet);

  const ringGeometry = new THREE.RingGeometry(RING_INNER_RADIUS, RING_OUTER_RADIUS, segments, 8);
  applyRadialUVs(ringGeometry, RING_INNER_RADIUS, RING_OUTER_RADIUS);

  const loader = new THREE.TextureLoader();
  const ringColorTex = loader.load(RING_COLOR_PATH);
  ringColorTex.colorSpace = THREE.SRGBColorSpace;
  ringColorTex.wrapS = ringColorTex.wrapT = THREE.RepeatWrapping;

  const ringPatternTex = loader.load(RING_PATTERN_PATH);
  ringPatternTex.wrapS = ringPatternTex.wrapT = THREE.RepeatWrapping;

  const ringMaterial = new THREE.MeshBasicMaterial({
    map: ringColorTex,
    alphaMap: ringPatternTex,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -RING_TILT;
  scene.add(ring);

  // Interaction state
  let isGrabbed = false;
  let previousMouseX = 0;

  window.addEventListener('planet-grab-toggle', (e) => {
    if (e.detail.planet !== 'saturn') return;
    isGrabbed = e.detail.isGrabbed;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isGrabbed) {
      previousMouseX = e.clientX;
      return;
    }
    const deltaX = e.clientX - previousMouseX;
    planet.rotation.y += deltaX * 0.01;
    ring.rotation.y += deltaX * 0.01;
    previousMouseX = e.clientX;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isGrabbed || e.touches.length === 0) {
      if (e.touches.length > 0) previousMouseX = e.touches[0].clientX;
      return;
    }
    const deltaX = e.touches[0].clientX - previousMouseX;
    planet.rotation.y += deltaX * 0.01;
    ring.rotation.y += deltaX * 0.01;
    previousMouseX = e.touches[0].clientX;
  }, { passive: true });

  function syncSize() {
    const size = container.offsetWidth;
    if (size === 0) return;
    renderer.setSize(size, size);
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);
  syncSize();

  const zoomObserver = new MutationObserver(() => {
    setTimeout(syncSize, window.innerWidth < 768 ? 250 : 100);
  });
  zoomObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function animate() {
    requestAnimationFrame(animate);
    if (!isGrabbed) {
      planet.rotation.y += ROTATION_SPEED;
      ring.rotation.y += ROTATION_SPEED;
    }
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSaturn3D);
} else {
  initSaturn3D();
}
