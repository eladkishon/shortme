'use client';

import { useState, useTransition } from 'react';
import { z } from 'zod';

const urlSchema = z.string().url();

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    startTransition(async () => {
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
    });
  };

  return (
    <main className="container">
      <h1 className="text-4xl font-bold mb-8">URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your URL here"
          className="form-input"
          disabled={isPending}
        />
        {error && <p className="error">{error}</p>}
        <button 
          type="submit" 
          className="button"
          disabled={isPending}
        >
          {isPending ? 'Shortening...' : 'Shorten URL'}
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
    </main>
  );
}
