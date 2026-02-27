/**
 * Cosmos — Starfield animation and mobile nav.
 * Design ref: images/design-palette.txt
 */

(function () {
  'use strict';

  /** Starfield canvas: twinkling stars on hero. */
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];

    function setSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      initStars(w, h);
    }

    function initStars(width, height) {
      const count = Math.min(200, Math.floor((width * height) / 8000));
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.2 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.03,
        });
      }
    }

    function draw() {
      const w = canvas.style.width ? parseInt(canvas.style.width, 10) : window.innerWidth;
      const h = canvas.style.height ? parseInt(canvas.style.height, 10) : window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      stars.forEach(function (star) {
        star.twinkle += star.speed;
        const alpha = 0.3 + 0.7 * (Math.sin(star.twinkle) * 0.5 + 0.5);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    setSize();
    draw();
    window.addEventListener('resize', function () {
      setSize();
    });
  }

  /** Planet zoom: click to zoom in, stop orbit, hide others, keep axis spin. */
  function initPlanetZoom() {
    const planets = document.querySelectorAll('.planet');
    const overlay = document.querySelector('.planet-zoom-overlay');
    if (!planets.length || !overlay) return;

    // Multi-click state: 0=normal, 1=zoomed, 2=grabbed, 3=released
    let currentState = 0;
    let activePlanetName = null;

    function closeZoom() {
      if (!activePlanetName) return;
      
      window.dispatchEvent(new CustomEvent('planet-grab-toggle', { 
        detail: { planet: activePlanetName, isGrabbed: false } 
      }));
      
      document.body.classList.remove(
        `${activePlanetName}-zoomed`, 
        'planet-zoomed-active', 
        'planet-grabbed-active', 
        'planet-released-active'
      );
      
      currentState = 0;
      activePlanetName = null;
    }

    planets.forEach(planet => {
      planet.addEventListener('click', (e) => {
        e.preventDefault();
        const planetName = planet.getAttribute('aria-label').toLowerCase();
        
        if (activePlanetName && activePlanetName !== planetName) {
          closeZoom();
        }

        activePlanetName = planetName;

        if (currentState === 0) {
          // 1st click: Zoom in
          currentState = 1;
          document.body.classList.add(`${planetName}-zoomed`, 'planet-zoomed-active');
        } else if (currentState === 1) {
          // 2nd click: Grab
          currentState = 2;
          window.dispatchEvent(new CustomEvent('planet-grab-toggle', { 
            detail: { planet: planetName, isGrabbed: true } 
          }));
          document.body.classList.add('planet-grabbed-active');
        } else if (currentState === 2) {
          // 3rd click: Release
          currentState = 3;
          window.dispatchEvent(new CustomEvent('planet-grab-toggle', { 
            detail: { planet: planetName, isGrabbed: false } 
          }));
          document.body.classList.remove('planet-grabbed-active');
          document.body.classList.add('planet-released-active');
        } else {
          // 4th click: Zoom out
          closeZoom();
        }
      });
    });

    overlay.addEventListener('click', closeZoom);
  }

  /** Mobile nav: toggle menu open/close. */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      links.classList.toggle('is-open', !expanded);
    });

    links.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      });
    });
  }

  function init() {
    initStarfield();
    initPlanetZoom();
    initNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
