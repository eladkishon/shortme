'use client';

import { useState, useEffect } from 'react';
import { Url } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export function UserUrls() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      if (response.ok) {
        const data = await response.json();
        setUrls(data.urls);
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (slug: string, id: number) => {
    const shortUrl = slug;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4">
      {urls.map((url) => (
        <div key={url.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-medium">{url.title || url.originalUrl}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Created {formatDistanceToNow(new Date(url.createdAt))} ago
              </p>
              <p className="text-sm mt-2">
                Visits: {url.visits}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(url.slug, url.id)}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"
            >
              {copiedId === url.id ? (
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
          <div className="mt-2 text-sm">
            <p className="text-gray-600">Original: {url.originalUrl}</p>
            <p className="text-blue-600">
              Short: <a 
                href={`/${url.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {process.env.NEXT_PUBLIC_APP_URL}/{url.slug}
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 