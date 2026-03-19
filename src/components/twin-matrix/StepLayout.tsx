import type { ReactNode } from "react";

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
}

export const StepLayout = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = "Next",
  backLabel = "Back",
  nextDisabled = false,
}: StepLayoutProps) => (
  <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
    <div className="space-y-2">
      <h2 className="font-heading text-2xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
    <div className="space-y-4">{children}</div>
    <div className="flex justify-between pt-4">
      {onBack ? (
        <button onClick={onBack} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
          {backLabel}
        </button>
      ) : <div />}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {nextLabel}
        </button>
      )}
    </div>
  </div>
);

export default StepLayout;
