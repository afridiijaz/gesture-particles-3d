/* ============================================================
   ParticleMancer — Main Application
   Three.js particle system + hand-gesture integration
   ============================================================ */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────
  const CONFIG = {
    particleCount: 5000,
    particleSize: 5,
    rotationSpeed: 0.003,
    currentShape: 'heart',
    colorTheme: 'rainbow',
    scale: 3,
    lerpSpeed: 0.03,           // smooth transition speed
    gestureInfluence: 1.0,
    expansionFactor: 1.0,      // controlled by gestures
    attractPoint: null         // when pointing
  };

  // ── Color themes ───────────────────────────────────────────
  const COLOR_THEMES = {
    rainbow: (t) => {
      const c = new THREE.Color();
      c.setHSL(t, 0.9, 0.6);
      return c;
    },
    fire: (t) => {
      const c = new THREE.Color();
      c.setHSL(0.05 + t * 0.08, 1.0, 0.35 + t * 0.35);
      return c;
    },
    ocean: (t) => {
      const c = new THREE.Color();
      c.setHSL(0.52 + t * 0.12, 0.8, 0.3 + t * 0.4);
      return c;
    },
    neon: (t) => {
      const c = new THREE.Color();
      const hues = [0.75, 0.85, 0.95, 0.05];
      c.setHSL(hues[Math.floor(t * hues.length) % hues.length], 1.0, 0.55);
      return c;
    },
    gold: (t) => {
      const c = new THREE.Color();
      c.setHSL(0.12 + t * 0.04, 0.9, 0.4 + t * 0.3);
      return c;
    },
    aurora: (t) => {
      const c = new THREE.Color();
      c.setHSL(0.3 + t * 0.4, 0.7, 0.4 + t * 0.2);
      return c;
    },
    sakura: (t) => {
      const c = new THREE.Color();
      c.setHSL(0.92 + t * 0.05, 0.6, 0.65 + t * 0.2);
      return c;
    }
  };

  // ── Three.js Setup ─────────────────────────────────────────
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050510, 1);

  const scene = new THREE.Scene();

  // subtle fog
  scene.fog = new THREE.FogExp2(0x050510, 0.015);

  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(0, 0, 12);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.enablePan = false;

  // ── Ambient light sphere (background glow) ─────────────────
  const bgGeo = new THREE.SphereGeometry(50, 32, 32);
  const bgMat = new THREE.MeshBasicMaterial({
    color: 0x0a0a1e,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.4
  });
  scene.add(new THREE.Mesh(bgGeo, bgMat));

  // ── Stars background ───────────────────────────────────────
  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3]     = (Math.random() - 0.5) * 100;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.5
  });
  scene.add(new THREE.Points(starGeo, starMat));

  // ── Particle System ────────────────────────────────────────
  let geometry, material, points;
  let targetPositions = [];    // where particles want to go
  let currentPositions;        // current interpolated positions
  let colors;

  function createParticleSystem() {
    // clean up old
    if (points) {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    }

    const count = CONFIG.particleCount;

    geometry = new THREE.BufferGeometry();
    currentPositions = new Float32Array(count * 3);
    colors = new Float32Array(count * 3);

    // generate target shape
    targetPositions = ParticleTemplates.generate(CONFIG.currentShape, count, CONFIG.scale);

    // initialise current positions (random scatter)
    for (let i = 0; i < count; i++) {
      currentPositions[i * 3]     = (Math.random() - 0.5) * 20;
      currentPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      currentPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // colours
      const t = i / count;
      const col = COLOR_THEMES[CONFIG.colorTheme](t);
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // circle texture for particles
    const tex = createParticleTexture();

    material = new THREE.PointsMaterial({
      size: CONFIG.particleSize * 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: tex,
      sizeAttenuation: true
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
  }

  // ── Particle texture (soft circle) ─────────────────────────
  function createParticleTexture() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.2)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  // ── Switch shape ───────────────────────────────────────────
  function switchShape(shapeName) {
    CONFIG.currentShape = shapeName;
    targetPositions = ParticleTemplates.generate(shapeName, CONFIG.particleCount, CONFIG.scale);

    // update button UI
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === shapeName);
    });
  }

  // ── Update colours ─────────────────────────────────────────
  function updateColors() {
    if (!colors) return;
    const count = CONFIG.particleCount;
    const themeFn = COLOR_THEMES[CONFIG.colorTheme];
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const col = themeFn(t);
      colors[i * 3]     = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geometry.attributes.color.needsUpdate = true;
  }

  // ── Gesture processing ─────────────────────────────────────
  let gestureShapeCooldown = 0;
  const shapeNames = ParticleTemplates.getNames();
  let currentShapeIdx = 0;

  function processGestures(dt) {
    if (!HandTracker.isActive()) {
      CONFIG.expansionFactor += (1.0 - CONFIG.expansionFactor) * 0.02;
      CONFIG.attractPoint = null;
      return;
    }

    const gesture = HandTracker.getGesture();
    const hand = HandTracker.getHandCenter();
    const statusEl = document.getElementById('gesture-status');

    switch (gesture) {
      case 'open':
        // Expand particles outward
        CONFIG.expansionFactor += (2.0 - CONFIG.expansionFactor) * 0.05;
        statusEl.textContent = '🖐 Open Hand — Expanding!';
        statusEl.classList.add('active');
        break;

      case 'fist':
        // Compress particles inward
        CONFIG.expansionFactor += (0.3 - CONFIG.expansionFactor) * 0.05;
        statusEl.textContent = '✊ Fist — Compressing!';
        statusEl.classList.add('active');
        break;

      case 'point':
        // Attract toward finger position (mapped to 3D)
        const px = (hand.x - 0.5) * 10;
        const py = -(hand.y - 0.5) * 10;
        CONFIG.attractPoint = { x: px, y: py, z: 0 };
        statusEl.textContent = '👆 Pointing — Attracting!';
        statusEl.classList.add('active');
        break;

      case 'peace':
        // Cycle to next shape
        gestureShapeCooldown -= dt;
        if (gestureShapeCooldown <= 0) {
          currentShapeIdx = (currentShapeIdx + 1) % shapeNames.length;
          switchShape(shapeNames[currentShapeIdx]);
          gestureShapeCooldown = 1.5; // prevent rapid cycling
          statusEl.textContent = `✌️ Peace — Switched to ${shapeNames[currentShapeIdx]}!`;
        }
        statusEl.classList.add('active');
        break;

      case 'pinch':
        // Change particle size based on pinch distance
        const pinchVal = HandTracker.state.pinchDist;
        CONFIG.particleSize = 2 + pinchVal * 18;
        material.size = CONFIG.particleSize * 0.04;
        document.getElementById('particle-size').value = CONFIG.particleSize;
        document.getElementById('size-val').textContent = CONFIG.particleSize.toFixed(1);
        statusEl.textContent = '🤏 Pinch — Resizing!';
        statusEl.classList.add('active');
        break;

      default:
        CONFIG.expansionFactor += (1.0 - CONFIG.expansionFactor) * 0.02;
        CONFIG.attractPoint = null;
        statusEl.textContent = '🖐 Hand detected — try a gesture!';
        statusEl.classList.remove('active');
        break;
    }
  }

  // ── Animation Loop ─────────────────────────────────────────
  const clock = new THREE.Clock();
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    time += dt;

    // process hand gestures
    processGestures(dt);

    // update particle positions (smooth lerp toward target)
    if (currentPositions && targetPositions.length > 0) {
      const count = CONFIG.particleCount;
      const expansion = CONFIG.expansionFactor;
      const attract = CONFIG.attractPoint;

      for (let i = 0; i < count; i++) {
        const target = targetPositions[i % targetPositions.length];

        let tx = target.x * expansion;
        let ty = target.y * expansion;
        let tz = target.z * expansion;

        // attract toward finger point
        if (attract) {
          const dx = attract.x - currentPositions[i * 3];
          const dy = attract.y - currentPositions[i * 3 + 1];
          const dz = attract.z - currentPositions[i * 3 + 2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          const force = Math.max(0, 1 - dist / 8) * 0.15;
          tx += dx * force;
          ty += dy * force;
          tz += dz * force;
        }

        // add subtle floating animation
        const floatX = Math.sin(time * 0.5 + i * 0.01) * 0.05;
        const floatY = Math.cos(time * 0.7 + i * 0.013) * 0.05;
        const floatZ = Math.sin(time * 0.3 + i * 0.017) * 0.05;

        // lerp
        currentPositions[i * 3]     += (tx + floatX - currentPositions[i * 3])     * CONFIG.lerpSpeed;
        currentPositions[i * 3 + 1] += (ty + floatY - currentPositions[i * 3 + 1]) * CONFIG.lerpSpeed;
        currentPositions[i * 3 + 2] += (tz + floatZ - currentPositions[i * 3 + 2]) * CONFIG.lerpSpeed;
      }

      geometry.attributes.position.needsUpdate = true;
    }

    // rotate the particle system
    if (points) {
      points.rotation.y += CONFIG.rotationSpeed;
    }

    // color pulse effect based on hand activity
    if (HandTracker.isActive() && material) {
      const pulse = 0.7 + Math.sin(time * 3) * 0.3;
      material.opacity = pulse;
    } else if (material) {
      material.opacity += (0.85 - material.opacity) * 0.05;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // ── UI Event Listeners ─────────────────────────────────────
  function setupUI() {
    // Shape buttons
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const shape = btn.dataset.shape;
        currentShapeIdx = shapeNames.indexOf(shape);
        switchShape(shape);
      });
    });

    // Particle count
    const countSlider = document.getElementById('particle-count');
    const countVal = document.getElementById('count-val');
    countSlider.addEventListener('input', () => {
      countVal.textContent = countSlider.value;
      CONFIG.particleCount = parseInt(countSlider.value);
      createParticleSystem();
    });

    // Particle size
    const sizeSlider = document.getElementById('particle-size');
    const sizeVal = document.getElementById('size-val');
    sizeSlider.addEventListener('input', () => {
      sizeVal.textContent = sizeSlider.value;
      CONFIG.particleSize = parseFloat(sizeSlider.value);
      if (material) material.size = CONFIG.particleSize * 0.04;
    });

    // Rotation speed
    const rotSlider = document.getElementById('rotation-speed');
    const rotVal = document.getElementById('rot-val');
    rotSlider.addEventListener('input', () => {
      rotVal.textContent = rotSlider.value;
      CONFIG.rotationSpeed = parseInt(rotSlider.value) * 0.0001;
    });

    // Color theme
    const themeSelect = document.getElementById('color-theme');
    themeSelect.addEventListener('change', () => {
      CONFIG.colorTheme = themeSelect.value;
      updateColors();
    });

    // Toggle gesture guide
    const guideEl = document.getElementById('gesture-guide');
    const toggleBtn = document.getElementById('toggle-guide');
    let guideVisible = true;
    toggleBtn.addEventListener('click', () => {
      guideVisible = !guideVisible;
      guideEl.querySelector('ul').style.display = guideVisible ? 'flex' : 'none';
      toggleBtn.textContent = guideVisible ? 'Hide Guide' : 'Show Guide';
    });

    // About panel toggle
    const aboutToggle  = document.getElementById('about-toggle');
    const aboutContent = document.getElementById('about-content');
    const aboutClose   = document.getElementById('about-close');

    aboutToggle.addEventListener('click', () => {
      aboutContent.classList.toggle('visible');
    });
    aboutClose.addEventListener('click', () => {
      aboutContent.classList.remove('visible');
    });

    // ── Mobile FAB & Drawer ──────────────────────────────────
    const mobileFab      = document.getElementById('mobile-fab');
    const backdrop       = document.getElementById('mobile-backdrop');
    const controlsPanel  = document.getElementById('controls-panel');

    function openDrawer() {
      controlsPanel.classList.add('drawer-open');
      backdrop.classList.add('visible');
      mobileFab.classList.add('active');
      mobileFab.textContent = '✕';
    }

    function closeDrawer() {
      controlsPanel.classList.remove('drawer-open');
      backdrop.classList.remove('visible');
      mobileFab.classList.remove('active');
      mobileFab.textContent = '⚙️';
    }

    mobileFab.addEventListener('click', () => {
      controlsPanel.classList.contains('drawer-open') ? closeDrawer() : openDrawer();
    });

    backdrop.addEventListener('click', closeDrawer);

    // swipe down on controls panel to close
    let touchStartY = 0;
    controlsPanel.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    controlsPanel.addEventListener('touchmove', (e) => {
      const dy = e.touches[0].clientY - touchStartY;
      if (dy > 60) closeDrawer();
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= shapeNames.length) {
        currentShapeIdx = num - 1;
        switchShape(shapeNames[currentShapeIdx]);
      }

      // Space to randomise colours
      if (e.key === ' ') {
        e.preventDefault();
        const themes = Object.keys(COLOR_THEMES);
        CONFIG.colorTheme = themes[Math.floor(Math.random() * themes.length)];
        document.getElementById('color-theme').value = CONFIG.colorTheme;
        updateColors();
      }

      // R to reset camera
      if (e.key === 'r' || e.key === 'R') {
        camera.position.set(0, 0, 12);
        controls.reset();
      }
    });
  }

  // ── Boot ───────────────────────────────────────────────────
  async function boot() {
    console.log('✨ ParticleMancer — Booting...');

    // create the particle system
    createParticleSystem();

    // setup UI
    setupUI();

    // start animation
    animate();

    // initialise hand tracking
    try {
      const video = document.getElementById('webcam');
      const handCanvas = document.getElementById('hand-canvas');
      await HandTracker.init(video, handCanvas);
      console.log('🖐 Hand tracking ready!');
      document.getElementById('gesture-status').textContent = 'Hand tracking ready — show your hand!';
    } catch (err) {
      console.warn('Hand tracking failed to initialise, running without it.', err);
      document.getElementById('gesture-status').textContent = 'Hand tracking unavailable — use buttons & sliders!';
      document.getElementById('camera-preview').style.display = 'none';
    }
  }

  // wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
