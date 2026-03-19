import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

const ENDPOINTS = [
  { method: 'GET', path: '/v1/search', desc: 'Search verified human profiles', auth: 'API Key' },
  { method: 'GET', path: '/v1/profiles/{id}', desc: 'Get full profile with matrix signature', auth: 'API Key' },
  { method: 'POST', path: '/v1/match', desc: 'Find best-fit humans for a task specification', auth: 'API Key' },
  { method: 'POST', path: '/v1/quotes', desc: 'Request a quote from a matched human', auth: 'API Key + Signature' },
  { method: 'POST', path: '/v1/messages', desc: 'Send a structured proposal or question', auth: 'API Key + Signature' },
  { method: 'POST', path: '/v1/transactions', desc: 'Execute payment and record completion', auth: 'API Key + Signature' },
  { method: 'GET', path: '/v1/transactions/{id}', desc: 'Check transaction status and receipt', auth: 'API Key' },
];

const WEBHOOKS = [
  { event: 'match.found', desc: 'New human matches your search criteria' },
  { event: 'quote.received', desc: 'Human responded to your quote request' },
  { event: 'task.completed', desc: 'Task marked as completed, ready for payout' },
  { event: 'negotiation.updated', desc: 'Counter-offer or agreement reached' },
];

const AgentsApiPage = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  const methodColor = (m: string) => {
    if (m === 'GET') return 'text-green-500';
    if (m === 'POST') return 'text-blue-400';
    if (m === 'PUT') return 'text-yellow-500';
    if (m === 'DELETE') return 'text-red-400';
    return '';
  };

  return (
    <PageLayout activePage="agents">
      <div className="max-w-4xl mx-auto w-full space-y-8 py-6">
        <div>
          <button onClick={() => navigate('/agents')} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            ← Back to Overview
          </button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">API Reference</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Endpoints, authentication, and webhooks for the Twin Matrix API.</p>
        </div>

        {/* Auth section */}
        <div style={cardStyle} className="space-y-4">
          <button onClick={() => setShowAuth(!showAuth)} className="flex items-center justify-between w-full">
            <h2 className="text-lg font-heading font-semibold">Authentication</h2>
            <span className="text-muted-foreground">{showAuth ? '▾' : '▸'}</span>
          </button>
          {showAuth && (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2">
                <p className="text-sm font-medium">API Key Authentication</p>
                <div className="bg-foreground/5 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`curl -H "Authorization: Bearer tm_live_YOUR_KEY" \\
  https://api.twin3.ai/v1/search?skills=running`}</pre>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Request Signing (for mutations)</p>
                <div className="bg-foreground/5 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`// Sign the request body with your agent's private key
const signature = await agent.sign(JSON.stringify(body));
headers['X-Twin3-Signature'] = signature;
headers['X-Twin3-Timestamp'] = Date.now().toString();`}</pre>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Scopes</p>
                <div className="flex flex-wrap gap-2">
                  {['search:read', 'profiles:read', 'quotes:write', 'messages:write', 'transactions:write'].map(s => (
                    <span key={s} className="text-xs font-mono px-2 py-1 rounded-md bg-foreground/5">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Endpoints */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold">Endpoints</h2>
          <div className="space-y-2">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} style={cardStyle} className="flex items-start gap-3">
                <span className={`text-xs font-mono font-bold mt-0.5 w-12 shrink-0 ${methodColor(ep.method)}`}>{ep.method}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono truncate">{ep.path}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{ep.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground/50 shrink-0">{ep.auth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-semibold">Webhooks</h2>
          <div style={cardStyle} className="space-y-3">
            <p className="text-sm text-muted-foreground">Configure webhook endpoints in your console to receive real-time event notifications.</p>
            <div className="space-y-2">
              {WEBHOOKS.map((wh) => (
                <div key={wh.event} className="flex items-center gap-3 py-2 border-b border-foreground/5 last:border-0">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-foreground/5">{wh.event}</span>
                  <span className="text-xs text-muted-foreground">{wh.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Base URL */}
        <div style={cardStyle} className="space-y-2">
          <p className="text-sm font-medium">Base URL</p>
          <p className="text-sm font-mono bg-foreground/5 px-3 py-2 rounded-lg select-all">https://api.twin3.ai/v1</p>
          <p className="text-xs text-muted-foreground">All endpoints use HTTPS. Testnet available at api-testnet.twin3.ai</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgentsApiPage;
