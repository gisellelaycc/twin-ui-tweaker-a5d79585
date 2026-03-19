import { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import type { SoulData, SoulBar } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

// Internal IDs stay English, display uses i18n keys
const BAR_DEFS = [
  { id: 'BAR_OUTCOME_EXPERIENCE', labelKey: 'soul.bar.performanceOrientation', leftKey: 'soul.bar.performanceLeft', rightKey: 'soul.bar.performanceRight' },
  { id: 'BAR_CONTROL_RELEASE', labelKey: 'soul.bar.structurePreference', leftKey: 'soul.bar.structureLeft', rightKey: 'soul.bar.structureRight' },
  { id: 'BAR_SOLO_GROUP', labelKey: 'soul.bar.socialPreference', leftKey: 'soul.bar.socialLeft', rightKey: 'soul.bar.socialRight' },
  { id: 'BAR_PASSIVE_ACTIVE', labelKey: 'soul.bar.engagementMode', leftKey: 'soul.bar.engagementLeft', rightKey: 'soul.bar.engagementRight' },
];

function getBarRaw(value: number | null): number {
  if (value === null) return 0;
  return Math.round((value / 100) * 255);
}

interface Props {
  data: SoulData;
  onUpdate: (d: SoulData) => void;
  onNext: () => void;
}

export const SoulStep = ({ data, onUpdate, onNext }: Props) => {
  const { t } = useI18n();
  const [bars, setBars] = useState<SoulBar[]>(
    data.bars?.length === 4 ? data.bars : BAR_DEFS.map(d => ({
      id: d.id, label: d.labelKey, left: d.leftKey, right: d.rightKey, value: null,
    }))
  );

  const handleSlider = useCallback((idx: number, value: number) => {
    const nextBars = bars.map((b, i) => i === idx ? { ...b, value } : b);
    setBars(nextBars);
    onUpdate({ bars: nextBars, confirmed: true });
  }, [bars, onUpdate]);

  const touchedCount = bars.filter(b => b.value !== null).length;
  const hasInteracted = touchedCount > 0;

  // Get display text — if the bar stores i18n keys, translate; otherwise show raw
  const displayText = (key: string) => {
    const translated = t(key);
    return translated !== key ? translated : key;
  };

  return (
    <StepLayout>
      <StepContent>
        <div className="w-full flex flex-col">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              {t('soul.title')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t('soul.subtitle')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-end">
            <div className="flex-1 min-w-0">
              <div className="space-y-8">
                <p className="text-base text-muted-foreground uppercase tracking-widest">{t('soul.why')}</p>

                {bars.map((bar, idx) => (
                  <div key={bar.id} className="space-y-3">
                    <div className="flex justify-between text-base text-muted-foreground">
                      <span className="max-w-[45%] text-left leading-tight">{displayText(bar.left)}</span>
                      <span className="max-w-[45%] text-right leading-tight">{displayText(bar.right)}</span>
                    </div>
                    <div className="relative group">
                      {bar.value !== null && (
                        <div
                          className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 rounded-full pointer-events-none z-0"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, rgba(10, 255, 255, 0.05) ${Math.max(bar.value - 30, 0)}%, rgba(10, 255, 255, 0.35) ${bar.value}%, rgba(173, 255, 255, 0.05) ${Math.min(bar.value + 30, 100)}%, transparent 100%)`,
                            boxShadow: `0 0 8px rgba(10, 255, 255, 0.15), 0 0 20px rgba(10, 255, 255, 0.06)`,
                          }}
                        />
                      )}
                      <Slider value={[bar.value ?? 50]} onValueChange={([v]) => handleSlider(idx, v)} max={100} step={1} className="relative z-10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hasInteracted && (
              <div className="lg:w-[220px] shrink-0 animate-fade-in">
                <p className="text-base text-muted-foreground uppercase tracking-widest mb-4">{t('soul.signature')}</p>
                <div className="space-y-6">
                  {bars.map(bar => {
                    const raw = getBarRaw(bar.value);
                    return (
                      <div key={bar.id}>
                        <span className="text-sm text-foreground/60 block">{displayText(bar.label)}</span>
                        {bar.value !== null ? (
                          <span className="text-sm text-muted-foreground font-mono">{raw} / 255</span>
                        ) : (
                          <span className="text-muted-foreground/40 italic text-[10px]">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10">
            <button
              onClick={onNext}
              disabled={!hasInteracted}
              className={`btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed ${hasInteracted ? 'btn-glow' : ''}`}
            >
              {t('soul.cta')}
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
