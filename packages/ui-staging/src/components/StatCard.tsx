import type { ReactElement, ReactNode } from 'react';

export interface StatCardProps {
  label: ReactNode;
  value?: ReactNode;
  children?: ReactNode;
  tone?: 'neutral' | 'success' | 'danger';
  className?: string;
}

export function StatCard({
  label,
  value,
  children,
  tone = 'neutral',
  className = '',
}: StatCardProps): ReactElement {
  return (
    <article className={`wm-staged-stat-card ${className}`}>
      <p className="wm-staged-stat-label">{label}</p>
      {value !== undefined && (
        <p className={`wm-staged-stat-value wm-staged-stat-value--${tone}`}>{value}</p>
      )}
      {children}
    </article>
  );
}
