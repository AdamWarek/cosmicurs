/**
 * Renders a spinning 3D Saturn globe with rings into #saturn-3d canvas using Three.js.
 * Textures: images/3d/2k_saturn.jpg (planet), images/3d/2k_saturn_ring_alpha.png (rings).
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const PLANET_TEXTURE_PATH = 'images/3d/2k_saturn.jpg';
const RING_TEXTURE_PATH = 'images/3d/2k_saturn_ring_alpha.png';
const ROTATION_SPEED = 0.003;
const RING_INNER_RADIUS = 1.2;
const RING_OUTER_RADIUS = 2.3;
const RING_TILT = (26.7 * Math.PI) / 180;

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

  const planetGeometry = new THREE.SphereGeometry(1, 64, 64);
  const planetTexture = new THREE.TextureLoader().load(PLANET_TEXTURE_PATH);
  planetTexture.colorSpace = THREE.SRGBColorSpace;
  const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planet);

  const ringGeometry = new THREE.RingGeometry(RING_INNER_RADIUS, RING_OUTER_RADIUS, 64);
  const ringTexture = new THREE.TextureLoader().load(RING_TEXTURE_PATH);
  ringTexture.colorSpace = THREE.SRGBColorSpace;
  const ringMaterial = new THREE.MeshBasicMaterial({
    map: ringTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -RING_TILT;
  scene.add(ring);

  function syncSize() {
    const size = container.offsetWidth;
    if (size === 0) return;
    renderer.setSize(size, size);
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);
  syncSize();

  function animate() {
    requestAnimationFrame(animate);
    planet.rotation.y += ROTATION_SPEED;
    ring.rotation.y += ROTATION_SPEED;
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSaturn3D);
} else {
  initSaturn3D();
}
