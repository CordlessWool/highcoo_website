import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://highcoo.studio',
  integrations: [
    sitemap(),
  ],
});
