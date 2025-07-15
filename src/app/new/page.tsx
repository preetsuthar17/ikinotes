"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getNotes, updateNote, Note } from "@/lib/note-storage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Home, Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";

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

  // Auto-save on title/content change
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
