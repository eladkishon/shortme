import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import base62 from '@/lib/utils/base62';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const url = await db.query.urls.findFirst({
      where: eq(urls.id, base62.decode(request.nextUrl.pathname.split('/').pop() || '')),
    });

    logger.debug({ slug: request.nextUrl.pathname, url }, 'Attempting to redirect');

    if (!url) {
      logger.warn({ slug: request.nextUrl.pathname }, 'URL not found');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Increment visit count
    await db
      .update(urls)
      .set({ visits: url.visits + 1 })
      .where(eq(urls.id, url.id));

    logger.info({ 
      slug: url.slug, 
      originalUrl: url.originalUrl,
      visits: url.visits + 1 
    }, 'Successfully redirected');

    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    logger.error({ 
      error,
      slug: request.nextUrl.pathname 
    }, 'Error redirecting to URL');
    return NextResponse.redirect(new URL('/', request.url));
  }
} 