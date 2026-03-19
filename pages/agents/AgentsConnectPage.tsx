import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { toast } from 'sonner';

type IntegrationMode = 'skill' | 'api' | 'sdk';

const MODES: { id: IntegrationMode; label: string; desc: string; icon: string }[] = [
  { id: 'skill', label: 'Skill Protocol', desc: 'Declare capabilities and let the protocol handle discovery, matching, and settlement.', icon: 'SK' },
  { id: 'api', label: 'REST API', desc: 'Direct HTTP endpoints for search, profile retrieval, quoting, and transactions.', icon: 'AP' },
  { id: 'sdk', label: 'TypeScript SDK', desc: 'Type-safe SDK with built-in auth, retries, and WebSocket support.', icon: 'SD' },
];

const AgentsConnectPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<IntegrationMode | null>(null);
  const [orgName, setOrgName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [step, setStep] = useState<'choose' | 'configure' | 'done'>('choose');

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  const handleCreate = () => {
    if (!orgName.trim() || !agentName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setStep('done');
    toast.success('Agent connection created!');
  };

  return (
    <PageLayout activePage="agents">
      <div className="max-w-3xl mx-auto w-full space-y-8 py-6">
        <div>
          <button onClick={() => navigate('/agents')} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            ← Back to Overview
          </button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Connect Buyer Agent</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Choose your integration mode and configure your agent.</p>
        </div>

        {step === 'choose' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Step 1 — Choose Integration Mode</p>
            <div className="grid gap-3">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setStep('configure'); }}
                  style={cardStyle}
                  className={`text-left w-full transition-all duration-200 hover:border-foreground/20 ${
                    mode === m.id ? 'border-foreground/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{m.icon}</span>
                    <div>
                      <p className="font-medium">{m.label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'configure' && (
          <div className="space-y-6 animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">
              Step 2 — Configure ({MODES.find(m => m.id === mode)?.label})
            </p>

            <div style={cardStyle} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Nike Innovation Lab"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Runner Scout"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scopes</label>
                <div className="flex flex-wrap gap-2">
                  {['search', 'match', 'message', 'negotiate', 'transact'].map((scope) => (
                    <span key={scope} className="chip text-xs">{scope}</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">All scopes selected by default. Customize in console after creation.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('choose')} className="btn-twin btn-twin-ghost py-3 px-6 text-sm">Back</button>
              <button onClick={handleCreate} className="btn-twin btn-twin-primary py-3 px-6 text-sm flex-1">Create Agent Connection</button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-[hsl(var(--color-success))] flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-heading font-bold">Agent Connected</h2>
            <p className="text-muted-foreground text-sm">Your agent "{agentName}" is ready to use.</p>

            <div style={cardStyle} className="text-left space-y-3">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Credentials</p>
              <div className="space-y-2">
                <div>
                   <p className="text-sm text-muted-foreground">API Key</p>
                  <p className="text-sm font-mono bg-foreground/5 px-3 py-2 rounded-lg select-all">tm_live_k8f2j9a3m5n7p1q4r6s8t0</p>
                </div>
                <div>
                   <p className="text-sm text-muted-foreground">Endpoint</p>
                  <p className="text-sm font-mono bg-foreground/5 px-3 py-2 rounded-lg select-all">https://api.twin3.ai/v1</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button onClick={() => navigate('/agents/api')} className="btn-twin btn-twin-ghost py-3 px-6 text-sm">View API Docs</button>
              <button onClick={() => navigate('/agents/console')} className="btn-twin btn-twin-primary py-3 px-6 text-sm">Go to Console</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AgentsConnectPage;
