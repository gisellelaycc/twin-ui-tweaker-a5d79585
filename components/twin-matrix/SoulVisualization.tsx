import { useMemo } from 'react';
import type { WizardLayer } from '@/lib/twin-matrix/soul-dimensions';

interface Props {
    vector: Uint8Array;
    layers: WizardLayer[];
    values: Map<number, unknown>;
}

const QUADRANT_COLORS: Record<string, string> = {
    P: '#FF6B6B',  // Physical — coral
    D: '#0AFFFF',  // Digital — cyan
    M: '#FFD93D',  // Mental — gold
    S: '#6BCB77',  // Social — green
};

const QUADRANT_LABELS: Record<string, string> = {
    P: 'Physical Me',
    D: 'Digital Me',
    M: 'Mental Me',
    S: 'Social Me',
};

export const SoulVisualization = ({ vector, layers, values }: Props) => {
    // Compute stats
    const stats = useMemo(() => {
        let nonZero = 0;
        let totalVal = 0;
        for (let i = 0; i < 256; i++) {
            if (vector[i] > 0) {
                nonZero++;
                totalVal += vector[i];
            }
        }
        return {
            nonZero,
            avgValue: nonZero > 0 ? Math.round(totalVal / nonZero) : 0,
            completeness: Math.round((nonZero / 256) * 100),
        };
    }, [vector]);

    // Quadrant breakdown
    const quadrantStats = useMemo(() => {
        const qs: Record<string, { total: number; filled: number; avgVal: number }> = {};
        for (const layer of layers) {
            if (!qs[layer.quadrant]) qs[layer.quadrant] = { total: 0, filled: 0, avgVal: 0 };
            for (const dim of layer.dimensions) {
                qs[layer.quadrant].total++;
                const v = vector[dim.dimId];
                if (v > 0) {
                    qs[layer.quadrant].filled++;
                    qs[layer.quadrant].avgVal += v;
                }
            }
        }
        for (const q of Object.values(qs)) {
            q.avgVal = q.filled > 0 ? Math.round(q.avgVal / q.filled) : 0;
        }
        return qs;
    }, [vector, layers]);

    // Render 256 cells as a 16×16 grid
    const cells = useMemo(() => {
        const result: Array<{ idx: number; val: number; color: string; layerName?: string }> = [];
        const dimToLayer = new Map<number, { quadrant: string; layerName: string }>();
        for (const layer of layers) {
            for (const dim of layer.dimensions) {
                dimToLayer.set(dim.dimId, { quadrant: layer.quadrant, layerName: layer.title });
            }
        }

        for (let i = 0; i < 256; i++) {
            const val = vector[i];
            const info = dimToLayer.get(i);
            const color = info ? QUADRANT_COLORS[info.quadrant] : '#444';
            result.push({ idx: i, val, color, layerName: info?.layerName });
        }
        return result;
    }, [vector, layers]);

    return (
        <div className="space-y-6">

            {/* Overview stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Dimensions" value={`${stats.nonZero}/256`} sub="configured" />
                <StatCard label="Completeness" value={`${stats.completeness}%`} sub="of vector" />
                <StatCard label="Avg Value" value={`${stats.avgValue}`} sub="/ 255" />
                <StatCard label="Signal Layers" value={`${layers.length}`} sub="active" />
            </div>

            {/* 256D grid */}
            <div
                className="rounded-2xl p-4 md:p-6"
                style={{
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg">256-Dimensional Soul Vector</h3>
                    <div className="flex items-center gap-3 text-xs">
                        {Object.entries(QUADRANT_COLORS).map(([q, color]) => (
                            <span key={q} className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                                {QUADRANT_LABELS[q]}
                            </span>
                        ))}
                    </div>
                </div>

                <div
                    className="grid gap-[2px]"
                    style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}
                >
                    {cells.map(cell => (
                        <div
                            key={cell.idx}
                            title={`dim[${cell.idx}]${cell.layerName ? ` — ${cell.layerName}` : ''}: ${cell.val}`}
                            className="aspect-square rounded-sm transition-all duration-200 cursor-pointer hover:scale-125 hover:z-10"
                            style={{
                                background: cell.val > 0
                                    ? `${cell.color}${Math.max(20, Math.round(cell.val / 255 * 100)).toString(16).padStart(2, '0')}`
                                    : 'rgba(255,255,255,0.03)',
                                boxShadow: cell.val > 200 ? `0 0 6px ${cell.color}40` : 'none',
                            }}
                        />
                    ))}
                </div>

                <p className="text-xs text-muted-foreground/50 mt-3 text-center">
                    Each cell = 1 byte (0-255). Brightness = intensity. Color = quadrant. Hover for details.
                </p>
            </div>

            {/* Quadrant breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(quadrantStats).map(([q, s]) => (
                    <div
                        key={q}
                        className="rounded-xl p-4 space-y-2"
                        style={{
                            border: `1px solid ${QUADRANT_COLORS[q]}30`,
                            background: `${QUADRANT_COLORS[q]}08`,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-heading font-medium" style={{ color: QUADRANT_COLORS[q] }}>
                                {QUADRANT_LABELS[q]}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">{s.filled}/{s.total}</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-foreground/10 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${s.total > 0 ? (s.filled / s.total) * 100 : 0}%`,
                                    background: QUADRANT_COLORS[q],
                                }}
                            />
                        </div>
                        {s.avgVal > 0 && <p className="text-xs text-muted-foreground">Avg: {s.avgVal}/255</p>}
                    </div>
                ))}
            </div>

            {/* Per-layer breakdown */}
            <div
                className="rounded-2xl p-4 md:p-6 space-y-3"
                style={{
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                }}
            >
                <h3 className="font-heading font-bold text-lg">Signal Layers</h3>
                {layers.map(layer => {
                    const dimValues = layer.dimensions.map(d => vector[d.dimId]).filter(v => v > 0);
                    const avg = dimValues.length > 0 ? Math.round(dimValues.reduce((a, b) => a + b, 0) / dimValues.length) : 0;
                    const filled = dimValues.length;

                    return (
                        <div key={layer.id} className="flex items-center gap-3">
                            <span className="text-xl w-8 text-center">{layer.icon}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{layer.title}</span>
                                    <span className="text-muted-foreground font-mono">{filled}/{layer.dimensions.length}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${(filled / layer.dimensions.length) * 100}%`,
                                            background: QUADRANT_COLORS[layer.quadrant],
                                        }}
                                    />
                                </div>
                            </div>
                            {avg > 0 && (
                                <span className="text-xs font-mono text-muted-foreground w-12 text-right">{avg}</span>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div
            className="rounded-xl p-4 text-center"
            style={{
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
            }}
        >
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-heading font-bold">{value}</p>
            <p className="text-xs text-muted-foreground/60">{sub}</p>
        </div>
    );
}
