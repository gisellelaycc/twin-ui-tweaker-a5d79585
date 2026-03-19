import { useState } from 'react';
import type { SportSetup } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

interface Props {
  data: SportSetup;
  onUpdate: (d: SportSetup) => void;
  onNext: () => void;
}

const COMMON_SPORTS = ['Running', 'Cycling', 'Swimming', 'Strength', 'Yoga', 'Team', 'Combat', 'Racquet'];
const COMMON_BRANDS = ['Nike', 'Adidas', 'Under Armour', 'Lululemon', 'ASICS', 'On', 'Hoka', 'Reebok'];
const SPEND_OPTS = ['< $50', '$50–$100', '$100–$250', '$250+'];
const STYLE_OPTS = ['Minimalist', 'Techwear', 'Street/Casual', 'Vintage', 'Performance-focused'];
const FREQ_OPTS = ['1-2x', '3-4x', '5+x', 'Occasional'];
const DUR_OPTS = ['< 30m', '30-60m', '60-90m', '90m+'];

export const SportSetupStep = ({ data, onUpdate, onNext }: Props) => {
  const { t } = useI18n();
  const [setup, setSetup] = useState(data);

  const update = <K extends keyof SportSetup>(key: K, val: SportSetup[K]) => {
    const next = { ...setup, [key]: val };
    setSetup(next);
    onUpdate(next);
  };

  const toggleArray = (key: 'topSportTypes' | 'favoriteBrands' | 'sportswearStyle', val: string, max?: number) => {
    let curr = setup[key] as string[];
    if (curr.includes(val)) curr = curr.filter(v => v !== val);
    else if (!max || curr.length < max) curr = [...curr, val];
    update(key, curr);
  };

  const isValid = setup.topSportTypes.length > 0 && setup.exerciseFrequency !== '';

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl mb-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-2">Sport Signals (Part 1)</h2>
            <p className="text-muted-foreground">Select your baseline physical attributes.</p>
          </div>

          <div className="glass-card space-y-6 w-full max-w-xl text-left bg-transparent h-[60vh] overflow-y-auto pr-2">

            {/* Top Sports */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Top Sport Types (Max 5)</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SPORTS.map(o => (
                  <button key={o} onClick={() => toggleArray('topSportTypes', o, 5)} className={`chip px-3 py-1 text-sm ${setup.topSportTypes.includes(o) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Brands */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Favorite Brands</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_BRANDS.map(o => (
                  <button key={o} onClick={() => toggleArray('favoriteBrands', o)} className={`chip px-3 py-1 text-sm ${setup.favoriteBrands.includes(o) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Spending */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Monthly Spending (USD)</label>
              <div className="flex gap-2">
                {SPEND_OPTS.map(o => (
                  <button key={o} onClick={() => update('monthlySpending', o)} className={`chip flex-1 py-1 text-sm ${setup.monthlySpending === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Exercise Frequency</label>
              <div className="flex gap-2">
                {FREQ_OPTS.map(o => (
                  <button key={o} onClick={() => update('exerciseFrequency', o)} className={`chip flex-1 py-1 text-sm ${setup.exerciseFrequency === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Avg Session Duration</label>
              <div className="flex gap-2">
                {DUR_OPTS.map(o => (
                  <button key={o} onClick={() => update('avgSessionDuration', o)} className={`chip flex-1 py-1 text-sm ${setup.avgSessionDuration === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Sportswear Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTS.map(o => (
                  <button key={o} onClick={() => toggleArray('sportswearStyle', o)} className={`chip px-3 py-1 text-sm ${setup.sportswearStyle.includes(o) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Competitive Drive Slider */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-muted-foreground uppercase tracking-widest">Competitive Drive</label>
                <span className="text-sm font-mono">{setup.competitiveDrive}/100</span>
              </div>
              <input type="range" min="0" max="100" value={setup.competitiveDrive} onChange={e => update('competitiveDrive', Number(e.target.value))} className="w-full accent-foreground" />
            </div>

            {/* Wearable Tech */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Wearable Tech Usage</label>
              <div className="flex gap-2">
                {['High', 'Medium', 'Low', 'None'].map(o => (
                  <button key={o} onClick={() => update('wearableTechUsage', o)} className={`chip flex-1 py-1 text-sm ${setup.wearableTechUsage === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="w-full max-w-xl mt-6">
            <button onClick={onNext} disabled={!isValid} className={`btn-twin btn-twin-primary w-full py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed ${isValid ? 'btn-glow' : ''}`}>
              Proceed to Part 2
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
