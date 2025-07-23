"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getNotes, addNote, Note } from "@/lib/note-storage";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { Github, NotebookPen, View } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [dateOrder, setDateOrder] = useState<"newest" | "oldest">("newest");
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

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  // Filter notes by tag
  const filteredNotes = notes.filter((note) => {
    if (tagFilter === "all") return true;
    return note.tags && note.tags.includes(tagFilter);
  });

  // Sort notes by date
  filteredNotes.sort((a, b) =>
    dateOrder === "newest"
      ? b.createdAt - a.createdAt
      : a.createdAt - b.createdAt
  );

  // Group notes by first tag, untagged separately
  const grouped: Record<string, Note[]> = {};
  const untagged: Note[] = [];
  filteredNotes.forEach((note) => {
    if (note.tags && note.tags.length > 0) {
      const tag = note.tags[0];
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push(note);
    } else {
      untagged.push(note);
    }
  });

  return (
    <main className="flex flex-col min-h-screen max-w-2xl mx-auto py-12 px-4 gap-14">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ViewTransition name="iki-logo">
            <Image
              src="https://68u63cxp9s.ufs.sh/f/Q3JH7qTNtPXuRLGe8euIK9q7ed8fhWNTVmEF0SuPbkLQg1CO"
              alt="Iki"
              width={45}
              height={45}
            />
          </ViewTransition>
          <h1 className="text-3xl font-bold tracking-tight">Iki</h1>
        </div>
        <div className="flex gap-2">
          <Button size={"icon"} variant={"secondary"} asChild>
            <Link href={"http://github.com/preetsuthar17/iki"} target="_blank">
              <Github />
            </Link>
          </Button>
          <Button onClick={handleCreateNote}>
            New Note
            <NotebookPen />
          </Button>
        </div>
      </header>
      <section>
        <div className="flex flex-col gap-14">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-40 min-w-[120px]">
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40 min-w-[120px]">
              <Select
                value={dateOrder}
                onValueChange={(v) => setDateOrder(v as "newest" | "oldest")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            {/* Notes List */}
            {loading ? (
              <div className="w-full flex justify-center py-12">
                <Loader />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-muted-foreground">No notes found.</div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* Grouped by tag */}
                {Object.entries(grouped).map(([tag, notes]) => (
                  <div key={tag} className="flex flex-col gap-2">
                    <div className="font-semibold text-base text-foreground mb-1">
                      {tag}
                    </div>
                    {notes.map((note) => (
                      <Link
                        href={`/new?id=${note.id}`}
                        key={note.id}
                        className="text-[#1d4ed8] flex items-center justify-between w-full flex-wrap max-sm:flex-col max-sm:items-start gap-4 cursor-pointer"
                      >
                        <p
                          className="note-link text-base text-left flex-1 flex items-center gap-1 transition-opacity group-hover:opacity-40 hover:!opacity-100 "
                          style={{ wordBreak: "break-all" }}
                        >
                          {note.title || "Untitled Note"}
                        </p>
                        <span className="text-muted-foreground min-w-[90px] text-right">
                          {note.createdAt
                            ? new Date(note.createdAt)
                                .toISOString()
                                .slice(0, 10)
                            : ""}
                        </span>
                      </Link>
                    ))}
                  </div>
                ))}
                <Separator />
                {/* Untagged notes */}
                {untagged.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {untagged.map((note) => (
                      <Link
                        href={`/new?id=${note.id}`}
                        key={note.id}
                        className="text-[#1d4ed8] flex items-center justify-between w-full flex-wrap max-sm:flex-col max-sm:items-start gap-4 cursor-pointer"
                        onClick={() => router.push(`/new?id=${note.id}`)}
                      >
                        <p
                          className="note-link text-base text-left flex-1 flex items-center gap-1 transition-opacity group-hover:opacity-40 hover:!opacity-100 "
                          style={{ wordBreak: "break-all" }}
                        >
                          {note.title || "Untitled Note"}
                        </p>
                        <span className="text-muted-foreground min-w-[90px] text-right">
                          {note.createdAt
                            ? new Date(note.createdAt)
                                .toISOString()
                                .slice(0, 10)
                            : ""}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
