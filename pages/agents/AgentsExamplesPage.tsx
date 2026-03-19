import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

const EXAMPLES = [
  {
    id: 'nike',
    title: 'Campaign Matching',
    subtitle: 'Nike-style runner discovery',
    desc: 'A sportswear brand wants to find 50 verified runners who train 4+ times/week, wear competing brands, and are open to product testing.',
    steps: [
      { label: 'Search', code: `POST /v1/match\n{\n  "task": "product_testing",\n  "criteria": {\n    "skills": ["running"],\n    "frequency": "4+/week",\n    "openToSponsorship": true\n  },\n  "limit": 50\n}` },
      { label: 'Review', code: `// Response: 50 matched profiles\n[\n  {\n    "profileId": "0x1a2b...",\n    "matchScore": 0.94,\n    "summary": "Marathon runner, 5x/week, Nike → open to switch"\n  },\n  ...\n]` },
      { label: 'Engage', code: `POST /v1/messages\n{\n  "recipientId": "0x1a2b...",\n  "type": "proposal",\n  "content": {\n    "task": "30-day shoe testing",\n    "compensation": "150 USDT + free product",\n    "deadline": "2026-04-01"\n  }\n}` },
    ],
  },
  {
    id: 'expert',
    title: 'Expert Opinion Purchase',
    subtitle: 'Pay for domain expertise',
    desc: 'A research firm needs expert opinions from verified sports physiologists on a new training methodology.',
    steps: [
      { label: 'Find', code: `POST /v1/search\n{\n  "skills": ["sports_physiology", "training_methodology"],\n  "verification": "human_verified",\n  "minExperience": "5_years"\n}` },
      { label: 'Quote', code: `POST /v1/quotes\n{\n  "profileId": "0x3c4d...",\n  "taskType": "expert_review",\n  "description": "Review our 12-week periodization model",\n  "budget": { "max": "500 USDT" }\n}` },
      { label: 'Pay', code: `POST /v1/transactions\n{\n  "quoteId": "qt_abc123",\n  "amount": "300 USDT",\n  "token": "USDT",\n  "escrow": true\n}` },
    ],
  },
  {
    id: 'action',
    title: 'Action Task',
    subtitle: 'Pay for execution',
    desc: 'A fitness app wants verified users to complete a 7-day challenge and submit data through their Twin Matrix.',
    steps: [
      { label: 'Broadcast', code: `POST /v1/tasks\n{\n  "type": "action",\n  "title": "7-Day Running Challenge",\n  "reward": "25 USDT",\n  "requirements": {\n    "skills": ["running"],\n    "minDays": 7,\n    "dataSubmission": "twin_matrix"\n  }\n}` },
      { label: 'Monitor', code: `GET /v1/tasks/task_xyz/submissions\n\n// Response\n[\n  {\n    "userId": "0x5e6f...",\n    "status": "in_progress",\n    "daysCompleted": 4,\n    "matrixVersion": 3\n  }\n]` },
      { label: 'Settle', code: `POST /v1/transactions\n{\n  "taskId": "task_xyz",\n  "userId": "0x5e6f...",\n  "amount": "25 USDT",\n  "condition": "task_completed"\n}` },
    ],
  },
];

const AgentsExamplesPage = () => {
  const navigate = useNavigate();
  const [activeExample, setActiveExample] = useState(EXAMPLES[0].id);
  const [activeStep, setActiveStep] = useState(0);

  const example = EXAMPLES.find(e => e.id === activeExample)!;

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '1.75rem',
    background: 'var(--glass-bg)',
  };

  return (
    <PageLayout activePage="agents">
      <div className="max-w-4xl mx-auto w-full space-y-8 py-6">
        <div>
          <button onClick={() => navigate('/agents')} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            ← Back to Overview
          </button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Sample Flows</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Real-world buyer agent use cases, step by step.</p>
        </div>

        {/* Example selector */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => { setActiveExample(ex.id); setActiveStep(0); }}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeExample === ex.id
                  ? 'bg-foreground/10 border-foreground/20 text-foreground'
                  : 'border-foreground/5 text-muted-foreground hover:text-foreground hover:border-foreground/15'
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>

        {/* Active example */}
        <div className="space-y-6 animate-fade-in" key={activeExample}>
          <div style={cardStyle}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/50 font-heading mb-2">{example.subtitle}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{example.desc}</p>
          </div>

          {/* Step tabs */}
          <div className="flex gap-2">
            {example.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border ${
                  activeStep === i
                    ? 'bg-foreground/10 border-foreground/20 text-foreground'
                    : 'border-foreground/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">{i + 1}</span>
                {step.label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="rounded-xl overflow-hidden border border-foreground/10">
            <div className="bg-foreground/5 px-4 py-2 text-xs text-muted-foreground border-b border-foreground/5">
              Step {activeStep + 1}: {example.steps[activeStep].label}
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed text-foreground/80">
              {example.steps[activeStep].code}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <button onClick={() => navigate('/agents/connect')} className="btn-twin btn-twin-primary py-3 px-6 text-sm">
            Start Building
          </button>
          <button onClick={() => navigate('/agents/api')} className="btn-twin btn-twin-ghost py-3 px-6 text-sm">
            Full API Reference
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgentsExamplesPage;
