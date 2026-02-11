import { Flow } from './flow-types.js';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 20000;

const stripCodeFences = (content: string) => {
  const trimmed = content.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```[a-zA-Z]*\n/, '')
    .replace(/```\s*$/, '')
    .trim();
};

const buildPrompt = (flow: Flow, baseScript: string) => {
  return [
    'You are improving a Playwright script generated from recorded browser events.',
    'Goals:',
    '- Keep behavior equivalent to the flow.',
    '- Collapse redundant steps (e.g., focus before click).',
    '- Prefer robust selectors (data-testid, role/name).',
    '- Use selectOption for <select> inputs.',
    '- Keep the script runnable as-is.',
    'Return only the updated TypeScript code. Do not include markdown fences.',
    '',
    'Flow JSON:',
    JSON.stringify(flow, null, 2),
    '',
    'Base script:',
    baseScript,
  ].join('\n');
};

const requestChatCompletion = async (apiKey: string, prompt: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are a senior QA proven to write stable Playwright scripts.',
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response missing content.');
    }

    return stripCodeFences(content);
  } finally {
    clearTimeout(timeout);
  }
};

export const generateLlmRunScript = async (flow: Flow, baseScript: string) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const prompt = buildPrompt(flow, baseScript);
  return requestChatCompletion(apiKey, prompt);
};
