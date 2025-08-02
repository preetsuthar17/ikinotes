// Client-side service for interacting with the notes API

export type Note = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  folderId?: string | null;
  createdAt: string; // ISO string from database
  updatedAt: string; // ISO string from database
};

export type Folder = {
  id: string;
  name: string;
  createdAt: string; // ISO string from database
};

// --- Notes API ---
export async function getNotes(
  sortOrder: 'newest' | 'oldest' = 'newest'
): Promise<Note[]> {
  const response = await fetch(`/api/notes?sort=${sortOrder}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  const notes = await response.json();
  return notes.map((note: any) => ({
    ...note,
    // Convert database timestamps to numbers for compatibility
    createdAt: new Date(note.createdAt).getTime(),
    updatedAt: new Date(note.updatedAt).getTime(),
  }));
}

export async function addNote(note: {
  title: string;
  content: string;
  tags?: string[];
  folderId?: string | null;
}): Promise<Note> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  const newNote = await response.json();
  return {
    ...newNote,
    createdAt: new Date(newNote.createdAt).getTime(),
    updatedAt: new Date(newNote.updatedAt).getTime(),
  };
}

export async function updateNote(
  id: string,
  updates: {
    title?: string;
    content?: string;
    tags?: string[];
    folderId?: string | null;
  }
): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update note');
  }

  const updatedNote = await response.json();
  return {
    ...updatedNote,
    createdAt: new Date(updatedNote.createdAt).getTime(),
    updatedAt: new Date(updatedNote.updatedAt).getTime(),
  };
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
}

export async function getNoteById(id: string): Promise<Note | null> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch note');
  }

  const note = await response.json();
  return {
    ...note,
    createdAt: new Date(note.createdAt).getTime(),
    updatedAt: new Date(note.updatedAt).getTime(),
  };
}

export async function moveNoteToFolder(
  noteId: string,
  folderId: string | null
): Promise<Note> {
  return updateNote(noteId, { folderId });
}

// --- Folders API ---
export async function getFolders(): Promise<Folder[]> {
  const response = await fetch('/api/folders', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch folders');
  }

  const folders = await response.json();
  return folders.map((folder: any) => ({
    ...folder,
    createdAt: new Date(folder.createdAt).getTime(),
  }));
}

export async function addFolder(folder: { name: string }): Promise<Folder> {
  const response = await fetch('/api/folders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(folder),
  });

  if (!response.ok) {
    throw new Error('Failed to create folder');
  }

  const newFolder = await response.json();
  return {
    ...newFolder,
    createdAt: new Date(newFolder.createdAt).getTime(),
  };
}

export async function deleteFolder(id: string): Promise<void> {
  const response = await fetch(`/api/folders?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete folder');
  }
}

// Compatibility functions to maintain the same interface as the old localStorage functions
export { getNotes as getNotesFromStorage };
export { addNote as saveNote };
export { getFolders as getFoldersFromStorage };

// Legacy compatibility - these functions will now work with the database
export function saveNotes(_notes: Note[]): void {}

export function saveFolders(_folders: Folder[]): void {}
