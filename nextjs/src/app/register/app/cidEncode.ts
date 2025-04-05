'use client'
// import contentHash from '@ensdomains/content-hash';
import bs58 from 'bs58';

// ENSコンテンツハッシュをIPFS CIDに戻す関数
export function decodeContentHash(contentHash: string): string | null {
  if (!contentHash || contentHash === '0x') return null;
  
  // プレフィックスの0xを削除
  const hash = contentHash.startsWith('0x') ? contentHash.slice(2) : contentHash;
  
  // IPFSのプロトコルコードをチェック (0xe3)
  if (!hash.startsWith('e3')) {
    throw new Error('IPFSプロトコルコード (0xe3) が見つかりません');
  }
  
  // CIDv0の形式 (e30101701220) をチェック
  if (hash.includes('0101701220')) {
    // ハッシュ部分を抽出（プレフィックスを除く）
    const hashPart = hash.slice(hash.indexOf('0101701220') + 10);
    
    // 16進数文字列をバイト配列に変換
    const bytes = Buffer.from(hashPart, 'hex');
    
    // マルチハッシュのプレフィックスを追加（0x1220 = sha2-256 + 32バイト長）
    const multiHashPrefix = Buffer.from([0x12, 0x20]);
    const fullBytes = Buffer.concat([multiHashPrefix, bytes]);
    
    // Base58エンコード
    return bs58.encode(fullBytes);
  }
  
  // その他の形式や、CIDv1の場合
  throw new Error('サポートされていないコンテンツハッシュ形式です');
}

// CIDをENSコンテンツハッシュ形式にエンコードする関数（EIP-1577準拠）
export function encodeContentHash(cid: string): string {
  if (!cid) return '0x';
  
  const bytes = bs58.decode(cid);
  return '0xe30101701220' + Buffer.from(bytes.slice(2)).toString('hex');
}
// CIDをENSコンテンツハッシュ形式にエンコードする関数（EIP-1577準拠）
// export function encodeContentHash(cid: string): string {
//     // const bs58= require('bs58');
//     const bytes = bs58.decode(cid);
//     return '0xe30101701220' + Buffer.from(bytes).toString('hex');
// }