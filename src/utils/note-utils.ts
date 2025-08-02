import type { Note } from '@/lib/note-service';

export type DateOrder = 'newest' | 'oldest';

export const formatDate = (date: string | number): string => {
  const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
  return dateObj.toISOString().slice(0, 10);
};

export const getUniqueTagsFromNotes = (notes: Note[]): string[] => {
  return Array.from(new Set(notes.flatMap((note) => note.tags || [])));
};

export const filterNotesByTag = (notes: Note[], tagFilter: string): Note[] => {
  if (tagFilter === 'all') {
    return notes;
  }
  return notes.filter((note) => note.tags?.includes(tagFilter));
};

export const sortNotesByDate = (notes: Note[], order: DateOrder): Note[] => {
  return [...notes].sort((a, b) => {
    const aTime =
      typeof a.createdAt === 'number'
        ? a.createdAt
        : new Date(a.createdAt).getTime();
    const bTime =
      typeof b.createdAt === 'number'
        ? b.createdAt
        : new Date(b.createdAt).getTime();
    return order === 'newest' ? bTime - aTime : aTime - bTime;
  });
};

export const groupNotesByTag = (
  notes: Note[]
): { grouped: Record<string, Note[]>; untagged: Note[] } => {
  const grouped: Record<string, Note[]> = {};
  const untagged: Note[] = [];

  notes.forEach((note) => {
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

  return { grouped, untagged };
};
