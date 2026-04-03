import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const key = env.split('VITE_ANTHROPIC_API_KEY=')[1].split('\n')[0].trim();

const anthropic = new Anthropic({
  apiKey: key,
});

async function test() {
  try {
    const res = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 100,
      system: [
        {
          type: "text",
          text: "You are a helpful assistant.",
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log("Success:", res.content);
  } catch (e: any) {
    console.error("Error:", e.message, e.status, e.name);
  }
}

test();
