"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getNotes, updateNote, Note } from "@/lib/note-storage";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Home, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Sparkles } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { TagInput } from "@/components/ui/tag-input";
import Image from "next/image";
import { unstable_ViewTransition as ViewTransition } from "react";
import Link from "next/link";

export default function NewNotePage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  const [aiHeading, setAiHeading] = useState("");
  const [headingLoading, setHeadingLoading] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [aiEditPrompt, setAiEditPrompt] = useState("");

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    setUnsaved(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
      // Removed scrollTop restore to prevent auto-scroll to end
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    setUnsaved(true);
  }

  function handleSave() {
    if (!note) return;
    const updated = { ...note, content, title, tags, updatedAt: Date.now() };
    updateNote(updated);
    setUnsaved(false);
    setNote(updated);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const notes = getNotes();
    const found = notes.find((n) => n.id === id);
    if (found) {
      setNote(found);
      setContent(found.content);
      setTitle(found.title);
      setTags(found.tags || []);
    }
    // Gather all unique tags from all notes
    setAllTags(Array.from(new Set(notes.flatMap((n) => n.tags || []))));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
      // Removed scrollTop restore to prevent auto-scroll to end
    }
  }, [content]);

  function handleBack() {
    router.back();
  }

  function handleHome() {
    router.push("/");
  }

  // Simple line diff function
  function getDiffLines(oldStr: string, newStr: string) {
    const oldLines = oldStr.split("\n");
    const newLines = newStr.split("\n");
    const diff = [];
    let i = 0,
      j = 0;
    while (i < oldLines.length || j < newLines.length) {
      if (
        i < oldLines.length &&
        j < newLines.length &&
        oldLines[i] === newLines[j]
      ) {
        diff.push({ type: "unchanged", text: oldLines[i] });
        i++;
        j++;
      } else if (
        j < newLines.length &&
        (!oldLines[i] || oldLines[i] !== newLines[j])
      ) {
        diff.push({ type: "added", text: newLines[j] });
        j++;
      } else if (
        i < oldLines.length &&
        (!newLines[j] || oldLines[i] !== newLines[j])
      ) {
        diff.push({ type: "removed", text: oldLines[i] });
        i++;
      } else {
        i++;
        j++;
      }
    }
    return diff;
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
    overrideContent?: string
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
      else if (action === "heading") {
        setTitle(result.trim());
        setUnsaved(true);
      } else setContent(result);
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
    <main
      className="flex flex-col max-w-2xl mx-auto px-4 gap-6 py-4"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <>
          <nav className="flex gap-2 items-center md:absolute right-12">
            <Button variant="ghost" size={"icon"} asChild>
              <Link href={`/`}>
                <ArrowLeft />
              </Link>
            </Button>
            <Button variant="ghost" size={"icon"} asChild>
              <Link href={`/`}>
                <Home />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size={"icon"}
              onClick={handleDelete}
              className="ml-auto"
              aria-label="Delete note"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
          </nav>
          <Input
            className=" text-[#1d4ed8]  w-full text-2xl font-semibold bg-transparent p-0 focus-visible:outline-none focus-visible:ring-0  focus-visible:border-0 border-none focus-visible:shadow-none"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title..."
            style={{ minHeight: 0, boxShadow: "none", border: "none" }}
          />
          <TagInput
            tags={tags}
            onTagsChange={(newTags) => {
              setTags(newTags);
              setUnsaved(true);
            }}
            placeholder="Add tags..."
            className="mb-2"
            suggestions={allTags}
          />
          <div
            className="flex flex-col gap-3 flex-1"
            style={{ height: "calc(100vh - 220px)" }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAIAction("ask", askInput);
              }}
              className="flex gap-2 items-center"
            >
              <Input
                type="text"
                className="border rounded px-4 py-1 text-sm"
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
                  setAiEditPrompt("");
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
            <Modal open={showAiEdit} onOpenChange={setShowAiEdit}>
              <ModalContent className="w-full h-full max-h-[95vh] flex flex-col p-4 sm:p-8 gap-4 max-w-[95%]">
                <ModalHeader>
                  <ModalTitle>Edit with AI</ModalTitle>
                </ModalHeader>
                <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:gap-8 overflow-hidden h-full">
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="font-semibold mb-2">Original Note</span>
                    <ScrollArea className="border border-border rounded-card p-2 text-base flex-1 bg-muted/30 whitespace-pre-wrap">
                      {content}
                    </ScrollArea>
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="font-semibold mb-2">
                      AI Edited Note (Diff)
                    </span>
                    <ScrollArea className="border border-border rounded-card p-2 text-base flex-1 whitespace-pre-wrap">
                      {getDiffLines(content, aiEditContent).map((line, idx) => (
                        <div
                          key={idx}
                          style={{
                            background:
                              line.type === "added"
                                ? "#e6ffed"
                                : line.type === "removed"
                                ? "#ffeef0"
                                : "transparent",
                            color:
                              line.type === "added"
                                ? "#22863a"
                                : line.type === "removed"
                                ? "#b31d28"
                                : undefined,
                          }}
                        >
                          {line.type === "added"
                            ? "+ "
                            : line.type === "removed"
                            ? "- "
                            : "  "}
                          {line.text}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>{" "}
                <div className="flex flex-col gap-4">
                  <Input
                    type="text"
                    size={"lg"}
                    className="w-full"
                    value={aiEditPrompt}
                    onChange={(e) => setAiEditPrompt(e.target.value)}
                    placeholder="Enter your prompt for AI..."
                  />
                  <Button
                    variant="outline"
                    className="self-end"
                    onClick={async () => {
                      setAiLoading(true);
                      setAiError("");
                      try {
                        const prompt =
                          aiEditPrompt.trim() +
                          "\nDo not include any meta text like 'Here's a summary:', 'Here's a simplified version:', or similar. Only output the result.";
                        const res = await fetch("/api/ai-action", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            content,
                            action: "rewrite",
                            question: prompt,
                          }),
                        });
                        if (!res.body) throw new Error("No response body");
                        const reader = res.body.getReader();
                        let result = "";
                        const decoder = new TextDecoder();
                        while (true) {
                          const { done, value } = await reader.read();
                          if (done) break;
                          result += decoder.decode(value, { stream: true });
                        }
                        result += decoder.decode();
                        setAiEditContent(result);
                      } catch (e) {
                        setAiError("Failed to process AI action");
                      }
                      setAiLoading(false);
                    }}
                    disabled={aiLoading || !aiEditPrompt.trim()}
                  >
                    Run AI Edit
                  </Button>
                </div>
                <ModalFooter className="justify-end mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAiEdit(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => {
                      setShowAiEdit(false);
                      if (note) {
                        const updated = {
                          ...note,
                          content: aiEditContent,
                          title,
                          tags,
                          updatedAt: Date.now(),
                        };
                        updateNote(updated);
                        setUnsaved(false);
                        setNote(updated);
                        setContent(aiEditContent);
                      }
                    }}
                    disabled={aiEditContent.trim() === content.trim()}
                  >
                    Confirm
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <div className="flex gap-2">
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
            <ScrollArea className="flex-1 w-full">
              <Textarea
                ref={textareaRef}
                className="w-full min-h-[80px] bg-transparent text-base focus:outline-none border-none shadow-none p-0 h-auto rounded-ele px-3 py-2 flex-1"
                style={{
                  boxShadow: "none",
                  border: "none",
                  outline: "none",
                  overflowY: "auto",
                  height: "100%",
                  maxHeight: "100%",
                  resize: "none",
                  background: "transparent",
                }}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setUnsaved(true);
                }}
                onBlur={(e) => {
                  setContent(e.target.value);
                }}
              />
            </ScrollArea>
            {unsaved && (
              <Alert
                variant={"info"}
                className="text-center rounded-0 fixed bottom-3 right-3 max-w-[95%] w-fit"
              >
                You have unsaved changes.
              </Alert>
            )}
            <Button onClick={handleSave} disabled={!unsaved} variant="default">
              Save
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
