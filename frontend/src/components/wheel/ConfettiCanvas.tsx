import { useEffect, useRef } from "react";

interface ConfettiCanvasProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  color: string;
}

const colors = ["#47d7ff", "#ff725e", "#c5ff55", "#ffcc4d", "#ffffff"];

export function ConfettiCanvas({ active }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: -20 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 3.5,
      vy: 2 + Math.random() * 4,
      size: 5 + Math.random() * 7,
      rotation: Math.random() * Math.PI,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    let frame = 0;
    let start: number | null = null;

    const render = (timestamp: number) => {
      if (start == null) {
        start = timestamp;
      }

      const elapsed = timestamp - start;
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += 0.08;
        particle.vy += 0.015;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.65);
        context.restore();
      }

      if (elapsed < 3000) {
        frame = window.requestAnimationFrame(render);
      } else {
        context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      }
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
