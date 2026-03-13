import { useEffect, useRef, useState } from 'react';
import './GlobeCanvas.css';
import treeImg from '../../assets/tree.png';

export default function GlobeCanvas({ size = 480 }) {
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const W = size;
    const H = size;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Load tree image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = treeImg;

    img.onload = () => {
      // Create offscreen mask canvas
      const maskC = document.createElement('canvas');
      maskC.width = W;
      maskC.height = H;
      const mCtx = maskC.getContext('2d');

      // Draw tree image scaled to fit canvas
      const scale = Math.min(W / img.width, H / img.height) * 0.95;
      const iw = img.width * scale;
      const ih = img.height * scale;
      const ix = (W - iw) / 2;
      const iy = (H - ih) / 2;
      mCtx.drawImage(img, ix, iy, iw, ih);

      const imageData = mCtx.getImageData(0, 0, W, H);
      const pixels = imageData.data;

      // Sample dots from non-transparent, non-white pixels
      const dots = [];
      const spacing = 7;
      for (let y = 0; y < H; y += spacing) {
        for (let x = 0; x < W; x += spacing) {
          const i = (y * W + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a < 80) continue; // transparent
          const brightness = (r + g + b) / 3;
          if (brightness > 210) continue; // near-white background

          // Classify dot color based on pixel
          // Trunk = brownish, leaves = greenish
          const isLeaf = g > r && g > b;
          const isTrunk = r > 80 && g > 50 && b < 80 && !isLeaf;

          dots.push({ x, y, isLeaf, isTrunk, brightness });
        }
      }

      setLoaded(true);

      // Animate with shimmer wave
      let frame = 0;
      let animId;

      const render = () => {
        ctx.clearRect(0, 0, W, H);
        frame++;

        dots.forEach(({ x, y, isLeaf, isTrunk, brightness }) => {
          // Wave shimmer effect
          const wave = Math.sin((x + y) * 0.03 + frame * 0.04) * 0.5 + 0.5;
          const alpha = 0.3 + wave * 0.7;

          let color;
          if (isTrunk) {
            color = `rgba(160, 120, 80, ${alpha * 0.8})`;
          } else if (isLeaf) {
            // Brighter leaves get lighter green dot
            const lightness = brightness / 255;
            const g = Math.round(150 + lightness * 80);
            color = `rgba(80, ${g}, 80, ${alpha})`;
          } else {
            color = `rgba(126, 200, 122, ${alpha * 0.6})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });

        animId = requestAnimationFrame(render);
      };

      render();

      return () => cancelAnimationFrame(animId);
    };

    return () => {};
  }, [size]);

  return (
    <div className="globe-wrap">
      {!loaded && (
        <div className="globe-loader">
          <div className="globe-spinner" />
        </div>
      )}
      <canvas ref={canvasRef} className={`globe-canvas ${loaded ? 'globe-visible' : ''}`} />
      <p className="globe-hint">Manjares del Campo</p>
    </div>
  );
}
