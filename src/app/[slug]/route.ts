import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import base62 from '@/lib/utils/base62';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const url = await db.query.urls.findFirst({
      where: eq(urls.id, base62.decode(request.nextUrl.pathname.split('/').pop() || '')),
    });

    console.log('Redirecting to:', url?.originalUrl);

    if (!url) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment visit count
    await db
      .update(urls)
      .set({ visits: url.visits + 1 })
      .where(eq(urls.id, url.id));

    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error in slug route:', error);
    // Redirect to home page on error
    return NextResponse.redirect(new URL('/', request.url));
  }
} 