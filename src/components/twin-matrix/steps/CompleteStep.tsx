import { useMemo } from 'react';
import { StepLayout, StepContent, StepFooter } from '../StepLayout';
import { useI18n } from '@/lib/i18n';

const DIMENSION_MAP: Record<number, { layer: string; name: string }> = {
  206: { layer: 'Spiritual', name: 'Outcome' },
  207: { layer: 'Spiritual', name: 'Experience' },
  208: { layer: 'Spiritual', name: 'Control' },
  209: { layer: 'Spiritual', name: 'Release' },
  155: { layer: 'Social', name: 'Solo' },
  156: { layer: 'Social', name: 'Group' },
  85: { layer: 'Digital', name: 'Passive' },
  86: { layer: 'Digital', name: 'Active' },
};

const SLICES = [
  { label: 'Physical', range: [0, 63] as const, color: '255, 60, 100' },
  { label: 'Digital', range: [64, 127] as const, color: '60, 180, 255' },
  { label: 'Social', range: [128, 191] as const, color: '255, 200, 40' },
  { label: 'Spiritual', range: [192, 255] as const, color: '100, 200, 50' },
];

interface Props {
  signature: number[];
  agentName: string;
  onActivateAgent: () => void;
  onDashboard: () => void;
}

function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

function generateHash(sig: number[]): string {
  const hex = sig.slice(0, 16).map(v => v.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}

function generateSBTId(): string {
  return `SBT-${Math.floor(Math.random() * 900000 + 100000)}`;
}

/* Glowing divider with animated light trace */
const GlowDivider = ({ vertical = false }: { vertical?: boolean }) => (
  <div className={`relative ${vertical ? 'w-px h-full mx-6' : 'w-full h-px my-6'}`}>
    <div className="absolute inset-0" style={{
      background: vertical
        ? 'linear-gradient(180deg, transparent, rgba(255,255,255,0.04), transparent)'
        : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
    }} />
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={`absolute ${vertical ? 'left-0 w-full h-[60px]' : 'top-0 h-full w-[60px]'}`}
        style={{
          background: vertical
            ? 'linear-gradient(180deg, transparent, rgba(10, 255, 255, 0.25), rgba(173, 255, 255, 0.15), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(10, 255, 255, 0.25), rgba(173, 255, 255, 0.15), transparent)',
          animation: vertical ? 'divider-trace-v 6s linear infinite' : 'divider-trace 6s linear infinite',
        }}
      />
    </div>
  </div>
);

export const CompleteStep = ({ signature, onActivateAgent, onDashboard }: Props) => {
  const { t } = useI18n();
  const walletAddress = useMemo(() => generateWalletAddress(), []);
  const identityHash = useMemo(() => generateHash(signature), [signature]);
  const sbtId = useMemo(() => generateSBTId(), []);

  const dominantDimensions = useMemo(() => {
    return signature
      .map((val, idx) => {
        const mapped = DIMENSION_MAP[idx];
        const slice = SLICES.find(s => idx >= s.range[0] && idx <= s.range[1]);
        return {
          idx,
          value: val / 255,
          layer: mapped?.layer || slice?.label || 'Unknown',
          name: mapped?.name || `D${idx}`,
        };
      })
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [signature]);

  return (
    <StepLayout>
      <StepContent>
        <div className="flex flex-col items-center text-center px-4">
          <div className="text-3xl mb-6 font-heading font-bold text-foreground/20">⬡</div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{t('complete.title')}</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            {t('complete.subtitle')}
          </p>

          {/* Top row: Identity Hash (left) + Minted SBT ID (right) */}
          <div className="max-w-2xl w-full">
            <div className="flex items-start">
              {/* Identity Hash */}
              <div className="flex-1 text-left space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('complete.hash')}</p>
                <p className="text-sm font-mono text-foreground/70 break-all">{identityHash}</p>
              </div>

              <GlowDivider vertical />

              {/* Minted SBT ID */}
              <div className="flex-1 text-left space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('complete.sbtId')}</p>
                <p className="text-sm font-mono text-foreground">{sbtId}</p>
                <div className="space-y-1 mt-2">
                  <p className="text-sm" style={{ color: '#F24455' }}>{t('complete.boundWallet')}</p>
                  <p className="text-sm text-muted-foreground font-mono break-all">{walletAddress}</p>
                </div>
              </div>
            </div>

            <GlowDivider />

            {/* Bottom row: Dominant Dimensions (left) + Vector Imprint (right) */}
            <div className="flex items-start">
              {/* Dominant Dimensions */}
              <div className="flex-1 text-left space-y-2.5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('complete.dominantDim')}</p>
                <div className="space-y-1.5">
                  {dominantDimensions.map(d => (
                    <div key={d.idx} className="flex items-center justify-between pr-4">
                      <span className="text-sm font-light text-foreground/60">
                        {d.layer} · {d.name}
                      </span>
                      <span className="text-xs text-muted-foreground/60 font-mono font-light">
                        {d.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <GlowDivider vertical />

              {/* Vector Imprint */}
              <div className="flex-1 text-left space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{t('complete.vectorImprint')}</p>
                <p className="text-sm text-muted-foreground/50">{t('complete.snapshot')}</p>
                <div className="space-y-3">
                  {SLICES.map(slice => {
                    const sliceData = signature.slice(slice.range[0], slice.range[1] + 1);
                    return (
                      <div key={slice.label}>
                        <p className="text-xs text-muted-foreground/30 uppercase tracking-wider mb-1 font-light">{slice.label}</p>
                        <div className="flex flex-wrap gap-px">
                          {sliceData.map((v, i) => {
                            const intensity = v / 255;
                            const cellOpacity = v > 0 ? 0.25 + 0.75 * intensity : 0.03;
                            return (
                              <div
                                key={i}
                                className="rounded-[1px]"
                                style={{
                                  width: 10,
                                  height: 10,
                                  aspectRatio: '1',
                                  background: v > 0
                                    ? `rgba(${slice.color}, ${cellOpacity * 0.5})`
                                    : 'hsl(var(--foreground) / 0.02)',
                                  boxShadow: v > 150
                                    ? `0 0 4px rgba(${slice.color}, ${cellOpacity * 0.4})`
                                    : 'none',
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </StepContent>

      <StepFooter>
        <div className="space-y-2">
          <button onClick={onActivateAgent} className="btn-twin btn-twin-primary btn-glow w-full py-2.5 text-sm">
            {t('complete.activateAgent')}
          </button>
          <button onClick={onDashboard} className="btn-twin btn-twin-ghost w-full py-2 text-sm">
            {t('complete.returnDashboard')}
          </button>
        </div>
      </StepFooter>

      <style>{`
        @keyframes divider-trace {
          0% { left: -60px; }
          100% { left: 100%; }
        }
        @keyframes divider-trace-v {
          0% { top: -60px; }
          100% { top: 100%; }
        }
      `}</style>
    </StepLayout>
  );
};
