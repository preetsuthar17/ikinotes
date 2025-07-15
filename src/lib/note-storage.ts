// Types
export type Note = {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  createdAt: number;
  updatedAt: number;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: number;
};

// Storage keys
const NOTES_KEY = "ikinotes-notes";
const FOLDERS_KEY = "ikinotes-folders";

// --- Notes ---
export function getNotes(): Note[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(NOTES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveNotes(notes: Note[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function addNote(note: Note): void {
  const notes = getNotes();
  notes.push(note);
  saveNotes(notes);
}

export function updateNote(updated: Note): void {
  const notes = getNotes().map((n) => (n.id === updated.id ? updated : n));
  saveNotes(notes);
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  saveNotes(notes);
}

export function moveNoteToFolder(
  noteId: string,
  folderId: string | undefined,
): void {
  const notes = getNotes().map((n) =>
    n.id === noteId ? { ...n, folderId } : n,
  );
  saveNotes(notes);
}

// --- Folders ---
export function getFolders(): Folder[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(FOLDERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveFolders(folders: Folder[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function addFolder(folder: Folder): void {
  const folders = getFolders();
  folders.push(folder);
  saveFolders(folders);
}

export function deleteFolder(id: string): void {
  const folders = getFolders().filter((f) => f.id !== id);
  saveFolders(folders);
  // Optionally, remove folderId from notes in this folder
  const notes = getNotes().map((n) =>
    n.folderId === id ? { ...n, folderId: undefined } : n,
  );
  saveNotes(notes);
}
