import { useState } from 'react';

const CAPABILITIES: Record<string, string[]> = {
  Discovery: ['Event', 'Competition', 'Limited Drop', 'New Release', 'Nearby Experience', 'Early Access Opportunity', 'Beta Opportunity', 'Sponsored Opportunity'],
  Commerce: ['Product Purchase', 'Discount Match', 'Bundle Offer', 'Subscription', 'Trial Offer', 'Marketplace Bid', 'NFT / Digital Asset Purchase', 'Ticket Purchase'],
  Participation: ['Campaign Enrollment', 'Challenge Participation', 'Marathon Registration', 'Brand Activation', 'Community Event', 'Referral Program', 'Loyalty Program'],
  Contribution: ['Review Submission', 'Survey Completion', 'Content Post', 'Social Amplification', 'Beta Feedback', 'UGC Creation', 'Data Contribution'],
  Access: ['Membership Access', 'VIP Invite', 'Token-Gated Entry', 'Location Unlock', 'Ticket Claim', 'Private Event Access', 'Digital Collectible Claim'],
  Intelligence: ['Market Trend', 'Price Alert', 'Brand Activity', 'Competitor Watch', 'Community Sentiment', 'Signal Analytics'],
};

interface Props {
  capabilities: Record<string, string[]>;
  onUpdate: (caps: Record<string, string[]>) => void;
}

export const TaskCapabilitySection = ({ capabilities, onUpdate }: Props) => {
  const [openCap, setOpenCap] = useState<string | null>(null);

  const togglePrimary = (cap: string) => {
    if (openCap === cap) {
      setOpenCap(null);
    } else {
      setOpenCap(cap);
      if (!(cap in capabilities)) {
        onUpdate({ ...capabilities, [cap]: [] });
      }
    }
  };

  const deactivate = (cap: string) => {
    const next = { ...capabilities };
    delete next[cap];
    onUpdate(next);
    if (openCap === cap) setOpenCap(null);
  };

  const toggleSub = (cap: string, sub: string) => {
    const current = capabilities[cap] || [];
    const next = current.includes(sub)
      ? current.filter(s => s !== sub)
      : [...current, sub];
    onUpdate({ ...capabilities, [cap]: next });
  };

  const capKeys = Object.keys(CAPABILITIES);

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Task Capability</h3>

      <div className="flex flex-wrap gap-1.5">
        {capKeys.map(cap => {
          const isActive = cap in capabilities;
          const isOpen = openCap === cap;
          return (
            <button
              key={cap}
              onClick={() => togglePrimary(cap)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                isActive
                  ? isOpen
                    ? 'bg-foreground/20 text-foreground border border-foreground/20'
                    : 'bg-foreground/15 text-foreground border border-foreground/15'
                  : 'bg-foreground/5 text-muted-foreground border border-foreground/5 hover:border-foreground/15'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-[rgba(40,180,160,0.7)] shadow-[0_0_4px_rgba(40,180,160,0.4)]' : 'bg-foreground/15'
                }`} />
                {cap}
              </span>
            </button>
          );
        })}
      </div>

      {openCap && openCap in capabilities && (
        <div className="animate-fade-in space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">{openCap} sub-tasks</span>
            <button
              onClick={() => deactivate(openCap)}
              className="text-xs text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              Remove
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CAPABILITIES[openCap].map(sub => {
              const selected = (capabilities[openCap] || []).includes(sub);
              return (
                <button
                  key={sub}
                  onClick={() => toggleSub(openCap, sub)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                    selected
                      ? 'bg-foreground/15 text-foreground border border-foreground/18'
                      : 'bg-foreground/4 text-muted-foreground border border-foreground/6 hover:border-foreground/12'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
