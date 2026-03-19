import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';
import { toast } from 'sonner';

const API_BASE = (import.meta.env.VITE_BACKEND_API_BASE_URL ?? '').trim().replace(/\/+$/, '') || '/api';

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  fullKey?: string;       // only available on create
  environment: 'live' | 'test';
  permissions: string[];
  created: string;
  lastUsed: string | null;
  status: 'active' | 'revoked';
}

interface UsageDay {
  date: string;
  searches: number;
  matches: number;
  messages: number;
  transactions: number;
}

interface UsageData {
  month: string;
  plan: string;
  totalSearches: number;
  totalMatches: number;
  totalMessages: number;
  totalTransactions: number;
  estimatedCost: number;
  limit: number;
  remainingCalls: number;
  daily: UsageDay[];
}

interface OrgData {
  orgId: string;
  name: string;
  email: string;
  webhookUrl: string;
  plan: string;
  members: Array<{ name: string; email: string; role: string }>;
}

interface PlanInfo {
  tier: string;
  monthlyCallLimit: number;
  matchResultPercent: number;
  maxKeys: number;
  dispatchEnabled: boolean;
  transactEnabled: boolean;
  priceMonthly: number;
}

const AgentsConsolePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'keys' | 'usage' | 'org' | 'plans'>('keys');
  const [orgId, setOrgId] = useState<string | null>(null);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // Registration form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Org edit
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebhook, setEditWebhook] = useState('');

  // Load orgId from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tm_orgId');
    if (stored) {
      setOrgId(stored);
    } else {
      setLoading(false);
    }
  }, []);

  // Load org data when orgId is set
  const loadOrgData = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [orgRes, keysRes, usageRes, planRes] = await Promise.all([
        fetch(`${API_BASE}/v1/console/org?orgId=${orgId}`),
        fetch(`${API_BASE}/v1/console/keys?orgId=${orgId}`),
        fetch(`${API_BASE}/v1/console/usage?orgId=${orgId}`),
        fetch(`${API_BASE}/v1/console/plan?orgId=${orgId}`),
      ]);

      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrg(orgData);
        setEditName(orgData.name);
        setEditEmail(orgData.email);
        setEditWebhook(orgData.webhookUrl || '');
      }

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setKeys(keysData.keys.map((k: Record<string, unknown>) => ({
          id: k.id as string,
          name: k.name as string,
          keyPreview: k.keyPreview as string,
          environment: k.environment as string,
          permissions: k.permissions as string[],
          created: (k.createdAt as string)?.split('T')[0] || '',
          lastUsed: (k.lastUsedAt as string)?.split('T')[0] || null,
          status: k.status as string,
        })));
      }

      if (usageRes.ok) {
        setUsage(await usageRes.json());
      }

      if (planRes.ok) {
        const planData = await planRes.json();
        setPlans(planData.available);
      }
    } catch (err) {
      console.error('Failed to load org data:', err);
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (orgId) loadOrgData();
  }, [orgId, loadOrgData]);

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim()) {
      toast.error('Enter organization name and email');
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch(`${API_BASE}/v1/console/org/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem('tm_orgId', data.orgId);
        setOrgId(data.orgId);
        toast.success('Organization registered! Your API keys are ready.');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch {
      toast.error('Network error');
    }
    setRegistering(false);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) { toast.error('Enter a key name'); return; }
    try {
      const res = await fetch(`${API_BASE}/v1/console/keys/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Org-Id': orgId || '' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`API key "${newKeyName}" created`);
        // Show full key once
        const newKey: ApiKey = {
          id: data.id,
          name: data.name,
          keyPreview: data.key,
          fullKey: data.key,
          environment: data.environment,
          permissions: data.permissions,
          created: new Date().toISOString().split('T')[0],
          lastUsed: null,
          status: 'active',
        };
        setKeys([newKey, ...keys]);
        setNewKeyName('');
        navigator.clipboard.writeText(data.key);
        toast.info('Full API key copied to clipboard. Store it safely!');
      } else {
        toast.error(data.error || 'Failed to create key');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleRevoke = async (keyId: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/console/keys/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      });
      const data = await res.json();
      if (data.ok) {
        setKeys(keys.map(k => k.id === keyId ? { ...k, status: 'revoked' as const } : k));
        toast.success('Key revoked');
      } else {
        toast.error(data.error || 'Failed to revoke');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleSaveOrg = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/console/org/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Org-Id': orgId || '' },
        body: JSON.stringify({ name: editName, email: editEmail, webhookUrl: editWebhook }),
      });
      const data = await res.json();
      if (data.ok) {
        setOrg(data.org);
        toast.success('Settings saved');
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  const tabBtn = (id: typeof tab, label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`text-sm uppercase tracking-widest font-medium transition-colors px-1 pb-2 ${tab === id ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
    >
      {label}
    </button>
  );

  // ─── Registration Screen ───────────────────────────────────────
  if (!orgId && !loading) {
    return (
      <PageLayout activePage="agents">
        <div className="max-w-lg mx-auto w-full py-16 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold">Developer Console</h1>
            <p className="text-muted-foreground mt-2">Register your organization to get API access.</p>
          </div>

          <div style={cardStyle} className="space-y-4">
            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Register Organization</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Organization Name</label>
                <input
                  type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                  placeholder="Acme Research Lab"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Contact Email</label>
                <input
                  type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="admin@acme.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
            </div>
            <button onClick={handleRegister} disabled={registering}
              className="btn-twin btn-twin-primary py-2.5 px-6 text-sm w-full">
              {registering ? 'Registering...' : 'Register & Get API Keys'}
            </button>
          </div>

          {/* Plan comparison */}
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading text-center">Plans</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Free', price: '$0', calls: '100/mo', results: 'Top 5%', dispatch: '✗', color: '' },
                { name: 'Pro', price: '$47.50/mo', calls: '5,000/mo', results: 'Top 20%', dispatch: '✓', color: 'border-foreground/30' },
                { name: 'Enterprise', price: 'Custom', calls: 'Unlimited', results: '100%', dispatch: '✓', color: '' },
              ].map((p) => (
                <div key={p.name} style={cardStyle} className={`text-center space-y-2 ${p.color}`}>
                  <p className="text-sm font-heading font-bold">{p.name}</p>
                  <p className="text-lg font-bold">{p.price}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📊 {p.calls}</p>
                    <p>🎯 {p.results}</p>
                    <p>📨 Dispatch: {p.dispatch}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout activePage="agents">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground animate-pulse">Loading console...</p>
        </div>
      </PageLayout>
    );
  }

  // ─── Console Dashboard ─────────────────────────────────────────
  return (
    <PageLayout activePage="agents">
      <div className="max-w-4xl mx-auto w-full space-y-6 py-6">
        <div>
          <button onClick={() => navigate('/agents')} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            ← Back to Overview
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold">Console</h1>
              <p className="text-base md:text-lg text-muted-foreground mt-1">Manage API keys, monitor usage, and configure your organization.</p>
            </div>
            {org && (
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded font-medium uppercase tracking-wider ${org.plan === 'pro' ? 'bg-blue-500/10 text-blue-500' :
                    org.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-foreground/5 text-muted-foreground'
                  }`}>
                  {org.plan} plan
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6 border-b border-foreground/10">
          {tabBtn('keys', 'API Keys')}
          {tabBtn('usage', 'Usage')}
          {tabBtn('org', 'Organization')}
          {tabBtn('plans', 'Plans')}
        </div>

        {/* ── API Keys Tab ── */}
        {tab === 'keys' && (
          <div className="space-y-4 animate-fade-in">
            <div style={cardStyle} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">New API Key</label>
                <input
                  type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g. Production)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                />
              </div>
              <button onClick={handleCreateKey} className="btn-twin btn-twin-primary py-2.5 px-4 text-sm shrink-0">
                Create Key
              </button>
            </div>

            {keys.map((k) => (
              <div key={k.id} style={cardStyle} className="flex items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{k.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${k.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                      {k.status}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground">
                      {k.environment}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground truncate cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => { if (k.fullKey) { navigator.clipboard.writeText(k.fullKey); toast.success('Key copied!'); } else { toast.info('Full key shown only on creation'); } }}>
                    {k.fullKey || k.keyPreview}
                  </p>
                  <div className="flex gap-3">
                    <p className="text-xs text-muted-foreground/50">Created {k.created}</p>
                    {k.lastUsed && <p className="text-xs text-muted-foreground/50">Last used {k.lastUsed}</p>}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {k.permissions?.map((p: string) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground font-mono">{p}</span>
                    ))}
                  </div>
                </div>
                {k.status === 'active' && (
                  <button onClick={() => handleRevoke(k.id)} className="btn-twin btn-twin-ghost py-1.5 px-3 text-xs text-destructive shrink-0">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Usage Tab ── */}
        {tab === 'usage' && (
          <div className="space-y-4 animate-fade-in">
            {/* Rate limit indicator */}
            {usage && usage.limit > 0 && (
              <div style={cardStyle} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly API Calls</span>
                  <span className="font-medium">{usage.totalSearches.toLocaleString()} / {usage.limit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-foreground/5 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (usage.totalSearches / usage.limit) * 100)}%`,
                      background: usage.totalSearches / usage.limit > 0.9 ? 'hsl(0, 70%, 55%)' :
                        usage.totalSearches / usage.limit > 0.7 ? 'hsl(40, 90%, 55%)' : 'hsl(150, 60%, 45%)',
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {usage.remainingCalls > 0
                    ? `${usage.remainingCalls.toLocaleString()} calls remaining this month`
                    : '⚠️ Limit reached. Upgrade to continue.'}
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Searches', value: (usage?.totalSearches || 0).toLocaleString() },
                { label: 'Total Matches', value: (usage?.totalMatches || 0).toLocaleString() },
                { label: 'Messages Sent', value: (usage?.totalMessages || 0).toLocaleString() },
                { label: 'Transactions', value: (usage?.totalTransactions || 0).toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} style={cardStyle} className="text-center">
                  <p className="text-xl font-heading font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Daily breakdown */}
            {usage && usage.daily.length > 0 && (
              <div style={cardStyle}>
                <p className="text-sm font-medium mb-3">Daily Breakdown</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-foreground/10 text-muted-foreground">
                        <th className="text-left py-2 font-medium">Date</th>
                        <th className="text-right py-2 font-medium">Searches</th>
                        <th className="text-right py-2 font-medium">Matches</th>
                        <th className="text-right py-2 font-medium">Messages</th>
                        <th className="text-right py-2 font-medium">Txns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.daily.map((d) => (
                        <tr key={d.date} className="border-b border-foreground/5 text-muted-foreground">
                          <td className="py-2 font-mono text-xs">{d.date}</td>
                          <td className="py-2 text-right">{d.searches.toLocaleString()}</td>
                          <td className="py-2 text-right">{d.matches.toLocaleString()}</td>
                          <td className="py-2 text-right">{d.messages}</td>
                          <td className="py-2 text-right">{d.transactions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Billing */}
            <div style={cardStyle} className="space-y-2">
              <p className="text-sm font-medium">Current Period Estimate</p>
              <p className="text-2xl font-heading font-bold">
                {usage?.estimatedCost === -1 ? 'Custom' :
                  usage?.estimatedCost === 0 ? '$0.00' :
                    `$${(usage?.estimatedCost || 0).toFixed(2)}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {usage?.month || ''} · {org?.plan || 'free'} plan
              </p>
            </div>
          </div>
        )}

        {/* ── Organization Tab ── */}
        {tab === 'org' && (
          <div className="space-y-4 animate-fade-in">
            <div style={cardStyle} className="space-y-4">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Organization</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Organization Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Contact Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Webhook URL</label>
                  <input type="url" value={editWebhook} onChange={(e) => setEditWebhook(e.target.value)}
                    placeholder="https://api.example.com/webhooks/twin3"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border border-foreground/10 focus:border-foreground/30 outline-none" />
                </div>
              </div>
              <button onClick={handleSaveOrg} className="btn-twin btn-twin-primary py-2.5 px-6 text-sm">
                Save Changes
              </button>
            </div>

            <div style={cardStyle} className="space-y-3">
              <p className="text-sm uppercase tracking-widest text-muted-foreground/60 font-heading">Team Members</p>
              <div className="space-y-2">
                {(org?.members || []).map((m) => (
                  <div key={m.email} className="flex items-center justify-between py-2 border-b border-foreground/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{m.role}</span>
                  </div>
                ))}
              </div>
              <button className="btn-twin btn-twin-ghost py-2 px-4 text-xs" onClick={() => toast.info('Invite feature coming soon')}>
                + Invite Member
              </button>
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, borderColor: 'hsl(0, 50%, 30%)' }} className="space-y-2">
              <p className="text-xs text-red-400 uppercase tracking-widest font-heading">Org ID</p>
              <p className="text-xs font-mono text-muted-foreground">{orgId}</p>
            </div>
          </div>
        )}

        {/* ── Plans Tab ── */}
        {tab === 'plans' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(plans).map(([tier, info]) => {
                const isCurrent = org?.plan === tier;
                return (
                  <div key={tier} style={{
                    ...cardStyle,
                    borderColor: isCurrent ? 'hsl(var(--foreground) / 0.3)' : undefined,
                  }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-heading font-bold capitalize">{tier}</h3>
                      {isCurrent && <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">Current</span>}
                    </div>
                    <p className="text-2xl font-bold">
                      {info.priceMonthly === 0 ? 'Free' :
                        info.priceMonthly === -1 ? 'Custom' :
                          `$${info.priceMonthly}/mo`}
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>📊 {info.monthlyCallLimit === -1 ? 'Unlimited' : info.monthlyCallLimit.toLocaleString()} calls/month</p>
                      <p>🎯 Top {info.matchResultPercent}% match results</p>
                      <p>🔑 Up to {info.maxKeys} API keys</p>
                      <p>{info.dispatchEnabled ? '✅' : '❌'} Telegram dispatch</p>
                      <p>{info.transactEnabled ? '✅' : '❌'} On-chain transactions</p>
                    </div>
                    {!isCurrent && tier !== 'enterprise' && (
                      <button
                        className="btn-twin btn-twin-primary w-full py-2.5 text-sm"
                        onClick={() => toast.info(`Upgrade to ${tier} coming soon`)}
                      >
                        {tier === 'free' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                    {tier === 'enterprise' && !isCurrent && (
                      <button
                        className="btn-twin btn-twin-ghost w-full py-2.5 text-sm border border-foreground/20"
                        onClick={() => toast.info('Contact sales@twin3.ai for enterprise pricing')}
                      >
                        Contact Sales
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Permission scopes explanation */}
            <div style={cardStyle} className="space-y-3">
              <p className="text-sm font-heading font-medium">Permission Scopes</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { scope: 'matrix:read', desc: 'Read user profiles (anonymized)', free: true },
                  { scope: 'matrix:match', desc: 'Query & match users by criteria', free: true },
                  { scope: 'matrix:dispatch', desc: 'Send missions via Telegram', free: false },
                  { scope: 'matrix:transact', desc: 'Execute on-chain USDT payments', free: false },
                ].map((s) => (
                  <div key={s.scope} className="flex items-start gap-2 p-2 rounded-lg bg-foreground/[0.02]">
                    <span className="text-xs font-mono bg-foreground/5 px-1.5 py-0.5 rounded shrink-0">{s.scope}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                        {s.free ? '✓ All plans' : 'Pro+ only'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AgentsConsolePage;
