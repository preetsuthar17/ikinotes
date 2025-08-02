import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { deleteNote, getNoteById, updateNote } from '@/lib/db/queries';
import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';

const noteCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 30 * 1000,
});

const RESPONSE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const cacheKey = createHash('sha256').update(`${userId}:${id}`).digest('hex');
  const cachedNote = noteCache.get(cacheKey);

  if (cachedNote) {
    return NextResponse.json(cachedNote, {
      status: 200,
      headers: {
        ...RESPONSE_HEADERS,
        'X-Cache-Hit': 'true',
      },
    });
  }

  try {
    const note = await getNoteById(id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    noteCache.set(cacheKey, note);
    return NextResponse.json(note, {
      status: 200,
      headers: {
        ...RESPONSE_HEADERS,
        'X-Cache-Hit': 'false',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, content, tags, folderId } = body;
  try {
    const updatedNote = await updateNote(id, { title, content, tags, folderId });
    noteCache.clear();
    return NextResponse.json(updatedNote);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Note not found or not authorized'
    ) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteNote(id);
    noteCache.clear();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

