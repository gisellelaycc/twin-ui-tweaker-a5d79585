import React, { useState, useEffect, useRef } from 'react';
import { Lock, Dumbbell, Music, Palette, BookOpen, UtensilsCrossed, Plane, TrendingUp, Gamepad2, GraduationCap, ArrowRight } from 'lucide-react';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

export interface IdentityModule {
  id: string;
  icon: string;
  label: string;
  description: string;
  active: boolean;
}

const SIGNAL_ICONS: Record<string, React.ReactNode> = {
  sport: <Dumbbell className="w-6 h-6" />,
  music: <Music className="w-6 h-6" />,
  art: <Palette className="w-6 h-6" />,
  reading: <BookOpen className="w-6 h-6" />,
  food: <UtensilsCrossed className="w-6 h-6" />,
  travel: <Plane className="w-6 h-6" />,
  finance: <TrendingUp className="w-6 h-6" />,
  gaming: <Gamepad2 className="w-6 h-6" />,
  learning: <GraduationCap className="w-6 h-6" />,
};

const SIGNALS: (IdentityModule & { soon?: boolean })[] = [
  { id: 'sport', icon: 'sport', label: 'Sport', description: 'Physical signal · competitive state', active: true },
  { id: 'music', icon: 'music', label: 'Music', description: 'Rhythm signal · listening state', active: true },
  { id: 'art', icon: 'art', label: 'Art', description: 'Aesthetic signal · creative state', active: true },
  { id: 'reading', icon: 'reading', label: 'Reading', description: 'Knowledge signal · absorption state', active: true },
  { id: 'food', icon: 'food', label: 'Food', description: 'Lifestyle signal · dietary state', active: true },
  { id: 'travel', icon: 'travel', label: 'Travel', description: 'Mobility signal · exploration state', active: true },
  { id: 'finance', icon: 'finance', label: 'Finance', description: 'Risk signal · asset state', active: true },
  { id: 'gaming', icon: 'gaming', label: 'Gaming', description: 'Strategic signal · competitive state', active: true },
  { id: 'learning', icon: 'learning', label: 'Learning', description: 'Growth signal · focus state', active: true },
];

const MINTED_MODULES = ['music', 'reading'];

interface Props {
  activeModules: string[];
  onUpdate: (modules: string[]) => void;
  onNavigateToCategory: (id: string) => void;
  onProceedToSoul: () => void;
}

export const CategoryStep = ({ activeModules, onUpdate, onNavigateToCategory, onProceedToSoul }: Props) => {
  const { t } = useI18n();
  const [selected, setSelected] = useState(SIGNALS[0].id);
  const [activated, setActivated] = useState<string[]>(activeModules);
  const [transitioning, setTransitioning] = useState(false);
  const [soonTooltip, setSoonTooltip] = useState<string | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>();

  const current = SIGNALS.find(s => s.id === selected)!;
  const isActivated = activated.includes(selected);
  const isMinted = MINTED_MODULES.includes(selected);
  const hasActive = activated.length > 0;

  useEffect(() => {
    const sanitized = activeModules;
    if (sanitized.length !== activated.length) {
      setActivated(sanitized);
    }
  }, [activeModules, activated.length]);

  const toggleActive = () => {
    if (current.soon) return;
    const next = isActivated
      ? activated.filter(m => m !== selected)
      : [...activated, selected];
    setActivated(next);
    onUpdate(next);
  };

  const showSoonTooltip = (id: string) => {
    setSoonTooltip(id);
    clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setSoonTooltip(null), 1800);
  };

  useEffect(() => () => clearTimeout(tooltipTimer.current), []);

  const getLabel = (id: string) => t(`signal.${id}`);
  const getDesc = (id: string) => t(`signal.${id}.desc`);

  const chipItems = [
    ...SIGNALS.map(s => ({ id: s.id, icon: s.id, soon: !!s.soon })),
    { id: '_more', icon: '_more', soon: false },
  ];

  return (
    <StepLayout>
      <StepContent>
        <div className="w-full flex flex-col gap-8">
          {/* Top: Title & description */}
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              Twin Matrix Configuration
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl">
              Configure signal layers step by step to shape a single, evolving Twin Matrix.
            </p>
          </div>

          {/* Bottom: Step 1 (left 70%) + Step 2 (right 30%) */}
          <div className="w-full flex flex-col lg:flex-row gap-6">
            {/* LEFT: Step 1 — Signal list */}
            <div className="lg:w-[65%] min-w-0 flex flex-col gap-2">
              <p className="text-base text-muted-foreground uppercase tracking-widest mb-3">
                Step 1 · Choose a signal layer
              </p>
              {chipItems.map(chip => {
                const isMore = chip.id === '_more';
                const isSoon = chip.soon;
                const isChipSelected = chip.id === selected;
                const isChipActivated = activated.includes(chip.id);
                const isChipMinted = MINTED_MODULES.includes(chip.id);

                return (
                  <div key={chip.id} className="relative">
                    <button
                      onClick={() => {
                        if (isMore) return;
                        if (isSoon) { showSoonTooltip(chip.id); return; }
                        setSelected(chip.id);
                      }}
                      onMouseEnter={() => { if (isSoon) showSoonTooltip(chip.id); }}
                      onMouseLeave={() => { if (isSoon) setSoonTooltip(null); }}
                      className="relative w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300"
                      style={{
                        background: isChipSelected ? 'hsl(var(--foreground) / 0.08)' : 'var(--glass-bg)',
                        border: `1px solid ${isChipSelected ? 'hsl(var(--foreground) / 0.15)' : 'var(--glass-border)'}`,
                        opacity: isMore ? 0.4 : isSoon ? 0.4 : isChipSelected ? 1 : 0.7,
                        filter: isSoon ? 'blur(0.5px)' : 'none',
                        cursor: isSoon || isMore ? 'default' : 'pointer',
                        boxShadow: isChipActivated && !isSoon
                          ? isChipMinted
                            ? '0 4px 12px -2px rgba(74, 222, 128, 0.15), inset 0 -1px 0 rgba(74, 222, 128, 0.2)'
                            : '0 4px 12px -2px rgba(54, 230, 255, 0.15), inset 0 -1px 0 rgba(54, 230, 255, 0.2)'
                          : 'none',
                      }}
                    >
                      {isSoon && <Lock className="w-4 h-4 text-foreground/30 shrink-0" />}
                      <span className="text-2xl shrink-0 text-foreground/70">{chip.id === '_more' ? <ArrowRight className="w-6 h-6" /> : SIGNAL_ICONS[chip.id]}</span>
                      <div className="min-w-0">
                        <span className={`text-lg font-medium block ${isChipSelected ? 'text-foreground' : 'text-foreground/70'}`}>
                          {isMore ? t('category.andMore') : getLabel(chip.id)}
                        </span>
                        {!isMore && (
                          <span className="text-base text-muted-foreground/50 block leading-tight mt-0.5">
                            {getDesc(chip.id)}
                          </span>
                        )}
                      </div>
                    </button>

                    {soonTooltip === chip.id && (
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg text-xs text-foreground/70 whitespace-nowrap animate-fade-in"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {t('category.comingSoon')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Step 2 — Shape card (30%) */}
            <div className="lg:w-[35%] shrink-0 flex flex-col">
              <p className="text-base text-muted-foreground uppercase tracking-widest mb-3">
                Step 2 · Shape this signal
              </p>
              <div
                onClick={toggleActive}
                className="relative cursor-pointer w-full flex-1 mb-4 flex flex-col"
                style={{
                  minHeight: '460px', borderRadius: '28px',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  boxShadow: `0 0 60px -20px rgba(10, 200, 200, ${isActivated ? '0.12' : '0.04'}), 0 0 120px -40px rgba(10, 200, 200, ${isActivated ? '0.06' : '0.02'})`,
                  border: '1px solid var(--glass-border)',
                  transform: 'translateY(0)',
                  transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 400ms ease',
                }}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                  style={{
                    opacity: transitioning ? 0 : 1,
                    transform: transitioning ? 'scale(0.98)' : 'scale(1)',
                    transition: 'opacity 150ms ease, transform 150ms ease',
                  }}
                >
                  <span className="text-foreground/80 mb-5">{SIGNAL_ICONS[current.id] ? React.cloneElement(SIGNAL_ICONS[current.id] as React.ReactElement, { className: 'w-14 h-14' }) : null}</span>
                  <h3 className="text-2xl font-semibold text-foreground mb-1">{getLabel(current.id)}</h3>
                  {isMinted && (
                    <span className="text-sm px-3 py-0.5 rounded-full mb-2" style={{ background: 'hsla(164, 24%, 74%, 0.15)', color: 'hsl(164, 24%, 74%)' }}>{t('category.minted')}</span>
                  )}
                  <p className="text-base text-muted-foreground/70 max-w-xs mb-4">{getDesc(current.id)}</p>
                  <p className="text-base text-muted-foreground/40 mb-8">
                    {isActivated ? t('category.tapDeactivate') : t('category.tapActivate')}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!activated.includes(selected)) {
                        const next = [...activated, selected];
                        setActivated(next);
                        onUpdate(next);
                      }
                      onNavigateToCategory(selected);
                    }}
                    className="btn-twin btn-twin-primary px-8 py-3 text-base rounded-xl"
                  >
                    Shape {getLabel(selected)} Signal
                  </button>
                </div>

                {isActivated && (
                  <div style={{
                    position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                    width: '48px', height: '3px', borderRadius: '4px',
                    background: isMinted ? 'rgba(74, 222, 128, 0.5)' : 'rgba(54, 230, 255, 0.4)',
                    boxShadow: isMinted ? '0 0 16px rgba(74, 222, 128, 0.3)' : '0 0 16px rgba(54, 230, 255, 0.25)',
                    animation: 'signal-breathe 3s ease-in-out infinite',
                  }} />
                )}
              </div>

              {/* Finish layer selection button */}
              <button
                onClick={(e) => { e.stopPropagation(); onProceedToSoul(); }}
                disabled={!hasActive}
                className="btn-twin btn-twin-ghost w-full py-4 text-base rounded-xl border border-foreground/30 mt-auto hover:bg-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue to Soul Matrix
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes signal-breathe { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        `}</style>
      </StepContent>
    </StepLayout>
  );
};
