/**
 * Orbital positions — set initial planet and Moon positions from current date.
 * Uses mean anomaly and negative animation-delay so orbits show real positions on load.
 */
(function () {
  'use strict';

  /** J2000 epoch: 2000-01-01 12:00:00 UTC (ms). */
  var J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0, 0);

  /** Orbital period in days (approximate). */
  var ORBITAL_PERIOD_DAYS = {
    mercury: 87.97,
    venus: 224.70,
    earth: 365.25,
    mars: 687.00,
    jupiter: 4332.59,
    saturn: 10759.22,
    uranus: 30688.5,
    neptune: 60182,
    moon: 27.32
  };

  /** CSS animation duration in seconds for each orbit track (from style.css). */
  var ANIMATION_DURATION_S = {
    1: 60,
    2: 80,
    3: 100,
    4: 120,
    5: 140,
    6: 160,
    7: 180,
    8: 200,
    moon: 12
  };

  /** Planet keys in orbit order (track 1 = Mercury, etc.). */
  var TRACK_TO_PLANET = [
    'mercury',
    'venus',
    'earth',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune'
  ];

  /**
   * Days since J2000 epoch (UTC).
   * @returns {number}
   */
  function daysSinceJ2000() {
    var now = Date.now();
    return (now - J2000_MS) / (24 * 60 * 60 * 1000);
  }

  /**
   * Mean anomaly in degrees [0, 360) for a given orbital period.
   * @param {number} daysSinceEpoch
   * @param {number} periodDays
   * @returns {number}
   */
  function meanAnomalyDeg(daysSinceEpoch, periodDays) {
    var revolutions = daysSinceEpoch / periodDays;
    var deg = (revolutions % 1) * 360;
    if (deg < 0) deg += 360;
    return deg;
  }

  /**
   * Animation delay in seconds so the CSS animation shows the body at the given angle.
   * @param {number} meanAnomalyDeg - angle in degrees [0, 360)
   * @param {number} durationS - animation duration in seconds
   * @returns {number} negative seconds for animation-delay
   */
  function animationDelaySeconds(meanAnomalyDeg, durationS) {
    var fraction = meanAnomalyDeg / 360;
    return -(fraction * durationS);
  }

  /**
   * Apply real positions to orbit tracks and moon orbit. Run on DOMContentLoaded.
   */
  function applyRealPositions() {
    var solarSystem = document.querySelector('.solar-system');
    if (!solarSystem) return;

    var days = daysSinceJ2000();

    for (var i = 0; i < TRACK_TO_PLANET.length; i++) {
      var trackIndex = i + 1;
      var planetKey = TRACK_TO_PLANET[i];
      var periodDays = ORBITAL_PERIOD_DAYS[planetKey];
      var durationS = ANIMATION_DURATION_S[trackIndex];

      var anomalyDeg = meanAnomalyDeg(days, periodDays);
      var delayS = animationDelaySeconds(anomalyDeg, durationS);

      var track = solarSystem.querySelector('.orbit-track-' + trackIndex);
      if (track) {
        track.style.animationDelay = delayS + 's';
      }
    }

    var moonPeriodDays = ORBITAL_PERIOD_DAYS.moon;
    var moonDurationS = ANIMATION_DURATION_S.moon;
    var moonAnomalyDeg = meanAnomalyDeg(days, moonPeriodDays);
    var moonDelayS = animationDelaySeconds(moonAnomalyDeg, moonDurationS);

    var moonTrack = solarSystem.querySelector('.moon-orbit-track');
    if (moonTrack) {
      moonTrack.style.animationDelay = moonDelayS + 's';
    }
  }

  function init() {
    if (document.querySelector('.solar-system')) {
      applyRealPositions();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
