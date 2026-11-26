import type { ReactElement, ReactNode } from 'react';

export interface DisclosureSectionProps {
  title: string;
  children: ReactNode;
  headerAction?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function DisclosureSection({
  title,
  children,
  headerAction,
  defaultOpen = true,
  className = '',
}: DisclosureSectionProps): ReactElement {
  return (
    <details
      className={`diagnostics-section${className ? ` ${className}` : ''}`}
      open={defaultOpen}
    >
      <summary className="diagnostics-section-summary">
        <h4 className="diagnostics-section-heading">{title}</h4>
        {headerAction}
      </summary>
      <div className="diagnostics-section-content">{children}</div>
    </details>
  );
}
