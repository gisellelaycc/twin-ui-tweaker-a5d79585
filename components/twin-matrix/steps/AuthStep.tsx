import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { BaseError, isAddress, type Address } from 'viem';
import { useChainId, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi';
import type { AgentSetup, AgentDefinition, AgentPermission } from '@/types/twin-matrix';
import { TaskCapabilitySection } from './TaskCapabilitySection';
import lobsterIcon from '@/assets/openclaw.svg';
import { useI18n } from '@/lib/i18n';
import { BSC_TESTNET_CHAIN_ID } from '@/lib/wallet/config';
import { TWIN_MATRIX_SBT_ADDRESS, twinMatrixSbtAbi } from '@/lib/contracts/twin-matrix-sbt';

/* ── Saved Agent Record ── */
interface SavedAgent {
  id: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE';
  agent: AgentDefinition;
  permission: AgentPermission;
  telegramConnected: boolean;
  backendAgentId?: string;
  deepLink?: string;
  agentAddress?: string;
}

/* ── Particle Canvas (lobster silhouette) ── */
const LOBSTER_PIXELS = [
  [3, 0], [13, 0], [2, 1], [14, 1], [1, 2], [15, 2],
  [2, 3], [3, 3], [4, 3], [1, 4], [2, 4], [4, 4], [5, 4], [1, 5], [2, 5], [3, 5], [5, 5],
  [12, 3], [13, 3], [14, 3], [11, 4], [12, 4], [14, 4], [15, 4], [11, 5], [13, 5], [14, 5], [15, 5],
  [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4],
  [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5],
  [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7],
  [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9],
  [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11],
  [3, 7], [4, 7], [3, 9], [4, 9], [3, 11], [4, 11], [12, 7], [13, 7], [12, 9], [13, 9], [12, 11], [13, 11],
  [6, 12], [7, 12], [8, 12], [9, 12], [10, 12], [7, 13], [8, 13], [9, 13],
  [6, 14], [7, 14], [8, 14], [9, 14], [10, 14], [5, 15], [7, 15], [8, 15], [9, 15], [11, 15]
];

interface Particle { x: number; y: number; tx: number; ty: number; ox: number; oy: number; size: number; opacity: number; }

const CORNERS = [
  { xr: 0.02, yr: 0.02 }, { xr: 0.82, yr: 0.02 },
  { xr: 0.02, yr: 0.72 }, { xr: 0.82, yr: 0.72 }
];

const ParticleCanvas = ({ width, height }: { width: number; height: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timerRef = useRef(0);
  const cornerIdxRef = useRef(Math.floor(Math.random() * 4));

  const setTargetsToCorner = useCallback((particles: Particle[], ci: number) => {
    const scale = Math.min(width, height) * 0.016;
    const cx = width * CORNERS[ci].xr;
    const cy = height * CORNERS[ci].yr;
    particles.forEach((p, i) => {
      if (i < LOBSTER_PIXELS.length) {
        p.tx = cx + LOBSTER_PIXELS[i][0] * scale;
        p.ty = cy + LOBSTER_PIXELS[i][1] * scale;
      }
    });
  }, [width, height]);

  const initParticles = useCallback(() => {
    const scale = Math.min(width, height) * 0.016;
    const ci = cornerIdxRef.current;
    const cx = width * CORNERS[ci].xr;
    const cy = height * CORNERS[ci].yr;
    const particles: Particle[] = LOBSTER_PIXELS.map(([px, py]) => ({
      x: Math.random() * width, y: Math.random() * height,
      tx: cx + px * scale, ty: cy + py * scale,
      ox: Math.random() * width, oy: Math.random() * height,
      size: 2.5 + Math.random() * 2, opacity: 0.08 + Math.random() * 0.14
    }));
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width; const y = Math.random() * height;
      particles.push({ x, y, tx: x, ty: y, ox: x, oy: y, size: 1.5 + Math.random() * 2, opacity: 0.02 + Math.random() * 0.05 });
    }
    particlesRef.current = particles;
    timerRef.current = 0;
  }, [width, height]);

  useEffect(() => {
    if (!width || !height) return;
    initParticles();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const GATHER = 180, HOLD = 120, SCATTER = 180;
    const TOTAL = GATHER + HOLD + SCATTER;
    const animate = () => {
      timerRef.current++;
      const t = timerRef.current % TOTAL;
      ctx.clearRect(0, 0, width, height);
      if (t === 0) {
        cornerIdxRef.current = (cornerIdxRef.current + 1) % 4;
        setTargetsToCorner(particlesRef.current, cornerIdxRef.current);
        for (const p of particlesRef.current) { p.ox = p.x; p.oy = p.y; }
      }
      for (const p of particlesRef.current) {
        if (t < GATHER) {
          const ease = (t / GATHER) ** 2 * (3 - 2 * (t / GATHER));
          p.x = p.ox + (p.tx - p.ox) * ease;
          p.y = p.oy + (p.ty - p.oy) * ease;
        } else if (t < GATHER + HOLD) {
          p.x = p.tx + Math.sin(timerRef.current * 0.02 + p.tx) * 0.5;
          p.y = p.ty + Math.cos(timerRef.current * 0.02 + p.ty) * 0.5;
        } else {
          const progress = ((t - GATHER - HOLD) / SCATTER) ** 2;
          const nx = p.ox + (Math.random() - 0.5) * 40;
          const ny = p.oy + (Math.random() - 0.5) * 40;
          p.x = p.tx + (nx - p.tx) * progress;
          p.y = p.ty + (ny - p.ty) * progress;
        }
        const phase = t < GATHER ? 'gather' : t < GATHER + HOLD ? 'hold' : 'scatter';
        const glowOpacity = phase === 'hold' ? p.opacity * 1.2 : p.opacity;
        const s = p.size;
        ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity})`;
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
        if (phase === 'hold') {
          ctx.fillStyle = `rgba(242, 68, 85, ${glowOpacity * 0.1})`;
          ctx.fillRect(Math.round(p.x - s * 1.5), Math.round(p.y - s * 1.5), s * 3, s * 3);
        }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [width, height, initParticles, setTargetsToCorner]);

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.35 }} />;
};

/* ── Thin Divider ── */
const ThinDivider = () => (
  <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.15), transparent)' }} />
);

/* ── Constants ── */
const IDENTITY_SCOPES = ['Physical', 'Digital', 'Social', 'Spiritual'];
const DURATION_OPTIONS = ['7 days', '30 days', 'Custom'];

const defaultAgent: AgentDefinition = { name: '', taskTypes: [], matchingStrategy: [], behaviorMode: 'Active search', capabilities: {} };
const defaultPermission: AgentPermission = {
  identityScope: 'Physical', identityScopes: ['Physical'], tradingAuthority: 'Manual Only',
  authorizationDuration: '', customDurationDays: '',
  maxPerTask: '', dailyCap: '', weeklyCap: '', spendResetPolicy: [], taskTypeBound: false, brandRestriction: false
};

type SubStep = 'list' | 'create' | 'config' | 'telegram' | 'resolving' | 'activated';

const QUADRANT_RANGES: Record<string, [number, number]> = {
  Physical: [0, 63],
  Digital: [64, 127],
  Social: [128, 191],
  Spiritual: [192, 255],
};

function getAgentApiBase(): string {
  const baseEnv = (import.meta.env.VITE_BACKEND_API_BASE_URL ?? '').trim().replace(/\/+$/, '');
  return baseEnv || '/api';
}

function buildPermissionMaskFromQuadrants(scopes: string[]): bigint {
  let mask = 0n;
  for (const scope of scopes) {
    const range = QUADRANT_RANGES[scope];
    if (!range) continue;
    const [start, end] = range;
    const bitLength = BigInt(end - start + 1);
    const segment = ((1n << bitLength) - 1n) << BigInt(start);
    mask |= segment;
  }
  return mask;
}

function resolveExpirySeconds(permission: AgentPermission): number | null {
  if (permission.authorizationDuration === '7 days') return 7 * 24 * 60 * 60;
  if (permission.authorizationDuration === '30 days') return 30 * 24 * 60 * 60;
  if (permission.authorizationDuration === 'Custom') {
    const days = Number.parseInt(permission.customDurationDays, 10);
    if (!Number.isFinite(days) || days <= 0) return null;
    return days * 24 * 60 * 60;
  }
  return null;
}

interface Props {
  data: AgentSetup;
  onUpdate: (d: AgentSetup) => void;
  onNext: () => void;
  onDashboard: () => void;
  ownerAddress?: string;
  tokenId?: bigint | null;
}

export const AuthStep = ({ data, onUpdate, onNext, onDashboard, ownerAddress, tokenId }: Props) => {
  const { t } = useI18n();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: BSC_TESTNET_CHAIN_ID });
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);
  const [subStep, setSubStep] = useState<SubStep>('create');
  const [agentName, setAgentName] = useState('');
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentDefinition>({ ...defaultAgent });
  const [permission, setPermission] = useState<AgentPermission>({ ...defaultPermission, identityScopes: ['Physical'] });
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [viewingAgentId, setViewingAgentId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolveStatusText, setResolveStatusText] = useState<string>(t('agent.waitingTelegram'));
  const [isBindingAgent, setIsBindingAgent] = useState(false);
  const [bindTxHash, setBindTxHash] = useState<string | null>(null);
  const [bindCompleted, setBindCompleted] = useState(false);
  const canCreateAgent = tokenId !== null && tokenId !== undefined;
  const isWrongNetwork = chainId !== BSC_TESTNET_CHAIN_ID;
  const resolveSessionRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setDims({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const generateId = () => `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const handleCreateAgent = () => {
    if (!canCreateAgent) {
      toast.error(t('wizard.needMintBeforeAgent'));
      return;
    }
    if (!agentName.trim()) return;
    const id = generateId();
    const newAgent: SavedAgent = {
      id, name: agentName.trim(), status: 'DRAFT',
      agent: { ...defaultAgent, name: agentName.trim() },
      permission: { ...defaultPermission, identityScopes: ['Physical'] },
      telegramConnected: false
    };
    setSavedAgents((prev) => [...prev, newAgent]);
    setCurrentAgentId(id);
    setAgent({ ...defaultAgent, name: agentName.trim() });
    setPermission({ ...defaultPermission, identityScopes: ['Physical'] });
    setTelegramConnected(false);
    setSubStep('config');
  };

  const handleSaveConfig = async () => {
    if (!currentAgentId) return;
    if (!ownerAddress || tokenId === null || tokenId === undefined) {
      toast.error(t('agent.error.walletTokenMissing'));
      return;
    }

    try {
      setIsRegistering(true);
      const baseUrl = getAgentApiBase();
      const endpoint = `${baseUrl}/v1/agent/register`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ownerAddress,
          tokenId: tokenId.toString(),
          agentName: agent.name || agentName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const payload = await response.json() as { agentId?: string; deepLink?: string };
      if (!payload.agentId || !payload.deepLink) {
        throw new Error('Register API response missing agentId or deepLink.');
      }

      setSavedAgents((prev) => prev.map((a) =>
        a.id === currentAgentId
          ? {
            ...a,
            agent: { ...agent },
            permission: { ...permission },
            backendAgentId: payload.agentId,
            deepLink: payload.deepLink,
          }
          : a
      ));
      onUpdate({ agent, permission });
      setSubStep('telegram');
      toast.success('Agent registered. Continue to connect Telegram.');
    } catch (error) {
      toast.error(`Failed to register agent: ${String(error)}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleConnectTelegram = async () => {
    if (!currentSavedAgent?.deepLink || !currentSavedAgent.backendAgentId) {
      toast.error(t('agent.error.missingDeepLink'));
      return;
    }

    window.open(currentSavedAgent.deepLink, '_blank', 'noopener,noreferrer');
    setTelegramConnected(true);
    setResolveError(null);
    setResolveStatusText(t('agent.waitingTelegram'));
    setSubStep('resolving');

    const baseUrl = getAgentApiBase();
    const resolveEndpoint = `${baseUrl}/v1/agent/resolve?agentId=${encodeURIComponent(currentSavedAgent.backendAgentId)}`;
    const sessionId = ++resolveSessionRef.current;
    try {
      const maxAttempts = 120;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (resolveSessionRef.current !== sessionId) return;

        const response = await fetch(resolveEndpoint, { method: 'GET' });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }

        const payload = await response.json() as {
          status?: string;
          agentAddress?: string;
          updatedAt?: string;
        };

        const agentAddress = (payload.agentAddress ?? '').trim();
        if (agentAddress) {
          if (currentAgentId) {
            setSavedAgents((prev) => prev.map((a) =>
              a.id === currentAgentId
                ? { ...a, status: 'ACTIVE', telegramConnected: true, agentAddress }
                : a
            ));
          }
          setSubStep('activated');
          toast.success('Agent wallet resolved on-chain.');
          return;
        }

        setResolveStatusText(`Polling backend... (${attempt + 1}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      throw new Error('Timed out while waiting for agentAddress.');
    } catch (error) {
      const message = String(error);
      setResolveError(message);
      setTelegramConnected(false);
      setSubStep('telegram');
      toast.error(`Failed to resolve agentAddress: ${message}`);
    }
  };

  const handleCreateAnother = () => {
    resolveSessionRef.current += 1;
    setAgentName('');
    setCurrentAgentId(null);
    setViewingAgentId(null);
    setBindTxHash(null);
    setBindCompleted(false);
    setResolveError(null);
    setSubStep('list');
  };

  const handleBindAgentPermission = async () => {
    if (!publicClient || tokenId === null || tokenId === undefined) {
      toast.error(t('agent.error.missingTokenId'));
      return;
    }

    if (isWrongNetwork) {
      toast.error(t('agent.error.switchBscBeforeBind'));
      return;
    }

    const agentAddress = currentSavedAgent?.agentAddress;
    if (!agentAddress || !isAddress(agentAddress)) {
      toast.error('Invalid or missing agentAddress from resolve API.');
      return;
    }

    const scopes = permission.identityScopes || [];
    const newMask = buildPermissionMaskFromQuadrants(scopes);
    if (newMask === 0n) {
      toast.error(t('agent.error.selectScope'));
      return;
    }

    const expiryOffset = resolveExpirySeconds(permission);
    if (!expiryOffset) {
      toast.error(t('agent.error.selectDuration'));
      return;
    }
    const expiry = BigInt(Math.floor(Date.now() / 1000) + expiryOffset);

    try {
      setIsBindingAgent(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hash = await (writeContractAsync as any)({
        address: TWIN_MATRIX_SBT_ADDRESS,
        abi: twinMatrixSbtAbi,
        functionName: 'bindAgentAndGrantPermission',
        args: [tokenId, agentAddress as Address, newMask, expiry],
        chainId: BSC_TESTNET_CHAIN_ID,
      });
      setBindTxHash(hash);
      toast.info(t('agent.bindingSubmitted'));
      await publicClient.waitForTransactionReceipt({ hash });
      setBindCompleted(true);
      toast.success('Agent bound and permission granted.', {
        description: (
          <a
            href={`https://testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View tx on BscScan
          </a>
        ),
      });
    } catch (error) {
      const message = error instanceof BaseError ? error.shortMessage : String(error);
      toast.error(`Bind permission failed: ${message}`);
    } finally {
      setIsBindingAgent(false);
    }
  };

  const currentSavedAgent = currentAgentId ? savedAgents.find((a) => a.id === currentAgentId) : null;
  const viewingAgent = viewingAgentId ? savedAgents.find((a) => a.id === viewingAgentId) : null;

  return (
    <div ref={containerRef} className="relative h-full">

      <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-0">
          <button
            onClick={() => {
              if (subStep === 'list') {
                onDashboard();
              } else if (subStep === 'create' || subStep === 'config') {
                setSubStep('list');
              } else if (subStep === 'telegram') {
                setSubStep('config');
              } else if (subStep === 'resolving' || subStep === 'activated') {
                setSubStep('telegram');
              }
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {subStep === 'list' ? '← Back to Agent Page' : '← Back'}
          </button>
        </div>
        <div className="max-w-lg mx-auto px-6 py-10 space-y-0">

          {/* ═══ Sub-step: LIST ═══ */}
          {subStep === 'list' && (
            <div className="animate-fade-in space-y-0">
              <div className="text-center pb-6">
                <h2 className="font-heading font-extrabold leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>{t('agent.yourAgents')}</h2>
                <p className="text-base md:text-lg text-muted-foreground mt-1">{t('agent.manageCreate')}</p>
              </div>

              <ThinDivider />

              {savedAgents.length > 0 && savedAgents.map((sa) => (
                <div key={sa.id}>
                  <div
                    className="py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => setViewingAgentId(viewingAgentId === sa.id ? null : sa.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background: sa.status === 'ACTIVE' ? '#F24455' : 'rgba(255,255,255,0.2)',
                          boxShadow: sa.status === 'ACTIVE' ? '0 0 6px rgba(242,68,85,0.4)' : 'none',
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{sa.name}</p>
                        <p className="text-sm text-muted-foreground/50">{sa.id.slice(0, 16)}…</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${sa.status === 'ACTIVE' ? 'text-[#F24455]' : 'text-muted-foreground/50'}`}>
                      {sa.status}
                    </span>
                  </div>

                  {viewingAgentId === sa.id && viewingAgent && (
                    <div className="pb-4 space-y-3 text-sm animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">{t('agent.scope')}</span><span className="text-foreground/70">{(viewingAgent.permission.identityScopes || []).join(', ')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">{t('agent.telegram')}</span><span className={viewingAgent.telegramConnected ? 'text-[#F24455]' : 'text-muted-foreground/40'}>{viewingAgent.telegramConnected ? t('agent.connected') : t('agent.notConnected')}</span></div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentAgentId(sa.id);
                          setAgent({ ...viewingAgent.agent });
                          setPermission({ ...viewingAgent.permission });
                          setAgentName(viewingAgent.name);
                          setTelegramConnected(viewingAgent.telegramConnected);
                          setViewingAgentId(null);
                          setSubStep('config');
                        }}
                        className="w-full text-sm py-2 rounded-lg border border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-colors"
                      >
                        {t('agent.editAuth')}
                      </button>
                    </div>
                  )}

                  <ThinDivider />
                </div>
              ))}

              <div className="pt-6">
                <button onClick={() => { setAgentName(''); setSubStep('create'); }} className="btn-twin btn-twin-primary btn-glow w-full py-3">
                  <Plus className="w-4 h-4" /> {t('agent.createNew')}
                </button>
              </div>
            </div>
          )}

          {/* ═══ Sub-step A+B: CREATE & CONFIG (single continuous page) ═══ */}
          {(subStep === 'create' || subStep === 'config') && (
            <div className="animate-fade-in space-y-0">
              {savedAgents.length > 0 && !currentAgentId && (
                <div className="pb-4">
                  <button onClick={() => setSubStep('list')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← View existing agents ({savedAgents.length})
                  </button>
                </div>
              )}

              <div className="text-center pb-8">
                <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 8px rgba(242,68,85,0.5))', opacity: 0.9 }} />
                <h2 className="font-heading font-extrabold leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>{t('agent.activate')}</h2>
                <p className="text-base md:text-lg text-muted-foreground mt-1">{t('agent.activateDesc')}</p>
              </div>

              <ThinDivider />

              {/* Agent Name — editable when not yet created, read-only after */}
              {!currentAgentId ? (
                <div className="py-6 space-y-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">{t('agent.name')}</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateAgent()}
                    placeholder={t('agent.namePlaceholder')}
                    className="w-full bg-transparent border-b border-foreground/10 px-0 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-foreground/30 transition-colors"
                  />
                  <div className="pt-2">
                    <button
                      onClick={handleCreateAgent}
                      disabled={!canCreateAgent || !agentName.trim()}
                      className={`btn-twin btn-twin-primary w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed ${agentName.trim() ? 'btn-glow' : ''}`}
                    >
                      {t('agent.next')}
                    </button>
                  </div>
                </div>
              ) : (
                <>

                  {/* Agent Name (read-only) */}
                  <div className="py-5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Agent</span>
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <img src={lobsterIcon} alt="" className="w-4 h-4" style={{ filter: 'drop-shadow(0 0 4px rgba(242,68,85,0.4))', opacity: 0.8 }} />
                      {agent.name}
                    </span>
                  </div>

                  <ThinDivider />

                  {/* ── Config section (appears inline after agent created) ── */}
                  <div className="animate-fade-in">
                    {/* Scope */}
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">{t('agent.scope')}</label>
                      <p className="text-sm text-muted-foreground/50">{t('agent.scopeHint')}</p>
                      <div className="flex gap-2">
                        {IDENTITY_SCOPES.map((s) => {
                          const scopes = permission.identityScopes || ['Physical'];
                          const selected = scopes.includes(s);
                          return (
                            <button key={s} onClick={() => {
                              const next = selected ? scopes.filter((x) => x !== s) : [...scopes, s];
                              setPermission((p) => ({ ...p, identityScopes: next, identityScope: next[0] || '' }));
                            }}
                              className={`text-sm px-4 py-1.5 rounded-full transition-all ${selected ? 'text-foreground border-2' : 'text-muted-foreground/60 border border-foreground/20 hover:border-foreground/30'}`}
                              style={selected ? { borderColor: 'rgba(242,68,85,0.4)', background: 'rgba(242,68,85,0.08)', color: 'rgba(242,68,85,0.9)' } : {}}>
                              {t(`common.${s.toLowerCase()}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <ThinDivider />

                    {/* Authorization Duration */}
                    <div className="py-5 space-y-3">
                      <label className="text-xs text-muted-foreground uppercase tracking-widest">{t('agent.authDuration')}</label>
                      <div className="space-y-2">
                        {DURATION_OPTIONS.map((d) => (
                          <div key={d} className="flex items-center gap-3 cursor-pointer" onClick={() => setPermission((p) => ({ ...p, authorizationDuration: d, customDurationDays: d === 'Custom' ? p.customDurationDays : '' }))}>
                            <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: permission.authorizationDuration === d ? '#F24455' : 'hsl(var(--foreground) / 0.25)' }}>
                              {permission.authorizationDuration === d && <span className="w-2 h-2 rounded-full" style={{ background: '#F24455' }} />}
                            </span>
                            <span className="text-sm text-foreground/80">{t(d === '7 days' ? 'duration.7days' : d === '30 days' ? 'duration.30days' : 'duration.custom')}</span>
                          </div>
                        ))}
                      </div>
                      {permission.authorizationDuration === 'Custom' && (
                        <div className="animate-fade-in flex items-center gap-2 pt-1">
                          <span className="text-sm text-muted-foreground">{t('agent.days')}</span>
                          <input type="number" min="1" value={permission.customDurationDays}
                            onChange={(e) => setPermission((p) => ({ ...p, customDurationDays: e.target.value.replace(/[^0-9]/g, '') }))}
                            placeholder={t('agent.customDaysPlaceholder')}
                            className="flex-1 bg-transparent border-b border-foreground/10 px-0 py-1.5 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
                        </div>
                      )}
                    </div>

                    <ThinDivider />

                    {/* Actions */}
                    <div className="pt-6 space-y-3">
                      <button onClick={handleSaveConfig}
                        disabled={isRegistering || !ownerAddress || tokenId === null || tokenId === undefined}
                        className="btn-twin btn-twin-primary btn-glow w-full py-3 disabled:opacity-30 disabled:cursor-not-allowed">
                        {isRegistering ? t('agent.creating') : t('agent.createAgent')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ Sub-step C: TELEGRAM ═══ */}
          {subStep === 'telegram' && (
            <div className="animate-fade-in space-y-0">
              <div className="text-center pb-8">
                <h2 className="font-heading font-extrabold leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>{t('telegram.title')}</h2>
                <p className="text-base md:text-lg text-muted-foreground mt-1">{t('telegram.subtitle')}</p>
              </div>

              <ThinDivider />

              <div className="py-6 text-center space-y-4">
                <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(242,68,85,0.5))', opacity: 0.9 }} />
                <div>
                  <p className="text-sm font-medium">{currentSavedAgent?.name || agent.name}</p>
                  <p className="text-sm text-muted-foreground/50 mt-1">{t('telegram.statusDraft')}</p>
                </div>
              </div>

              <ThinDivider />

              <div className="pt-6">
                {!telegramConnected ? (
                  <button onClick={() => { void handleConnectTelegram(); }} className="btn-twin btn-twin-primary btn-glow w-full py-3">
                    {t('telegram.connect')}
                  </button>
                ) : (
                  <p className="text-sm text-center" style={{ color: '#F24455' }}>{t('telegram.connectedLabel')}</p>
                )}
                {resolveError && (
                  <p className="text-sm text-destructive text-center mt-3 break-all">{resolveError}</p>
                )}
                <p className="text-sm text-muted-foreground/40 text-center mt-3">{t('telegram.hint')}</p>
              </div>
            </div>
          )}

          {/* ═══ Sub-step D: RESOLVING ═══ */}
          {subStep === 'resolving' && (
            <div className="animate-fade-in space-y-0">
              <div className="text-center pb-8">
                <h2 className="font-heading font-extrabold leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>{t('agent.waitingWallet')}</h2>
                <p className="text-base md:text-lg text-muted-foreground mt-1">Telegram confirmed. We are waiting for backend to return agentAddress.</p>
              </div>

              <ThinDivider />

              <div className="py-8 text-center space-y-4">
                <div className="w-10 h-10 mx-auto rounded-full border border-[#F24455]/30 border-t-[#F24455] animate-spin" />
                <p className="text-sm text-muted-foreground">{resolveStatusText}</p>
                {currentSavedAgent?.backendAgentId && (
                  <p className="text-sm text-muted-foreground/60 font-mono break-all">
                    {t('agent.agentId')}: {currentSavedAgent.backendAgentId}
                  </p>
                )}
              </div>

              <ThinDivider />

              <div className="pt-6">
                <button
                  onClick={() => {
                    resolveSessionRef.current += 1;
                    setTelegramConnected(false);
                    setSubStep('telegram');
                  }}
                  className="btn-twin btn-twin-ghost w-full py-2.5 text-sm"
                >
                  {t('common.back')}
                </button>
              </div>
            </div>
          )}

          {/* ═══ Sub-step E: ACTIVATED ═══ */}
          {subStep === 'activated' && (
            <div className="animate-fade-in space-y-0">
              <div className="text-center pb-8">
                <h2 className="font-heading font-extrabold leading-tight tracking-tight text-foreground" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>{t('activated.title')}</h2>
                <p className="text-base md:text-lg text-muted-foreground mt-1">{t('activated.subtitle')}</p>
              </div>

              <ThinDivider />

              <div className="py-6">
                <RedFlashLobster />
              </div>

              <ThinDivider />

              <div className="py-4 space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t('activated.agent')}</span>
                  <span className="text-foreground/80 flex items-center gap-1.5">
                    <img src={lobsterIcon} alt="" className="w-3.5 h-3.5" style={{ filter: 'drop-shadow(0 0 4px rgba(242,68,85,0.4))', opacity: 0.8 }} />
                    {currentSavedAgent?.name || agent.name}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t('activated.status')}</span>
                  <span className="font-medium" style={{ color: '#F24455' }}>● Active</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t('agent.telegram')}</span>
                  <span style={{ color: '#F24455' }}>✓ Connected</span>
                </div>
                <div className="flex justify-between py-1 gap-4">
                  <span className="text-muted-foreground">{t('agentStudio.agentAddress')}</span>
                  <span className="text-foreground/80 font-mono text-right break-all">
                    {currentSavedAgent?.agentAddress || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 gap-4">
                  <span className="text-muted-foreground">ERC-8004 Identity</span>
                  <span className="text-foreground/80 text-right">
                    Bound to SBT #{tokenId?.toString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 gap-4">
                  <span className="text-muted-foreground">Authorization Scope</span>
                  <span className="text-foreground/80 text-right">
                    {(permission.identityScopes || []).join(', ') || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 gap-4">
                  <span className="text-muted-foreground">{t('agent.authDuration')}</span>
                  <span className="text-foreground/80 text-right">
                    {permission.authorizationDuration === 'Custom'
                      ? `${permission.customDurationDays || '-'} ${t('agent.days')}`
                      : (permission.authorizationDuration || '-')}
                  </span>
                </div>
                {bindTxHash && (
                  <div className="pt-2">
                    <a
                      href={`https://testnet.bscscan.com/tx/${bindTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#F24455] underline break-all"
                    >
                      {bindTxHash}
                    </a>
                  </div>
                )}
              </div>

              <ThinDivider />

              <div className="pt-6 space-y-3">
                {!bindCompleted && (
                  <>
                    {isWrongNetwork && (
                      <div className="rounded-lg border border-yellow-400/35 bg-yellow-400/10 px-3 py-2">
                        <p className="text-sm text-yellow-200 mb-2">
                          {t('review.wrongNetwork').replace('{network}', 'BSC Testnet (97)')}
                        </p>
                        <button
                          onClick={() => switchChain({ chainId: BSC_TESTNET_CHAIN_ID })}
                          className="btn-twin btn-twin-primary py-1.5 px-3 text-sm"
                          disabled={isSwitchingNetwork}
                        >
                          {isSwitchingNetwork ? t('review.switching') : t('review.switchTo').replace('{network}', 'BSC Testnet (97)')}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => { void handleBindAgentPermission(); }}
                      disabled={isBindingAgent || isWrongNetwork || !currentSavedAgent?.agentAddress}
                      className="btn-twin btn-twin-primary btn-glow w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isBindingAgent ? t('agent.binding') : t('agent.bindPermission')}
                    </button>
                  </>
                )}
                {bindCompleted && (
                  <>
                    <p className="text-sm text-center text-[#F24455]">
                      Bind agent and grant permission completed.
                    </p>
                    <button onClick={onDashboard} className="btn-twin btn-twin-primary btn-glow w-full py-3">
                      {t('activated.returnDashboard')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ── Red Flash Lobster Animation ── */
function RedFlashLobster() {
  const [showRed, setShowRed] = useState(true);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    const fadeT = setTimeout(() => setFaded(true), 600);
    const hideT = setTimeout(() => setShowRed(false), 1200);
    return () => { clearTimeout(fadeT); clearTimeout(hideT); };
  }, []);

  if (!showRed) {
    return (
      <div className="animate-fade-in">
        <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 12px rgba(242,68,85,0.5))', opacity: 0.9 }} />
      </div>
    );
  }

  return (
    <div className="transition-all duration-500" style={{ opacity: faded ? 0 : 1, transform: faded ? 'scale(1.3)' : 'scale(1)' }}>
      <img src={lobsterIcon} alt="" className="w-16 h-16 mx-auto" style={{ filter: 'drop-shadow(0 0 16px rgba(255,60,60,0.7))' }} />
    </div>
  );
}
