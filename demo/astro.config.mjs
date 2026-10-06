// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

const secret = (optional = true) => envField.string({ context: 'server', access: 'secret', optional });

export default defineConfig({
  site: 'https://kodesme-demo.klyihao.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  env: {
    schema: {
      DATABASE_URL: secret(),
      GEMINI_API_KEY: secret(),
      GEMINI_MODEL: secret(),
      GOOGLE_SERVICE_ACCOUNT_EMAIL: secret(),
      GOOGLE_PRIVATE_KEY: secret(),
      GOOGLE_SHEET_ID: secret(),
      PRESENTER_PASSWORD: secret(),
      SESSION_SECRET: secret(),
    },
  },
});
