'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useUser } from "@clerk/nextjs";
import { UserUrls } from '@/components/UserUrls';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const urlSchema = z.string().url();

export default function Home() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const { isSignedIn } = useUser();
  const [copied, setCopied] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        if (response.status === 409) {
          setShortUrl(data.shortUrl);
          setError('You have already shortened this URL');
          return;
        }
        if (response.status === 429) {
          setError('Too many requests. Please try again later.');
          return;
        }
        throw new Error(data.error);
      }

      setShortUrl(data.shortUrl);
      // Trigger refresh of URLs list
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError('Please enter a valid URL');
      } 
      else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
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
            <div className="flex items-center gap-4">
              <a 
                href={`${process.env.NEXT_PUBLIC_APP_URL}/${shortUrl.split('/').pop()}`} 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                {process.env.NEXT_PUBLIC_APP_URL}/{shortUrl.split('/').pop()}
              </a>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="h-4 w-4" />
                    Copy URL
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {isSignedIn && (
          <>
            <div className="my-12 border-t border-gray-200" />
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Shortened URLs</h2>
              <UserUrls refreshTrigger={refreshTrigger} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
