import React, { useEffect, useRef } from 'react';
import './DotGrid.css';

interface DotGridProps {
  baseColor?: string;
  activeColor?: string;
  dotSize?: number;
  gap?: number;
  proximity?: number;
  glow?: number;
  className?: string;
}

export const DotGrid: React.FC<DotGridProps> = ({
  baseColor = '#D8D0C4',
  activeColor = '#183153',
  dotSize = 2,
  gap = 18,
  proximity = 120,
  glow = 0.5,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let frameId = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const hexToRgb = (hex: string) => {
      const value = hex.replace('#', '');
      const normalized = value.length === 3
        ? value.split('').map(char => char + char).join('')
        : value;
      return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
      };
    };

    const base = hexToRgb(baseColor);
    const active = hexToRgb(activeColor);

    const targetMouse = { x: -1000, y: -1000 };
    const smoothMouse = { x: -1000, y: -1000 };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      smoothMouse.x += (targetMouse.x - smoothMouse.x) * 0.16;
      smoothMouse.y += (targetMouse.y - smoothMouse.y) * 0.16;

      for (let x = gap / 2; x < width; x += gap) {
        for (let y = gap / 2; y < height; y += gap) {
          const dx = x - smoothMouse.x;
          const dy = y - smoothMouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - distance / proximity);
          const eased = influence * influence * (3 - 2 * influence);
          const radius = dotSize + eased * dotSize * glow;
          const red = Math.round(base.r + (active.r - base.r) * eased);
          const green = Math.round(base.g + (active.g - base.g) * eased);
          const blue = Math.round(base.b + (active.b - base.b) * eased);

          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          context.fill();
        }
      }

      frameId = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = event.clientX - rect.left;
      targetMouse.y = event.clientY - rect.top;
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handlePointerLeave = () => {
      targetMouse.x = -1000;
      targetMouse.y = -1000;
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    draw();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [baseColor, activeColor, dotSize, gap, proximity, glow]);

  return (
    <div className={`dot-grid ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className="dot-grid__canvas" />
    </div>
  );
};
