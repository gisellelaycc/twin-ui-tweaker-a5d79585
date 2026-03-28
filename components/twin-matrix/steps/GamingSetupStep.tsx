import { useState } from 'react';
import type { GamingSetup } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';

interface Props {
    data: GamingSetup;
    onUpdate: (d: GamingSetup) => void;
    onNext: () => void;
}

export const GamingSetupStep = ({ data, onUpdate, onNext }: Props) => {
    const [setup, setSetup] = useState(data);

    const update = <K extends keyof GamingSetup>(key: K, val: GamingSetup[K]) => {
        const next = { ...setup, [key]: val };
        setSetup(next);
        onUpdate(next);
    };

    return (
        <StepLayout>
            <StepContent>
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-xl mb-6">
                        <h2 className="text-3xl font-bold">Gaming Signals</h2>
                    </div>
                    <div className="glass-card space-y-6 w-full max-w-xl text-left bg-transparent h-[50vh] overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-sm">Difficulty Preference Slider</label>
                            <input type="range" min="0" max="100" value={setup.difficultyPreference} onChange={e => update('difficultyPreference', Number(e.target.value))} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm">Min/Maxing Tendency</label>
                            <input type="range" min="0" max="100" value={setup.minMaxingTendency} onChange={e => update('minMaxingTendency', Number(e.target.value))} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm">Tilt Susceptibility</label>
                            <input type="range" min="0" max="100" value={setup.tiltSusceptibility} onChange={e => update('tiltSusceptibility', Number(e.target.value))} className="w-full" />
                        </div>
                    </div>
                    <div className="w-full max-w-xl mt-6">
                        <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-2.5">Proceed</button>
                    </div>
                </div>
            </StepContent>
        </StepLayout>
    );
};
