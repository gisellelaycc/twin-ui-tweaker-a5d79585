import { useEffect, useState, useMemo, useRef } from 'react';
import type { WizardState } from '@/types/twin-matrix';
import { encodeIdentityVector } from '@/lib/twin-encoder';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

interface Props {
  wizardState: WizardState;
  onComplete: (signature: number[]) => void;
}

export const GenerateStep = ({ wizardState, onComplete }: Props) => {
  const { t } = useI18n();

  const PHASES = useMemo(() => [
    { label: t('generate.signalNorm'), desc: t('generate.signalNormDesc') },
    { label: t('generate.dimProj'), desc: t('generate.dimProjDesc') },
    { label: t('generate.weightAgg'), desc: t('generate.weightAggDesc') },
    { label: t('generate.matrixEnc'), desc: t('generate.matrixEncDesc') },
    { label: t('generate.vectorFin'), desc: t('generate.vectorFinDesc') },
    { label: t('generate.soulSig'), desc: t('generate.vectorFinDesc') },
  ], [t]);

  const [activePhase, setActivePhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gridValues, setGridValues] = useState<number[]>(new Array(256).fill(0));
  const [finalSignature, setFinalSignature] = useState<number[] | null>(null);
  const prevGridRef = useRef<number[]>(new Array(256).fill(0));
  const [changedCells, setChangedCells] = useState<Set<number>>(new Set());
  const [displayPhase, setDisplayPhase] = useState(0);
  const [phaseVisible, setPhaseVisible] = useState(true);

  useEffect(() => {
    const totalDuration = 6000;
    const phaseInterval = totalDuration / PHASES.length;
    const phaseTimer = setInterval(() => {
      setActivePhase(p => { const next = p + 1; if (next >= PHASES.length) clearInterval(phaseTimer); return Math.min(next, PHASES.length - 1); });
    }, phaseInterval);
    const progressTimer = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 1.2, 100);
        if (next >= 100) {
          clearInterval(progressTimer);
          const result = encodeIdentityVector(wizardState);
          const sig = result.signature ?? Array.from({ length: 256 }, () => 0);
          setFinalSignature(sig); setGridValues(sig);
          setChangedCells(new Set(Array.from({ length: 256 }, (_, i) => i)));
          setTimeout(() => onComplete(sig), 3000);
        }
        return next;
      });
    }, 60);
    return () => { clearInterval(phaseTimer); clearInterval(progressTimer); };
  }, [onComplete]);

  useEffect(() => {
    if (activePhase === displayPhase) return;
    setPhaseVisible(false);
    const tt = setTimeout(() => { setDisplayPhase(activePhase); setPhaseVisible(true); }, 400);
    return () => clearTimeout(tt);
  }, [activePhase, displayPhase]);

  useEffect(() => {
    if (finalSignature) return;
    const interval = setInterval(() => {
      const newGrid = new Array(256).fill(0);
      const filled = Math.floor((progress / 100) * 256);
      for (let i = 0; i < filled; i++) newGrid[i] = Math.floor(Math.random() * 256);
      const changed = new Set<number>();
      for (let i = 0; i < 256; i++) { if (newGrid[i] !== prevGridRef.current[i] && newGrid[i] > 0) changed.add(i); }
      prevGridRef.current = newGrid; setChangedCells(changed); setGridValues(newGrid);
    }, 200);
    return () => clearInterval(interval);
  }, [activePhase, progress, finalSignature]);

  useEffect(() => {
    if (changedCells.size === 0) return;
    const tt = setTimeout(() => setChangedCells(new Set()), 400);
    return () => clearTimeout(tt);
  }, [changedCells]);

  const isDone = progress >= 100;
  const rowLabels = useMemo(() => Array.from({ length: 16 }, (_, i) => (i * 16).toString(16).toUpperCase().padStart(4, '0')), []);

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center text-center animate-fade-in px-4 min-h-[70vh] justify-center">
          <div className="mb-5 h-12 flex flex-col items-center justify-center" style={{
            opacity: phaseVisible ? 1 : 0, transform: phaseVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}>
            <h2 className="text-lg font-semibold tracking-tight">{PHASES[displayPhase]?.label}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{PHASES[displayPhase]?.desc}</p>
          </div>

          <div className="relative mb-6 p-4">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(10,255,255,0.10) 0%, rgba(10,255,255,0.03) 40%, transparent 70%)' }} />
            <div className="absolute inset-0 pointer-events-none animate-[field-breathe_5s_ease-in-out_infinite]" style={{ background: 'radial-gradient(ellipse at center, rgba(10,255,255,0.06) 0%, transparent 60%)' }} />
            <div className="flex flex-col gap-[2px] relative z-10" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" }}>
              {Array.from({ length: 16 }, (_, row) => (
                <div key={row} className="flex items-center gap-[2px]">
                  <span className="text-[8px] text-muted-foreground/40 font-mono w-7 text-right shrink-0">{rowLabels[row]}</span>
                  {Array.from({ length: 16 }, (_, col) => {
                    const idx = row * 16 + col;
                    const val = gridValues[idx];
                    const intensity = val / 255;
                    const showNumber = activePhase >= 3 && val > 0;
                    const justChanged = changedCells.has(idx);
                    const borderColor = val > 0
                      ? `rgba(10, 255, 255, ${0.15 + 0.4 * intensity})`
                      : 'hsl(var(--foreground) / 0.06)';
                    return (
                      <div key={col} className="rounded-full flex items-center justify-center relative" style={{
                        width: 'clamp(1.1rem, 2.5vw, 1.6rem)', height: 'clamp(1.1rem, 2.5vw, 1.6rem)', aspectRatio: '1',
                        border: `1px solid ${borderColor}`,
                        background: val > 0 ? `rgba(10, 255, 255, ${intensity * 0.08})` : 'transparent',
                        boxShadow: justChanged ? `0 0 10px rgba(10, 255, 255, 0.6), 0 0 20px rgba(10, 255, 255, 0.3)` : val > 150 ? `0 0 6px rgba(10, 255, 255, ${intensity * 0.3})` : 'none',
                        transform: justChanged ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.35s ease-out',
                      }}>
                        {showNumber && (
                          <span className="text-[6px] font-mono" style={{ color: `rgba(10, 255, 255, ${0.3 + intensity * 0.7})`, opacity: justChanged ? 1 : 0.8, transition: 'opacity 0.3s' }}>
                            {val.toString(16).toUpperCase().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="w-full h-6 mt-1 pointer-events-none relative z-10" style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))' }} />
          </div>

          <div className="flex gap-2 mb-4">
            {PHASES.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i < activePhase || isDone ? 'bg-[rgba(10,255,255,0.6)]' : i === activePhase ? 'bg-foreground/60 animate-glow-pulse' : 'bg-foreground/10'}`} />
            ))}
          </div>

          <div className="w-64 h-1.5 bg-transparent rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200" style={{
              width: `${progress}%`, background: 'linear-gradient(90deg, rgba(10,255,255,0.5), rgba(10,255,255,0.9))',
              boxShadow: '0 0 8px rgba(10,255,255,0.5), 0 0 20px rgba(10,255,255,0.2)',
            }} />
          </div>
          <p className="text-sm text-muted-foreground/50 mt-2">{Math.round(progress)}%</p>
        </div>
      </StepContent>
    </StepLayout>
  );
};
