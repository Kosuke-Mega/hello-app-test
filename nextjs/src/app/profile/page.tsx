'use client';

import React from 'react';
import Link from 'next/link';

export default function Profile() {
  // サンプルプロフィールデータ
  const profile = {
    name: '山田 太郎',
    company: '株式会社サンプル',
    email: 'taro.yamada@example.com',
    telNumber: '03-1234-5678',
    url: 'https://example.com',
    profileText: 'ブロックチェーン技術に興味があり、特にNFTの可能性に注目しています。企業でのブロックチェーン導入を推進しています。',
    walletAddress: '0x1234...5678',
    nftTokenId: '#12345'
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 border border-blue-100">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-800">プロフィール</h1>
            <div className="flex space-x-4">
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                ダッシュボード
              </Link>
              <Link 
                href="/" 
                className="px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                ホーム
              </Link>
            </div>
          </div>
          
          <div className="border-t border-blue-100 pt-6">
            <div className="flex flex-col md:flex-row">
              {/* プロフィール画像（NFT表現） */}
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-full h-64 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  ユーザーNFT
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-blue-600">NFT ID: {profile.nftTokenId}</p>
                  <p className="text-xs text-blue-400 mt-1">Polygon Amoyテストネット</p>
                </div>
              </div>
              
              {/* プロフィール情報 */}
              <div className="md:w-2/3">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-blue-800">基本情報</h2>
                    <div className="mt-2 grid grid-cols-1 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-blue-600">名前</h3>
                        <p className="mt-1 text-blue-800">{profile.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-600">会社名</h3>
                        <p className="mt-1 text-blue-800">{profile.company}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-600">メールアドレス</h3>
                        <p className="mt-1 text-blue-800">{profile.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-600">電話番号</h3>
                        <p className="mt-1 text-blue-800">{profile.telNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-blue-600">URL</h3>
                        <a href={profile.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-blue-600 hover:underline">{profile.url}</a>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-medium text-blue-800">プロフィール</h2>
                    <p className="mt-2 text-blue-700">{profile.profileText}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-medium text-blue-800">ウォレット情報</h2>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-blue-600">アドレス</h3>
                      <p className="mt-1 font-mono text-sm text-blue-800">{profile.walletAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link
              href="/profile/edit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              プロフィールを編集
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 