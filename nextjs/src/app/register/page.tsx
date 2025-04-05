'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// WalletConnectコンポーネントをクライアントサイドレンダリングで動的にインポート
const WalletConnect = dynamic(
  () => import('../components/WalletConnect'),
  { ssr: false }
);

export default function Register() {
  const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ODE2ZDVlZC05MGRhLTQ5NjEtYWY2OC1iNmVmZmZmODYzNTciLCJlbWFpbCI6ImsubWVnYS4yMDc5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1OTI5N2JmNzZmMDU4MjNkZGJiMSIsInNjb3BlZEtleVNlY3JldCI6IjE1ZWY0MmRmNmNhMDVkM2M1MmIxMjVlMGE5ZGFmYzk0MzU5MzA4YjFjOTg0Y2IwNTY2YTMzNTgwNjgyNWY1NWEiLCJleHAiOjE3NzUzMDM4NjV9.ga8UCNMfS5rRZodAYfu2gxBhf8nDkBFo_LEn21tNOdw';
  const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  const NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL || 'https://sqglsbgyg5eyfkplsjs277i5w4.multibaas.com';
  const CHAIN_ID = process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID || '11155111'; // デフォルトはSepolia
  const SBT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MULTIBAAS_VOTING_ADDRESS_ALIAS || '0x5E1801208afe7f165ae20cFaFE8bE2d5b1265963';
  const SBT_CONTRACT_LABEL = process.env.NEXT_PUBLIC_MULTIBAAS_VOTING_CONTRACT_LABEL || 'soulboundtoken1';

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    telNumber: '',
    url: '',
    profileText: ''
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [lastTokenId, setLastTokenId] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('');

  // ウォレット接続時にアドレスを保存
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    console.log('Connected with wallet address:', address);
  };

  // コンポーネントマウント時に最新のトークンIDを取得
  useEffect(() => {
    async function fetchLastTokenId() {
      try {
        console.log('最新のトークンIDを取得中...');
        
        // コントラクトの現在のトークン数を取得するリクエスト
        const totalSupplyRequest = {
          path: `/api/v0/chains/ethereum/addresses/soulboundtoken1/contracts/soulboundtoken/methods/totalSupply`,
          method: 'POST',
          body: {
            args: [],
            from: "0x868dF5E337f6d777d69EEA0c1c3c2cda27ED6a1e"
          }
        };
        
        const response = await fetch('/api/multibaas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(totalSupplyRequest),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Total supply result:', result);
          
          if (result && result.result && result.result.output && result.result.output.length > 0) {
            // 通常はtotalSupplyがトークンの総数を返す
            const totalSupply = parseInt(result.result.output[0], 10);
            // 次のトークンIDは現在の総数 + 1
            const nextTokenId = totalSupply + 1;
            console.log(`Retrieved last token ID: ${totalSupply}, next available ID: ${nextTokenId}`);
            setLastTokenId(nextTokenId);
            return;
          }
        }
        
        // APIリクエストが失敗した場合やトークン総数が取得できない場合のフォールバック
        console.log('Could not retrieve current token count, using default ID (1)');
        setLastTokenId(1);
      } catch (error) {
        console.error('Error fetching last token ID:', error);
        setLastTokenId(1); // エラー時はデフォルト値
      }
    }
    
    fetchLastTokenId();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const mintSBT = async (ipfsCid: string) => {
    if (!walletAddress) {
      setMintStatus('ウォレットが接続されていません。');
      return;
    }
    
    setIsMinting(true);
    setMintStatus('SBTをミント中...');
    
    try {
      console.log('Minting SBT with IPFS CID:', ipfsCid);
      
      // 最初に試すトークンID
      let tokenId = lastTokenId;
      let isTokenIdValid = false;
      let maxAttempts = 5; // 最大試行回数
      
      // トークンIDの有効性を確認するループ
      while (!isTokenIdValid && maxAttempts > 0) {
        setMintStatus(`トークンID ${tokenId} の検証中...`);
        console.log(`Checking if token ID ${tokenId} is available...`);
        
        try {
          // トークンIDの存在を確認するためのリクエスト
          const checkTokenRequest = {
            path: `/api/v0/chains/ethereum/addresses/soulboundtoken1/contracts/soulboundtoken/methods/tokenURI`,
            method: 'POST',
            body: {
              args: [tokenId.toString()],
              from: walletAddress
            }
          };
          
          const checkResponse = await fetch('/api/multibaas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkTokenRequest),
          });
          
          const checkResult = await checkResponse.json();
          console.log(`Token ID ${tokenId} check result:`, checkResult);
          
          // トークンが存在しない場合（エラーが返ってくるはず）
          if (checkResponse.status === 400 || 
              (checkResult.error && checkResult.error.includes("execution reverted")) ||
              (checkResult.message && checkResult.message.includes("execution reverted"))) {
            // このトークンIDは使用されていないので有効
            isTokenIdValid = true;
            console.log(`Token ID ${tokenId} is available for minting`);
          } else {
            // このトークンIDはすでに使用されている
            console.log(`Token ID ${tokenId} is already in use, trying next ID`);
            tokenId++;
            maxAttempts--;
          }
        } catch (error) {
          // エラーが発生した場合、このトークンIDは使用されていないと仮定
          console.log(`Error checking token ID ${tokenId}, assuming it's available:`, error);
          isTokenIdValid = true;
        }
      }
      
      if (!isTokenIdValid) {
        throw new Error(`有効なトークンIDが見つかりませんでした。${lastTokenId}から${tokenId - 1}までのIDがすでに使用されています。`);
      }
      
      console.log(`Using token ID ${tokenId} for minting`);
      setMintStatus(`トークンID ${tokenId} でミントを開始します...`);
      
      // IPFSのCIDからURIを作成
      const tokenURI = `ipfs://${ipfsCid}`;
      
      // MultiBaasへのリクエストデータを構築
      const mintRequestData = {
        path: `/api/v0/chains/ethereum/addresses/soulboundtoken1/contracts/soulboundtoken/methods/mint`,
        method: 'POST',
        body: {
          args: [walletAddress, tokenId.toString(), tokenURI],
          from: "0x868dF5E337f6d777d69EEA0c1c3c2cda27ED6a1e" // コントラクト所有者のアドレス
        }
      };
      
      console.log('MultiBaas mint request:', mintRequestData);
      
      // MultiBaas APIをコールするためのエンドポイントを呼び出し
      const mintResponse = await fetch('/api/multibaas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mintRequestData),
      });
      
      let mintResult = await mintResponse.json();
      console.log('MultiBaas mint response:', mintResult);
      
      // エラーチェックと処理
      if (!mintResponse.ok) {
        console.error('MultiBaas mint error details:', mintResult);
        
        let errorMessage = '不明なエラーが発生しました';
        
        // 401エラー（認証失敗）の場合
        if (mintResponse.status === 401) {
          errorMessage = 'MultiBaas APIとの認証に失敗しました。APIキーを確認してください。';
          if (mintResult.authDetails && mintResult.authDetails.tip) {
            errorMessage = mintResult.authDetails.tip;
          }
        } 
        // その他のエラーメッセージが含まれている場合
        else if (mintResult.error || mintResult.message) {
          errorMessage = mintResult.error || mintResult.message;
          
          // ブロックチェーンが見つからないエラー
          if (errorMessage.includes('blockchain not found')) {
            errorMessage = `指定されたブロックチェーン「ethereum」が見つかりません。環境変数を確認してください。`;
          }
          // コントラクトが見つからないエラー
          else if (errorMessage.includes('contract not found')) {
            errorMessage = `指定されたコントラクト「${SBT_CONTRACT_LABEL}」が見つかりません。環境変数を確認してください。`;
          }
        }
        
        setMintStatus(`ミントに失敗しました: ${errorMessage}`);
        console.error('Failed to mint SBT:', mintResult);
        return;
      }
      
      // 成功した場合の処理
      if (mintResult && mintResult.result && mintResult.result.transaction) {
        // トランザクションハッシュを取得
        const txHash = mintResult.result.transaction.hash;
        setMintStatus(`SBTが正常にミントされました！トークンID: ${tokenId}, トランザクションハッシュ: ${txHash.substring(0, 10)}...`);
        // 次のトークンIDをインクリメント（使用したIDの次から始める）
        setLastTokenId(tokenId + 1);
        return;
      }
      
      // トランザクション情報がない場合はエラーとみなす
      setMintStatus('SBTのミントは完了しましたが、トランザクション情報が取得できませんでした。');
      
    } catch (error: any) {
      setMintStatus(`ミント中にエラーが発生しました: ${error.message || '不明なエラー'}`);
      console.error('Error during SBT minting:', error);
    } finally {
      setIsMinting(false);
    }
  };

  const saveIPFS = async () => {

    const jsonData = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        telNumber: formData.telNumber,
        url: formData.url,
        profileText: formData.profileText
    //   },
    //   timestamp: new Date().toISOString()
    };

    const pinataBody = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: `${formData.name}.json`,
          keyvalues: {
            source: 'hello-app',
            timestamp: new Date().toISOString(),
            // recordCount: jsonData.length || 0
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

    console.log(jsonData);

    const response = await fetch(PINATA_API_URL, {
      method: 'POST',
      body: JSON.stringify(pinataBody),
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(response);
    const responseData = await response.json();
    console.log(responseData);
    
    if (response.ok) {
      console.log('Successfully uploaded to IPFS with CID:', responseData.IpfsHash);
      // CIDを保存して後でNFTミント時に使用
      return responseData.IpfsHash;
    } else {
      console.error('Failed to upload to IPFS:', responseData);
      throw new Error('Failed to upload to IPFS');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    
    if (!walletAddress) {
      setMintStatus('ウォレットを接続してから登録してください。');
      return;
    }
    
    try {
      // First save to IPFS
      const ipfsCid = await saveIPFS();
      // Then mint the SBT
      await mintSBT(ipfsCid);
      // We could add navigation here
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">ユーザー登録</h2>
          <p className="mt-2 text-sm text-gray-600">
            情報を入力して、SBTをミントしましょう
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-2">ウォレット接続</h3>
          <WalletConnect onConnect={handleWalletConnect} />
          
          {walletAddress && (
            <div className="mt-2 text-sm text-green-600">
              ウォレット接続済み: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              placeholder="山田 太郎"
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              会社名
            </label>
            <input
              type="text"
              name="company"
              id="company"
              value={formData.company}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              placeholder="株式会社サンプル"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              placeholder="your-email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="telNumber" className="block text-sm font-medium text-gray-700">
              電話番号
            </label>
            <input
              type="tel"
              name="telNumber"
              id="telNumber"
              value={formData.telNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              placeholder="03-xxxx-xxxx"
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              URL
            </label>
            <input
              type="url"
              name="url"
              id="url"
              value={formData.url}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="profileText" className="block text-sm font-medium text-gray-700">
              プロフィール
            </label>
            <textarea
              name="profileText"
              id="profileText"
              rows={4}
              value={formData.profileText}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
              placeholder="自己紹介をお書きください"
            />
          </div>
          
          <div className="flex justify-between items-center pt-4">            
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={isMinting || !walletAddress}
            >
              {isMinting ? 'ミント中...' : 'SBTをミント'}
            </button>
          </div>
          
          {mintStatus && (
            <div className={`mt-4 p-3 rounded-md ${
              mintStatus.includes('正常') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {mintStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 