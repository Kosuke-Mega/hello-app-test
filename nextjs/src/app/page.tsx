'use client';

import Image from "next/image";
import dynamic from 'next/dynamic';
import Link from 'next/link';

// WalletConnectコンポーネントをクライアントサイドレンダリングで動的にインポート
const WalletConnect = dynamic(
  () => import('./components/WalletConnect'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-inter)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-3xl font-bold text-center">Wallet Connect Demo</h1>
        
        <div className="wallet-section flex flex-col items-center p-8 border border-gray-200 rounded-xl shadow-sm">
          <p className="mb-6 text-center">Connect your wallet to get started</p>
          <WalletConnect 
            onConnect={(address) => {
              console.log('Connected with address:', address);
            }} 
          />
        </div>

        <div className="mt-4 text-center">
          <Link 
            href="/register" 
            className="inline-flex items-center px-4 py-2 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ユーザー登録へ進む
          </Link>
        </div>
        
        <div className="mt-8 flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://ethereum.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn About Ethereum
          </a>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">© 2025 Wallet Connect Demo</p>
      </footer>
    </div>
  );
}
