import { NextRequest } from "next/server";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
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
    },
  });
}
