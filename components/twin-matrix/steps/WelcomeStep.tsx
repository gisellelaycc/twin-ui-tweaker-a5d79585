import { useState, useEffect } from 'react';
import logo from '@/assets/twin3-logo.svg';
import { StepLayout, StepContent } from '../StepLayout';
import { useI18n } from '@/lib/i18n';
import xLogo from '@/assets/social/x-logo.svg';
import elementLogo from '@/assets/social/element-logo.svg';
import discordLogo from '@/assets/social/discord-logo.svg';
import bcscanLogo from '@/assets/social/bcscan-logo.svg';

interface Props {
  onNext: () => void;
  locked?: boolean;
  onRequestConnect?: () => void;
}

/* ── Glowing divider line (white, shimmering) ── */
const GlowLine = () => (
  <div className="relative w-full h-px mt-1 mb-6">
    <div className="absolute inset-0 bg-foreground/10" />
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-0 h-full w-[60px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
          animation: 'divider-trace-welcome 6s linear infinite',
        }}
      />
    </div>
  </div>
);

/* ── Social Footer ── */
const SOCIAL_LINKS = [
  { icon: xLogo, href: 'https://x.com/twin3_ai', alt: 'X (Twitter)' },
  { icon: elementLogo, href: 'https://element.market/collections/twin3-1?search[toggles][0]=ALL', alt: 'Element' },
  { icon: discordLogo, href: 'https://discord.gg/ZveHDMVG', alt: 'Discord' },
  { icon: bcscanLogo, href: 'https://bscscan.com/token/0xe3ec133e29addfbba26a412c38ed5de37195156f', alt: 'BscScan' },
];

const SocialFooter = () => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-3 mt-auto pt-8">
      <div className="flex items-center gap-4">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.alt}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-200"
          >
            <img src={link.icon} alt={link.alt} className="w-5 h-5" />
          </a>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/80">{t('welcome.trackUs')}</p>
        <p className="text-sm text-muted-foreground">{t('welcome.trackUsDesc')}</p>
      </div>
    </div>
  );
};

export const WelcomeStep = ({ onNext, locked = false, onRequestConnect }: Props) => {
  const { t } = useI18n();

  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true), 600);
    const t2 = setTimeout(() => setContentVisible(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleConfirm = () => {
    if (locked) return;
    onNext();
  };

  return (
    <StepLayout>
      <StepContent>
        <div className="relative flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
          <div className="relative z-10 flex flex-col items-center">
            <img
              src={logo}
              alt="Twin Matrix"
              className="w-12 h-12 mb-8"
              style={{
                opacity: titleVisible ? 1 : 0,
                transition: 'opacity 600ms ease-out',
              }}
            />

            {/* Pre-title */}
            <p
              className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-heading mb-3"
              style={{
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 500ms ease-out 200ms, transform 500ms ease-out 200ms',
              }}
            >
              {t('welcome.pretitle')}
            </p>

            {/* Main title — Montserrat, bold, twin3.ai style */}
            <h1
              className="font-heading font-bold tracking-tight leading-[1.1] relative"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                maxWidth: '600px',
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'scale(1)' : 'scale(0.92)',
                transition: 'opacity 800ms ease-out, transform 800ms ease-out',
              }}
            >
              <span className="scan-text-base">{t('welcome.title')}</span>
              <span className="scan-text-glow" aria-hidden="true">{t('welcome.title')}</span>
            </h1>

            <p
              className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed mt-5"
              style={{
                opacity: titleVisible ? 1 : 0,
                transform: titleVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 600ms ease-out 400ms, transform 600ms ease-out 400ms',
              }}
            >
              {t('welcome.subtitle')}
            </p>

            <div
              className="mt-10 w-full max-w-sm mx-auto relative"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 600ms ease-out, transform 600ms ease-out',
              }}
            >
              <button
                onClick={handleConfirm}
                disabled={locked}
                className="btn-twin btn-twin-primary btn-glow w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('welcome.start')}
              </button>

              <div className="mt-4">
                <GlowLine />
              </div>

              {locked && (
                <div className="absolute inset-0 rounded-xl bg-background/70 backdrop-blur-sm border border-foreground/10 flex flex-col items-center justify-center gap-4 px-4 py-6 min-h-[120px]">
                  <p className="text-xs text-muted-foreground text-center">
                    {t('wallet.connectToContinue')}
                  </p>
                  <button
                    onClick={onRequestConnect}
                    className="btn-twin btn-twin-primary py-2 px-3 text-xs"
                  >
                    {t('wallet.connect')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Footer */}
          <div
            style={{
              opacity: contentVisible ? 1 : 0,
              transition: 'opacity 800ms ease-out 400ms',
            }}
          >
            <SocialFooter />
          </div>
        </div>
      </StepContent>
    </StepLayout>
  );
};
