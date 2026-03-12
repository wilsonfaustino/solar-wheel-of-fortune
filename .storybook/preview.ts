import addonPerformancePanel from '@github-ui/storybook-addon-performance-panel';
import { definePreview } from '@storybook/react-vite';
import '../src/index.css';

export default definePreview({
  addons: [addonPerformancePanel()],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
});
