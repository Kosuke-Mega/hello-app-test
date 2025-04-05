'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 mb-8 border border-blue-100">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-800">ダッシュボード</h1>
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              ホームに戻る
            </Link>
          </div>
          
          <div className="border-t border-blue-100 pt-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">あなたのNFT</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-blue-200 rounded-lg p-4 flex flex-col">
                <div className="bg-blue-100 w-full h-48 rounded-md mb-4 flex items-center justify-center text-blue-500">
                  NFTイメージ
                </div>
                <h3 className="font-medium text-blue-800">ユーザーNFT #1</h3>
                <p className="text-sm text-blue-600">Polygon Amoyテストネット</p>
                <p className="text-xs text-blue-400 mt-2 truncate">0x1234...5678</p>
              </div>
              
              {/* NFTがまだない場合に表示 */}
              <div className="border border-dashed border-blue-300 rounded-lg p-4 flex flex-col items-center justify-center h-48">
                <p className="text-blue-500 mb-4">まだNFTがありません</p>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  NFTを作成する
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">アクティビティ</h2>
          <div className="border-t border-blue-100 pt-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-800">NFTをミントしました</p>
                  <p className="text-xs text-blue-500">2025-04-05 10:45</p>
                </div>
                <div className="ml-4 text-xs text-blue-400">
                  トランザクション: 0xabcd...1234
                </div>
              </div>
              <div className="flex items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-800">Polygonネットワークに接続しました</p>
                  <p className="text-xs text-blue-500">2025-04-05 10:40</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 