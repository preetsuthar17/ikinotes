import { auth } from '@clerk/nextjs/server';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import {
  db,
  type Folder,
  folders,
  type NewFolder,
  type NewNote,
  type Note,
  notes,
} from '@/lib/db/index';

// Helper function to get current user ID from Clerk
async function getCurrentUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }
  return userId;
}

// --- Notes Functions ---
export async function getNotes(
  sortOrder: 'newest' | 'oldest' = 'newest'
): Promise<Note[]> {
  const userId = await getCurrentUserId();

  const orderBy =
    sortOrder === 'newest' ? desc(notes.createdAt) : asc(notes.createdAt);

  return await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(orderBy);
}

export async function addNote(note: Omit<NewNote, 'userId'>): Promise<Note> {
  const userId = await getCurrentUserId();

  const newNote = await db
    .insert(notes)
    .values({
      ...note,
      userId,
    })
    .returning();

  return newNote[0];
}

export async function updateNote(
  noteId: string,
  updates: Partial<Omit<NewNote, 'id' | 'userId'>>
): Promise<Note> {
  const userId = await getCurrentUserId();

  const updatedNote = await db
    .update(notes)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  if (updatedNote.length === 0) {
    throw new Error('Note not found or not authorized');
  }

  return updatedNote[0];
}

export async function deleteNote(noteId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const _result = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  // Note: Drizzle doesn't return affected rows count in the same way,
  // but the operation will succeed silently if no rows match
}

export async function moveNoteToFolder(
  noteId: string,
  folderId: string | null
): Promise<Note> {
  const userId = await getCurrentUserId();

  const updatedNote = await db
    .update(notes)
    .set({
      folderId,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  if (updatedNote.length === 0) {
    throw new Error('Note not found or not authorized');
  }

  return updatedNote[0];
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const userId = await getCurrentUserId();

  const note = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);

  return note.length > 0 ? note[0] : null;
}

// --- Folders Functions ---
export async function getFolders(): Promise<Folder[]> {
  const userId = await getCurrentUserId();

  return await db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId))
    .orderBy(asc(folders.createdAt));
}

export async function addFolder(
  folder: Omit<NewFolder, 'userId'>
): Promise<Folder> {
  const userId = await getCurrentUserId();

  const newFolder = await db
    .insert(folders)
    .values({
      ...folder,
      userId,
    })
    .returning();

  return newFolder[0];
}

export async function deleteFolder(folderId: string): Promise<void> {
  const userId = await getCurrentUserId();

  // First, remove folder reference from all notes in this folder
  await db
    .update(notes)
    .set({ folderId: null })
    .where(and(eq(notes.folderId, folderId), eq(notes.userId, userId)));

  // Then delete the folder
  await db
    .delete(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));
}

export async function getNotesByFolder(
  folderId: string | null,
  sortOrder: 'newest' | 'oldest' = 'newest'
): Promise<Note[]> {
  const userId = await getCurrentUserId();
  const orderBy =
    sortOrder === 'newest' ? desc(notes.createdAt) : asc(notes.createdAt);

  if (folderId === null) {
    // Get notes without folder
    return await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), isNull(notes.folderId)))
      .orderBy(orderBy);
  }

  return await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.folderId, folderId)))
    .orderBy(orderBy);
}
