import { useState } from 'react';
import type { MusicSetup } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';

interface Props {
    data: MusicSetup;
    onUpdate: (d: MusicSetup) => void;
    onNext: () => void;
}

export const MusicSetupStep = ({ data, onUpdate, onNext }: Props) => {
    const [setup, setSetup] = useState(data);

    const update = <K extends keyof MusicSetup>(key: K, val: MusicSetup[K]) => {
        const next = { ...setup, [key]: val };
        setSetup(next);
        onUpdate(next);
    };

    return (
        <StepLayout>
            <StepContent>
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-xl mb-6">
                        <h2 className="text-3xl font-bold">Music Signals</h2>
                    </div>
                    <div className="glass-card space-y-6 w-full max-w-xl text-left bg-transparent h-[50vh] overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-sm">Emotional Resonance Slider</label>
                            <input type="range" min="0" max="100" value={setup.emotionalResonance} onChange={e => update('emotionalResonance', Number(e.target.value))} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm">Live Performance Bias Slider</label>
                            <input type="range" min="0" max="100" value={setup.livePerformanceBias} onChange={e => update('livePerformanceBias', Number(e.target.value))} className="w-full" />
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
