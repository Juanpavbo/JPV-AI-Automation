import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import db from '@astrojs/db';

export default defineConfig({
  site: 'https://jpv-ai-automation.vercel.app',
  integrations: [tailwind(), mdx(), db()],
  adapter: import('@astrojs/vercel/edge')(),
  output: 'hybrid',
  prefetch: { prefetchAll: true },
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  vite: {
    optimizeDeps: { include: ['preact', 'lucide-preact', '@supabase/supabase-js'] },
    ssr: { noExternal: ['@supabase/supabase-js'] }
  },
  experimental: { contentIntellisense: true }
});