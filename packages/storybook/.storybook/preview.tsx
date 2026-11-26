import type { Preview } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useGlobals } from 'storybook/preview-api';
import '@wintermuted/ui-theme/index.css';
import '../../app/src/app/styles/App.css';
import '../../ui-grid/src/styles/Grid.css';
import './preview.css';
import PreviewProviders from './PreviewProviders';

const preview: Preview = {
  tags: ['autodocs'],
  initialGlobals: { theme: 'light', locale: 'en' },
  globalTypes: {
    theme: {
      description: 'Product theme',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Product language',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'es', title: 'Español' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    function ProductPreview(Story, context): ReactElement {
      const [, updateGlobals] = useGlobals();
      const mode = context.globals.theme === 'dark' ? 'dark' : 'light';
      const locale = context.globals.locale === 'es' ? 'es' : 'en';
      return (
        <PreviewProviders
          mode={mode}
          locale={locale}
          applyDocumentTheme={context.viewMode === 'story'}
          toggleTheme={() => updateGlobals({ theme: mode === 'dark' ? 'light' : 'dark' })}
        >
          <Story />
        </PreviewProviders>
      );
    },
  ],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { expanded: true },
    options: { storySort: { order: ['Product', ['Primitives', 'Patterns', 'Grid', 'Controls']] } },
  },
};

export default preview;
