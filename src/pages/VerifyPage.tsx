import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/twin-matrix/PageLayout';

// ─── zkHumanity SDK ─────────────────────────────────────────────────────────

const ZKH_SDK_URL = 'https://zkhumanity.twin3.ai/sdk.js';
const ZKH_REF = 'soul.twin3.ai';

interface ZkHumanityResult {
  address: string;
  score: number;
  token: string;
}

declare global {
  interface Window {
    zkHumanity?: {
      onVerified: (cb: (result: ZkHumanityResult) => void) => void;
    };
  }
}

const VerifyPage = () => {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // Load zkHumanity SDK on mount
  useEffect(() => {
    if (document.querySelector(`script[src="${ZKH_SDK_URL}"]`)) return;

    const script = document.createElement('script');
    script.src = ZKH_SDK_URL;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.zkHumanity?.onVerified((result) => {
        setAddress(result.address);
        setScore(result.score);
        setVerified(true);

        if (result.token) {
          sessionStorage.setItem('zkh_token', result.token);
          sessionStorage.setItem('zkh_address', result.address);
          sessionStorage.setItem('zkh_score', String(result.score));
        }

        setTimeout(() => navigate('/mint'), 1500);
      });
    };
  }, [navigate]);

  return (
    <PageLayout activePage="identity">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-lg w-full text-center space-y-8">
          {verified ? (
            <div className="space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full border-2 border-[hsl(var(--color-success))] flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-heading font-bold">Verified Human</h2>
              {score !== null && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Humanity Index</p>
                  <p className="text-4xl font-heading font-bold" style={{ color: '#0AFFFF' }}>
                    {score}<span className="text-lg text-muted-foreground/60">/255</span>
                  </p>
                </div>
              )}
              {address && (
                <p className="text-sm font-mono text-muted-foreground truncate px-4">{address}</p>
              )}
              <p className="text-muted-foreground">Redirecting to Twin Matrix creation…</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground font-heading">Human Verification</p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold">Prove You're Human</h1>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Before listing your experience, we verify your identity through twin3.ai's proof-of-humanity protocol.
                </p>
              </div>

              <div className="rounded-2xl p-6 text-left space-y-4" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-sm font-heading font-bold text-muted-foreground/40 mt-0.5">01</span>
                  <div>
                    <p className="text-sm font-medium">Privacy-Preserving</p>
                    <p className="text-sm text-muted-foreground">No personal data stored. Only a cryptographic proof is recorded on-chain.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm font-heading font-bold text-muted-foreground/40 mt-0.5">02</span>
                  <div>
                    <p className="text-sm font-medium">Multi-Factor Scoring</p>
                    <p className="text-sm text-muted-foreground">6 verification methods: reCAPTCHA, Google, Apple, 2FA, Telegram, Discord. More = higher score.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm font-heading font-bold text-muted-foreground/40 mt-0.5">03</span>
                  <div>
                    <p className="text-sm font-medium">Soulbound On-Chain</p>
                    <p className="text-sm text-muted-foreground">Your Humanity Index (0-255) is stored as a non-transferable SBT on BNB Chain.</p>
                  </div>
                </div>
              </div>

              {/* zkHumanity SDK widget — renders "Verify Human" button, click opens popup */}
              <div id="zkh-verify" data-ref={ZKH_REF}></div>

              <p className="text-xs text-muted-foreground/40">
                Powered by <a href="https://zkhumanity.twin3.ai" target="_blank" rel="noopener" className="underline hover:text-foreground/60">zkHumanity</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default VerifyPage;
