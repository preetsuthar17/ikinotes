// UI Components
import { Loader } from '@/components/ui/loader';
import { Separator } from '@/components/ui/separator';
// Types
import type { Note } from '@/lib/note-service';
// Home Components
import { NoteItem } from './note-item';

interface NotesListProps {
  loading: boolean;
  grouped: Record<string, Note[]>;
  untagged: Note[];
  hasNotes: boolean;
}

export function NotesList({
  loading,
  grouped,
  untagged,
  hasNotes,
}: NotesListProps) {
  if (loading) {
    return (
      <div className="flex w-full justify-center">
        <Loader />
      </div>
    );
  }

  if (!hasNotes) {
    return (
      <div className="text-center text-muted-foreground">
        <p className="text-lg">No notes found.</p>
        <p className="text-sm">Create your first note to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(grouped).map(([tag, notes]) => (
        <div className="flex flex-col gap-2 max-[350px]:gap-4" key={tag}>
          <div className="font-semibold text-base text-foreground">{tag}</div>
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      ))}
      {untagged.length > 0 && Object.keys(grouped).length > 0 && <Separator />}
      {untagged.length > 0 && (
        <div className="flex flex-col gap-2 max-[350px]:gap-4">
          {untagged.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
