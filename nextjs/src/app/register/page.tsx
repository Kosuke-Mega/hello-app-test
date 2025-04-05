'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ODE2ZDVlZC05MGRhLTQ5NjEtYWY2OC1iNmVmZmZmODYzNTciLCJlbWFpbCI6ImsubWVnYS4yMDc5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1OTI5N2JmNzZmMDU4MjNkZGJiMSIsInNjb3BlZEtleVNlY3JldCI6IjE1ZWY0MmRmNmNhMDVkM2M1MmIxMjVlMGE5ZGFmYzk0MzU5MzA4YjFjOTg0Y2IwNTY2YTMzNTgwNjgyNWY1NWEiLCJleHAiOjE3NzUzMDM4NjV9.ga8UCNMfS5rRZodAYfu2gxBhf8nDkBFo_LEn21tNOdw';
  const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';


  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    telNumber: '',
    url: '',
    profileText: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const mintSBT = async (ipfsCid: string) => {
    // form.append('ipfsCid', ipfsCid);
    
    console.log('Minting SBT with IPFS CID:', ipfsCid);
    // ここにSBTミントのロジックを実装
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
            情報を入力して、NFTをミントしましょう
          </p>
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
            >
              SBTをミント
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 