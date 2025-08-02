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
      className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-4 text-[#1d4ed8] max-sm:items-start max-[350px]:flex-col max-[350px]:gap-1"
      href={`/new?id=${note.id}`}
    >
      <p
        className="note-link hover:!opacity-100 flex flex-1 items-center gap-1 text-left text-base transition-opacity group-hover:opacity-40"
        style={{ wordBreak: 'break-word' }}
      >
        {note.title || 'Untitled Note'}
      </p>
      <span className="text-right text-muted-foreground max-[350px]:text-sm">
        {note.createdAt ? formatDate(note.createdAt) : ''}
      </span>
    </Link>
  );
}
