import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import 'dotenv/config';

// Vercel AI Gateway with Google Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  // If using Vercel AI Gateway, set the baseURL:
  // baseURL: process.env.AI_GATEWAY_URL,
});

async function main() {
  console.log('Testing AI Gateway with Gemini...\n');

  const result = streamText({
    model: google('gemini-1.5-pro'), // Replace with your actual Gemini model ID
    prompt: 'Say hello and confirm the AI Gateway is working with Gemini.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log('\n\n✅ Gemini stream completed successfully!');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
