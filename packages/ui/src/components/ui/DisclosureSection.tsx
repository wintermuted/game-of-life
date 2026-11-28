import { useId, useState, type ReactElement, type ReactNode } from 'react';
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
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const headingId = useId();
  return (
    <div
      className={`diagnostics-section${headerAction ? ' diagnostics-section-with-action' : ''}${className ? ` ${className}` : ''}`}
    >
      <Accordion
        className="diagnostics-disclosure"
        open={defaultOpen}
        onToggle={(event) => setIsOpen(event.currentTarget.open)}
        title={
          <h4 id={headingId} className="diagnostics-section-heading">
            {title}
          </h4>
        }
      >
        {headerAction ? null : children}
      </Accordion>
      {headerAction && <div className="diagnostics-section-action">{headerAction}</div>}
      {headerAction && (
        <div hidden={!isOpen} role="group" aria-labelledby={headingId}>
          {children}
        </div>
      )}
    </div>
  );
}
