import { useMemo, useState } from "react";
import { computeDensity } from "@/lib/twin-encoder";
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

const SLICES = [
  { labelKey: 'common.physical', range: [0, 63], color: "255, 60, 100" },
  { labelKey: 'common.digital', range: [64, 127], color: "60, 180, 255" },
  { labelKey: 'common.social', range: [128, 191], color: "255, 200, 40" },
  { labelKey: 'common.spiritual', range: [192, 255], color: "100, 200, 50" },
];

interface Props {
  signature: number[];
  tags: string[];
  activeModules: string[];
  onNext: () => void;
  onBack: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionLoading?: boolean;
  primaryActionDisabled?: boolean;
  networkMismatch?: boolean;
  expectedNetworkLabel?: string;
  onSwitchNetwork?: () => void;
  switchingNetwork?: boolean;
}

export const ReviewStep = ({
  signature,
  activeModules,
  onNext,
  onBack,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionLoading = false,
  primaryActionDisabled = false,
  networkMismatch = false,
  expectedNetworkLabel = 'BSC Testnet (97)',
  onSwitchNetwork,
  switchingNetwork = false,
}: Props) => {
  const { t } = useI18n();
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const identityDensity = useMemo(() => computeDensity(signature), [signature]);

  const quadrant = useMemo(() => {
    const x206 = signature[206] ?? 0;
    const x207 = signature[207] ?? 0;
    const x208 = signature[208] ?? 0;
    const x209 = signature[209] ?? 0;
    const X = (x206 - x207) / 255;
    const Y = (x208 - x209) / 255;
    const missing = x206 === 0 && x207 === 0 && x208 === 0 && x209 === 0;
    if (missing) return { X: 0, Y: 0, label: "—", missing: true };
    let label = "ON_AXIS";
    if (X > 0.05 && Y > 0.05) label = "Q1";
    else if (X < -0.05 && Y > 0.05) label = "Q2";
    else if (X < -0.05 && Y < -0.05) label = "Q3";
    else if (X > 0.05 && Y < -0.05) label = "Q4";
    return { X: Math.round(X * 100) / 100, Y: Math.round(Y * 100) / 100, label, missing: false };
  }, [signature]);

  const layerMix = useMemo(() => {
    const sumSlice = (start: number, end: number) => signature.slice(start, end + 1).reduce((a, b) => a + b, 0);
    const p = sumSlice(0, 63);
    const d = sumSlice(64, 127);
    const s = sumSlice(128, 191);
    const sp = sumSlice(192, 255);
    const total = p + d + s + sp || 1;
    return {
      physical: Math.round((p / total) * 100),
      digital: Math.round((d / total) * 100),
      social: Math.round((s / total) * 100),
      spiritual: Math.round((sp / total) * 100),
    };
  }, [signature]);

  const topIndices = useMemo(() => {
    const sorted = signature.map((val, idx) => ({ val, idx })).sort((a, b) => b.val - a.val);
    return new Set(sorted.slice(0, 12).map((d) => d.idx));
  }, [signature]);

  return (
    <StepLayout>
      <StepContent>
        <div className="w-full">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-2">
              {t('review.title')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {t('review.subtitle')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Left: Matrix — 60% */}
            <div className="lg:w-[60%] min-w-0">
              <div className="relative">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Twin Matrix Projection (256D)
                </h3>
                <div>
                  <div className="flex flex-col gap-[2px]" style={{ fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace" }}>
                    {Array.from({ length: 16 }, (_, row) => {
                      const isTopHalf = row < 8;
                      return (
                        <div key={row} className={`flex items-center gap-[2px] ${row === 8 ? "mt-[2px]" : ""}`}>
                          <span className="text-[8px] text-muted-foreground/25 font-mono w-7 text-right shrink-0">
                            {(row * 16).toString(16).toUpperCase().padStart(4, "0")}
                          </span>
                          {Array.from({ length: 16 }, (_, col) => {
                            const isLeftHalf = col < 8;
                            let sliceIdx: number;
                            let localRow: number;
                            let localCol: number;
                            if (isTopHalf && isLeftHalf) { sliceIdx = 0; localRow = row; localCol = col; }
                            else if (isTopHalf && !isLeftHalf) { sliceIdx = 1; localRow = row; localCol = col - 8; }
                            else if (!isTopHalf && isLeftHalf) { sliceIdx = 2; localRow = row - 8; localCol = col; }
                            else { sliceIdx = 3; localRow = row - 8; localCol = col - 8; }
                            const slice = SLICES[sliceIdx];
                            const idx = slice.range[0] + localRow * 8 + localCol;
                            const val = signature[idx] ?? 0;
                            const intensity = val / 255;
                            const isTop = topIndices.has(idx);
                            const isHovered = hoveredCell === idx;
                            const borderColor = val > 0
                              ? `rgba(${slice.color}, ${0.6 + 0.4 * intensity})`
                              : 'hsl(var(--foreground) / 0.2)';
                            const textColor = val > 0
                              ? `rgba(${slice.color}, ${0.7 + 0.3 * intensity})`
                              : 'hsl(var(--foreground) / 0.35)';
                            return (
                              <div
                                key={col}
                                className={`rounded-full flex items-center justify-center cursor-default relative transition-transform duration-150 ${col === 8 ? "ml-[2px]" : ""}`}
                                style={{
                                  width: "clamp(1.1rem, 2.5vw, 1.6rem)", height: "clamp(1.1rem, 2.5vw, 1.6rem)", aspectRatio: "1",
                                  border: `1px solid ${borderColor}`,
                                  background: val > 0 ? `rgba(${slice.color}, ${0.1 + intensity * 0.15})` : "transparent",
                                  boxShadow: isTop && val > 0
                                    ? `0 0 3px rgba(${slice.color}, ${intensity * 0.15})`
                                    : "none",
                                  transform: isHovered ? "scale(1.15)" : "scale(1)",
                                }}
                                onMouseEnter={() => setHoveredCell(idx)}
                                onMouseLeave={() => setHoveredCell(null)}
                              >
                                <span className="text-[6px] font-mono" style={{ color: textColor, textShadow: isTop && val > 0 ? `0 0 2px rgba(${slice.color}, 0.2)` : 'none' }}>
                                  {val.toString(16).toUpperCase().padStart(2, "0")}
                                </span>
                                {isHovered && (
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                                    D{idx}: {val} ({t(slice.labelKey)})
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 3 data sections — 40%, no glass cards, vertically centered */}
            <div className="lg:w-[40%] space-y-6">
              {/* Soul Quadrant */}
              <div className="space-y-2 rounded-2xl p-5" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-widest">{t('review.quadrant')}</h3>
                {quadrant.missing ? (
                  <p className="text-sm text-muted-foreground/50">{t('review.incompleteAxis')}</p>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">{quadrant.label}</div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{t('review.axisX')}: {quadrant.X}</p>
                      <p>{t('review.axisY')}: {quadrant.Y}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-2xl p-5" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-widest">{t('review.density')}</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-foreground">{identityDensity}%</span>
                  <span className="text-xs text-muted-foreground mb-1">{t('review.densityOf')}</span>
                </div>
                <div className="h-[3px] bg-transparent rounded-full overflow-visible">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${identityDensity}%`,
                    background: "rgba(10, 255, 255, 0.5)",
                    boxShadow: "0 0 6px rgba(10, 255, 255, 0.5), 0 0 14px rgba(10, 255, 255, 0.25)",
                  }} />
                </div>
              </div>

              <div className="space-y-2 rounded-2xl p-5" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-widest">{t('review.layerMix')}</h3>
                {[
                  { label: t('common.physical'), value: layerMix.physical, color: "255, 60, 100" },
                  { label: t('common.digital'), value: layerMix.digital, color: "60, 180, 255" },
                  { label: t('common.social'), value: layerMix.social, color: "255, 200, 40" },
                  { label: t('common.spiritual'), value: layerMix.spiritual, color: "100, 200, 50" },
                ].map((layer) => (
                  <div key={layer.label} className="space-y-1">
                    <div className="flex justify-between text-base">
                      <span className="text-foreground/70">{layer.label}</span>
                      <span className="text-muted-foreground">{layer.value}%</span>
                    </div>
                    <div className="h-[3px] bg-transparent rounded-full overflow-visible">
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${layer.value}%`,
                        background: `rgba(${layer.color}, 0.6)`,
                        boxShadow: `0 0 5px rgba(${layer.color}, 0.6), 0 0 12px rgba(${layer.color}, 0.3)`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA centered */}
          {networkMismatch && (
            <div className="max-w-[520px] mx-auto mt-6 mb-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
              <p className="text-xs text-amber-200">
                {t('review.wrongNetwork').replace('{network}', expectedNetworkLabel)}
              </p>
              <button
                onClick={onSwitchNetwork}
                disabled={!onSwitchNetwork || switchingNetwork}
                className="mt-2 btn-twin btn-twin-ghost py-1.5 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {switchingNetwork ? t('review.switching') : t('review.switchTo').replace('{network}', expectedNetworkLabel)}
              </button>
            </div>
          )}
          <div className="flex gap-3 max-w-[520px] mx-auto mt-10">
            <button onClick={onBack} className="btn-twin btn-twin-ghost flex-1 py-2.5 text-sm">
              {t('review.refine')}
            </button>
            <button
              onClick={onPrimaryAction ?? onNext}
              disabled={primaryActionLoading || primaryActionDisabled}
              className="btn-twin btn-twin-primary btn-glow flex-1 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {primaryActionLoading ? t('review.pending') : (primaryActionLabel ?? t('review.commitState'))}
            </button>
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
