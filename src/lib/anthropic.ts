import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

let _client: Anthropic | null = null
function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
  return _client
}

export async function claudeComplete(
  prompt: string,
  opts: { maxTokens?: number; temperature?: number; system?: string } = {}
): Promise<string> {
  const resp = await client().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages: [{ role: 'user', content: prompt }],
  })
  const parts = resp.content.map(c => (c.type === 'text' ? c.text : '')).filter(Boolean)
  return parts.join('\n').trim()
}

export async function* claudeStream(
  prompt: string,
  opts: { maxTokens?: number; temperature?: number; system?: string } = {}
): AsyncGenerator<string> {
  const stream = await client().messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.7,
    system: opts.system,
    messages: [{ role: 'user', content: prompt }],
  })
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}
