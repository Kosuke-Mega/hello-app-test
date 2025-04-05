'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl text-blue-600">
                HELLO App
              </Link>
            </div>
            
            {/* デスクトップメニュー */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-blue-900' 
                    : 'border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                ホーム
              </Link>
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard') 
                    ? 'border-blue-500 text-blue-900' 
                    : 'border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                ダッシュボード
              </Link>
              <Link
                href="/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/profile') 
                    ? 'border-blue-500 text-blue-900' 
                    : 'border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                プロフィール
              </Link>
              <Link
                href="/register"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/register') 
                    ? 'border-blue-500 text-blue-900' 
                    : 'border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                新規登録
              </Link>
            </div>
          </div>
          
          {/* モバイルメニューボタン */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">メニューを開く</span>
              {/* ハンバーガーアイコン */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Xアイコン */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            ホーム
          </Link>
          <Link
            href="/dashboard"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/dashboard')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            ダッシュボード
          </Link>
          <Link
            href="/profile"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/profile')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            プロフィール
          </Link>
          <Link
            href="/register"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/register')
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            新規登録
          </Link>
        </div>
      </div>
    </nav>
  );
} 