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

    const makeParticle = (wave: number): Particle => {
      const fromSide = Math.random() < 0.2;
      const fromLeft = Math.random() < 0.5;
      return {
        x: fromSide
          ? (fromLeft ? -10 : canvas.clientWidth + 10)
          : Math.random() * canvas.clientWidth,
        y: fromSide
          ? Math.random() * canvas.clientHeight * 0.5
          : -20 - Math.random() * 200 - wave * 60,
        vx: fromSide
          ? (fromLeft ? 3 + Math.random() * 5 : -(3 + Math.random() * 5))
          : (Math.random() - 0.5) * 6,
        vy: fromSide ? -(1 + Math.random() * 3) : 1.5 + Math.random() * 5,
        size: 5 + Math.random() * 9,
        rotation: Math.random() * Math.PI,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    const particles: Particle[] = Array.from({ length: 350 }, (_, i) => makeParticle(Math.floor(i / 120)));

    let frame = 0;
    let start: number | null = null;
    const duration = 6000;

    const render = (timestamp: number) => {
      if (start == null) {
        start = timestamp;
      }

      const elapsed = timestamp - start;
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += 0.07 + Math.random() * 0.04;
        particle.vy += 0.018;
        particle.vx *= 0.998;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
        context.restore();
      }

      if (elapsed < duration) {
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
