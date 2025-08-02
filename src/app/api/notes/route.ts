import { createHash } from 'node:crypto';
import { auth } from '@clerk/nextjs/server';
import { LRUCache } from 'lru-cache';
import { type NextRequest, NextResponse } from 'next/server';
import { addNote, getNotes } from '@/lib/db/queries';

const notesCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 30 * 1000,
});

const RESPONSE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30',
};

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const sortOrder =
    (url.searchParams.get('sort') as 'newest' | 'oldest') || 'newest';
  const cacheKey = createHash('sha256')
    .update(`${userId}:${sortOrder}`)
    .digest('hex');

  const cachedNotes = notesCache.get(cacheKey);
  if (cachedNotes) {
    return NextResponse.json(cachedNotes, {
      status: 200,
      headers: {
        ...RESPONSE_HEADERS,
        'X-Cache-Hit': 'true',
      },
    });
  }

  try {
    const notes = await getNotes(sortOrder);
    notesCache.set(cacheKey, notes);
    return NextResponse.json(notes, {
      status: 200,
      headers: {
        ...RESPONSE_HEADERS,
        'X-Cache-Hit': 'false',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get('content-type') !== 'application/json') {
    return NextResponse.json(
      { error: 'Invalid Content-Type' },
      { status: 400 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, content = '', tags = [], folderId = null } = body;
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const note = await addNote({ title, content, tags, folderId });
    notesCache.clear();
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
