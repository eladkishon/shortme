'use client';

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function Navigation() {
  const { isSignedIn } = useUser();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              URL Shortener
            </Link>
          </div>
          <div className="flex items-center">
            {isSignedIn ? (
              <>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 