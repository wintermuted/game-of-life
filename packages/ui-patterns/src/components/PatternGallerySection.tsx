import type { ReactElement, ReactNode } from 'react';

export interface PatternGallerySectionProps {
  title: string;
  count: number;
  icon?: ReactNode;
  id?: string;
  viewMode?: 'cards' | 'table';
  children: ReactNode;
}

export function PatternGallerySection({
  title,
  count,
  icon,
  id,
  viewMode,
  children,
}: PatternGallerySectionProps): ReactElement {
  return (
    <section
      id={id}
      className={`profile-gallery-section${viewMode === 'cards' ? ' explore-gallery-section-cards' : ''}`}
    >
      <div className="profile-section-heading-row">
        <h2>
          {icon ? (
            <span className="profile-section-heading-label">
              {icon}
              <span>{title}</span>
            </span>
          ) : (
            title
          )}
        </h2>
        <span className="wm-badge wm-badge-neutral">{count}</span>
      </div>
      {children}
    </section>
  );
}
