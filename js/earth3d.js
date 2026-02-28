/**
 * Renders a spinning 3D Earth with smooth crossfade between textures.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const TEXTURES = [
  'images/3d/2k_earth_daymap.jpg',
  'images/3d/2k_earth_clouds.jpg',
  'images/3d/2k_earth_nightmap.jpg',
];
const ZOOM_TEXTURE = 'images/3d/earth/earthzoom.jpg';

const ROTATION_SPEED = 0.003;
const CYCLE_INTERVAL_MS = 30000;
const FADE_DURATION_MS = 2000;

function initEarth3D() {
  const container = document.querySelector('.planet-earth');
  const canvas = document.getElementById('earth-3d');
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

  const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
  const loader = new THREE.TextureLoader();
  const textures = [];
  let texturesLoaded = 0;
  let zoomTexture = null;

  loader.load(ZOOM_TEXTURE, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    zoomTexture = tex;
  });

  // Interaction state
  let isGrabbed = false;
  let previousMouseX = 0;

  window.addEventListener('planet-grab-toggle', (e) => {
    if (e.detail.planet !== 'earth') return;
    isGrabbed = e.detail.isGrabbed;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isGrabbed) {
      previousMouseX = e.clientX;
      return;
    }
    const deltaX = e.clientX - previousMouseX;
    sphereA.rotation.y += deltaX * 0.01;
    sphereB.rotation.y += deltaX * 0.01;
    previousMouseX = e.clientX;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isGrabbed || e.touches.length === 0) {
      if (e.touches.length > 0) previousMouseX = e.touches[0].clientX;
      return;
    }
    const deltaX = e.touches[0].clientX - previousMouseX;
    sphereA.rotation.y += deltaX * 0.01;
    sphereB.rotation.y += deltaX * 0.01;
    previousMouseX = e.touches[0].clientX;
  }, { passive: true });

  let sphereA, sphereB;

  function onAllTexturesLoaded() {
    const materialA = new THREE.MeshStandardMaterial({
      map: textures[0],
      transparent: true,
      opacity: 1,
      depthWrite: true,
    });
    const materialB = new THREE.MeshStandardMaterial({
      map: textures[1],
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    sphereA = new THREE.Mesh(earthGeometry, materialA);
    sphereB = new THREE.Mesh(earthGeometry, materialB);
    scene.add(sphereA);
    scene.add(sphereB);

    let currentIndex = 0;
    let activeSphere = 0;
    let fadeStart = 0;
    let isFading = false;

    function startFade() {
      isFading = true;
      fadeStart = performance.now();
    }

    function cycleTexture() {
      if (isFading) return;
      const nextIndex = (currentIndex + 1) % TEXTURES.length;
      const inMat = activeSphere === 0 ? materialB : materialA;

      inMat.map = textures[nextIndex];
      inMat.opacity = 0;
      inMat.depthWrite = false;
      startFade();
    }

    let cycleInterval = setInterval(cycleTexture, CYCLE_INTERVAL_MS);

    function applyZoomTexture(isZoomed) {
      if (isZoomed) {
        if (zoomTexture) {
          materialA.map = zoomTexture;
          materialB.map = zoomTexture;
          materialA.opacity = 1;
          materialB.opacity = 0;
          materialB.depthWrite = false;
        }
        clearInterval(cycleInterval);
        cycleInterval = null;
      } else {
        materialA.map = textures[currentIndex];
        materialB.map = textures[(currentIndex + 1) % TEXTURES.length];
        materialA.opacity = activeSphere === 0 ? 1 : 0;
        materialB.opacity = activeSphere === 0 ? 0 : 1;
        materialB.depthWrite = false;
        materialA.depthWrite = activeSphere === 0;
        if (!cycleInterval) cycleInterval = setInterval(cycleTexture, CYCLE_INTERVAL_MS);
      }
    }

    const zoomObserver = new MutationObserver(() => {
      applyZoomTexture(document.body.classList.contains('earth-zoomed'));
    });
    zoomObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (document.body.classList.contains('earth-zoomed')) applyZoomTexture(true);

    function animate() {
      requestAnimationFrame(animate);
      const time = performance.now();

      if (isFading) {
        const dt = time - fadeStart;
        const t = Math.min(dt / FADE_DURATION_MS, 1);
        const easeT = t * t * (3 - 2 * t);

        if (t >= 1) {
          isFading = false;
          currentIndex = (currentIndex + 1) % TEXTURES.length;
          activeSphere = 1 - activeSphere;
          const outMat = activeSphere === 0 ? materialB : materialA;
          outMat.opacity = 0;
          outMat.depthWrite = false;
          const inMat = activeSphere === 0 ? materialA : materialB;
          inMat.opacity = 1;
          inMat.depthWrite = true;
        } else {
          const outMat = activeSphere === 0 ? materialA : materialB;
          const inMat = activeSphere === 0 ? materialB : materialA;
          outMat.opacity = 1 - easeT;
          inMat.opacity = easeT;
        }
      }

      if (!isGrabbed) {
        sphereA.rotation.y += ROTATION_SPEED;
        sphereB.rotation.y += ROTATION_SPEED;
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  TEXTURES.forEach((path, i) => {
    loader.load(path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      textures[i] = tex;
      texturesLoaded++;
      if (texturesLoaded === TEXTURES.length) onAllTexturesLoaded();
    });
  });

  function syncSize() {
    const size = container.offsetWidth;
    if (size === 0) return;
    renderer.setSize(size, size);
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);
  syncSize();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEarth3D);
} else {
  initEarth3D();
}
