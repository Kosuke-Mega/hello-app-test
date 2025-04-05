import { NextRequest, NextResponse } from 'next/server';

// MultiBaasの設定（環境変数から取得）
const MULTIBAAS_URL = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
const MULTIBAAS_API_KEY = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY || process.env.NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY;
const CHAIN_ID = process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID || '11155111'; // デフォルトはSepolia

// APIルートデバッグ用のログ
console.log('API Route: /api/multibaas/submit-tx loaded');
console.log('MultiBaas URL:', MULTIBAAS_URL);
console.log('API Key exists:', !!MULTIBAAS_API_KEY);
console.log('Chain ID:', CHAIN_ID);

// トランザクション送信用のPOSTメソッド
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/multibaas/submit-tx');
  
  try {
    // リクエストボディを取得
    const requestBody = await request.json();
    const { txHash, transactionId } = requestBody;

    console.log('Request body:', { txHash, transactionId });

    if (!txHash) {
      console.log('Error: Transaction hash is required');
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    console.log('Submitting transaction to MultiBaas:', { txHash, transactionId });

    // MultiBaas API認証ヘッダーの設定
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MULTIBAAS_API_KEY}`
    };

    // トランザクションIDが提供されている場合は、特定のトランザクションを更新
    if (transactionId) {
      const updatePath = `/api/v0/transactions/${transactionId}`;
      const updateUrl = `${MULTIBAAS_URL}${updatePath}`;
      
      console.log('Updating transaction in MultiBaas:', updateUrl);
      
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          hash: txHash,
          submitted: true
        })
      });
      
      const updateResponseText = await updateResponse.text();
      console.log('MultiBaas update response text:', updateResponseText.substring(0, 200));
      
      try {
        const updateResponseData = JSON.parse(updateResponseText);
        console.log('MultiBaas update response:', JSON.stringify(updateResponseData, null, 2));
        
        return NextResponse.json(updateResponseData, { 
          status: updateResponse.status 
        });
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        return NextResponse.json(
          { 
            error: 'Invalid JSON response from MultiBaas API',
            rawResponse: updateResponseText.substring(0, 1000)
          },
          { status: 502 }
        );
      }
    } 
    
    // トランザクションIDがない場合は、ハッシュでトランザクションを検索して更新
    const searchPath = `/api/v0/transactions?hash=${txHash}`;
    const searchUrl = `${MULTIBAAS_URL}${searchPath}`;
    
    console.log('Searching for transaction in MultiBaas:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers
    });
    
    const searchResponseText = await searchResponse.text();
    console.log('MultiBaas search response text:', searchResponseText.substring(0, 200));
    
    try {
      const searchResponseData = JSON.parse(searchResponseText);
      console.log('MultiBaas search response:', JSON.stringify(searchResponseData, null, 2));
      
      // トランザクションが見つかった場合、最初のトランザクションを更新
      if (searchResponseData.result && searchResponseData.result.items && searchResponseData.result.items.length > 0) {
        const foundTransaction = searchResponseData.result.items[0];
        const updatePath = `/api/v0/transactions/${foundTransaction.id}`;
        const updateUrl = `${MULTIBAAS_URL}${updatePath}`;
        
        console.log('Updating found transaction in MultiBaas:', updateUrl);
        
        const updateResponse = await fetch(updateUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            hash: txHash,
            submitted: true
          })
        });
        
        const updateResponseText = await updateResponse.text();
        
        try {
          const updateResponseData = JSON.parse(updateResponseText);
          console.log('MultiBaas update response:', JSON.stringify(updateResponseData, null, 2));
          
          return NextResponse.json(updateResponseData, { 
            status: updateResponse.status 
          });
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          return NextResponse.json(
            { 
              error: 'Invalid JSON response from MultiBaas API',
              rawResponse: updateResponseText.substring(0, 1000)
            },
            { status: 502 }
          );
        }
      }
      
      // トランザクションが見つからない場合、新しいトランザクションとして登録
      console.log('Transaction not found, creating new transaction record');
      
      const createPath = '/api/v0/transactions';
      const createUrl = `${MULTIBAAS_URL}${createPath}`;
      
      console.log('Creating new transaction in MultiBaas:', createUrl);
      console.log('Request body:', JSON.stringify({
        hash: txHash,
        chain_id: CHAIN_ID,
        submitted: true
      }));
      
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          hash: txHash,
          chain_id: CHAIN_ID,
          submitted: true
        })
      });
      
      const createResponseText = await createResponse.text();
      console.log('MultiBaas create response text:', createResponseText.substring(0, 200));
      
      try {
        const createResponseData = JSON.parse(createResponseText);
        console.log('MultiBaas create response:', JSON.stringify(createResponseData, null, 2));
        
        return NextResponse.json(createResponseData, { 
          status: createResponse.status 
        });
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        return NextResponse.json(
          { 
            error: 'Invalid JSON response from MultiBaas API',
            rawResponse: createResponseText.substring(0, 1000)
          },
          { status: 502 }
        );
      }
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON response from MultiBaas API',
          rawResponse: searchResponseText.substring(0, 1000)
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('MultiBaas transaction submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 