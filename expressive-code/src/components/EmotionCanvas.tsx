'use client';

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  trail: number;
};

const PARTICLE_COUNT = 120;
const BASE_SPEED = 0.18;

const createParticle = (width: number, height: number, origin?: { x: number; y: number }): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = (Math.random() + 0.4) * BASE_SPEED;
  const spawnRadius = origin ? Math.random() * 36 : Math.random() * Math.max(width, height) * 0.12;
  const x = origin ? origin.x + Math.cos(angle) * spawnRadius : Math.random() * width;
  const y = origin ? origin.y + Math.sin(angle) * spawnRadius : Math.random() * height;
  const hue = 206 + Math.random() * 40;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: 320 + Math.random() * 280,
    hue,
    trail: Math.random() * 0.7 + 0.3,
  };
};

const EmotionCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    const particles: Particle[] = [];
    const pointer = { x: 0, y: 0, active: false };
    let lastBirth = 0;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      particles.push(createParticle(width, height));
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerMove);
    window.addEventListener("pointerup", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    const step = (timestamp: number) => {
      context.fillStyle = "rgba(8, 9, 20, 0.22)";
      context.fillRect(0, 0, width, height);

      if (pointer.active && timestamp - lastBirth > 28) {
        particles.push(createParticle(width, height, pointer));
        if (particles.length > 240) {
          particles.splice(0, particles.length - 240);
        }
        lastBirth = timestamp;
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];

        particle.life += 1;
        if (particle.life >= particle.maxLife) {
          particles.splice(index, 1);
          particles.push(createParticle(width, height));
          continue;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -80 || particle.x > width + 80 || particle.y < -80 || particle.y > height + 80) {
          particles.splice(index, 1);
          particles.push(createParticle(width, height));
          continue;
        }

        const normalisedLife = particle.life / particle.maxLife;
        const alpha = Math.sin(normalisedLife * Math.PI);
        const radius = 1.4 + Math.sin(normalisedLife * Math.PI) * 1.8;

        context.beginPath();
        context.fillStyle = `hsla(${particle.hue}, 88%, 68%, ${alpha * 0.6})`;
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        const particleA = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const particleB = particles[j];
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 140) continue;

          const strength = 1 - distance / 140;
          const gradient = context.createLinearGradient(particleA.x, particleA.y, particleB.x, particleB.y);
          gradient.addColorStop(0, `hsla(${particleA.hue}, 88%, 74%, ${strength * 0.25})`);
          gradient.addColorStop(1, `hsla(${particleB.hue}, 88%, 74%, ${strength * 0.25})`);

          context.beginPath();
          context.strokeStyle = gradient;
          context.lineWidth = Math.max(0.35, strength * 1.4);
          context.moveTo(particleA.x, particleA.y);
          context.lineTo(particleB.x, particleB.y);
          context.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="emotion-canvas" />;
};

export default EmotionCanvas;
