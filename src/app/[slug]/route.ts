import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment visit count
    await db
      .update(urls)
      .set({ visits: url.visits + 1 })
      .where(eq(urls.slug, params.slug));

    // Make sure the URL starts with http:// or https://
    const redirectUrl = url.originalUrl.startsWith('http') 
      ? url.originalUrl 
      : `https://${url.originalUrl}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in slug route:', error);
    // Redirect to home page on error
    return NextResponse.redirect(new URL('/', request.url));
  }
} 