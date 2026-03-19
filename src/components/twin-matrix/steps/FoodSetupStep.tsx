import { useState } from 'react';
import type { FoodSetup } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';

interface Props {
    data: FoodSetup;
    onUpdate: (d: FoodSetup) => void;
    onNext: () => void;
}

export const FoodSetupStep = ({ data, onUpdate, onNext }: Props) => {
    const [setup, setSetup] = useState(data);

    const update = <K extends keyof FoodSetup>(key: K, val: FoodSetup[K]) => {
        const next = { ...setup, [key]: val };
        setSetup(next);
        onUpdate(next);
    };

    return (
        <StepLayout>
            <StepContent>
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-xl mb-6">
                        <h2 className="text-3xl font-bold">Food Signals</h2>
                    </div>
                    <div className="glass-card space-y-6 w-full max-w-xl text-left bg-transparent h-[50vh] overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-sm">Health vs Pleasure Slider</label>
                            <input type="range" min="0" max="100" value={setup.healthVsPleasure} onChange={e => update('healthVsPleasure', Number(e.target.value))} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm">Eating Adventure Slider</label>
                            <input type="range" min="0" max="100" value={setup.eatingAdventure} onChange={e => update('eatingAdventure', Number(e.target.value))} className="w-full" />
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
