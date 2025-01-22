import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import base62 from '@/lib/utils/base62';
import { eq } from 'drizzle-orm';
import { auth } from "@clerk/nextjs";

const requestSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { url } = requestSchema.parse(body);

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