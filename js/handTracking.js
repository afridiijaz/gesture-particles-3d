/* ============================================================
   ParticleMancer — Hand Tracking Module (MediaPipe Hands)
   Detects hand landmarks, recognises gestures, and exposes
   real-time state for the particle system to consume.
   ============================================================ */

const HandTracker = (() => {

  // ── State ──────────────────────────────────────────────────
  const state = {
    active: false,
    landmarks: null,           // 21 landmarks (normalised 0-1)
    gesture: 'none',           // none | open | fist | point | peace | pinch
    handCenter: { x: 0.5, y: 0.5, z: 0 },
    fingerSpread: 0,           // 0 = closed,  1 = fully open
    pinchDist: 1,              // normalised thumb-index distance
    ready: false,
    error: null
  };

  let handsInstance = null;
  let cameraInstance = null;

  // ── Initialise MediaPipe Hands ─────────────────────────────
  function init(videoEl, canvasEl) {
    return new Promise((resolve, reject) => {
      try {
        const ctx = canvasEl.getContext('2d');
        canvasEl.width = 320;
        canvasEl.height = 240;

        handsInstance = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        });

        handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        handsInstance.onResults((results) => {
          onResults(results, ctx, canvasEl);
        });

        cameraInstance = new Camera(videoEl, {
          onFrame: async () => {
            await handsInstance.send({ image: videoEl });
          },
          width: 320,
          height: 240
        });

        cameraInstance.start().then(() => {
          state.ready = true;
          resolve();
        });

      } catch (err) {
        state.error = err.message;
        console.warn('Hand tracking unavailable:', err);
        reject(err);
      }
    });
  }

  // ── Process results ────────────────────────────────────────
  function onResults(results, ctx, canvas) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw camera image
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const lm = results.multiHandLandmarks[0];
      state.active = true;
      state.landmarks = lm;

      // palm center (average of wrist, middle-finger-mcp, ring-finger-mcp)
      state.handCenter = {
        x: (lm[0].x + lm[9].x + lm[13].x) / 3,
        y: (lm[0].y + lm[9].y + lm[13].y) / 3,
        z: (lm[0].z + lm[9].z + lm[13].z) / 3
      };

      // finger spread (sum of distances between finger tips)
      state.fingerSpread = calcFingerSpread(lm);

      // pinch distance
      state.pinchDist = dist3D(lm[4], lm[8]);

      // gesture recognition
      state.gesture = recogniseGesture(lm);

      // draw skeleton
      drawHand(ctx, lm);

    } else {
      state.active = false;
      state.gesture = 'none';
    }

    ctx.restore();
  }

  // ── Gesture recognition ────────────────────────────────────
  function recogniseGesture(lm) {
    const fingers = fingersUp(lm);
    const thumbUp = fingers[0];
    const indexUp = fingers[1];
    const middleUp = fingers[2];
    const ringUp = fingers[3];
    const pinkyUp = fingers[4];
    const totalUp = fingers.reduce((a, b) => a + b, 0);

    const pinch = dist3D(lm[4], lm[8]);

    // Pinch: thumb and index very close
    if (pinch < 0.06) return 'pinch';

    // Fist: no fingers up
    if (totalUp <= 1 && !indexUp) return 'fist';

    // Point: only index up
    if (indexUp && !middleUp && !ringUp && !pinkyUp) return 'point';

    // Peace: index + middle up
    if (indexUp && middleUp && !ringUp && !pinkyUp) return 'peace';

    // Open hand: 4+ fingers up
    if (totalUp >= 4) return 'open';

    return 'none';
  }

  // ── Helper: which fingers are extended ─────────────────────
  function fingersUp(lm) {
    const tips    = [4, 8, 12, 16, 20];
    const pips    = [3, 6, 10, 14, 18];
    const result  = [];

    // Thumb: compare x (since thumb moves laterally)
    const thumbUp = Math.abs(lm[4].x - lm[2].x) > 0.05;
    result.push(thumbUp ? 1 : 0);

    // Other fingers: tip above pip (lower y = higher on screen)
    for (let i = 1; i < 5; i++) {
      result.push(lm[tips[i]].y < lm[pips[i]].y ? 1 : 0);
    }
    return result;
  }

  // ── Finger spread metric ───────────────────────────────────
  function calcFingerSpread(lm) {
    const tips = [4, 8, 12, 16, 20];
    let total = 0;
    for (let i = 0; i < tips.length - 1; i++) {
      total += dist3D(lm[tips[i]], lm[tips[i + 1]]);
    }
    return Math.min(total / 0.8, 1);  // normalise to 0-1
  }

  // ── Euclidean distance ─────────────────────────────────────
  function dist3D(a, b) {
    return Math.sqrt(
      (a.x - b.x) ** 2 +
      (a.y - b.y) ** 2 +
      (a.z - b.z) ** 2
    );
  }

  // ── Draw hand skeleton on preview canvas ───────────────────
  function drawHand(ctx, lm) {
    const connections = [
      [0,1],[1,2],[2,3],[3,4],       // thumb
      [0,5],[5,6],[6,7],[7,8],       // index
      [5,9],[9,10],[10,11],[11,12],  // middle
      [9,13],[13,14],[14,15],[15,16],// ring
      [13,17],[17,18],[18,19],[19,20],// pinky
      [0,17]                         // palm
    ];

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
    ctx.lineWidth = 2;

    for (const [a, b] of connections) {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * 320, lm[a].y * 240);
      ctx.lineTo(lm[b].x * 320, lm[b].y * 240);
      ctx.stroke();
    }

    // landmark dots
    for (let i = 0; i < lm.length; i++) {
      ctx.beginPath();
      ctx.arc(lm[i].x * 320, lm[i].y * 240, 3, 0, Math.PI * 2);
      ctx.fillStyle = i === 8 ? '#ec4899' : '#a855f7';
      ctx.fill();
    }
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    init,
    state,
    getGesture: () => state.gesture,
    getHandCenter: () => state.handCenter,
    isActive: () => state.active
  };
})();
