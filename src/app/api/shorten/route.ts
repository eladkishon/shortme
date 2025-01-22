import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import base62 from '@/lib/utils/base62';
import { eq, and } from 'drizzle-orm';
import { auth } from "@clerk/nextjs";
import { rateLimit } from '@/lib/rateLimit';

const requestSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = auth();
    const body = await request.json();
    const { url } = requestSchema.parse(body);

    // Check if URL already exists for this user
    if (userId) {
      const existingUrl = await db.query.urls.findFirst({
        where: and(
          eq(urls.originalUrl, url),
          eq(urls.userId, userId)
        ),
      });

      if (existingUrl) {
        return NextResponse.json(
          { 
            error: 'You have already shortened this URL',
            shortUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${existingUrl.slug}` 
          }, 
          { status: 409 }
        );
      }
    }

    // First insert with a temporary slug
    const [result] = await db
      .insert(urls)
      .values({
        originalUrl: url,
        slug: 'temp', // Temporary slug
        userId: userId || null, // Store userId if authenticated
      })
      .returning({ insertedId: urls.id });

    // Generate the base62 slug from the ID
    const slug = base62.encode(result.insertedId);

    // Update the record with the actual slug
    await db
      .update(urls)
      .set({ slug })
      .where(eq(urls.id, result.insertedId));

    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`;

    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 