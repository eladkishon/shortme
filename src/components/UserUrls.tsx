'use client';

import { useState, useEffect } from 'react';
import { Url } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface UserUrlsProps {
  refreshTrigger: number;
}

export function UserUrls({ refreshTrigger }: UserUrlsProps) {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);


  console.log(refreshTrigger);

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

  useEffect(() => {
    fetchUrls();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

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
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="grid gap-4">
      {urls.map((url) => (
        <div key={url.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <h2 className="font-medium break-all">{url.title || url.originalUrl}</h2>
              <p className="text-sm text-gray-500">
                Created {formatDistanceToNow(new Date(url.createdAt))} ago
              </p>
              <p className="text-sm">
                Visits: {url.visits}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(url.slug, url.id)}
              className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              {copiedId === url.id ? (
                <>
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-600 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardIcon className="h-4 w-4 mr-2" />
                  Copy URL
                </>
              )}
            </button>
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <p className="text-gray-600 break-all">
              <span className="font-medium">Original:</span> {url.originalUrl}
            </p>
            <p className="text-blue-600 break-all">
              <span className="font-medium">Short:</span>{' '}
              <a 
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