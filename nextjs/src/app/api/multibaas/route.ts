import { NextRequest, NextResponse } from 'next/server';

// MultiBaasの設定（環境変数から取得）
// 公式サンプルの変数名に合わせて変更
const MULTIBAAS_URL = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
// 公式テンプレートの環境変数名に合わせて更新
const MULTIBAAS_API_KEY = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY || process.env.NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY;
// コントラクトアドレスを取得 - アドレスエイリアスを使用
const SBT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MULTIBAAS_VOTING_ADDRESS_ALIAS || '0x5E1801208afe7f165ae20cFaFE8bE2d5b1265963';
const SBT_CONTRACT_LABEL = process.env.NEXT_PUBLIC_MULTIBAAS_VOTING_CONTRACT_LABEL || 'soulboundtoken1';
// MultiBaas公式ドキュメントに合わせてチェーンIDを取得
const CHAIN_ID = process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID || '11155111'; // デフォルトはSepolia

// チェーン一覧取得のヘルパー関数
async function getAvailableChains() {
  try {
    // MultiBaas API認証ヘッダーの設定
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MULTIBAAS_API_KEY}`
    };

    console.log('API key format (first 20 chars):', MULTIBAAS_API_KEY ? MULTIBAAS_API_KEY.substring(0, 20) + '...' : '未設定');
    
    const chainsResponse = await fetch(`${MULTIBAAS_URL}/api/v0/chains`, {
      method: 'GET',
      headers
    });
    
    // レスポンスのステータスコードをチェック
    if (!chainsResponse.ok) {
      console.error('Error fetching chains, status code:', chainsResponse.status);
      // ステータスコードに基づいたエラーメッセージ
      if (chainsResponse.status === 401) {
        return { error: 'Unauthorized: API key may be invalid or expired' };
      }
      return { error: `Failed to fetch chains: ${chainsResponse.status} ${chainsResponse.statusText}` };
    }
    
    // テキスト形式でレスポンスを取得して確認
    const responseText = await chainsResponse.text();
    console.log('Raw chains response:', responseText.substring(0, 100) + '...');
    
    try {
      // JSONとして解析
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return { 
        error: 'Failed to parse chains response',
        rawResponse: responseText.substring(0, 200) + '...'
      };
    }
  } catch (error) {
    console.error('Error fetching chains:', error);
    return { error: `Failed to fetch chains: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const requestBody = await request.json();
    const { path, method, body } = requestBody;

    // デバッグ用のログ
    console.log('MultiBaas URL:', MULTIBAAS_URL);
    console.log('API Key 長さ:', MULTIBAAS_API_KEY ? MULTIBAAS_API_KEY.length : '未設定');
    console.log('API Key 最初の30文字:', MULTIBAAS_API_KEY ? MULTIBAAS_API_KEY.substring(0, 30) : '未設定');
    console.log('Contract Address:', SBT_CONTRACT_ADDRESS);
    console.log('Contract Label:', SBT_CONTRACT_LABEL);
    console.log('Chain ID:', CHAIN_ID);
    console.log('Request Path:', path);
    console.log('Request Body:', JSON.stringify(body, null, 2));

    // チェーン一覧を確認するための特別なパス
    if (path === '/check-chains') {
      const chains = await getAvailableChains();
      console.log('Available chains:', chains);
      
      // 使用可能なすべての環境変数もログ出力
      console.log('All MultiBaas env vars:', {
        MULTIBAAS_URL,
        SBT_CONTRACT_ADDRESS,
        SBT_CONTRACT_LABEL,
        CHAIN_ID
      });
      
      return NextResponse.json({ chains }, { status: 200 });
    }

    if (!path) {
      return NextResponse.json(
        { error: 'API path is required' },
        { status: 400 }
      );
    }

    // パスの検証 - パスを修正せず、そのまま使用
    const modifiedPath = path;
    console.log('Using path:', modifiedPath);

    // MultiBaasへのリクエストを構築
    const multiBaasUrl = `${MULTIBAAS_URL}${modifiedPath}`;
    console.log('Full MultiBaas URL:', multiBaasUrl);
    
    // MultiBaas API認証ヘッダーの設定 
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MULTIBAAS_API_KEY}`
    };
    
    console.log('Authorization Header:', `Bearer ${MULTIBAAS_API_KEY ? MULTIBAAS_API_KEY.substring(0, 30) + '...' : '未設定'}`);

    // MultiBaasへリクエストを転送
    const response = await fetch(multiBaasUrl, {
      method: method || 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    try {
      // レスポンスのテキストをまず取得
      const responseText = await response.text();
      
      // デバッグ用にレスポンスの最初の部分をログ出力
      console.log('MultiBaas response text (first 100 chars):', responseText.substring(0, 100));
      
      let responseData;
      try {
        // JSONとして解析を試みる
        responseData = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        // JSONパースエラー時は元のテキストを返す
        return NextResponse.json(
          { 
            error: 'Invalid JSON response from MultiBaas API',
            rawResponse: responseText.substring(0, 1000) // 最初の1000文字を返す
          },
          { status: 502 }
        );
      }
      
      console.log('MultiBaas Response:', JSON.stringify(responseData, null, 2));

      // ブロックチェーンが見つからないエラーの場合、利用可能なチェーンリストを取得
      if (responseData.error === 'blockchain not found' || responseData.message === 'blockchain not found') {
        const chainsData = await getAvailableChains();
        console.log('Available chains in MultiBaas:', chainsData);
        
        // コントラクト一覧も取得
        try {
          const contractsResponse = await fetch(`${MULTIBAAS_URL}/api/v0/contracts`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${MULTIBAAS_API_KEY}`
            }
          });
          
          const contractsData = await contractsResponse.json();
          console.log('Available contracts in MultiBaas:', contractsData);
          
          // 元のエラーに加えて、利用可能なチェーン情報を返す
          responseData.availableChains = chainsData;
          responseData.availableContracts = contractsData;
        } catch (error) {
          console.error('Error fetching contracts:', error);
          responseData.availableChains = chainsData;
        }
      }

      // 401エラーの場合、詳細なエラー情報を提供
      if (responseData.status === 401 || response.status === 401) {
        console.error('Authorization failed with MultiBaas API');
        responseData.authDetails = {
          tip: 'MultiBaasのAPIキーが無効またはJWTトークンの形式が正しくありません。MultiBaasダッシュボードで新しいAPIキーを生成してください。',
          keyLength: MULTIBAAS_API_KEY ? MULTIBAAS_API_KEY.length : 0
        };
      }

      // MultiBaasからのレスポンスをクライアントに送信
      return NextResponse.json(responseData, { 
        status: response.status 
      });
    } catch (error: any) {
      console.error('Error processing MultiBaas response:', error);
      return NextResponse.json(
        { error: error.message || 'Error processing MultiBaas response' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('MultiBaas proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 