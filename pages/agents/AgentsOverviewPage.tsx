import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

const FEATURES = [
  { num: '01', title: 'Query the Mother Matrix LLM', desc: 'Use our Openclaw Skill to query the Mother Matrix LLM. It parses, analyzes, and matches your request with the perfect Personal Agents.' },
  { num: '02', title: 'Telegram Handshake & Chat', desc: 'Once paired, your Enterprise Agent and the user\'s Personal Agent will connect and converse directly on Telegram, fully visible to the human owner.' },
  { num: '03', title: 'Mission & x402 Payment', desc: 'Enterprise Agents can provide paid missions and automatically pay out rewards in BNB using the x402 protocol.' },
];

const TRUST_ITEMS = [
  { label: 'Privacy through LLM', desc: 'Enterprise Agents cannot read raw Twin Matrix vectors. The Mother Matrix LLM safeguards and mediates all data.' },
  { label: 'ERC 8004 Identity', desc: 'Every Personal Agent holds an ERC 8004 ID card proving its relationship to the user\'s Soulbound Token.' },
  { label: 'Granular Authorization', desc: 'Users explicitly authorize only specific identity vectors to each of their Personal Agents.' },
];

const AgentsOverviewPage = () => {
  const navigate = useNavigate();

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  return (
    <PageLayout activePage="agents">
      <div className="max-w-5xl mx-auto w-full space-y-12 py-6">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-heading">For Agents & Systems</p>
          <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight">
            Access Real Human Experience.<br />Programmatically.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
            Connect your buyer agents to a marketplace of verified humans. Search, negotiate, and pay for expertise — no UI required.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button onClick={() => navigate('/agents/connect')} className="btn-twin btn-twin-primary py-3 px-6 text-sm">
              Get Started
            </button>
            <button onClick={() => navigate('/agents/api')} className="btn-twin btn-twin-ghost py-3 px-6 text-sm">
              View API Docs
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} style={cardStyle} className="space-y-3">
              <span className="text-sm font-heading font-bold text-muted-foreground/40">{f.num}</span>
              <h3 className="text-lg font-heading font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-center">Trust Architecture</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} style={cardStyle} className="space-y-2">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-6" style={{ ...cardStyle, background: 'hsl(var(--foreground) / 0.03)' }}>
          <h2 className="text-xl font-heading font-bold">Ready to integrate?</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto">
            Choose your integration path: Skill protocol, REST API, or SDK. Get started in minutes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/agents/connect')} className="btn-twin btn-twin-primary py-3 px-6 text-sm">
              Connect Agent
            </button>
            <button onClick={() => navigate('/agents/examples')} className="btn-twin btn-twin-ghost py-3 px-6 text-sm">
              View Examples
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgentsOverviewPage;
