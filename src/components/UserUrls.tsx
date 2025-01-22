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
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {urls.map((url) => (
        <div 
          key={url.id} 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <h2 className="font-medium break-all text-gray-900">
                {url.title || url.originalUrl}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <p className="flex items-center">
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mr-2" />
                  Created {formatDistanceToNow(new Date(url.createdAt))} ago
                </p>
                <p className="flex items-center">
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mr-2" />
                  {url.visits} visits
                </p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(url.slug, url.id)}
              className="inline-flex items-center px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm whitespace-nowrap"
            >
              {copiedId === url.id ? (
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
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Original URL</span>
              <p className="text-gray-900 break-all">{url.originalUrl}</p>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Short URL</span>
              <a 
                href={`/${url.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 break-all font-medium"
              >
                {process.env.NEXT_PUBLIC_APP_URL}/{url.slug}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 