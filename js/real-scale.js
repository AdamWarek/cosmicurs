/**
 * Real Scale view — positions planets at true size ratios,
 * with optional logarithmic-distance mode.
 */
(function () {
  'use strict';

  var PLANETS = [
    { id: 'sun',     diameter: 1392700, distAU: 0,      name: 'Sun'     },
    { id: 'mercury', diameter: 4879,    distAU: 0.387,  name: 'Mercury' },
    { id: 'venus',   diameter: 12104,   distAU: 0.723,  name: 'Venus'   },
    { id: 'earth',   diameter: 12742,   distAU: 1.0,    name: 'Earth'   },
    { id: 'mars',    diameter: 6779,    distAU: 1.524,  name: 'Mars'    },
    { id: 'jupiter', diameter: 139820,  distAU: 5.203,  name: 'Jupiter' },
    { id: 'saturn',  diameter: 116460,  distAU: 9.537,  name: 'Saturn'  },
    { id: 'uranus',  diameter: 50724,   distAU: 19.19,  name: 'Uranus'  },
    { id: 'neptune', diameter: 49244,   distAU: 30.07,  name: 'Neptune' }
  ];

  var JUPITER_DIAMETER = 139820;

  /** Viewport-height units for Jupiter — controls overall scale. */
  var JUPITER_VH = 40;
  var PX_PER_KM = 0;
  var isTrueDistance = false;

  /** Pixels per log10 decade — controls how spread out True Distance mode is. */
  function getPxPerDecade() {
    return window.innerWidth * 1.2;
  }

  function getLogMin() {
    return Math.log10(PLANETS[1].distAU);
  }

  function vhToPx(vh) {
    return (vh / 100) * window.innerHeight;
  }

  function diameterPx(diameterKm) {
    return diameterKm * PX_PER_KM;
  }

  /**
   * Compressed mode: planets spaced evenly across viewport.
   * Sun is positioned so only its right arc is visible at the left edge.
   */
  function compressedPositions() {
    var vw = window.innerWidth;
    var sunDiaPx = diameterPx(PLANETS[0].diameter);
    var sunVisibleArc = vhToPx(JUPITER_VH * 0.6);
    var sunLeft = -sunDiaPx / 2 + sunVisibleArc / 2;

    var startX = sunVisibleArc + 20;
    var endX = vw - 40;
    var count = PLANETS.length - 1;
    var spacing = (endX - startX) / count;

    var positions = [];
    positions.push({ left: sunLeft, planet: PLANETS[0] });

    for (var i = 1; i < PLANETS.length; i++) {
      positions.push({
        left: startX + spacing * (i - 1) + spacing / 2,
        planet: PLANETS[i]
      });
    }

    return { positions: positions, totalWidth: vw };
  }

  /**
   * True Distance mode: logarithmic spacing based on AU from Sun.
   * Uses log10(distAU) mapped to pixels.
   */
  function trueDistancePositions() {
    var sunDiaPx = diameterPx(PLANETS[0].diameter);
    var sunVisibleArc = vhToPx(JUPITER_VH * 0.6);
    var sunLeft = -sunDiaPx / 2 + sunVisibleArc / 2;

    var pxPerDecade = getPxPerDecade();
    var logMin = getLogMin();

    var positions = [];
    positions.push({ left: sunLeft, planet: PLANETS[0] });

    var baseOffset = sunVisibleArc + 40;

    for (var i = 1; i < PLANETS.length; i++) {
      var logPos = Math.log10(PLANETS[i].distAU) - logMin;
      var x = baseOffset + logPos * pxPerDecade;
      positions.push({ left: x, planet: PLANETS[i] });
    }

    var lastPos = positions[positions.length - 1];
    var lastDia = diameterPx(lastPos.planet.diameter);
    var totalWidth = lastPos.left + lastDia + 120;

    return { positions: positions, totalWidth: totalWidth };
  }

  function applyLayout() {
    var strip = document.getElementById('real-scale-strip');
    var wrapper = document.getElementById('real-scale-wrapper');
    if (!strip || !wrapper) return;

    PX_PER_KM = vhToPx(JUPITER_VH) / JUPITER_DIAMETER;

    var layout = isTrueDistance ? trueDistancePositions() : compressedPositions();

    strip.style.width = layout.totalWidth + 'px';

    if (isTrueDistance) {
      wrapper.classList.add('is-scrollable');
    } else {
      wrapper.classList.remove('is-scrollable');
      wrapper.scrollLeft = 0;
    }

    var items = strip.querySelectorAll('.rs-item');
    items.forEach(function (item, index) {
      var pos = layout.positions[index];
      var dia = diameterPx(pos.planet.diameter);
      var body = item.querySelector('.rs-body');

      item.style.left = pos.left + 'px';
      body.style.width = dia + 'px';
      body.style.height = dia + 'px';
    });

    renderGapLabels(layout.positions);
    renderAURuler(layout);
  }

  function formatDistance(km) {
    if (km >= 1e9) return (km / 1e9).toFixed(1) + 'B km';
    if (km >= 1e6) return (km / 1e6).toFixed(1) + 'M km';
    return Math.round(km).toLocaleString() + ' km';
  }

  function renderGapLabels(positions) {
    var container = document.getElementById('rs-gap-labels');
    if (!container) return;

    container.innerHTML = '';
    if (!isTrueDistance) return;

    var AU_TO_KM = 149597870.7;

    for (var i = 1; i < positions.length; i++) {
      var prev = positions[i - 1];
      var curr = positions[i];

      var prevRight = prev.left + diameterPx(prev.planet.diameter) / 2;
      var currLeft = curr.left - diameterPx(curr.planet.diameter) / 2;
      var midX = (prevRight + currLeft) / 2;

      var distKm = (curr.planet.distAU - prev.planet.distAU) * AU_TO_KM;
      var distAU = (curr.planet.distAU - prev.planet.distAU).toFixed(2);

      var gap = document.createElement('div');
      gap.className = 'rs-gap';
      gap.style.left = midX + 'px';

      var text = document.createElement('span');
      text.className = 'rs-gap-text';
      text.innerHTML = formatDistance(distKm) + '<br>' + distAU + ' AU';

      gap.appendChild(text);
      container.appendChild(gap);
    }
  }

  function renderAURuler(layout) {
    var ruler = document.getElementById('au-ruler');
    if (!ruler) return;

    ruler.innerHTML = '';
    if (!isTrueDistance) return;

    ruler.style.width = layout.totalWidth + 'px';

    var ticks = [0, 0.5, 1, 2, 5, 10, 15, 20, 25, 30];
    var pxPerDecade = getPxPerDecade();
    var logMin = getLogMin();
    var sunVisibleArc = vhToPx(JUPITER_VH * 0.6);
    var baseOffset = sunVisibleArc + 40;

    ticks.forEach(function (au) {
      if (au === 0) return;
      var logPos = Math.log10(au) - logMin;
      var x = baseOffset + logPos * pxPerDecade;

      if (x < 0 || x > layout.totalWidth) return;

      var tick = document.createElement('div');
      tick.className = 'au-tick';
      tick.style.left = x + 'px';

      var label = document.createElement('span');
      label.className = 'au-tick-label';
      label.textContent = au + ' AU';

      tick.appendChild(label);
      ruler.appendChild(tick);
    });
  }

  function initToggle() {
    var btn = document.getElementById('true-distance-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      isTrueDistance = !isTrueDistance;
      btn.classList.toggle('is-active', isTrueDistance);
      applyLayout();
    });
  }

  function init() {
    if (!document.body.classList.contains('real-scale-page')) return;

    initToggle();
    applyLayout();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyLayout, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
