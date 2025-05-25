import { genkit, GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import logger from '@/lib/logger'; // Import the logger

let googleAiPlugin: GenkitPlugin | undefined = undefined;

try {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    logger.warn('GOOGLE_GENAI_API_KEY is not set. Google AI features will be unavailable.');
    // Potentially set a flag or use a mock plugin if AI is optional
  } else {
    googleAiPlugin = googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });
  }
} catch (error) {
  logger.error('Failed to initialize Google AI plugin:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  // Decide if you want to throw the error or let the app run without AI
  // For now, we let it run, and googleAiPlugin will be undefined.
  // If AI is critical, you might rethrow the error or exit:
  // throw new Error('AI Plugin initialization failed.');
}

const plugins: GenkitPlugin[] = [];
if (googleAiPlugin) {
  plugins.push(googleAiPlugin);
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: plugins,
  model: googleAiPlugin ? 'googleai/gemini-2.0-flash' : undefined, // Conditionally set model
  // Consider adding a flowStateStore or traceStore if not already present
  // and if you want to persist traces/states, especially if AI is optional.
});

// Optional: Export a function to check AI readiness
export function isAiReady(): boolean {
  return !!googleAiPlugin;
}
