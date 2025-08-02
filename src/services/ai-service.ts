export type AIAction = 'ask' | 'summarize' | 'rewrite' | 'fix' | 'heading';

export async function performAIAction(
  content: string,
  action: AIAction,
  question?: string
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('/api/ai-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, action, question }),
  });

  if (!response.body) {
    throw new Error('No response body');
  }

  return response.body;
}

export async function processStreamedResponse(
  stream: ReadableStream<Uint8Array>,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const reader = stream.getReader();
  let result = '';
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    result += chunk;
    onChunk?.(result);
  }

  result += decoder.decode();
  return result;
}
