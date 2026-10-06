// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://kodestudio.klyihao.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  security: {
    allowedDomains: [
      { hostname: 'kodestudio.klyihao.com', protocol: 'https' },
    ],
  },
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),
      SESSION_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      CALLMEBOT_APIKEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CALLMEBOT_PHONE: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
