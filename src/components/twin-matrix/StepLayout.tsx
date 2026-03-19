import type { ReactNode } from "react";

// StepContent — simple wrapper used by step components
export const StepContent = ({ children, ...props }: any) => (
  <div className="space-y-4" {...props}>{children}</div>
);

// StepFooter — simple wrapper used by step components
export const StepFooter = ({ children, ...props }: any) => (
  <div className="flex justify-between pt-4" {...props}>{children}</div>
);

// StepLayout — main layout
export const StepLayout = ({ children, ...props }: any) => (
  <div className="mx-auto max-w-2xl space-y-6 py-8 px-4" {...props}>{children}</div>
);

export default StepLayout;
