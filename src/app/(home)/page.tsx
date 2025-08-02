'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Github, NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { addNote, getNotes, type Note } from '@/lib/note-service';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [dateOrder, setDateOrder] = useState<'newest' | 'oldest'>('newest');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    async function loadNotes() {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const fetchedNotes = await getNotes(dateOrder);
        setNotes(fetchedNotes);
      } catch (_err) {
        setError('Failed to load notes. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      loadNotes();
    }
  }, [isSignedIn, isLoaded, dateOrder]);

  async function handleCreateNote() {
    if (!isSignedIn) {
      return;
    }

    try {
      const newNote = await addNote({
        title: 'Untitled Note',
        content: '',
      });
      router.push(`/new?id=${newNote.id}`);
    } catch (_err) {
      setError('Failed to create note. Please try again.');
    }
  }

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));

  // Filter notes by tag
  const filteredNotes = notes.filter((note) => {
    if (tagFilter === 'all') {
      return true;
    }
    return note.tags?.includes(tagFilter);
  });

  // Sort notes by date (they're already sorted from the API, but we can re-sort if filter changed)
  filteredNotes.sort((a, b) => {
    const aTime =
      typeof a.createdAt === 'number'
        ? a.createdAt
        : new Date(a.createdAt).getTime();
    const bTime =
      typeof b.createdAt === 'number'
        ? b.createdAt
        : new Date(b.createdAt).getTime();
    return dateOrder === 'newest' ? bTime - aTime : aTime - bTime;
  });

  // Group notes by first tag, untagged separately
  const grouped: Record<string, Note[]> = {};
  const untagged: Note[] = [];
  filteredNotes.forEach((note) => {
    if (note.tags && note.tags.length > 0) {
      const tag = note.tags[0];
      if (!grouped[tag]) {
        grouped[tag] = [];
      }
      grouped[tag].push(note);
    } else {
      untagged.push(note);
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-14 px-4 py-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-3xl tracking-tight">Iki</h1>
        </div>
        <div className="flex gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant={'outline'}>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
          </SignedIn>
          <Button asChild size={'icon'} variant={'secondary'}>
            <Link href={'http://github.com/preetsuthar17/iki'} target="_blank">
              <Github />
            </Link>
          </Button>
          <SignedIn>
            <Button onClick={handleCreateNote}>
              New Note
              <NotebookPen />
            </Button>
          </SignedIn>
        </div>
      </header>

      <SignedOut>
        <section className="py-12 text-center">
          <h2 className="mb-4 font-semibold text-2xl">Welcome to Iki</h2>
          <p className="mb-6 text-muted-foreground">
            A beautiful, open-source note-taking application. Sign in to start
            creating and managing your notes.
          </p>
          <div className="flex justify-center gap-4">
            <SignInButton mode="modal">
              <Button size="lg">Get Started</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </SignUpButton>
          </div>
        </section>
      </SignedOut>

      <SignedIn>
        <section>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-red-600">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-14">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-40 min-w-[120px]">
                <Select onValueChange={setTagFilter} value={tagFilter}>
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
                  onValueChange={(v) => setDateOrder(v as 'newest' | 'oldest')}
                  value={dateOrder}
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
            <div className="font-medium">
              {/* Notes List */}
              {loading ? (
                <div className="flex w-full justify-center py-12">
                  <Loader />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="mb-2 text-lg">No notes found.</p>
                  <p className="text-sm">
                    Create your first note to get started!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {/* Grouped by tag */}
                  {Object.entries(grouped).map(([tag, notes]) => (
                    <div className="flex flex-col gap-2" key={tag}>
                      <div className="mb-1 font-semibold text-base text-foreground">
                        {tag}
                      </div>
                      {notes.map((note) => (
                        <Link
                          className="wrap-break-word flex w-full cursor-pointer flex-wrap items-center justify-between gap-4 text-[#1d4ed8] max-sm:flex-col max-sm:items-start"
                          href={`/new?id=${note.id}`}
                          key={note.id}
                        >
                          <p
                            className="note-link hover:!opacity-100 flex flex-1 items-center gap-1 text-left text-base transition-opacity group-hover:opacity-40"
                            style={{ wordBreak: 'break-word' }}
                          >
                            {note.title || 'Untitled Note'}
                          </p>
                          <span className="min-w-[90px] text-right text-muted-foreground">
                            {note.createdAt
                              ? new Date(
                                  typeof note.createdAt === 'number'
                                    ? note.createdAt
                                    : note.createdAt
                                )
                                  .toISOString()
                                  .slice(0, 10)
                              : ''}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                  {untagged.length > 0 && Object.keys(grouped).length > 0 && (
                    <Separator />
                  )}
                  {/* Untagged notes */}
                  {untagged.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {untagged.map((note) => (
                        <Link
                          className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-4 text-[#1d4ed8] max-sm:flex-col max-sm:items-start"
                          href={`/new?id=${note.id}`}
                          key={note.id}
                        >
                          <p
                            className="note-link hover:!opacity-100 flex flex-1 items-center gap-1 text-left text-base transition-opacity group-hover:opacity-40"
                            style={{ wordBreak: 'break-all' }}
                          >
                            {note.title || 'Untitled Note'}
                          </p>
                          <span className="min-w-[90px] text-right text-muted-foreground">
                            {note.createdAt
                              ? new Date(
                                  typeof note.createdAt === 'number'
                                    ? note.createdAt
                                    : note.createdAt
                                )
                                  .toISOString()
                                  .slice(0, 10)
                              : ''}
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
      </SignedIn>
    </main>
  );
}
