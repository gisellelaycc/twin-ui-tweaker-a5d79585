import { useNavigate } from 'react-router-dom';
import { useTwinMatrix } from '@/contexts/TwinMatrixContext';
import { ParticleBackground } from './ParticleBackground';
import { TopNav } from './TopNav';
import { SiteFooter } from './SiteFooter';

type NavPage = 'identity' | 'agents' | 'account' | null;

interface Props {
  activePage: NavPage;
  children: React.ReactNode;
  hideParticles?: boolean;
}

export const PageLayout = ({ activePage, children, hideParticles }: Props) => {
  const navigate = useNavigate();
  const { isConnected, openConnectModal, disconnect, walletAddress, hasMintedSbt } = useTwinMatrix();

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <div className="min-h-screen flex flex-col relative" style={{ zIndex: 10 }}>
        {!hideParticles && <ParticleBackground color="cyan" />}
        <TopNav
          activePage={activePage}
          onNavigate={(id) => {
            if (id === null) navigate('/');
            else if (id === 'identity') navigate('/matrix');
            else if (id === 'agents') navigate('/agents');

          }}
          hasIdentity={hasMintedSbt}
          isWalletConnected={isConnected}
          walletAddress={walletAddress}
          onConnectWallet={() => openConnectModal?.()}
          onDisconnectWallet={() => disconnect()}
        />
        <main className="flex-1 min-h-0 px-3 md:px-4 py-4 flex flex-col relative z-10">
          {children}
        </main>
        <div className="relative z-10">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
};
