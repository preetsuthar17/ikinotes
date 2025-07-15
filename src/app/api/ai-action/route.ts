import { NextRequest } from "next/server";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export const runtime = "edge";

const PROMPTS = {
  summarize:
    process.env.AI_PROMPT_SUMMARIZE ||
    "Summarize the following note in 4-5 sentences:\n\n{content}",
  ask:
    process.env.AI_PROMPT_ASK ||
    "Given the following note, answer the user's question as clearly as possible.\n\nNote:\n{content}\n\nQuestion: {question}\nAnswer:",
  rewrite:
    process.env.AI_PROMPT_REWRITE ||
    "Rewrite the following note to b    e clearer, more concise, and engaging:\n\n{content}",
  improve:
    process.env.AI_PROMPT_IMPROVE ||
    "Suggest improvements for the following note. List specific suggestions for clarity, grammar, and style:\n\n{content}",
  fix:
    process.env.AI_PROMPT_FIX ||
    "Correct any grammar, spelling, or punctuation errors in the following note. Return the corrected note only:\n\n{content}",
  heading:
    process.env.AI_PROMPT_HEADING ||
    "Generate a concise, relevant, and engaging title for the following note. Return only the title:\n\n{content}",
};

export async function POST(req: NextRequest) {
  const body: {
    content?: string;
    action?: keyof typeof PROMPTS;
    question?: string;
  } = await req.json();
  let { content, action, question } = body;
  content = (content ?? "").trim();
  if (!content || !action || !(action in PROMPTS)) {
    return new Response("Missing or invalid input", { status: 400 });
  }
  let prompt = PROMPTS[action];
  prompt = prompt.replace("{content}", content);
  if (action === "ask") prompt = prompt.replace("{question}", question || "");

  const { textStream } = await streamText({
    model: groq("llama-3.1-8b-instant"),
    prompt,
  });
  return new Response(textStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
