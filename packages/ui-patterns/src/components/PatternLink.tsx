import type { ReactElement, ReactNode } from 'react';

export interface PatternLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export type PatternLinkRenderer = (props: PatternLinkProps) => ReactNode;

export function PatternLink({ href, children, ...props }: PatternLinkProps): ReactElement {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
