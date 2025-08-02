import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  deleteNote,
  getNotes,
  type Note,
  updateNote,
} from '@/lib/note-service';

export function useNote() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');

  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadNote() {
      setLoading(true);
      try {
        const notes = await getNotes();
        const found = notes.find((n) => n.id === id);
        if (found) {
          setNote(found);
          setContent(found.content);
          setTitle(found.title);
          setTags(found.tags || []);
        }
        setAllTags(Array.from(new Set(notes.flatMap((n) => n.tags || []))));
      } catch {
        // Handle error silently
      }
      setLoading(false);
    }

    loadNote();
  }, [id]);

  const handleSave = async () => {
    if (!note) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateNote(note.id, { content, title, tags });
      setUnsaved(false);
      setNote(updated);
    } catch {
      // Handle error silently
    }
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  const handleDelete = async () => {
    if (!note) {
      return;
    }

    try {
      await deleteNote(note.id);
      router.push('/');
    } catch {
      // Handle error silently
    }
  };

  const updateContent = (newContent: string) => {
    setContent(newContent);
    setUnsaved(true);
  };

  const updateTitle = (newTitle: string) => {
    setTitle(newTitle);
    setUnsaved(true);
  };

  const updateTags = (newTags: string[]) => {
    setTags(newTags);
    setUnsaved(true);
  };

  return {
    note,
    content,
    title,
    tags,
    allTags,
    loading,
    unsaved,
    saving,
    handleSave,
    handleDelete,
    updateContent,
    updateTitle,
    updateTags,
  };
}
