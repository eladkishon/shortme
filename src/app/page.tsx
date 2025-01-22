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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              URL Shortener
            </h1>
            <p className="text-gray-600">
              Create short, memorable links in seconds
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your URL here"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                  {error}
                </p>
              )}
              <button 
                type="submit" 
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                Shorten URL
              </button>
            </form>
          </div>

          {shortUrl && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 animate-fade-in">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
                Your shortened URL is ready!
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <a 
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/${shortUrl.split('/').pop()}`} 
                  className="text-blue-600 hover:text-blue-700 break-all font-medium"
                  target="_blank"
                >
                  {process.env.NEXT_PUBLIC_APP_URL}/{shortUrl.split('/').pop()}
                </a>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="h-4 w-4 text-gray-600 mr-2" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {isSignedIn && (
            <>
              <div className="relative my-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-gradient-to-b from-gray-50 to-white text-sm text-gray-500">
                    Your URLs
                  </span>
                </div>
              </div>
              <div className="mb-8">
                <UserUrls refreshTrigger={refreshTrigger} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
