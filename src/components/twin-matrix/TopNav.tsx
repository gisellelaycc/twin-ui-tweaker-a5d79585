import twin3Logo from '@/assets/twin3-logo.svg';

interface Props {
  activePage: string | null;
  onNavigate: (id: string | null) => void;
  hasIdentity: boolean;
  isWalletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export const TopNav = ({
  activePage,
  onNavigate,
  hasIdentity,
  isWalletConnected,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
}: Props) => {
  const shortAddr = walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : '';

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-foreground/10" style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(12px)' }}>
      <button onClick={() => onNavigate(null)} className="flex items-center gap-2">
        <img src={twin3Logo} alt="Twin3" className="h-7" />
      </button>
      <div className="flex items-center gap-4">
        {hasIdentity && (
          <>
            <button onClick={() => onNavigate('identity')} className={`text-sm transition-colors ${activePage === 'identity' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Identity</button>
            <button onClick={() => onNavigate('agents')} className={`text-sm transition-colors ${activePage === 'agents' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Agents</button>
          </>
        )}
        {isWalletConnected ? (
          <button onClick={onDisconnectWallet} className="text-xs px-3 py-1.5 rounded-full border border-foreground/15 text-foreground/70 hover:text-foreground transition-colors">{shortAddr}</button>
        ) : (
          <button onClick={onConnectWallet} className="text-xs px-3 py-1.5 rounded-full border border-foreground/15 text-foreground/70 hover:text-foreground transition-colors">Connect</button>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
