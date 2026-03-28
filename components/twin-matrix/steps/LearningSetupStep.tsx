import { useState } from 'react';
import type { LearningSetup } from '@/types/twin-matrix';
import { StepLayout, StepContent } from '../StepLayout';

interface Props {
    data: LearningSetup;
    onUpdate: (d: LearningSetup) => void;
    onNext: () => void;
}

export const LearningSetupStep = ({ data, onUpdate, onNext }: Props) => {
    const [setup, setSetup] = useState(data);

    const update = <K extends keyof LearningSetup>(key: K, val: LearningSetup[K]) => {
        const next = { ...setup, [key]: val };
        setSetup(next);
        onUpdate(next);
    };

    return (
        <StepLayout>
            <StepContent>
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-xl mb-6">
                        <h2 className="text-3xl font-bold">Learning Signals</h2>
                    </div>
                    <div className="glass-card space-y-6 w-full max-w-xl text-left bg-transparent h-[50vh] overflow-y-auto">
                        <div className="space-y-2">
                            <label className="text-sm">AI Tutor Reliance</label>
                            <input type="range" min="0" max="100" value={setup.aiTutorReliance} onChange={e => update('aiTutorReliance', Number(e.target.value))} className="w-full" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm">Structured vs Unstructured</label>
                            <input type="range" min="0" max="100" value={setup.structuredVsUnstructured} onChange={e => update('structuredVsUnstructured', Number(e.target.value))} className="w-full" />
                        </div>
                    </div>
                    <div className="w-full max-w-xl mt-6">
                        <button onClick={onNext} className="btn-twin btn-twin-primary w-full py-2.5">Back to Layer Selection</button>
                    </div>
                </div>
            </StepContent>
        </StepLayout>
    );
};
