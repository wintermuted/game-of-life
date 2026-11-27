import type { ReactElement, ReactNode } from 'react';
import { Accordion } from '@wintermuted/ui-react';

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
    <div
      className={`diagnostics-section${headerAction ? ' diagnostics-section-with-action' : ''}${className ? ` ${className}` : ''}`}
    >
      <Accordion
        className="diagnostics-disclosure"
        open={defaultOpen}
        title={<h4 className="diagnostics-section-heading">{title}</h4>}
      >
        {children}
      </Accordion>
      {headerAction && <div className="diagnostics-section-action">{headerAction}</div>}
    </div>
  );
}
