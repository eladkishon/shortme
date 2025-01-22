'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useUser } from "@clerk/nextjs";
import { UserUrls } from '@/components/UserUrls';

const urlSchema = z.string().url();

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const { isSignedIn } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    try {
      urlSchema.parse(url);
      
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setShortUrl(data.shortUrl);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError('Please enter a valid URL');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <main className="container">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">URL Shortener</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your URL here"
            className="form-input"
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button">
            Shorten URL
          </button>
        </form>
        {shortUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Your shortened URL:</h2>
            <a href={shortUrl} className="text-blue-600 hover:underline">
              {shortUrl}
            </a>
          </div>
        )}

        {isSignedIn && (
          <>
            <div className="my-12 border-t border-gray-200" />
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Shortened URLs</h2>
              <UserUrls />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
