import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { addNote, getNotes } from '@/lib/db/queries';


export async function GET(request: NextRequest) {
  try {
    const [{ userId }, url] = await Promise.all([auth(), new URL(request.url)]);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sortOrder =
      (url.searchParams.get('sort') as 'newest' | 'oldest') || 'newest';

    const notes = await getNotes(sortOrder);
    return NextResponse.json(notes, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30',
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
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      content = '',
      tags = [],
      folderId = null,
    } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const note = await addNote({
      title,
      content,
      tags,
      folderId,
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
