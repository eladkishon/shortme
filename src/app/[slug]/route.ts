import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const url = await db.query.urls.findFirst({
      where: eq(urls.slug, params.slug),
    });

    if (!url) {
      return NextRequest.redirect(new URL('/404', request.url));
    }

    // Increment visit count
    await db
      .update(urls)
      .set({ visits: url.visits + 1 })
      .where(eq(urls.slug, params.slug));

    return NextRequest.redirect(url.originalUrl);
  } catch (error) {
    return NextRequest.redirect(new URL('/404', request.url));
  }
} 