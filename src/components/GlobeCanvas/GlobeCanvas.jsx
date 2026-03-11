import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './GlobeCanvas.css';

export default function GlobeCanvas({ size = 480 }) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = size;
    const H = size;
    const radius = size / 2.2;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const projection = d3.geoOrthographic()
      .scale(radius)
      .translate([W / 2, H / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(ctx);

    const pointInPolygon = (point, polygon) => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    const pointInFeature = (point, feature) => {
      const geo = feature.geometry;
      if (geo.type === 'Polygon') {
        if (!pointInPolygon(point, geo.coordinates[0])) return false;
        for (let i = 1; i < geo.coordinates.length; i++) {
          if (pointInPolygon(point, geo.coordinates[i])) return false;
        }
        return true;
      } else if (geo.type === 'MultiPolygon') {
        for (const poly of geo.coordinates) {
          if (pointInPolygon(point, poly[0])) {
            let inHole = false;
            for (let i = 1; i < poly.length; i++) {
              if (pointInPolygon(point, poly[i])) { inHole = true; break; }
            }
            if (!inHole) return true;
          }
        }
        return false;
      }
      return false;
    };

    const generateDots = (feature, spacing = 16) => {
      const dots = [];
      const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);
      const step = spacing * 0.08;
      for (let lng = minLng; lng <= maxLng; lng += step) {
        for (let lat = minLat; lat <= maxLat; lat += step) {
          if (pointInFeature([lng, lat], feature)) dots.push([lng, lat]);
        }
      }
      return dots;
    };

    const allDots = [];
    let landFeatures = null;
    const rotation = [0, -20];

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Globe base
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#071a06';
      ctx.fill();

      // Outer glow
      const glow = ctx.createRadialGradient(W/2, H/2, radius * 0.5, W/2, H/2, radius * 1.15);
      glow.addColorStop(0, 'transparent');
      glow.addColorStop(1, 'rgba(126,200,122,0.15)');
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, radius * 1.15, 0, 2 * Math.PI);
      ctx.fillStyle = glow;
      ctx.fill();

      // Globe border
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(126,200,122,0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (!landFeatures) return;

      // Graticule lines
      const graticule = d3.geoGraticule()();
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(126,200,122,0.1)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Land outlines
      ctx.beginPath();
      landFeatures.features.forEach(f => path(f));
      ctx.strokeStyle = 'rgba(126,200,122,0.45)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Dots with depth-based brightness
      allDots.forEach(([lng, lat]) => {
        const projected = projection([lng, lat]);
        if (!projected) return;
        const [px, py] = projected;
        if (px < 0 || px > W || py < 0 || py > H) return;

        const dx = (px - W/2) / radius;
        const dy = (py - H/2) / radius;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const alpha = 0.25 + (1 - dist) * 0.75;

        ctx.beginPath();
        ctx.arc(px, py, 1.1, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(126,200,122,${alpha.toFixed(2)})`;
        ctx.fill();
      });
    };

    const load = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json');
        landFeatures = await res.json();
        landFeatures.features.forEach(f => {
          generateDots(f, 16).forEach(d => allDots.push(d));
        });
        setLoaded(true);
        render();
      } catch (e) {
        console.error('Globe load error', e);
      }
    };

    let autoRotate = true;
    const timer = d3.timer(() => {
      if (autoRotate) {
        rotation[0] += 0.25;
        projection.rotate(rotation);
        render();
      }
    });

    const onMouseDown = (e) => {
      autoRotate = false;
      const sx = e.clientX, sy = e.clientY;
      const sr = [...rotation];
      const onMove = (me) => {
        rotation[0] = sr[0] + (me.clientX - sx) * 0.4;
        rotation[1] = Math.max(-90, Math.min(90, sr[1] - (me.clientY - sy) * 0.4));
        projection.rotate(rotation);
        render();
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        setTimeout(() => { autoRotate = true; }, 100);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    load();

    return () => {
      timer.stop();
      canvas.removeEventListener('mousedown', onMouseDown);
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
