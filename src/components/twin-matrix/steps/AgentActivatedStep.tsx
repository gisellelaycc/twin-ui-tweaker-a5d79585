import { useState, useEffect, useRef, useCallback } from 'react';
import lobsterIcon from '@/assets/lobster-icon.png';

interface Props {
  agentName: string;
  onDashboard: () => void;
  onCreateAnother: () => void;
}

/* ── Pixel lobster silhouette (16×16 grid) for particle target ── */
const LOBSTER_PIXELS = [
  [6,1],[7,1],[9,1],[10,1],
  [5,2],[6,2],[8,2],[9,2],[10,2],[11,2],
  [4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],
  [3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],
  [4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],
  [5,6],[6,6],[7,6],[8,6],[9,6],[10,6],
  [4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],
  [3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],
  [2,9],[3,9],[5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[12,9],[13,9],
  [1,10],[2,10],[6,10],[7,10],[8,10],[9,10],[13,10],[14,10],
  [5,11],[6,11],[7,11],[8,11],[9,11],[10,11],
  [4,12],[5,12],[7,12],[8,12],[10,12],[11,12],
  [3,13],[4,13],[11,13],[12,13],
];

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  ox: number; oy: number;
  size: number;
  opacity: number;
}

const ParticleCanvas = ({ width, height }: { width: number; height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef<'gather' | 'hold' | 'scatter'>('gather');
  const timerRef = useRef(0);

  const initParticles = useCallback(() => {
    const scale = Math.min(width, height) * 0.018;
    const offsetX = width * 0.72;
    const offsetY = height * 0.15;
    
    const particles: Particle[] = LOBSTER_PIXELS.map(([px, py]) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      tx: offsetX + px * scale,
      ty: offsetY + py * scale,
      ox: Math.random() * width,
      oy: Math.random() * height,
      size: 1.8 + Math.random() * 1.5,
      opacity: 0.25 + Math.random() * 0.35,
    }));
    
    // Add extra ambient particles
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x, y, tx: x, ty: y, ox: x, oy: y,
        size: 0.5 + Math.random() * 0.8,
        opacity: 0.05 + Math.random() * 0.1,
      });
    }
    
    particlesRef.current = particles;
    phaseRef.current = 'gather';
    timerRef.current = 0;
  }, [width, height]);

  useEffect(() => {
    if (!width || !height) return;
    initParticles();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const GATHER_FRAMES = 180;
    const HOLD_FRAMES = 90;
    const SCATTER_FRAMES = 180;
    const TOTAL = GATHER_FRAMES + HOLD_FRAMES + SCATTER_FRAMES;

    const animate = () => {
      timerRef.current++;
      const t = timerRef.current % TOTAL;
      
      if (t < GATHER_FRAMES) phaseRef.current = 'gather';
      else if (t < GATHER_FRAMES + HOLD_FRAMES) phaseRef.current = 'hold';
      else phaseRef.current = 'scatter';

      ctx.clearRect(0, 0, width, height);
      
      const particles = particlesRef.current;
      for (const p of particles) {
        let progress: number;
        
        if (phaseRef.current === 'gather') {
          progress = Math.min(1, (t / GATHER_FRAMES));
          const ease = progress * progress * (3 - 2 * progress);
          p.x = p.ox + (p.tx - p.ox) * ease;
          p.y = p.oy + (p.ty - p.oy) * ease;
        } else if (phaseRef.current === 'hold') {
          p.x = p.tx + Math.sin(timerRef.current * 0.02 + p.tx) * 0.5;
          p.y = p.ty + Math.cos(timerRef.current * 0.02 + p.ty) * 0.5;
        } else {
          progress = (t - GATHER_FRAMES - HOLD_FRAMES) / SCATTER_FRAMES;
          const ease = progress * progress;
          const newOx = p.ox + (Math.random() - 0.5) * 40;
          const newOy = p.oy + (Math.random() - 0.5) * 40;
          p.x = p.tx + (newOx - p.tx) * ease;
          p.y = p.ty + (newOy - p.ty) * ease;
          
          if (t === TOTAL - 1) {
            p.ox = p.x;
            p.oy = p.y;
          }
        }
        
        const glowOpacity = phaseRef.current === 'hold' ? p.opacity * 1.5 : p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity})`;
        ctx.fill();
        
        if (phaseRef.current === 'hold') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity * 0.15})`;
          ctx.fill();
        }
      }
      
      raf = requestAnimationFrame(animate);
    };
    
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [width, height, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
};

export const AgentActivatedStep = ({ agentName, onDashboard, onCreateAnother }: Props) => {
  const [showRedFlash, setShowRedFlash] = useState(true);
  const [redFaded, setRedFaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Red lobster flash 0.6s → fade to cyan
  useEffect(() => {
    const fadeTimer = setTimeout(() => setRedFaded(true), 600);
    const hideTimer = setTimeout(() => setShowRedFlash(false), 1200);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  // Measure container for particle canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [telegramConnected, setTelegramConnected] = useState(false);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in px-4 overflow-hidden">
      {/* Red lobster flash moment */}
      {showRedFlash && (
        <div
          className="mb-6 transition-all duration-500 relative z-10"
          style={{
            opacity: redFaded ? 0 : 1,
            transform: redFaded ? 'scale(1.3)' : 'scale(1)',
          }}
        >
          <img src={lobsterIcon} alt="" className="w-16 h-16" style={{
            filter: 'drop-shadow(0 0 16px rgba(255, 60, 60, 0.7))',
          }} />
        </div>
      )}

      {/* Permanent red lobster icon */}
      {!showRedFlash && (
        <div className="mb-6 relative z-10 animate-fade-in">
          <img src={lobsterIcon} alt="" className="w-16 h-16" style={{
            filter: 'drop-shadow(0 0 12px rgba(242, 68, 85, 0.5))',
          }} />
        </div>
      )}

      <h2 className="text-3xl font-bold mb-8 relative z-10">Agent Activated</h2>

      {/* Agent Info Card */}
      <div className="glass-card glass-card-agent max-w-sm w-full space-y-4 mb-8 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Agent</span>
          <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <img src={lobsterIcon} alt="" className="w-4 h-4" style={{
              filter: 'drop-shadow(0 0 4px rgba(242, 68, 85, 0.4))',
            }} />
            {agentName || 'Lobster-01'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-xs font-medium" style={{ color: '#F24455' }}>● Active</span>
        </div>

        {/* Telegram connection */}
        <div className="pt-3 border-t border-foreground/10">
          {!telegramConnected ? (
            <button
              onClick={() => setTelegramConnected(true)}
              className="btn-twin btn-twin-ghost w-full py-2 text-xs"
            >
              🔗 Connect Telegram
            </button>
          ) : (
            <p className="text-xs text-center" style={{ color: '#F24455' }}>✓ Telegram Connected</p>
          )}
          <p className="text-[9px] text-muted-foreground/50 mt-1 text-center">Required for agent notifications</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full max-w-sm space-y-3 relative z-10">
        <button onClick={onDashboard} className="btn-twin btn-twin-primary btn-glow-red w-full py-3">
          Return to Dashboard
        </button>
        <button onClick={onCreateAnother} className="btn-twin btn-twin-ghost w-full py-2.5 text-sm">
          Create Another Agent
        </button>
      </div>
    </div>
  );
};
