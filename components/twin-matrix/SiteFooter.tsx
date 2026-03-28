import logo from '@/assets/twin3-logo.svg';
import xLogo from '@/assets/social/x-logo.svg';
import elementLogo from '@/assets/social/element-logo.svg';
import discordLogo from '@/assets/social/discord-logo.svg';
import bcscanLogo from '@/assets/social/bcscan-logo.svg';

const SOCIAL_LINKS = [
  { icon: xLogo, href: 'https://x.com/twin3_ai', alt: 'X' },
  { icon: elementLogo, href: 'https://element.market/collections/twin3-1?search[toggles][0]=ALL', alt: 'Element' },
  { icon: discordLogo, href: 'https://discord.gg/ZveHDMVG', alt: 'Discord' },
  { icon: bcscanLogo, href: 'https://bscscan.com/token/0xe3ec133e29addfbba26a412c38ed5de37195156f', alt: 'BscScan' },
];

export const SiteFooter = () => (
  <footer className="w-full border-t border-foreground/5">
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      {/* Top row */}
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 lg:gap-16">
        {/* Logo */}
        <div className="flex flex-col items-start gap-2 shrink-0">
          <img src={logo} alt="twin3.ai" className="w-14 h-14" />
          <span className="text-base font-heading font-medium text-foreground/80">twin3.ai</span>
        </div>

        {/* Social Media */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Social Media</p>
          <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((link) => (
              <a
                key={link.alt}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
              >
                <img src={link.icon} alt={link.alt} className="w-5 h-5 social-icon" />
              </a>
            ))}
          </div>
        </div>

        {/* Subscribe */}
        <div className="space-y-2 md:ml-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Subscribe to Twin3 Newsletter</p>
          <a
            href="https://twin3.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 text-sm font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Subscribe
          </a>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="mt-8 pt-4 border-t border-foreground/5 text-center">
        <p className="text-xs text-muted-foreground/50">© 2025 Twin3.ai v1.1.0</p>
      </div>
    </div>
  </footer>
);
