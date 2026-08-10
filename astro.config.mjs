import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://vexania.co',
  integrations: [tailwind(), mdx(), preact()],
  adapter: vercel({ maxDuration: 30 }),
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