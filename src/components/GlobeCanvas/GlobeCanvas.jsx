import { useEffect, useRef, useState } from 'react';
import './GlobeCanvas.css';

function generateTreePoints() {
  const points = [];

  // ── Trunk (cylinder) ─────────────────────────────────
  const trunkH = 1.2;
  const trunkR = 0.08;
  for (let i = 0; i < 800; i++) {
    const theta = Math.random() * Math.PI * 2;
    const y = -1.4 + Math.random() * trunkH;
    const r = trunkR * (1 + (y + 1.4) * 0.15); // slightly wider at base
    points.push({
      x: Math.cos(theta) * r,
      y,
      z: Math.sin(theta) * r,
      type: 'trunk'
    });
  }

  // ── Main canopy (large sphere) ────────────────────────
  const canopyR = 1.0;
  const canopyY = 0.3;
  for (let i = 0; i < 4000; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = canopyR * (0.85 + Math.random() * 0.15);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = canopyY + r * Math.sin(phi) * Math.sin(theta) * 0.85;
    const z = r * Math.cos(phi);
    if (y < -0.2) continue; // cut bottom of canopy
    points.push({ x, y, z, type: 'leaf' });
  }

  // ── Secondary cluster (left bulge) ───────────────────
  for (let i = 0; i < 1200; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.6 * (0.85 + Math.random() * 0.15);
    points.push({
      x: -0.75 + r * Math.sin(phi) * Math.cos(theta),
      y:  0.1 + r * Math.sin(phi) * Math.sin(theta) * 0.8,
      z:  0.1 + r * Math.cos(phi),
      type: 'leaf'
    });
  }

  // ── Secondary cluster (right bulge) ──────────────────
  for (let i = 0; i < 1200; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.65 * (0.85 + Math.random() * 0.15);
    points.push({
      x:  0.8 + r * Math.sin(phi) * Math.cos(theta),
      y:  0.2 + r * Math.sin(phi) * Math.sin(theta) * 0.8,
      z:  0.0 + r * Math.cos(phi),
      type: 'leaf'
    });
  }

  // ── Top tuft ──────────────────────────────────────────
  for (let i = 0; i < 600; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.45 * (0.85 + Math.random() * 0.15);
    points.push({
      x:  0.1 + r * Math.sin(phi) * Math.cos(theta),
      y:  1.0 + r * Math.abs(Math.sin(phi)) * Math.sin(theta) * 0.7,
      z:  0.0 + r * Math.cos(phi),
      type: 'leaf'
    });
  }

  return points;
}

const TREE_POINTS = generateTreePoints();

export default function GlobeCanvas({ size = 480 }) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const W = size;
    const H = size;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2 + 20;
    const scale = W / 3.2;

    let rotY = 0;
    let rotX = 0.08; // slight tilt
    let autoRotate = true;
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let velX = 0;

    const project = (x, y, z) => {
      // Rotate around Y axis
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      return {
        sx: cx + x1 * scale,
        sy: cy - y1 * scale,
        depth: z2
      };
    };

    setLoaded(true);

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Sort by depth for painter's algorithm
      const projected = TREE_POINTS.map(p => ({
        ...project(p.x, p.y, p.z),
        type: p.type
      })).sort((a, b) => a.depth - b.depth);

      projected.forEach(({ sx, sy, depth, type }) => {
        if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) return;

        // Depth-based brightness
        const d = Math.max(0, Math.min(1, (depth + 2) / 4));
        const bright = 0.25 + d * 0.75;

        let r, g, b, radius;
        if (type === 'trunk') {
          r = Math.round(140 * bright);
          g = Math.round(95 * bright);
          b = Math.round(55 * bright);
          radius = 1.0;
        } else {
          // Leaves: mix dark/bright green based on depth
          r = Math.round(40 * bright);
          g = Math.round(160 + 40 * d);
          b = Math.round(50 * bright);
          radius = 1.2;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${(0.5 + d * 0.5).toFixed(2)})`;
        ctx.fill();
      });

      // Glow outline under tree
      const grad = ctx.createRadialGradient(cx, cy + 60, 0, cx, cy + 60, scale * 0.6);
      grad.addColorStop(0, 'rgba(126,200,122,0.12)');
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.ellipse(cx, cy + 65, scale * 0.55, scale * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      if (autoRotate) rotY += 0.008;
      animId = requestAnimationFrame(render);
    };

    render();

    // Drag to rotate
    const onDown = (e) => {
      isDragging = true;
      autoRotate = false;
      lastX = e.clientX ?? e.touches?.[0]?.clientX;
      lastY = e.clientY ?? e.touches?.[0]?.clientY;
      velX = 0;
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      velX = (x - lastX) * 0.01;
      rotY += velX;
      rotX = Math.max(-0.4, Math.min(0.5, rotX + (y - lastY) * 0.005));
      lastX = x; lastY = y;
    };
    const onUp = () => {
      isDragging = false;
      setTimeout(() => { autoRotate = true; }, 1500);
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('touchstart', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };
  }, [size]);

  return (
    <div className="globe-wrap">
      {!loaded && (
        <div className="globe-loader">
          <div className="globe-spinner" />
        </div>
      )}
      <canvas ref={canvasRef} className={`globe-canvas ${loaded ? 'globe-visible' : ''}`} />
      <p className="globe-hint">Arrastra para rotar</p>
    </div>
  );
}
