import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dns from 'node:dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: true
  }
});
