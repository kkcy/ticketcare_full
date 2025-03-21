import { withCors } from '@/app/lib/api';
import { auth } from '@repo/auth/server';
import { put } from '@repo/storage';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

async function handler(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const access =
      (formData.get('access') as 'public' | 'private') || 'private';

    const result = await put(file.name, file, {
      access,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      pathname: result.pathname,
    });
  } catch (error) {
    console.error('Failed to upload file:', error);

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export const POST = withCors(handler);
