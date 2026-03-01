/**
 * Renders a spinning 3D Jupiter globe into #jupiter-3d canvas using Three.js.
 * Texture: images/3d/2k_jupiter.jpg (equirectangular projection).
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const TEXTURE_PATH = 'images/3d/2k_jupiter.jpg';
const ROTATION_SPEED = 0.003;

function initJupiter3D() {
  const container = document.querySelector('.planet-jupiter');
  const canvas = document.getElementById('jupiter-3d');
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

  const segments = window.innerWidth < 768 ? 32 : 64;
  const geometry = new THREE.SphereGeometry(1, segments, segments);
  const texture = new THREE.TextureLoader().load(TEXTURE_PATH);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Interaction state
  let isGrabbed = false;
  let previousMouseX = 0;

  window.addEventListener('planet-grab-toggle', (e) => {
    if (e.detail.planet !== 'jupiter') return;
    isGrabbed = e.detail.isGrabbed;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isGrabbed) {
      previousMouseX = e.clientX;
      return;
    }
    const deltaX = e.clientX - previousMouseX;
    sphere.rotation.y += deltaX * 0.01;
    previousMouseX = e.clientX;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isGrabbed || e.touches.length === 0) {
      if (e.touches.length > 0) previousMouseX = e.touches[0].clientX;
      return;
    }
    const deltaX = e.touches[0].clientX - previousMouseX;
    sphere.rotation.y += deltaX * 0.01;
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
      sphere.rotation.y += ROTATION_SPEED;
    }
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initJupiter3D);
} else {
  initJupiter3D();
}
