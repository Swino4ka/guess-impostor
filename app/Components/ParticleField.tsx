'use client'
import React, { useMemo, useRef, useEffect } from 'react';

type Particle = {
  id: string;
  size: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
  opacity: number;
  blur: number;
  floatX: number;
  kind?: 'dot' | 'snow';
}

function rand(min:number, max:number){ return Math.random()*(max-min)+min; }

export default function ParticleField({count = 28, persistKey = 'particles_v1'}:{
  count?: number;
  persistKey?: string; // optional: key to persist seed/particles in sessionStorage
}) {
  // 1) try to load from sessionStorage so particles survive page navigation
  const stored = typeof window !== 'undefined' ? sessionStorage.getItem(persistKey) : null;
  // useRef to hold persistent particles across renders
  const ref = useRef<Particle[] | null>(null);

  if (!ref.current) {
    if (stored) {
      try {
        ref.current = JSON.parse(stored) as Particle[];
      } catch {
        ref.current = null;
      }
    }
  }

  if (!ref.current) {
    // generate once
    const arr: Particle[] = Array.from({ length: count }).map((_, i) => {
      const kind = Math.random() > 0.86 ? 'snow' : 'dot';
      return {
        id: `p-${i}-${Math.round(Math.random()*1e6)}`,
        size: kind === 'snow' ? Math.round(rand(8, 18)) : Math.round(rand(6, 28)),
        left: `${Math.round(rand(2, 98))}%`,
        top: `${Math.round(rand(2, 90))}%`,
        delay: Number(rand(0, 6).toFixed(2)),
        duration: Number(rand(6, 20).toFixed(2)),
        opacity: Number(rand(0.18, 0.9).toFixed(2)),
        blur: Number(rand(0, 6).toFixed(1)),
        floatX: Number(rand(-10, 10).toFixed(2)),
        kind,
      };
    });
    ref.current = arr;
    // persist to sessionStorage so same positions used across route changes in this session
    try {
      sessionStorage.setItem(persistKey, JSON.stringify(arr));
    } catch { /* ignore */ }
  }

  const particles = ref.current;

  // Minor: prevent animation restart on reflow — add will-change via effect (purely optional)
  useEffect(() => {
    // nothing needed here for now, but hook kept in case you want to toggle animations
    return () => {};
  }, []);

  // Render
  return (
    <div className="particle-layer" aria-hidden>
      {particles.map(p => {
        if (p.kind === 'snow') {
          // snow uses translateY animation (driftDown), keeps left/top static
          const style = {
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            transform: `translate3d(0,0,0)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            borderRadius: 4,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))',
            filter: `blur(${p.blur}px)`,
            willChange: 'transform, opacity',
          } as React.CSSProperties;

          //return <div key={p.id} className="snow" style={style} />;
        }

        // For dots, we need to pass CSS var --float-x; cast style to accept custom properties
        const style = {
          left: p.left,
          top: p.top,
          width: `${p.size}px`,
          height: `${p.size}px`,
          background: 'var(--particle-color, rgba(0,0,0,0.06))',
          opacity: p.opacity,
          filter: `blur(${p.blur}px)`,
          transform: `translate3d(0,0,0)`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          willChange: 'transform, opacity',
          // custom css variable for use in keyframes if needed
          ['--float-x' as any]: `${p.floatX}px`,
        } as React.CSSProperties & Record<string, string>;

        //disabled this before better times
        return ""; //<div key={p.id} className="particle" style={style} />;
      })}
    </div>
  );
}
