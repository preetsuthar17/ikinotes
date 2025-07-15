"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  getNotes,
  getFolders,
  addNote,
  addFolder,
  deleteNote,
  deleteFolder,
  moveNoteToFolder,
  Note,
  Folder,
} from "@/lib/note-storage";
import { useRouter } from "next/navigation";
import { NoteCard } from "@/components/NoteCard";
import Image from "next/image";
import { Loader } from "@/components/ui/loader";

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

  function handleDeleteNote(id: string) {
    deleteNote(id);
    setNotes(getNotes());
  }

  return (
    <main className="flex flex-col min-h-screen max-w-2xl mx-auto py-8 px-4 gap-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">ikinotes</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateNote}>New Note</Button>
        </div>
      </header>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 flex justify-center py-12">
              <Loader />
            </div>
          ) : notes.length === 0 ? (
            <div className="col-span-2 text-muted-foreground">
              No notes yet.
            </div>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                onOpen={(id) => router.push(`/new?id=${id}`)}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
