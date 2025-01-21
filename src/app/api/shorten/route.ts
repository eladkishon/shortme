import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { urls } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

const requestSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = requestSchema.parse(body);

    const slug = nanoid(6); // Generate a random 6-character slug
    
    await db.insert(urls).values({
      originalUrl: url,
      slug,
    });

    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`;

    return NextRequest.json({ shortUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextRequest.json({ error: 'Invalid URL provided' }, { status: 400 });
    }
    return NextRequest.json({ error: 'Internal server error' }, { status: 500 });
  }
} 