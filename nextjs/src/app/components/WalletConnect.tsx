'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore - Web3のモジュール型定義がなくても動作させる
import Web3 from 'web3';

// Remove the import for global types
// import '../types/global';

// MetaMask provider interface
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
}

// Helper function to get MetaMask provider
const getMetaMaskProvider = (): EthereumProvider | null => {
  if (typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask) {
    return (window as any).ethereum as EthereumProvider;
  }
  return null;
};

// Alchemyの設定
// 注: API KEYは環境変数から取得するのがベストプラクティスです
const ALCHEMY_API_KEY = 'IDS-YGcEPGAZC4J0lmjq_i2W31hTIGLm'; // ここに実際のAlchemyのAPIキーを入力
const ALCHEMY_RPC_URL = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Polygon メインネットとテストネット（Amoy）の設定
const POLYGON_MAINNET_CHAIN_ID = '0x89';
const POLYGON_AMOY_CHAIN_ID = '0x13882'; // Amoyテストネット
const POLYGON_CHAIN_ID = POLYGON_AMOY_CHAIN_ID; // テストネットを使用

const POLYGON_NETWORK = {
  chainId: POLYGON_CHAIN_ID,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'Poygon amoy',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const router = useRouter();
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);

  useEffect(() => {
    // MetaMaskが利用可能かチェック
    const ethereum = getMetaMaskProvider();
    if (ethereum) {
      setIsMetaMaskInstalled(true);
      
      // Check if user was previously connected
      checkConnection();

      // Listen for chain changes
      ethereum.on('chainChanged', (chainId: string) => {
        setChainId(chainId);
        window.location.reload();
      });

      // Listen for account changes
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnect?.(accounts[0]);
        } else {
          setAccount('');
        }
      });
    }
  }, []);

  const checkConnection = async () => {
    try {
      const ethereum = getMetaMaskProvider();
      if (!ethereum) return;

      // MetaMaskから接続済みアカウントを取得
      const accounts = await ethereum.request({
        method: 'eth_accounts'
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onConnect?.(accounts[0]);
      }

      // 現在のチェーンIDを取得
      const chainId = await ethereum.request({
        method: 'eth_chainId'
      });
      console.log(chainId);
      setChainId(chainId as string);
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const switchToPolygon = async () => {
    const ethereum = getMetaMaskProvider();
    if (!ethereum) return;

    try {
      // まずPolygonネットワークに切り替えを試みる
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // このエラーコードはチェーンがウォレットに追加されていないことを示す
      if (switchError.code === 4902) {
        try {
          // Polygonネットワークをウォレットに追加
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_NETWORK],
          });
        } catch (addError) {
          console.error('Error adding Polygon network:', addError);
          setError('Could not add Polygon network to your wallet');
        }
      } else {
        console.error('Error switching to Polygon network:', switchError);
        setError('Could not switch to Polygon network');
      }
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      const ethereum = getMetaMaskProvider();
      if (!ethereum) {
        throw new Error('MetaMask not installed');
      }
      
      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      setAccount(accounts[0]);
      onConnect?.(accounts[0]);

      // Get current chain ID
      const chainId = await ethereum.request({
        method: 'eth_chainId'
      });
      setChainId(chainId as string);

      // If not on Polygon, suggest switching
      if (chainId !== POLYGON_CHAIN_ID) {
        await switchToPolygon();
      }
      console.log(chainId);

      // Navigate to register page after successful connection
      router.push('/register');
      
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-connect-container">
      {!isMetaMaskInstalled ? (
        <div className="not-installed">
          <p className="text-red-500 mb-2">MetaMaskが見つかりません</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            MetaMaskをインストールする
          </a>
        </div>
      ) : !account ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="rounded-full bg-[#F6851B] hover:bg-[#E2761B] text-white font-medium py-2 px-6 transition-colors flex items-center gap-2"
        >
          {isConnecting ? (
            'Connecting...'
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.9582 1L19.8241 10.7183L22.2665 5.01311L32.9582 1Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.04183 1L15.0487 10.8041L12.7335 5.01311L2.04183 1Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28.2023 23.5086L24.7085 28.8543L32.1878 30.9012L34.313 23.6014L28.2023 23.5086Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0.701172 23.6014L2.81833 30.9012L10.2976 28.8543L6.80387 23.5086L0.701172 23.6014Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.91512 14.5201L7.82665 17.6517L15.242 17.9716L14.9933 9.93652L9.91512 14.5201Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M25.0849 14.5201L19.9358 9.85081L19.8241 17.9716L27.2324 17.6517L25.0849 14.5201Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.2976 28.8543L14.8046 26.6929L10.8462 23.6584L10.2976 28.8543Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.1953 26.6929L24.7093 28.8543L24.1537 23.6584L20.1953 26.6929Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              MetaMaskで接続
            </>
          )}
        </button>
      ) : (
        <div className="connected-info p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="font-medium">MetaMask接続済み</p>
          </div>
          <p className="text-sm mt-2">
            <span className="font-medium">アドレス:</span> {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <p className="text-sm mt-1">
            <span className="font-medium">ネットワーク:</span> {chainId === POLYGON_CHAIN_ID ? 'Polygon' : chainId}
          </p>
          {chainId !== POLYGON_CHAIN_ID && (
            <button
              onClick={switchToPolygon}
              className="mt-3 text-sm bg-purple-600 text-white px-4 py-1 rounded-full hover:bg-purple-700"
            >
              Polygonに切り替え
            </button>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
} 