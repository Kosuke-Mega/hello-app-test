'use client';

import Image from "next/image";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// WalletConnectコンポーネントをクライアントサイドレンダリングで動的にインポート
const WalletConnect = dynamic(
  () => import('./components/WalletConnect'),
  { ssr: false }
);

// MetaMaskが利用可能かチェックするヘルパー関数
const getMetaMaskProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask) {
    return (window as any).ethereum;
  }
  return null;
};

export default function Home() {
  const router = useRouter();

  // ページ読み込み時にウォレット接続状態を確認
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const ethereum = getMetaMaskProvider();
        if (!ethereum) return;

        // MetaMaskから接続済みアカウントを取得
        const accounts = await ethereum.request({
          method: 'eth_accounts'
        });
        
        // 接続済みであればregisterページにリダイレクト
        if (accounts && accounts.length > 0) {
          console.log('Already connected with wallet:', accounts[0]);
          router.push('/register');
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };
    
    checkWalletConnection();
  }, [router]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-inter)] bg-blue-50">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1 className="text-3xl font-bold text-center text-blue-800">Hello app Demo</h1>
        
        <div className="wallet-section flex flex-col items-center p-8 border border-blue-200 rounded-xl shadow-sm bg-white">
          <p className="mb-6 text-center text-blue-700">ウォレットを接続してサービスを開始する</p>
          <WalletConnect 
            onConnect={(address) => {
              console.log('Connected with address:', address);
            }}
            redirectPath="/register"
            onDisconnect={() => {
              console.log('Wallet disconnected');
            }}
          />
        </div>

        <div className="mt-4 text-center">
          {/* <Link 
            href="/register" 
            className="inline-flex items-center px-4 py-2 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ユーザー登録へ進む
          </Link> */}
        </div>
        
        {/* <div className="mt-8 flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 dark:hover:bg-blue-800 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://ethereum.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn About Ethereum
          </a>
        </div> */}
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-blue-500">© 2025 Wallet Connect Demo</p>
      </footer>
    </div>
  );
}
