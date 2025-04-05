'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Web3 from 'web3';
import { ethers } from 'ethers';
import { encodeContentHash, decodeContentHash } from './app/cidEncode';
// abi/ensRegisterControllerABI.json
import ensRegisterControllerAbi from './abi/ensRegisterControllerABI.json';

// abi/ensRegistrarABI.json
import ensRegistrarAbi from './abi/ensRegistryABI.json';

// abi/ensResolverABI.json
import ensResolverAbi from './abi/ensResolverABI.json';

// MetaMaskの型定義
declare global {
  interface Window {
    ethereum: any;
  }
}

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

  const ENS_REGISTER_CONTROLLER_ADDRESS = '0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72';
  const ENS_REGISTRAR_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  const ENS_RESOLVER_ADDRESS = '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD';

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
  const [isRegisteringENS, setIsRegisteringENS] = useState(false);

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
          cidVersion: 0
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

  const mintSBT = async (ipfsCid: string) => {
    if (!walletAddress) {
      setMintStatus('ウォレットが接続されていません。');
      return;
    }
    
    setIsMinting(true);
    setMintStatus('SBTをミント中...');
    
    try {
      console.log('Minting SBT with IPFS CID:', ipfsCid);
      
      // ランダムなトークンIDを生成する関数
      const generateRandomTokenId = () => {
        // 10000から99999の間のランダムな数値を生成
        return Math.floor(Math.random() * 90000) + 10000;
      };
      
      // 最初に試すトークンID（ランダム生成）
      let tokenId = generateRandomTokenId();
      let isTokenIdValid = false;
      let maxAttempts = 5; // 最大試行回数を5回に固定
      let attemptCount = 0;
      
      // トークンIDの有効性を確認するループ
      while (!isTokenIdValid && attemptCount < maxAttempts) {
        attemptCount++;
        setMintStatus(`トークンID ${tokenId} の検証中...（試行 ${attemptCount}/${maxAttempts}）`);
        console.log(`Checking if token ID ${tokenId} is available (attempt ${attemptCount}/${maxAttempts})...`);
        
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
            // このトークンIDはすでに使用されている場合は新しいランダムIDを生成
            console.log(`Token ID ${tokenId} is already in use, generating new random ID`);
            tokenId = generateRandomTokenId();
          }
        } catch (error) {
          // エラーが発生した場合、このトークンIDは使用されていないと仮定
          console.log(`Error checking token ID ${tokenId}, assuming it's available:`, error);
          isTokenIdValid = true;
        }
      }
      
      if (!isTokenIdValid) {
        throw new Error(`5回の試行後も有効なトークンIDが見つかりませんでした。他のタイミングで再度お試しください。`);
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
          from: walletAddress // ユーザー自身のウォレットアドレスから送信
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
      
      // 署名が必要なトランザクションの場合
      if (mintResult && mintResult.result && (mintResult.result.tx || mintResult.result.signatureRequest)) {
        setMintStatus('トランザクションに署名してください。MetaMaskの確認ウィンドウを確認してください。');
        // tx か signatureRequest のどちらかを使用
        const txData = mintResult.result.tx || mintResult.result.signatureRequest;
        console.log('署名リクエストデータを受信:', txData);
        
        try {
          // Web3インスタンスの作成
          if (!window.ethereum) {
            throw new Error('MetaMaskが見つかりません。MetaMaskをインストールしてください。');
          }
          console.log('MetaMask接続OK: ', window.ethereum.isMetaMask);
          const web3 = new Web3(window.ethereum);
          console.log('Web3インスタンス作成完了: ', web3.version);
          
          // ネットワーク接続を確認
          const chainId = await web3.eth.net.getId();
          console.log('現在のネットワークチェーンID:', chainId);
          console.log('現在のネットワークチェーンID(型):', typeof chainId);
          
          // sepoliaテストネットのチェーンID "0xaa36a7" (10進数では 11155111)
          const targetChainId = '0xaa36a7'; // sepoliaテストネット
          const targetChainIdDec = parseInt(targetChainId, 16);
          console.log('目標チェーンID(10進数):', targetChainIdDec);

          // 現在のチェーンIDと目標チェーンIDを比較
          const isCorrectNetwork = chainId === targetChainId;
          
          if (!isCorrectNetwork) {
            console.log('Sepoliaネットワークに切り替えが必要です');
            // sepoliaテストネットに切り替え
            try {
              // Web3.jsを通じてプロバイダーのリクエストを実行
              await web3.eth.currentProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }] // SepoliaのチェーンID（16進数）
              });
              console.log('Sepoliaネットワークに切り替え成功');
            } catch (switchError: any) {
              console.log('切り替えエラー発生:', switchError.code);
              // このエラーコードは、ユーザーがチェーンを持っていないことを示します
              if (switchError.code === 4902) {
                try {
                  // Web3.jsを通じてプロバイダーのリクエストを実行
                  await web3.eth.currentProvider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: targetChainId,
                      chainName: 'Sepolia Test Network',
                      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                      rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/'],
                      blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }]
                  });
                  console.log('Sepoliaネットワーク追加成功');
                } catch (addError) {
                  console.error('Sepoliaネットワーク追加エラー:', addError);
                  throw new Error('Sepoliaテストネットの追加に失敗しました');
                }
              } else {
                console.error('ネットワーク切り替えエラー:', switchError);
                throw new Error('ネットワークの切り替えに失敗しました');
              }
            }
          } else {
            console.log('既にSepoliaネットワークに接続されています');
          }
          
          // ガス見積もりを取得
          try {
            // 必要最低限のデータで試算用のトランザクションオブジェクトを作成
            const estimateGasObj = {
              from: walletAddress,
              to: txData.to,
              data: txData.data,
              value: txData.value ? web3.utils.toHex(txData.value) : '0x0'
            };
            
            console.log('ガス見積もり用データ:', estimateGasObj);
            const estimatedGas = await web3.eth.estimateGas(estimateGasObj);
            
            console.log('見積もりガス:', estimatedGas);
            
            // トランザクションデータを構築 - ガス見積もりを含める
            const ethereumTxData: {[key: string]: any} = {
              from: walletAddress,
              to: txData.to,
              data: txData.data,
              gas: estimatedGas, // 見積もったガス量を使用
            };
            
            // オプションのフィールドを条件付きで追加
            if (txData.value && txData.value !== '0' && txData.value !== 0) {
              ethereumTxData['value'] = web3.utils.toHex(txData.value);
            }
            
            console.log('トランザクション署名をリクエスト:', ethereumTxData);
            
            // 署名リクエストを送信
            const txHash = await web3.eth.sendTransaction(ethereumTxData);
            
            console.log('トランザクション署名完了・送信済み:', txHash);
            setMintStatus(`SBTをミント中...トランザクションハッシュ: ${txHash.substring(0, 10)}...`);
            
            // トランザクションの完了を監視
            const checkTxInterval = setInterval(async () => {
              try {
                const receipt = await web3.eth.getTransactionReceipt(txHash);
                if (receipt) {
                  clearInterval(checkTxInterval);
                  console.log('トランザクション完了:', receipt);
                  const success = receipt.status;
                  if (success) {
                    setMintStatus(`SBTが正常にミントされました！トランザクションハッシュ: ${txHash.substring(0, 10)}...`);
                    // 次のトークンIDをインクリメント
                    setLastTokenId(tokenId + 1);
                  } else {
                    setMintStatus(`トランザクションは失敗しました。詳細はブロックエクスプローラーで確認してください。`);
                  }
                }
              } catch (e) {
                console.error('トランザクション確認エラー:', e);
              }
            }, 3000); // 3秒ごとに確認
            
            return;
            
          } catch (gasEstimateError: any) {
            console.error('ガス見積もりエラー:', gasEstimateError);
            
            // ガス見積もりに失敗した場合はハードコードされた値を使用
            const ethereumTxData: {[key: string]: any} = {
              from: walletAddress,
              to: txData.to,
              data: txData.data,
              gas: '0x7A120', // 十分な値 (500,000) をハードコード
            };
            
            // オプションのフィールドを条件付きで追加
            if (txData.value && txData.value !== '0' && txData.value !== 0) {
              ethereumTxData['value'] = web3.utils.toHex(txData.value);
            }
            
            console.log('ガス見積もり失敗後のフォールバック:', ethereumTxData);
            
            // 署名リクエストを送信
            const txHash = await web3.eth.sendTransaction(ethereumTxData);
            
            console.log('トランザクション署名完了・送信済み:', txHash);
            setMintStatus(`SBTをミント中...トランザクションハッシュ: ${txHash.substring(0, 10)}...`);
            
            // 成功したら完了メッセージを表示
            setMintStatus(`SBTが正常にミントされました！トランザクションハッシュ: ${txHash.substring(0, 10)}...`);
            
            // 次のトークンIDをインクリメント
            setLastTokenId(tokenId + 1);
            return tokenId;
          }
        } catch (signError: any) {
          console.error('署名エラー詳細:', signError);
          // JSON-RPC エラーを詳細に解析
          let errorMsg = '署名が拒否されたか、エラーが発生しました';
          
          // エラーオブジェクトを詳細にログ出力
          console.log('エラータイプ:', typeof signError);
          console.log('エラープロパティ:', Object.keys(signError));
          console.log('エラーコード:', signError.code);
          console.log('エラーメッセージ:', signError.message);
          console.log('エラースタック:', signError.stack);
          
          if (signError.code === 4001) {
            errorMsg = 'ユーザーがトランザクションを拒否しました';
          } else if (signError.code === -32603) {
            errorMsg = '内部JSONRPCエラー。Polygon Mumbaiテストネットに接続し、ウォレットに十分なテスト用MATICがあることを確認してください。';
          } else if (signError.code === -32000) {
            errorMsg = 'ガス不足エラー。ウォレットに十分なテスト用MATICがあることを確認してください。';
          } else if (signError.message) {
            if (signError.message.includes('User denied')) {
              errorMsg = 'ユーザーがトランザクションを拒否しました';
            } else if (signError.message.includes('insufficient funds')) {
              errorMsg = 'ガス代が不足しています。ウォレットに十分なテスト用MATICがあるか確認してください';
            } else if (signError.message.includes('underpriced')) {
              errorMsg = 'トランザクションのガス価格が低すぎます。ネットワークの混雑状況を確認してください。';
            } else {
              errorMsg = signError.message;
            }
          }
          
          setMintStatus(`署名エラー: ${errorMsg}`);
          setIsMinting(false);
          return;
        }
      }
      
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

  const registerENS = async (tokenId: number) => {
    setIsRegisteringENS(true);
    setMintStatus('ENSドメインを登録中...');

    try {
      // トークンIDをJSONに保存
      const jsonData = {
        tokenId: tokenId,
      };

      // PINATAリクエストパラメータ
      const pinataBody = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: `${tokenId}.json`,
          keyvalues: {
            source: 'hello-app',
            timestamp: new Date().toISOString(),
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

      // PINATA APIリクエスト
      const response = await fetch(PINATA_API_URL, {
        method: 'POST',
        body: JSON.stringify(pinataBody),
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json',
        }
      });

      // PINATA APIレスポンス
      const responseData = await response.json();
      console.log('responseData', responseData.IpfsHash);

      // sepoliaテストネットに切り替え
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('MetaMaskが見つかりません。');
      }

      // ネットワーク接続を確認
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('現在のネットワークチェーンID:', chainId);
      console.log('現在のネットワークチェーンID(型):', typeof chainId);
      
      // sepoliaテストネットのチェーンID "0xaa36a7" (10進数では 11155111)
      const targetChainId = '0xaa36a7'; // sepoliaテストネット
      const targetChainIdDec = parseInt(targetChainId, 16);
      console.log('目標チェーンID(10進数):', targetChainIdDec);

      // Web3インスタンスの作成
      const web3 = new Web3(window.ethereum);
      
      // 現在のチェーンIDと目標チェーンIDを比較
      const isCorrectNetwork = chainId === targetChainId;
      
      if (!isCorrectNetwork) {
        console.log('Sepoliaネットワークに切り替えが必要です');
        // sepoliaテストネットに切り替え
        try {
          // Web3.jsを通じてプロバイダーのリクエストを実行
          await web3.eth.currentProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }] // SepoliaのチェーンID（16進数）
          });
          console.log('Sepoliaネットワークに切り替え成功');
        } catch (switchError: any) {
          console.log('切り替えエラー発生:', switchError.code);
          // このエラーコードは、ユーザーがチェーンを持っていないことを示します
          if (switchError.code === 4902) {
            try {
              // Web3.jsを通じてプロバイダーのリクエストを実行
              await web3.eth.currentProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainId,
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: { name: 'ETH', symbol: 'SepoliaETH', decimals: 18 },
                  rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
              });
              console.log('Sepoliaネットワーク追加成功');
            } catch (addError) {
              console.error('Sepoliaネットワーク追加エラー:', addError);
              throw new Error('Sepoliaテストネットの追加に失敗しました');
            }
          } else {
            console.error('ネットワーク切り替えエラー:', switchError);
            throw new Error('ネットワークの切り替えに失敗しました');
          }
        }
      } else {
        console.log('既にSepoliaネットワークに接続されています');
      }

      // コネクト中のアドレスを取得
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      // 英数字のランダムな文字列を生成
      const randomString = Math.random().toString(36).substring(2, 15);

      // ランダムなシークレットを生成
      const secret = web3.utils.randomHex(32);

      // 期間を指定
      const duration = 28 * 24 * 60 * 60; // 1年

      // レジスタコントローラーのコントラクトインスタンスを作成
      const ensRegisterController = new web3.eth.Contract(ensRegisterControllerAbi, ENS_REGISTER_CONTROLLER_ADDRESS);

      // レジスタコントローラーのコミットメントを作成
      const commitment = await ensRegisterController.methods.makeCommitment(
        randomString, 
        walletAddress,
        duration,
        secret,
        ENS_RESOLVER_ADDRESS,
        [],
        0,
        0).call();

      console.log('コミットメントを作成しました：', commitment);

      // コミットメントを送信
      const tx1 = await ensRegisterController.methods.commit(commitment).send({
        from: walletAddress,
        gas: '1000000',
      });

      console.log('コミットメントを送信しました：', tx1.transactionHash);

      // コミットメント期間待機(1分間)
      console.log('コミットメント期間待機中...');
      await new Promise(resolve => setTimeout(resolve, 60000));

      // 登録料金を計算
      const price = await ensRegisterController.methods.rentPrice(randomString, duration).call();
      console.log(`登録料金: ${web3.utils.fromWei(price.base, 'ether')} ETH`);

      // ドメインを登録
      const tx2 = await ensRegisterController.methods.register(
        randomString,
        walletAddress,
        duration,
        secret,
        ENS_RESOLVER_ADDRESS,
        [],
        0,
        0).send({
          from: walletAddress,
          value: web3.utils.toHex(price.base),
          gas: '1000000',
      });

      console.log('ドメインを登録しました：', tx2.transactionHash);

      // ENSネームをノードIDに変換
      let node = '0x0000000000000000000000000000000000000000000000000000000000000000';
      if(randomString) {
        let re_randomString = randomString + '.eth';
        const labels = re_randomString.toLowerCase().split('.');
        for (let i = labels.length - 1; i >= 0; i--) {
          let labelHash = web3.utils.keccak256(web3.utils.utf8ToHex(labels[i]));
          node = web3.utils.keccak256(node + labelHash.slice(2));
        }
      }
      // const node = ethers.utils.namehash(randomString);

      // cidをENSコンテンツハッシュ形式にエンコード
      const contentHash = encodeContentHash(responseData.IpfsHash);

      // ノードIDとコンテンツハッシュをセット
      const resolver = new web3.eth.Contract(ensResolverAbi, ENS_RESOLVER_ADDRESS);
      const tx3 = await resolver.methods.setContenthash(node, contentHash).send({
        from: walletAddress,
        gas: '1000000',
      });

      console.log('ノードIDとコンテンツハッシュをセットしました：', tx3);
      
      // コンテンツハッシュを取得
      const contentsHash = await resolver.methods.contenthash(node).call();
      console.log('コンテンツハッシュを取得しました：', contentsHash);

      // コンテンツハッシュをIPFS CIDにデコード
      const ipfsCid = decodeContentHash(contentHash);
      console.log('IPFS CID：', ipfsCid);
      console.log('ENSドメイン：', randomString + '.eth');
      
      setMintStatus(`ENSドメイン「${randomString}.eth」の登録が完了しました！`);
    } catch (error: any) {
      console.error('ENS登録エラー:', error);
      setMintStatus(`ENS登録中にエラーが発生しました: ${error.message || '不明なエラー'}`);
    } finally {
      setIsRegisteringENS(false);
    }
  };

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
      // const token_Id = await mintSBT(ipfsCid);
      // if (token_Id !== undefined) {
      //   await registerENS(token_Id);
      // } else {
      //   console.log('SBTのミントが完了していないため、ENSの登録はスキップします');
      // }
      await registerENS(17774);
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8 border border-blue-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-800">ユーザー登録</h2>
          <p className="mt-2 text-sm text-blue-600">
            情報を入力して、SBTをミントしましょう
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-medium text-blue-700 mb-2">ウォレット接続</h3>
          <WalletConnect 
            onConnect={handleWalletConnect} 
            redirectPath="/register"
            onDisconnect={() => {
              // This will automatically redirect to home page
              console.log('Wallet disconnected from register page');
            }}
          />
          
          {walletAddress && (
            <div className="mt-2 text-sm text-blue-600">
              ウォレット接続済み: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blue-700">
              名前
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="山田 太郎"
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-blue-700">
              会社名
            </label>
            <input
              type="text"
              name="company"
              id="company"
              value={formData.company}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="株式会社サンプル"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-700">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="your-email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="telNumber" className="block text-sm font-medium text-blue-700">
              電話番号
            </label>
            <input
              type="tel"
              name="telNumber"
              id="telNumber"
              value={formData.telNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="03-xxxx-xxxx"
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-blue-700">
              URL
            </label>
            <input
              type="url"
              name="url"
              id="url"
              value={formData.url}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="profileText" className="block text-sm font-medium text-blue-700">
              プロフィール
            </label>
            <textarea
              name="profileText"
              id="profileText"
              rows={4}
              value={formData.profileText}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              placeholder="自己紹介をお書きください"
            />
          </div>
          
          <div className="flex justify-between items-center pt-4">            
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isMinting || isRegisteringENS || !walletAddress}
            >
              {isMinting ? 'ミント中...' : isRegisteringENS ? 'ENS登録中...' : 'SBTをミント'}
            </button>
          </div>
          
          {mintStatus && (
            <div className={`mt-4 p-3 rounded-md ${
              mintStatus.includes('完了') || mintStatus.includes('正常') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
            }`}>
              {mintStatus}
              {isRegisteringENS && (
                <div className="mt-2 flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>ENSドメインを登録中です。この処理には数分かかることがあります...</span>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 