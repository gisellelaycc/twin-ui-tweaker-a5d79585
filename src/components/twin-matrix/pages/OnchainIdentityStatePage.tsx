import type { OnchainVersion, OnchainBoundAgent } from '@/lib/contracts/twin-matrix-sbt';

interface Props {
  tokenId: bigint | null;
  walletAddress: string;
  latestVersion: number;
  versions: OnchainVersion[];
  boundAgents: OnchainBoundAgent[];
  onReconfigure: () => void;
  onSetupAgent: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const OnchainIdentityStatePage = ({ tokenId, latestVersion, onReconfigure, onSetupAgent, onRefresh, isRefreshing }: Props) => (
  <div className="space-y-6 py-8 px-4">
    <div className="flex items-center justify-between">
      <h2 className="font-heading text-2xl font-bold text-foreground">On-Chain Identity State</h2>
      <button onClick={onRefresh} disabled={isRefreshing} className="text-sm text-muted-foreground hover:text-foreground">{isRefreshing ? 'Refreshing…' : 'Refresh'}</button>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="p-4 rounded-xl border border-foreground/10" style={{ background: 'var(--glass-bg)' }}>
        <p className="text-sm text-muted-foreground">Token ID</p>
        <p className="text-lg font-mono">{tokenId?.toString() ?? '—'}</p>
      </div>
      <div className="p-4 rounded-xl border border-foreground/10" style={{ background: 'var(--glass-bg)' }}>
        <p className="text-sm text-muted-foreground">Version</p>
        <p className="text-lg font-mono">{latestVersion}</p>
      </div>
    </div>
    <div className="flex gap-3">
      <button onClick={onReconfigure} className="btn-twin btn-twin-primary px-6 py-2 text-sm btn-glow">Reconfigure</button>
      <button onClick={onSetupAgent} className="btn-twin px-6 py-2 text-sm border border-foreground/15 text-foreground/70 hover:text-foreground">Setup Agent</button>
    </div>
  </div>
);
export default OnchainIdentityStatePage;
