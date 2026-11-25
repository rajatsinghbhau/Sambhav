/// <reference types="vitest" />
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleGenerateLessonGraph } from './server/generateLessonGraph';
import { handleGenerateActivities, handleGenerateExplanation, handleGenerateExamCheckpoint, handleGenerateSandboxSimulation } from './server/aiAssistant';
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
  // Support Gemini API and Groq API
  const geminiApiKey = serverEnv.SERVER_GEMINI_API_KEY || serverEnv.GEMINI_API_KEY || process.env.SERVER_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  const groqApiKey = serverEnv.GROQ_API_KEY || serverEnv.SERVER_GROQ_API_KEY || process.env.GROQ_API_KEY || process.env.SERVER_GROQ_API_KEY || '';

  const handleRoutes = (req: any, res: any, next: any) => {
    if (req.url === '/api/generate-lesson-graph') {
      handleGenerateLessonGraph(req, res, geminiApiKey);
    } else if (req.url === '/api/generate-activities') {
      handleGenerateActivities(req, res, geminiApiKey);
    } else if (req.url === '/api/generate-simple-explanation') {
      handleGenerateExplanation(req, res, geminiApiKey);
    } else if (req.url === '/api/generate-exam-checkpoint') {
      handleGenerateExamCheckpoint(req, res, geminiApiKey);
    } else if (req.url === '/api/generate-sandbox-simulation') {
      handleGenerateSandboxSimulation(req, res, { geminiApiKey, groqApiKey });
    } else {
      next();
    }
  };

  return {
    name: 'serverless-api-plugin',
    configureServer(server) {
      server.middlewares.use(handleRoutes);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRoutes);
    }
  };
}

export default defineConfig({
  plugins: [react(), serverlessApiPlugin()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', 'clsx', 'tailwind-merge'],
  },
  server: {
    host: true,
    allowedHosts: ['sambhav.nivixsa.com', '.nivixsa.com'],
  },
  preview: {
    host: true,
    allowedHosts: ['sambhav.nivixsa.com', '.nivixsa.com'],
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
