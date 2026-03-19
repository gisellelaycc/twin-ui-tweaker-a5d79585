import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { SOUL_LAYERS, type WizardDimension, type WizardLayer } from '@/lib/twin-matrix/soul-dimensions';
import {
    encodeContinuous,
    encodeDiscrete,
    encodeNarrative,
    encodeIndexing,
    buildSoulVector,
    type DimensionSpec,
} from '@/lib/twin-matrix';
import { SoulVisualization } from '@/components/twin-matrix/SoulVisualization';

// ─── Types ──────────────────────────────────────────────────────────────────

type DimValues = Map<number, unknown>;

// ─── SoulWizardPage ─────────────────────────────────────────────────────────

const SoulWizardPage = () => {
    const navigate = useNavigate();
    const { isConnected, openConnectModal, hasMintedSbt } = useTwinMatrix();
    const [currentLayer, setCurrentLayer] = useState(0);
    const [values, setValues] = useState<DimValues>(new Map());
    const [showVisualization, setShowVisualization] = useState(false);

    const layer = SOUL_LAYERS[currentLayer];
    const progress = ((currentLayer + 1) / SOUL_LAYERS.length) * 100;

    const updateValue = useCallback((dimId: number, value: unknown) => {
        setValues(prev => {
            const next = new Map(prev);
            next.set(dimId, value);
            return next;
        });
    }, []);

    // Build live soul vector from current values
    const soulVector = useMemo(() => {
        const specs: DimensionSpec[] = [];
        for (const layer of SOUL_LAYERS) {
            for (const dim of layer.dimensions) {
                specs.push({
                    dimId: dim.dimId,
                    name: dim.name,
                    layer: layer.id,
                    quadrant: layer.quadrant,
                    encoding: dim.encoding,
                    priority: 1,
                    uiType: dim.uiType,
                    maxValue: dim.maxValue,
                    levels: dim.levels,
                });
            }
        }
        return buildSoulVector(values, specs);
    }, [values]);

    // Count filled dimensions per layer
    const layerCompletion = useMemo(() => {
        return SOUL_LAYERS.map(layer => {
            const filled = layer.dimensions.filter(d => {
                const v = values.get(d.dimId);
                if (v === undefined || v === null) return false;
                if (typeof v === 'number') return v > 0;
                if (Array.isArray(v)) return v.length > 0;
                if (typeof v === 'string') return v !== '';
                return true;
            }).length;
            return { total: layer.dimensions.length, filled };
        });
    }, [values]);

    const totalFilled = layerCompletion.reduce((s, l) => s + l.filled, 0);
    const totalDims = layerCompletion.reduce((s, l) => s + l.total, 0);

    // Not connected
    if (!isConnected) {
        return (
            <PageLayout activePage="identity">
                <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-md text-center space-y-6 glass-card p-8">
                        <h2 className="text-2xl font-heading font-bold">Connect Wallet</h2>
                        <p className="text-muted-foreground">Connect your wallet to configure your Soul Vector.</p>
                        <button onClick={() => openConnectModal?.()} className="btn-twin btn-twin-primary py-4 px-8 w-full">
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    // Show visualization
    if (showVisualization) {
        return (
            <PageLayout activePage="identity">
                <div className="max-w-6xl mx-auto w-full py-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-heading font-extrabold">Your Soul Vector</h1>
                            <p className="text-muted-foreground mt-1">{totalFilled} / {totalDims} dimensions configured</p>
                        </div>
                        <button onClick={() => setShowVisualization(false)} className="btn-twin py-2 px-4 text-sm border border-foreground/20 hover:bg-foreground/5">
                            ← Back to Wizard
                        </button>
                    </div>
                    <SoulVisualization vector={soulVector} layers={SOUL_LAYERS} values={values} />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout activePage="identity">
            <div className="max-w-5xl mx-auto w-full py-4 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-extrabold leading-tight">
                            Soul Wizard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Configure your 256-dimensional identity across 9 signal layers.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowVisualization(true)}
                        className="btn-twin py-2 px-4 text-sm border border-foreground/20 hover:bg-foreground/5 transition-colors"
                    >
                        View 256D ↗
                    </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Layer {currentLayer + 1} of {SOUL_LAYERS.length}</span>
                        <span className="font-mono text-foreground/80">{totalFilled}/{totalDims} dims</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${progress}%`,
                                background: 'linear-gradient(90deg, #0AFFFF, #7B61FF)',
                            }}
                        />
                    </div>
                </div>

                {/* Layer tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {SOUL_LAYERS.map((l, i) => {
                        const comp = layerCompletion[i];
                        const isActive = i === currentLayer;
                        const isDone = comp.filled === comp.total;
                        return (
                            <button
                                key={l.id}
                                onClick={() => setCurrentLayer(i)}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${isActive
                                        ? 'bg-foreground/10 text-foreground border border-foreground/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                                    }`}
                            >
                                <span>{l.icon}</span>
                                <span className="hidden sm:inline">{l.title}</span>
                                {isDone && <span className="text-xs text-green-400">✓</span>}
                                {!isDone && comp.filled > 0 && (
                                    <span className="text-xs text-foreground/40">{comp.filled}/{comp.total}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Layer content */}
                <div className="animate-fade-in" key={layer.id}>
                    <div
                        className="rounded-2xl p-6 space-y-6"
                        style={{
                            border: '1px solid var(--glass-border)',
                            background: 'var(--glass-bg)',
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{layer.icon}</span>
                            <div>
                                <h2 className="text-xl font-heading font-bold">{layer.title}</h2>
                                <p className="text-sm text-muted-foreground">{layer.subtitle}</p>
                            </div>
                            <span className="ml-auto text-xs font-mono px-2 py-1 rounded bg-foreground/5 text-muted-foreground">
                                {layer.quadrant === 'P' ? 'Physical' : layer.quadrant === 'D' ? 'Digital' : layer.quadrant === 'M' ? 'Mental' : 'Social'}
                            </span>
                        </div>

                        <div
                            className="space-y-5 max-h-[55vh] overflow-y-auto pr-2"
                            style={{ scrollbarWidth: 'thin' }}
                        >
                            {layer.dimensions.map(dim => (
                                <DimensionInput
                                    key={dim.dimId}
                                    dim={dim}
                                    value={values.get(dim.dimId)}
                                    onChange={(v) => updateValue(dim.dimId, v)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setCurrentLayer(Math.max(0, currentLayer - 1))}
                        disabled={currentLayer === 0}
                        className="flex-1 py-3 rounded-xl text-sm font-medium border border-foreground/20 text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        ← Previous
                    </button>
                    {currentLayer < SOUL_LAYERS.length - 1 ? (
                        <button
                            onClick={() => setCurrentLayer(currentLayer + 1)}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
                        >
                            Next: {SOUL_LAYERS[currentLayer + 1].icon} {SOUL_LAYERS[currentLayer + 1].title} →
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowVisualization(true)}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                            style={{ background: 'linear-gradient(135deg, #0AFFFF, #7B61FF)', color: '#001515' }}
                        >
                            Complete — View Your Soul Vector ✨
                        </button>
                    )}
                </div>

            </div>
        </PageLayout>
    );
};

// ─── DimensionInput ─────────────────────────────────────────────────────────

function DimensionInput({
    dim,
    value,
    onChange,
}: {
    dim: WizardDimension;
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    switch (dim.uiType) {
        case 'slider':
            return (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm text-muted-foreground uppercase tracking-widest">{dim.label}</label>
                        <span className="text-sm font-mono text-foreground/70">{(value as number) ?? 0}/{dim.maxValue ?? 100}</span>
                    </div>
                    {dim.description && <p className="text-xs text-muted-foreground/60">{dim.description}</p>}
                    <input
                        type="range"
                        min="0"
                        max={dim.maxValue ?? 100}
                        value={(value as number) ?? 0}
                        onChange={e => onChange(Number(e.target.value))}
                        className="w-full accent-[#0AFFFF]"
                    />
                </div>
            );

        case 'single-select':
            return (
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground uppercase tracking-widest">{dim.label}</label>
                    <div className="flex flex-wrap gap-2">
                        {dim.options?.map((opt, i) => (
                            <button
                                key={opt}
                                onClick={() => onChange(i)}
                                className={`chip px-3 py-1.5 text-sm rounded-lg border transition-all ${(value as number) === i
                                        ? 'bg-foreground/15 border-foreground/30 text-foreground'
                                        : 'border-foreground/10 text-muted-foreground hover:border-foreground/20'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'multi-select':
            return (
                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground uppercase tracking-widest">
                        {dim.label}
                        {dim.encoding === 'narrative' && <span className="text-xs ml-1 text-foreground/30">(max 8)</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {dim.options?.map((opt, i) => {
                            const selected = Array.isArray(value) ? (value as (number | string)[]) : [];
                            const isNarrative = dim.encoding === 'narrative';
                            const isSelected = isNarrative ? selected.includes(i) : selected.includes(opt);

                            return (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        if (isNarrative) {
                                            const indices = (selected as number[]);
                                            if (indices.includes(i)) {
                                                onChange(indices.filter(x => x !== i));
                                            } else if (indices.length < 8) {
                                                onChange([...indices, i]);
                                            }
                                        } else {
                                            const items = (selected as string[]);
                                            onChange(items.includes(opt) ? items.filter(x => x !== opt) : [...items, opt]);
                                        }
                                    }}
                                    className={`chip px-3 py-1.5 text-sm rounded-lg border transition-all ${isSelected
                                            ? 'bg-foreground/15 border-foreground/30 text-foreground'
                                            : 'border-foreground/10 text-muted-foreground hover:border-foreground/20'
                                        }`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );

        default:
            return null;
    }
}

export default SoulWizardPage;
