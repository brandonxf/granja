import { useEffect, useRef, useState } from 'react';
import './GlobeCanvas.css';

function generateTreePoints() {
  const points = [];

  const leafColor = () => ({ type: 'leaf' });
  const trunkColor = () => ({ type: 'trunk' });
  const branchColor = () => ({ type: 'branch' });

  // Helper: fill sphere cluster
  const addCluster = (cx, cy, cz, rx, ry, rz, count) => {
    let added = 0;
    while (added < count) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 0.75 + Math.random() * 0.25;
      const x = cx + rx * r * Math.sin(phi) * Math.cos(theta);
      const y = cy + ry * r * Math.sin(phi) * Math.sin(theta);
      const z = cz + rz * r * Math.cos(phi);
      points.push({ x, y, z, ...leafColor() });
      added++;
    }
  };

  // Helper: branch line from point A to B
  const addBranch = (x1,y1,z1, x2,y2,z2, count, thick=1) => {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const jitter = 0.015 * thick;
      points.push({
        x: x1 + (x2-x1)*t + (Math.random()-.5)*jitter,
        y: y1 + (y2-y1)*t + (Math.random()-.5)*jitter,
        z: z1 + (z2-z1)*t + (Math.random()-.5)*jitter,
        ...branchColor()
      });
    }
  };

  // ── TRUNK ─────────────────────────────────────────────
  for (let i = 0; i < 1800; i++) {
    const t = i / 1800;
    const y = -1.6 + t * 1.4;
    const radius = 0.13 - t * 0.05 + Math.random() * 0.015;
    const theta = Math.random() * Math.PI * 2;
    // Add bark texture ridges
    const ridge = Math.sin(theta * 6) * 0.012;
    points.push({
      x: Math.cos(theta) * (radius + ridge),
      y,
      z: Math.sin(theta) * (radius + ridge),
      ...trunkColor()
    });
  }

  // Trunk base flare / roots
  for (let i = 0; i < 600; i++) {
    const theta = Math.random() * Math.PI * 2;
    const t = Math.random();
    const y = -1.6 + t * 0.3;
    const r = 0.13 + t * 0.12 + Math.random() * 0.02;
    points.push({ x: Math.cos(theta)*r, y, z: Math.sin(theta)*r, ...trunkColor() });
  }

  // ── MAIN BRANCHES ─────────────────────────────────────
  // Central vertical branch
  addBranch(0,-0.2,0,  0.05,0.35,0.05, 120, 2);

  // Left main branch
  addBranch(0,0.0,0,  -0.7,0.25,-0.1, 160, 2);
  addBranch(-0.7,0.25,-0.1, -1.0,0.5,-0.2, 120, 1.5);
  addBranch(-0.7,0.25,-0.1, -0.85,0.6,0.15, 100, 1.5);

  // Right main branch
  addBranch(0,0.05,0,  0.75,0.3,0.1, 160, 2);
  addBranch(0.75,0.3,0.1, 1.05,0.55,0.15, 120, 1.5);
  addBranch(0.75,0.3,0.1, 0.9,0.65,-0.1, 100, 1.5);

  // Upper center branch
  addBranch(0.05,0.35,0.05, -0.1,0.75,0.1, 110, 1.5);
  addBranch(0.05,0.35,0.05,  0.25,0.8,-0.1, 100, 1.5);

  // Back branches (depth)
  addBranch(0,0.1,0,  0.1,0.4,-0.5, 100, 1.5);
  addBranch(0,0.1,0, -0.2,0.35,-0.45, 90, 1.5);
  addBranch(0,0.1,0,  0.15,0.3,0.55, 90, 1.5);

  // Smaller sub-branches
  addBranch(-1.0,0.5,-0.2, -1.15,0.75,-0.3, 70, 1);
  addBranch(-0.85,0.6,0.15, -0.9,0.85,0.25, 60, 1);
  addBranch(1.05,0.55,0.15, 1.2,0.8,0.2, 70, 1);
  addBranch(0.9,0.65,-0.1, 1.0,0.9,-0.15, 60, 1);
  addBranch(-0.1,0.75,0.1, -0.2,1.05,0.15, 60, 1);
  addBranch(0.25,0.8,-0.1, 0.3,1.1,-0.05, 60, 1);

  // ── CANOPY CLUSTERS ───────────────────────────────────
  // Main large dome
  addCluster( 0.0,  0.55, 0.0,  1.05, 0.9, 0.95, 3200);
  // Left blob
  addCluster(-0.85, 0.45,-0.05, 0.75, 0.7, 0.7,  2000);
  // Right blob
  addCluster( 0.92, 0.5,  0.08, 0.72, 0.68,0.68, 2000);
  // Top center tuft
  addCluster( 0.0,  1.05, 0.05, 0.5,  0.45,0.48, 1200);
  // Back depth clusters
  addCluster( 0.1,  0.5, -0.6,  0.65, 0.6, 0.55, 1400);
  addCluster(-0.3,  0.5, -0.55, 0.55, 0.55,0.5,  1200);
  // Front cluster
  addCluster( 0.05, 0.45, 0.65, 0.6,  0.55,0.5,  1200);
  // Far left extension
  addCluster(-1.15, 0.55,-0.1,  0.5,  0.5, 0.45, 900);
  // Far right extension
  addCluster( 1.1,  0.6,  0.1,  0.5,  0.5, 0.45, 900);
  // Upper left
  addCluster(-0.55, 0.9,  0.1,  0.42, 0.4, 0.38, 700);
  // Upper right
  addCluster( 0.55, 0.95,-0.05, 0.42, 0.4, 0.38, 700);

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
    const W = size, H = size;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2 + 30;
    const sc = W / 3.6;

    let rotY = 0.3;
    let rotX = 0.1;
    let autoRotate = true;
    let isDragging = false;
    let lastX = 0, lastY = 0;

    const project = (x, y, z) => {
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x1 =  x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y1 =  y * cosX - z1 * sinX;
      const z2 =  y * sinX + z1 * cosX;
      return { sx: cx + x1 * sc, sy: cy - y1 * sc, depth: z2 };
    };

    setLoaded(true);

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Sort back-to-front
      const projected = TREE_POINTS
        .map(p => ({ ...project(p.x, p.y, p.z), type: p.type }))
        .sort((a, b) => a.depth - b.depth);

      projected.forEach(({ sx, sy, depth, type }) => {
        if (sx < -20 || sx > W+20 || sy < -20 || sy > H+20) return;

        // Depth 0..1 (front)
        const d = Math.max(0, Math.min(1, (depth + 2.5) / 5));

        let color, radius;
        if (type === 'trunk') {
          // Use globe palette browns — muted warm
          const bright = 0.3 + d * 0.7;
          color = `rgba(${Math.round(160*bright)},${Math.round(110*bright)},${Math.round(70*bright)},${0.55+d*0.45})`;
          radius = 1.1;
        } else if (type === 'branch') {
          const bright = 0.3 + d * 0.7;
          color = `rgba(${Math.round(140*bright)},${Math.round(100*bright)},${Math.round(65*bright)},${0.5+d*0.5})`;
          radius = 0.9;
        } else {
          // Leaves — strictly globe green palette: rgba(126,200,122)
          const alpha = 0.25 + d * 0.75;
          // Vary between dark and light green based on depth, matching globe
          const gVal = Math.round(150 + d * 50);  // 150–200
          const rVal = Math.round(40 + d * 86);   // 40–126
          const bVal = Math.round(40 + d * 82);   // 40–122
          color = `rgba(${rVal},${gVal},${bVal},${alpha.toFixed(2)})`;
          radius = 1.3;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Ground shadow glow — same as globe outer glow
      const glow = ctx.createRadialGradient(cx, cy+75, 0, cx, cy+75, sc*0.65);
      glow.addColorStop(0, 'rgba(126,200,122,0.12)');
      glow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.ellipse(cx, cy+78, sc*0.6, sc*0.07, 0, 0, Math.PI*2);
      ctx.fillStyle = glow;
      ctx.fill();

      if (autoRotate) rotY += 0.006;
      animId = requestAnimationFrame(render);
    };

    render();

    const getXY = e => e.touches
      ? [e.touches[0].clientX, e.touches[0].clientY]
      : [e.clientX, e.clientY];

    const onDown = e => { isDragging=true; autoRotate=false; [lastX,lastY]=getXY(e); };
    const onMove = e => {
      if (!isDragging) return;
      const [x,y] = getXY(e);
      rotY += (x - lastX) * 0.01;
      rotX = Math.max(-0.4, Math.min(0.5, rotX + (y - lastY) * 0.005));
      lastX=x; lastY=y;
    };
    const onUp = () => { isDragging=false; setTimeout(()=>{ autoRotate=true; },1500); };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchstart', onDown, { passive:true });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive:true });
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
      {!loaded && <div className="globe-loader"><div className="globe-spinner" /></div>}
      <canvas ref={canvasRef} className={`globe-canvas ${loaded ? 'globe-visible' : ''}`} />
      <p className="globe-hint">Arrastra para rotar</p>
    </div>
  );
}
