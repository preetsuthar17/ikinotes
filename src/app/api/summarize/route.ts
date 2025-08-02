import { groq } from '@ai-sdk/groq';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { streamText } from 'ai';
import type { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(15, '5 m'),
});

const rateLimitCache = new LRUCache<string, { success: boolean; limit: number; remaining: number; reset: number }>({
  max: 1000,
  ttl: 5 * 60 * 1000,
});
const responseCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 60 * 60 * 1000, 
});

const RATE_LIMIT_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-store',
};

export async function POST(req: NextRequest) {
  if (req.headers.get('content-type') !== 'application/json') {
    return new Response('Invalid Content-Type', { status: 400 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';

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

  let content: string;
  try {
    const body = await req.json();
    content = body.content;
    if (!content || typeof content !== 'string') {
      return new Response('Missing or invalid content', { status: 400 });
    }
  } catch (error) {
    return new Response('Invalid JSON', { status: 400 });
  }

  const cacheKey = createHash('sha256').update(content).digest('hex');
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    return new Response(cachedResponse, {
      headers: {
        ...RATE_LIMIT_HEADERS,
        'X-Cache-Hit': 'true',
      },
    });
  }

  const { textStream } = await streamText({
    model: groq('llama-3.1-8b-instant'),
    prompt: `Summarize this in 4-5 sentences:\n${content}`,
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
      ...RATE_LIMIT_HEADERS,
      'X-Cache-Hit': 'false',
    },
  });
}

