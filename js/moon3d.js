/**
 * Renders a spinning 3D Moon globe into #moon-3d canvas using Three.js.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const MOON_TEXTURE_PATH = 'images/3d/moonmap2k.jpg';
const ROTATION_SPEED = 0.002;

function initMoon3D() {
  const container = document.querySelector('.planet-moon');
  const canvas = document.getElementById('moon-3d');
  if (!container || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 3.0;

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  sunLight.position.set(-2, 1.5, 2);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
  const moonTexture = new THREE.TextureLoader().load(MOON_TEXTURE_PATH);
  moonTexture.colorSpace = THREE.SRGBColorSpace;
  const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  scene.add(moon);

  let isGrabbed = false;
  let previousMouseX = 0;

  window.addEventListener('planet-grab-toggle', (e) => {
    if (e.detail.planet !== 'moon') return;
    isGrabbed = e.detail.isGrabbed;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isGrabbed) {
      previousMouseX = e.clientX;
      return;
    }
    const deltaX = e.clientX - previousMouseX;
    moon.rotation.y += deltaX * 0.01;
    previousMouseX = e.clientX;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isGrabbed || e.touches.length === 0) {
      if (e.touches.length > 0) previousMouseX = e.touches[0].clientX;
      return;
    }
    const deltaX = e.touches[0].clientX - previousMouseX;
    moon.rotation.y += deltaX * 0.01;
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

  function animate() {
    requestAnimationFrame(animate);
    if (!isGrabbed) {
      moon.rotation.y += ROTATION_SPEED;
    }
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMoon3D);
} else {
  initMoon3D();
}
