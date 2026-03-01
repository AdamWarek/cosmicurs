/**
 * Renders a spinning 3D Sun sphere when zoomed. Uses 8k_sun.jpg from sun folder.
 * Original sun gif is shown when not zoomed.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const SUN_TEXTURE_PATH = 'images/3d/sun/8k_sun.jpg';
const ROTATION_SPEED = 0.0015;

function initSun3D() {
  const container = document.querySelector('.planet-sun');
  const canvas = document.getElementById('sun-3d');
  if (!container || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 3.0;

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(2, 2, 2);
  scene.add(keyLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const sunGeometry = new THREE.SphereGeometry(1, 64, 64);
  const sunTexture = new THREE.TextureLoader().load(SUN_TEXTURE_PATH);
  sunTexture.colorSpace = THREE.SRGBColorSpace;
  sunTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  sunTexture.minFilter = THREE.LinearMipmapLinearFilter;
  const sunMaterial = new THREE.MeshStandardMaterial({ map: sunTexture });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  let isGrabbed = false;
  let previousMouseX = 0;

  window.addEventListener('planet-grab-toggle', (e) => {
    if (e.detail.planet !== 'sun') return;
    isGrabbed = e.detail.isGrabbed;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isGrabbed) {
      previousMouseX = e.clientX;
      return;
    }
    const deltaX = e.clientX - previousMouseX;
    sun.rotation.y += deltaX * 0.01;
    previousMouseX = e.clientX;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isGrabbed || e.touches.length === 0) {
      if (e.touches.length > 0) previousMouseX = e.touches[0].clientX;
      return;
    }
    const deltaX = e.touches[0].clientX - previousMouseX;
    sun.rotation.y += deltaX * 0.01;
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
    const isZoomed = document.body.classList.contains('sun-zoomed');
    const isMobile = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 2 : (isZoomed ? 3 : 2)));
    setTimeout(syncSize, isMobile ? 250 : 100);
  });
  zoomObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  function animate() {
    requestAnimationFrame(animate);
    if (!isGrabbed) {
      sun.rotation.y += ROTATION_SPEED;
    }
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSun3D);
} else {
  initSun3D();
}
