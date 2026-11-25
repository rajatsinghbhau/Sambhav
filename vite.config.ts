/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGenerateLessonGraph } from './server/generateLessonGraph';
import fs from 'fs';
import path from 'path';

function loadServerEnv(): Record<string, string> {
  const envPath = path.resolve(__dirname, '.env');
  const env: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        env[match[1]] = (match[2] || '').trim();
      }
    }
  }
  return env;
}

// Serverless API middleware for Vite dev and preview servers
function serverlessApiPlugin(): Plugin {
  const serverEnv = loadServerEnv();
  // Support either SERVER_GEMINI_API_KEY or GEMINI_API_KEY on the server
  const apiKey = serverEnv.SERVER_GEMINI_API_KEY || serverEnv.GEMINI_API_KEY || process.env.SERVER_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

  return {
    name: 'serverless-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/generate-lesson-graph') {
          handleGenerateLessonGraph(req, res, apiKey);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/generate-lesson-graph') {
          handleGenerateLessonGraph(req, res, apiKey);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), serverlessApiPlugin()],
  test: {
    globals: true,
    environment: 'node',
  },
});
