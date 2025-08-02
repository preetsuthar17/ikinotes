import Link from 'next/link';

// Types
import type { Note } from '@/lib/note-service';

// Utils
import { formatDate } from '@/utils/note-utils';

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  return (
    <Link
      className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-4 text-[#1d4ed8] max-sm:flex-col max-sm:items-start"
      href={`/new?id=${note.id}`}
    >
      <p
        className="note-link hover:!opacity-100 flex flex-1 items-center gap-1 text-left text-base transition-opacity group-hover:opacity-40"
        style={{ wordBreak: 'break-word' }}
      >
        {note.title || 'Untitled Note'}
      </p>
      <span className="min-w-[90px] text-right text-muted-foreground">
        {note.createdAt ? formatDate(note.createdAt) : ''}
      </span>
    </Link>
  );
}
