import type { OnchainBoundAgent } from '@/lib/contracts/twin-matrix-sbt';

interface Props {
  tokenId: bigint;
  agent: OnchainBoundAgent;
  isWrongNetwork: boolean;
  isSwitchingNetwork: boolean;
  onSwitchNetwork: () => void;
  onBack: () => void;
  onUpdated: () => void;
}

export const AgentPermissionEditPage = ({ agent, isWrongNetwork, isSwitchingNetwork, onSwitchNetwork, onBack }: Props) => (
  <div className="space-y-6 py-8 px-4">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <h2 className="font-heading text-2xl font-bold text-foreground">Agent Permission Edit</h2>
    </div>
    <div className="p-4 rounded-xl border border-foreground/10" style={{ background: 'var(--glass-bg)' }}>
      <p className="text-sm text-muted-foreground">Agent</p>
      <p className="text-sm font-mono break-all">{agent.address}</p>
    </div>
    {isWrongNetwork && (
      <button onClick={onSwitchNetwork} disabled={isSwitchingNetwork} className="btn-twin btn-twin-primary px-6 py-2 text-sm">
        {isSwitchingNetwork ? 'Switching…' : 'Switch Network'}
      </button>
    )}
  </div>
);
export default AgentPermissionEditPage;
