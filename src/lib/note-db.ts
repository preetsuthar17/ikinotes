import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import {
  type Folder,
  folders,
  type NewFolder,
  type NewNote,
  type Note,
  notes,
} from './schema';

// Get current user ID
async function getCurrentUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}

// --- Notes ---
export async function getNotes(): Promise<Note[]> {
  const userId = await getCurrentUserId();
  return db.select().from(notes).where(eq(notes.userId, userId));
}

export async function addNote(note: Omit<NewNote, 'userId'>): Promise<Note> {
  const userId = await getCurrentUserId();
  const [newNote] = await db
    .insert(notes)
    .values({
      ...note,
      userId,
    })
    .returning();
  return newNote;
}

export async function updateNote(
  noteId: string,
  updates: Partial<Omit<NewNote, 'id' | 'userId'>>
): Promise<Note> {
  const userId = await getCurrentUserId();
  const [updatedNote] = await db
    .update(notes)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  if (!updatedNote) {
    throw new Error('Note not found or not authorized');
  }

  return updatedNote;
}

export async function deleteNote(noteId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const _result = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

export async function moveNoteToFolder(
  noteId: string,
  folderId: string | null
): Promise<Note> {
  const userId = await getCurrentUserId();
  const [updatedNote] = await db
    .update(notes)
    .set({
      folderId,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  if (!updatedNote) {
    throw new Error('Note not found or not authorized');
  }

  return updatedNote;
}

// --- Folders ---
export async function getFolders(): Promise<Folder[]> {
  const userId = await getCurrentUserId();
  return db.select().from(folders).where(eq(folders.userId, userId));
}

export async function addFolder(
  folder: Omit<NewFolder, 'userId'>
): Promise<Folder> {
  const userId = await getCurrentUserId();
  const [newFolder] = await db
    .insert(folders)
    .values({
      ...folder,
      userId,
    })
    .returning();
  return newFolder;
}

export async function deleteFolder(folderId: string): Promise<void> {
  const userId = await getCurrentUserId();

  // First, remove folder reference from notes
  await db
    .update(notes)
    .set({ folderId: null })
    .where(and(eq(notes.folderId, folderId), eq(notes.userId, userId)));

  // Then delete the folder
  await db
    .delete(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));
}
