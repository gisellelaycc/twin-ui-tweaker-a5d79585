import { useState } from 'react';
import type { SportTwin } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

interface Props {
  data: SportTwin;
  onUpdate: (d: SportTwin) => void;
  onNext: () => void;
}

const RECOVERY_OPTS = ['Stretching', 'Massage', 'Ice Bath', 'Sauna', 'Supplements', 'Sleep', 'Active Recovery'];
const WORKOUT_ENV = ['Gym', 'Outdoors', 'Home', 'Studio/Class', 'Virtual/VR'];

export const SportTwinStep = ({ data, onUpdate, onNext }: Props) => {
  const { t } = useI18n();
  const [twin, setTwin] = useState(data);

  const update = <K extends keyof SportTwin>(key: K, val: SportTwin[K]) => {
    const next = { ...twin, [key]: val };
    setTwin(next);
    onUpdate(next);
  };

  const toggleArray = (key: 'recoveryMethod', val: string) => {
    let curr = twin[key] as string[];
    if (curr.includes(val)) curr = curr.filter(v => v !== val);
    else curr = [...curr, val];
    update(key, curr);
  };

  const SliderField = ({ label, prop, minLabel, maxLabel }: { label: string, prop: keyof SportTwin, minLabel: string, maxLabel: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="text-sm text-muted-foreground uppercase tracking-widest">{label}</label>
        <span className="text-xs font-mono">{twin[prop] as number}/100</span>
      </div>
      <input type="range" min="0" max="100" value={twin[prop] as number} onChange={e => update(prop, Number(e.target.value))} className="w-full accent-foreground" />
      <div className="flex justify-between text-xs text-muted-foreground/60 w-full px-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl mb-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-2">Sport Signals (Part 2)</h2>
            <p className="text-muted-foreground">Define your mental and behavioral sporting patterns.</p>
          </div>

          <div className="glass-card space-y-6 w-full max-w-xl text-left bg-transparent h-[60vh] overflow-y-auto pr-2">

            <SliderField label="Dietary Discipline" prop="dietaryDiscipline" minLabel="Relaxed" maxLabel="Strict" />
            <SliderField label="Team vs Solo" prop="teamVsSolo" minLabel="Solo Focus" maxLabel="Team Driven" />
            <SliderField label="Pain Tolerance" prop="painTolerance" minLabel="Comfort First" maxLabel="Push Through" />
            <SliderField label="Adrenaline Seeking" prop="adrenalineSeeking" minLabel="Calm/Safe" maxLabel="Extreme" />
            <SliderField label="Exploration Desire" prop="explorationDesire" minLabel="Routine" maxLabel="Novelty" />
            <SliderField label="Aesthetics vs Performance" prop="aestheticsVsPerf" minLabel="Looks" maxLabel="Results" />

            {/* Recovery Method */}
            <div className="space-y-2 pt-2 border-t border-foreground/10">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Recovery Method</label>
              <div className="flex flex-wrap gap-2">
                {RECOVERY_OPTS.map(o => (
                  <button key={o} onClick={() => toggleArray('recoveryMethod', o)} className={`chip px-3 py-1 text-sm ${twin.recoveryMethod.includes(o) ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Environment */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Workout Environment</label>
              <div className="flex flex-wrap gap-2">
                {WORKOUT_ENV.map(o => (
                  <button key={o} onClick={() => update('workoutEnvironment', o)} className={`chip px-3 py-1 text-sm ${twin.workoutEnvironment === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Consumption */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground uppercase tracking-widest">Media Consumption (Hours/Week)</label>
              <div className="flex gap-2">
                {['< 2h', '2-5h', '5-10h', '10+h'].map(o => (
                  <button key={o} onClick={() => update('mediaConsumption', o)} className={`chip flex-1 py-1 text-sm ${twin.mediaConsumption === o ? '!bg-foreground/15 !border-foreground/30 !text-foreground' : ''}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="w-full max-w-xl mt-6">
            <button onClick={onNext} className="btn-twin btn-twin-primary btn-glow w-full py-2.5 text-sm">
              Complete Sport Module
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
