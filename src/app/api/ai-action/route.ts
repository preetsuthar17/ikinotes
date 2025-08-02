import { createHash } from 'node:crypto';
import { groq } from '@ai-sdk/groq';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { streamText } from 'ai';
import { LRUCache } from 'lru-cache';
import type { NextRequest } from 'next/server';
import { sanitizeString } from '@/lib/utils';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(15, '5 m'),
});

const responseCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 60 * 60 * 1000,
});

const rateLimitCache = new LRUCache<
  string,
  { success: boolean; limit: number; remaining: number; reset: number }
>({
  max: 1000,
  ttl: 5 * 60 * 1000,
});

const PROMPTS = {
  summarize:
    process.env.AI_PROMPT_SUMMARIZE ||
    'Summarize this in 4-5 sentences:\n{content}',
  ask:
    process.env.AI_PROMPT_ASK ||
    'Given this note, answer the question clearly.\nNote:\n{content}\nQuestion: {question}\nAnswer:',
  rewrite:
    process.env.AI_PROMPT_REWRITE ||
    'Rewrite this to be clearer, concise, and engaging:\n{content}',
  improve:
    process.env.AI_PROMPT_IMPROVE ||
    'Suggest specific improvements for clarity, grammar, and style:\n{content}',
  fix:
    process.env.AI_PROMPT_FIX ||
    'Correct grammar, spelling, or punctuation errors. Return the corrected note:\n{content}',
  heading:
    process.env.AI_PROMPT_HEADING ||
    'Generate a concise, relevant, engaging title:\n{content}',
};

const RESPONSE_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store',
};

export async function POST(req: NextRequest) {
  if (req.headers.get('content-type') !== 'application/json') {
    return new Response('Invalid Content-Type', { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  const cachedRateLimit = rateLimitCache.get(ip);
  if (cachedRateLimit) {
    if (!cachedRateLimit.success) {
      return new Response(
        JSON.stringify({
          message: 'The request has been rate limited.',
          rateLimitState: cachedRateLimit,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': cachedRateLimit.limit.toString(),
            'X-RateLimit-Remaining': cachedRateLimit.remaining.toString(),
          },
        }
      );
    }
  } else {
    const result = await ratelimit.limit(ip);
    rateLimitCache.set(ip, result);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          message: 'The request has been rate limited.',
          rateLimitState: result,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
          },
        }
      );
    }
  }

  let body: {
    content?: string;
    action?: keyof typeof PROMPTS;
    question?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  let { content, action, question } = body;
  content = sanitizeString((content ?? '').trim());
  if (question) {
    question = sanitizeString(question);
  }
  if (!(content && action && action in PROMPTS)) {
    return new Response('Missing or invalid input', { status: 400 });
  }

  const cacheKey = createHash('sha256')
    .update(`${action}:${content}:${question || ''}`)
    .digest('hex');
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    return new Response(cachedResponse, {
      headers: {
        ...RESPONSE_HEADERS,
        'X-Cache-Hit': 'true',
        'X-RateLimit-Limit': rateLimitCache.get(ip)?.limit.toString(),
        'X-RateLimit-Remaining': rateLimitCache.get(ip)?.remaining.toString(),
      },
    });
  }

  let prompt = PROMPTS[action];
  if (action === 'rewrite' && question) {
    prompt = `${question}\n\n${content}`;
  } else {
    prompt = prompt.replace('{content}', content);
    if (action === 'ask') {
      prompt = prompt.replace('{question}', question || '');
    }
  }

  const { textStream } = await streamText({
    model: groq('llama-3.1-8b-instant'),
    prompt,
  });

  let fullText = '';
  const textStreamWithCaching = new ReadableStream({
    async start(controller) {
      for await (const chunk of textStream) {
        fullText += chunk;
        controller.enqueue(chunk);
      }
      responseCache.set(cacheKey, fullText);
      controller.close();
    },
  });

  return new Response(textStreamWithCaching, {
    headers: {
      ...RESPONSE_HEADERS,
      'X-Cache-Hit': 'false',
      'X-RateLimit-Limit': rateLimitCache.get(ip)?.limit.toString(),
      'X-RateLimit-Remaining': rateLimitCache.get(ip)?.remaining.toString(),
    },
  });
}
