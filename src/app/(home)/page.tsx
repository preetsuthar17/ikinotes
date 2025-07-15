"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getNotes, addNote, Note } from "@/lib/note-storage";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { NotebookPen } from "lucide-react";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setNotes(getNotes());
    setLoading(false);
  }, []);

  function handleCreateNote() {
    const id = crypto.randomUUID();
    const now = Date.now();
    addNote({
      id,
      title: "Untitled Note",
      content: "",
      createdAt: now,
      updatedAt: now,
    });
    router.push(`/new?id=${id}`);
  }

  return (
    <main className="flex flex-col min-h-screen max-w-2xl mx-auto py-12 px-4 gap-14">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ikinotes</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateNote}>
            New Note
            <NotebookPen />
          </Button>
        </div>
      </header>
      <section>
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="w-full flex justify-center py-12">
              <Loader />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-muted-foreground">No notes yet.</div>
          ) : (
            <div className="flex flex-col gap-2 group">
              {notes.map((note, idx) => (
                <div
                  key={note.id}
                  className="text-[#1d4ed8] flex items-center justify-between w-full"
                >
                  <button
                    className="note-link text-base text-left flex-1 flex items-center gap-1 transition-opacity group-hover:opacity-40 hover:!opacity-100"
                    onMouseEnter={(e) =>
                      e.currentTarget.classList.add("!opacity-100")
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.classList.remove("!opacity-100")
                    }
                    onClick={() => router.push(`/new?id=${note.id}`)}
                    style={{ wordBreak: "break-all" }}
                  >
                    {note.title || "Untitled Note"}
                  </button>
                  <span className="text-muted-foreground ml-4 min-w-[90px] text-right">
                    {note.createdAt
                      ? new Date(note.createdAt).toISOString().slice(0, 10)
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
