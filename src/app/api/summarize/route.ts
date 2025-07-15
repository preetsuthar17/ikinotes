import { NextRequest } from "next/server";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(15, "5 m"),
});

export async function POST(req: NextRequest) {
  // Use IP address for per-user rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const result = await ratelimit.limit(ip);
  if (!result.success) {
    return new Response(
      JSON.stringify({
        message: "The request has been rate limited.",
        rateLimitState: result,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
        },
      },
    );
  }
  const { content } = await req.json();
  if (!content || typeof content !== "string") {
    return new Response("Missing or invalid content", { status: 400 });
  }

  const { textStream } = await streamText({
    model: groq("llama-3.1-8b-instant"),
    prompt: `Summarize the following note in 4-5 sentences:\n\n${content}`,
  });

  return new Response(textStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
    },
  });
}
