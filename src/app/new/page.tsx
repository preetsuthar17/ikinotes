"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getNotes, updateNote, Note } from "@/lib/note-storage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Home, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Sparkles } from "lucide-react";

export default function NewNotePage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [askInput, setAskInput] = useState("");
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [aiEditContent, setAiEditContent] = useState("");
  const [aiEditAction, setAiEditAction] = useState("rewrite");
  const [aiHeading, setAiHeading] = useState("");
  const [headingLoading, setHeadingLoading] = useState(false);

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const found = getNotes().find((n) => n.id === id);
    if (found) {
      setNote(found);
      setContent(found.content);
      setTitle(found.title);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!note) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      const updated = { ...note, content, title, updatedAt: Date.now() };
      updateNote(updated);
      setNote(updated);
    }, 500);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [title, content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  function handleBack() {
    router.back();
  }

  function handleHome() {
    router.push("/");
  }

  function handleDelete() {
    if (!note) return;
    const notes = getNotes().filter((n) => n.id !== note.id);
    localStorage.setItem("ikinotes-notes", JSON.stringify(notes));
    router.push("/");
  }

  async function handleSummarize() {
    setSummarizing(true);
    setSummary("");
    setSummaryError("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let result = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setSummary(result);
      }
      result += decoder.decode();
      setSummary(result);
      setSummarizing(false);
    } catch (e) {
      setSummaryError("Failed to summarize");
      setSummarizing(false);
    }
  }

  async function handleAIAction(
    action: string,
    question?: string,
    overrideContent?: string,
  ) {
    setAiAction(action);
    setAiResult("");
    setAiError("");
    setAiLoading(true);
    try {
      const usedContent = overrideContent ?? content;
      const res = await fetch("/api/ai-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: usedContent, action, question }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let result = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        if (action === "ask" || action === "summarize") setAiResult(result);
        // Do not setTitle here for heading
        else if (action !== "heading") setContent(result);
      }
      result += decoder.decode();
      if (action === "ask" || action === "summarize") setAiResult(result);
      else if (action === "heading") setTitle(result.trim());
      else setContent(result);
    } catch (e) {
      setAiError("Failed to process AI action");
    }
    setAiLoading(false);
  }

  async function handleAIHeading() {
    setHeadingLoading(true);
    await handleAIAction("heading");
    setHeadingLoading(false);
  }

  return (
    <main className="flex flex-col min-h-screen max-w-2xl mx-auto py-12 px-4 gap-14">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <>
          <nav className="flex gap-2 items-center">
            <Button variant="ghost" size={"icon"} onClick={handleBack}>
              <ArrowLeft />
            </Button>
            <Button variant="ghost" size={"icon"} onClick={handleHome}>
              <Home />
            </Button>
            <Button
              variant="outline"
              size={"icon"}
              onClick={handleDelete}
              className="ml-auto"
              aria-label="Delete note"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
          </nav>
          <div className="flex flex-col gap-8 flex-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAIAction("ask", askInput);
              }}
              className="flex gap-2 items-center"
            >
              <Input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                placeholder="Ask a question..."
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                disabled={aiLoading}
              />
              <Button
                type="submit"
                disabled={aiLoading || !askInput.trim() || !content.trim()}
                variant="outline"
              >
                Ask
              </Button>
            </form>
            <div className="flex flex-wrap gap-2 mb-2 items-center">
              <Button
                className="grow"
                onClick={() => handleAIAction("summarize")}
                disabled={aiLoading || !content.trim()}
                variant="outline"
              >
                Summarize
              </Button>
              <Button
                className="grow"
                onClick={() => handleAIAction("rewrite")}
                disabled={aiLoading || !content.trim()}
                variant="outline"
              >
                Rewrite
              </Button>
              <Button
                className="grow"
                onClick={() => handleAIAction("fix")}
                disabled={aiLoading || !content.trim()}
                variant="outline"
              >
                Fix Grammar
              </Button>
              <Button
                className="grow"
                onClick={() => {
                  setAiEditContent(content);
                  setShowAiEdit(true);
                }}
                disabled={aiLoading || !content.trim()}
                variant="outline"
              >
                Edit with AI
              </Button>
              <Button
                className="grow"
                onClick={handleAIHeading}
                disabled={headingLoading || !content.trim()}
                variant="outline"
              >
                Generate Heading
              </Button>
            </div>
            {showAiEdit && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setShowAiEdit(false);
                    await handleAIAction(
                      aiEditAction,
                      undefined,
                      aiEditContent,
                    );
                  }}
                  className="bg-background p-6 rounded shadow-lg flex flex-col gap-4 min-w-[320px]"
                >
                  <label className="font-semibold">Edit with AI:</label>
                  <Textarea
                    className="border rounded p-2 text-base"
                    value={aiEditContent}
                    onChange={(e) => setAiEditContent(e.target.value)}
                    rows={8}
                  />
                  <select
                    className="border rounded p-2"
                    value={aiEditAction}
                    onChange={(e) => setAiEditAction(e.target.value)}
                  >
                    <option value="rewrite">Rewrite</option>
                    <option value="fix">Fix Grammar</option>
                  </select>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAiEdit(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="outline">
                      Apply AI Edit
                    </Button>
                  </div>
                </form>
              </div>
            )}
            <div className="flex gap-2 mb-2">
              {(aiAction === "ask" || aiAction === "summarize") && aiResult && (
                <div className="mb-2 p-3 rounded bg-muted text-base">
                  <span className="font-semibold capitalize">{aiAction}:</span>{" "}
                  {aiResult}
                </div>
              )}
              {aiError && (
                <div className="mb-2 p-3 rounded bg-destructive/10 text-destructive text-base">
                  {aiError}
                </div>
              )}
            </div>
            <Input
              className=" text-[#1d4ed8]  w-full text-2xl font-semibold bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0  focus-visible:border-0 border-none focus-visible:shadow-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              style={{ minHeight: 0, boxShadow: "none", border: "none" }}
            />
            <Textarea
              ref={textareaRef}
              className="w-full resize-none bg-transparent text-base focus:outline-none focus:ring-0 border-none shadow-none p-0 h-auto"
              value={content}
              onChange={handleContentChange}
              placeholder="Write your note..."
              style={{ boxShadow: "none", border: "none", overflow: "hidden" }}
            />
          </div>
        </>
      )}
    </main>
  );
}
