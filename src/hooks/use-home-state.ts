// Third-party
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Services
import { addNote, getNotes, type Note } from '@/lib/note-service';

// Utils
import {
  type DateOrder,
  filterNotesByTag,
  getUniqueTagsFromNotes,
  groupNotesByTag,
  sortNotesByDate,
} from '@/utils/note-utils';

export function useHomeState() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [dateOrder, setDateOrder] = useState<DateOrder>('newest');
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
      } catch {
        setError('Failed to load notes. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      loadNotes();
    }
  }, [isSignedIn, isLoaded, dateOrder]);

  const handleCreateNote = async () => {
    if (!isSignedIn) {
      return;
    }

    try {
      const newNote = await addNote({
        title: 'Untitled Note',
        content: '',
      });
      router.push(`/new?id=${newNote.id}`);
    } catch {
      setError('Failed to create note. Please try again.');
    }
  };

  const allTags = getUniqueTagsFromNotes(notes);
  const filteredNotes = filterNotesByTag(notes, tagFilter);
  const sortedNotes = sortNotesByDate(filteredNotes, dateOrder);
  const { grouped, untagged } = groupNotesByTag(sortedNotes);

  return {
    notes,
    loading,
    tagFilter,
    dateOrder,
    error,
    allTags,
    grouped,
    untagged,
    hasNotes: filteredNotes.length > 0,
    isSignedIn,
    isLoaded,
    setTagFilter,
    setDateOrder,
    handleCreateNote,
  };
}
