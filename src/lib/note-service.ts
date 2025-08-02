export type Note = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  folderId?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: number;
};

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Accept-Encoding': 'gzip, deflate',
};

const cache = new Map<string, any>();
const CACHE_TTL = 30 * 1000;

function getCacheKey(method: string, url: string, body?: any): string {
  return `${method}:${url}:${body ? JSON.stringify(body) : ''}`;
}

async function fetchWithCache<T>(url: string, options: RequestInit, ttl: number = CACHE_TTL): Promise<T> {
  const cacheKey = getCacheKey(options.method || 'GET', url, options.body);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to ${options.method?.toLowerCase() || 'fetch'} ${url.split('/').pop()}`);
  }

  const data = await response.json();
  if (options.method === 'GET') {
    cache.set(cacheKey, { value: data, expiry: Date.now() + ttl });
  }
  return data;
}

function transformNote(note: any): Note {
  return {
    ...note,
    createdAt: new Date(note.createdAt).getTime(),
    updatedAt: new Date(note.updatedAt).getTime(),
  };
}

function transformFolder(folder: any): Folder {
  return {
    ...folder,
    createdAt: new Date(folder.createdAt).getTime(),
  };
}

export async function getNotes(sortOrder: 'newest' | 'oldest' = 'newest'): Promise<Note[]> {
  const url = `/api/notes?sort=${sortOrder}`;
  const notes = await fetchWithCache<Note[]>(url, { method: 'GET', headers: BASE_HEADERS });
  return notes.map(transformNote);
}

export async function addNote(note: {
  title: string;
  content: string;
  tags?: string[];
  folderId?: string | null;
}): Promise<Note> {
  const response = await fetchWithCache<Note>('/api/notes', {
    method: 'POST',
    headers: BASE_HEADERS,
    body: JSON.stringify(note),
  });
  cache.clear();
  return transformNote(response);
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
  const url = `/api/notes/${id}`;
  const response = await fetchWithCache<Note>(url, {
    method: 'PUT',
    headers: BASE_HEADERS,
    body: JSON.stringify(updates),
  });
  cache.clear();
  return transformNote(response);
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, { method: 'DELETE', headers: BASE_HEADERS });
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
  cache.clear();
}

export async function getNoteById(id: string): Promise<Note | null> {
  const url = `/api/notes/${id}`;
  const response = await fetch(url, { method: 'GET', headers: BASE_HEADERS });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch note');
  }
  return transformNote(await response.json());
}

export async function moveNoteToFolder(noteId: string, folderId: string | null): Promise<Note> {
  return updateNote(noteId, { folderId });
}

export async function getFolders(): Promise<Folder[]> {
  const folders = await fetchWithCache<Folder[]>('/api/folders', { method: 'GET', headers: BASE_HEADERS });
  return folders.map(transformFolder);
}

export async function addFolder(folder: { name: string }): Promise<Folder> {
  const response = await fetchWithCache<Folder>('/api/folders', {
    method: 'POST',
    headers: BASE_HEADERS,
    body: JSON.stringify(folder),
  });
  cache.clear();
  return transformFolder(response);
}

export async function deleteFolder(id: string): Promise<void> {
  const response = await fetch(`/api/folders?id=${id}`, { method: 'DELETE', headers: BASE_HEADERS });
  if (!response.ok) {
    throw new Error('Failed to delete folder');
  }
  cache.clear();
}

export { getNotes as getNotesFromStorage, addNote as saveNote, getFolders as getFoldersFromStorage };

export function saveNotes(_notes: Note[]): void {}
export function saveFolders(_folders: Folder[]): void {}