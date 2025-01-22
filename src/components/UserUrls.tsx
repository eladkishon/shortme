'use client';

import { useState, useEffect } from 'react';
import { Url } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';

export function UserUrls() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);

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

  const copyToClipboard = async (slug: string) => {
    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
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
              onClick={() => copyToClipboard(url.slug)}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Copy Short URL
            </button>
          </div>
          <div className="mt-2 text-sm">
            <p className="text-gray-600">Original: {url.originalUrl}</p>
            <p className="text-blue-600">
              Short: {process.env.NEXT_PUBLIC_APP_URL}/{url.slug}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 