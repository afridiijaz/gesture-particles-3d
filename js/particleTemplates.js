/* ============================================================
   ParticleMancer — Particle Shape Templates
   All template functions return an array of { x, y, z } positions.
   ============================================================ */

const ParticleTemplates = (() => {

  // ── Heart ──────────────────────────────────────────────────
  function heart(count, scale = 3) {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = Math.random() * 0.3 + 0.85;                     // jitter
      const layer = (Math.random() - 0.5) * 1.2;                // depth

      const x = 16 * Math.pow(Math.sin(t), 3) * r;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2*t)
                 - 2 * Math.cos(3*t) - Math.cos(4*t)) * r;
      const z = layer * scale * 0.3;

      positions.push({
        x: x * scale * 0.06,
        y: y * scale * 0.06,
        z
      });
    }
    return positions;
  }

  // ── Flower (rose curve) ────────────────────────────────────
  function flower(count, scale = 3) {
    const positions = [];
    const petals = 5;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2 * 3;
      const rr = Math.cos(petals * t);
      const jit = Math.random() * 0.5 + 0.75;
      const depth = (Math.random() - 0.5) * scale * 0.5;

      positions.push({
        x: rr * Math.cos(t) * scale * jit,
        y: rr * Math.sin(t) * scale * jit,
        z: depth
      });
    }
    return positions;
  }

  // ── Saturn (sphere + ring) ─────────────────────────────────
  function saturn(count, scale = 3) {
    const positions = [];
    const sphereCount = Math.floor(count * 0.6);
    const ringCount = count - sphereCount;

    // sphere body
    for (let i = 0; i < sphereCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = scale * 0.8 * Math.cbrt(Math.random());

      positions.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi)
      });
    }

    // ring
    for (let i = 0; i < ringCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = scale * (1.3 + Math.random() * 0.6);
      const tilt = 0.4;

      positions.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta) * Math.cos(tilt) + (Math.random() - 0.5) * 0.15,
        z: r * Math.sin(theta) * Math.sin(tilt) + (Math.random() - 0.5) * 0.15
      });
    }
    return positions;
  }

  // ── Firework (burst from center) ──────────────────────────
  function firework(count, scale = 3) {
    const positions = [];
    const trails = 12;
    const perTrail = Math.floor(count / trails);
    const remainder = count - trails * perTrail;

    for (let t = 0; t < trails; t++) {
      const theta = (t / trails) * Math.PI * 2;
      const phi = Math.PI * 0.3 + Math.random() * Math.PI * 0.4;

      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.sin(phi) * Math.sin(theta);
      const dz = Math.cos(phi);

      for (let i = 0; i < perTrail; i++) {
        const dist = (i / perTrail) * scale * 1.5;
        const spread = dist * 0.08;
        positions.push({
          x: dx * dist + (Math.random() - 0.5) * spread,
          y: dy * dist + (Math.random() - 0.5) * spread,
          z: dz * dist + (Math.random() - 0.5) * spread
        });
      }
    }

    // remainder particles at center
    for (let i = 0; i < remainder; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.2
      });
    }
    return positions;
  }

  // ── Spiral / Helix ─────────────────────────────────────────
  function spiral(count, scale = 3) {
    const positions = [];
    const turns = 5;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2 * turns;
      const r = (i / count) * scale;
      const jit = Math.random() * 0.25;

      positions.push({
        x: (r + jit) * Math.cos(t),
        y: (i / count) * scale * 2 - scale,
        z: (r + jit) * Math.sin(t)
      });
    }
    return positions;
  }

  // ── Star (5-pointed) ───────────────────────────────────────
  function star(count, scale = 3) {
    const positions = [];
    const points = 5;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const idx = Math.floor((angle / (Math.PI * 2)) * (points * 2));
      const r = idx % 2 === 0 ? scale * 1.2 : scale * 0.5;
      const jit = Math.random() * 0.5 + 0.75;
      const depth = (Math.random() - 0.5) * scale * 0.4;

      // interpolate between inner and outer radius
      const segFrac = (angle % (Math.PI / points)) / (Math.PI / points);
      const r0 = idx % 2 === 0 ? scale * 1.2 : scale * 0.5;
      const r1 = idx % 2 === 0 ? scale * 0.5 : scale * 1.2;
      const rr = (r0 + (r1 - r0) * segFrac) * jit;

      positions.push({
        x: rr * Math.cos(angle),
        y: rr * Math.sin(angle),
        z: depth
      });
    }
    return positions;
  }

  // ── DNA Double Helix ───────────────────────────────────────
  function dna(count, scale = 3) {
    const positions = [];
    const halfCount = Math.floor(count / 2);
    const turns = 4;

    for (let strand = 0; strand < 2; strand++) {
      const offset = strand * Math.PI;
      for (let i = 0; i < halfCount; i++) {
        const t = (i / halfCount) * Math.PI * 2 * turns + offset;
        const y = (i / halfCount) * scale * 3 - scale * 1.5;
        const r = scale * 0.6;
        const jit = (Math.random() - 0.5) * 0.15;

        positions.push({
          x: r * Math.cos(t) + jit,
          y: y + jit,
          z: r * Math.sin(t) + jit
        });
      }
    }

    // rungs between strands (remaining)
    const remaining = count - halfCount * 2;
    for (let i = 0; i < remaining; i++) {
      const t = (i / remaining) * Math.PI * 2 * turns;
      const y = (i / remaining) * scale * 3 - scale * 1.5;
      const r = scale * 0.6;
      const frac = Math.random();

      positions.push({
        x: r * Math.cos(t) * (1 - 2 * frac),
        y: y,
        z: r * Math.sin(t) * (1 - 2 * frac)
      });
    }
    return positions;
  }

  // ── Galaxy (disc + arms) ───────────────────────────────────
  function galaxy(count, scale = 3) {
    const positions = [];
    const arms = 4;

    for (let i = 0; i < count; i++) {
      const arm = i % arms;
      const armAngle = (arm / arms) * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.5) * scale * 1.8;
      const spiralAngle = dist * 0.8;
      const theta = armAngle + spiralAngle + (Math.random() - 0.5) * 0.5;
      const height = (Math.random() - 0.5) * scale * 0.15 * (1 + dist * 0.1);

      positions.push({
        x: dist * Math.cos(theta),
        y: height,
        z: dist * Math.sin(theta)
      });
    }
    return positions;
  }

  // ── Public API ─────────────────────────────────────────────
  const templates = { heart, flower, saturn, firework, spiral, star, dna, galaxy };

  function generate(name, count, scale) {
    const fn = templates[name] || heart;
    return fn(count, scale);
  }

  function getNames() {
    return Object.keys(templates);
  }

  return { generate, getNames, templates };
})();
