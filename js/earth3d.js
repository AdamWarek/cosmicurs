/**
 * Renders a spinning 3D Earth with cycling textures:
 * Day (30s) → Clouds (30s) → Night (30s) → repeat.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const TEXTURES = [
  'images/3d/2k_earth_daymap.jpg',
  'images/3d/2k_earth_clouds.jpg',
  'images/3d/2k_earth_nightmap.jpg',
];
const ROTATION_SPEED = 0.003;
const CYCLE_INTERVAL_MS = 30000;

function initEarth3D() {
  const container = document.querySelector('.planet-earth');
  const canvas = document.getElementById('earth-3d');
  if (!container || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.2;

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  sunLight.position.set(-2, 1.5, 2);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({ map: new THREE.Texture() });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  const loader = new THREE.TextureLoader();
  let currentIndex = 0;

  function loadTexture(path) {
    loader.load(path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      material.map = tex;
    });
  }

  loadTexture(TEXTURES[0]);

  setInterval(() => {
    currentIndex = (currentIndex + 1) % TEXTURES.length;
    loadTexture(TEXTURES[currentIndex]);
  }, CYCLE_INTERVAL_MS);

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
    sphere.rotation.y += ROTATION_SPEED;
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEarth3D);
} else {
  initEarth3D();
}
