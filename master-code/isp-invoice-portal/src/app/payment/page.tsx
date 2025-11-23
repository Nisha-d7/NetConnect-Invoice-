'use client';

import { useEffect, useState } from 'react';
import { AptosClient } from 'aptos';
import {
  AptosWalletAdapterProvider,
  useWallet,
  InputTransactionData,
} from '@aptos-labs/wallet-adapter-react';

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com/v1');

type Invoice = {
  id: number;
  amount: number;
  status: 'unpaid' | 'paid';
};

interface CoinResourceData {
  coin: {
    value: string;
  };
}

function Home() {
  const { connect, account, signAndSubmitTransaction, disconnect, wallets } = useWallet();
  const [invoices] = useState<Invoice[]>([
    { id: 1, amount: 2.5, status: 'unpaid' },
    { id: 2, amount: 3.2, status: 'unpaid' },
  ]);
  const [txHash, setTxHash] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  const RECIPIENT_ADDRESS = '0xc30fdc8a295f81f0123ebd31f04da158b28a3ab1c6882450aac40227c1d4a69'; // Replace with your actual recipient address

  const getBalance = async (address: string) => {
    try {
      const resources = await client.getAccountResources(address);
      const coin = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      const raw = (coin?.data as CoinResourceData)?.coin?.value || '0';
      return parseInt(raw) / 1e8;
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Failed to fetch balance. Please try again.');
      return 0;
    }
  };

  const checkTransactionStatus = async (hash: string) => {
    try {
      const tx = await client.getTransactionByHash(hash);
      if ('success' in tx && tx.success) {
        setTxStatus('success');
      } else {
        setTxStatus('failed');
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      console.error('Failed to check transaction status:', err);
      setTxStatus('failed');
      setError('Failed to verify transaction status.');
    }
  };

  useEffect(() => {
    if (account?.address) {
      getBalance(account.address.toString()).then(setBalance);
    } else {
      setBalance(null);
    }
  }, [account, txHash]);

  useEffect(() => {
    if (txHash) {
      setTxStatus('pending');
      checkTransactionStatus(txHash);
    }
  }, [txHash]);

  const handlePay = async (invoice: Invoice) => {
    if (!account) return;
    setIsLoading(true);
    setError(null);
    setTxStatus(null);

    const txPayload: InputTransactionData = {
      data: {
        function: '0x1::coin::transfer',
        typeArguments: ['0x1::aptos_coin::AptosCoin'],
        functionArguments: [
          RECIPIENT_ADDRESS,
          (invoice.amount * 1e8).toString(),
        ],
      },
    };

    try {
      const tx = await signAndSubmitTransaction(txPayload);
      setTxHash(tx.hash);
    } catch (error) {
      console.error('Payment failed:', error);
      setError('Payment failed. Please try again.');
      setTxStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">ISP Invoice Portal (Testnet)</h1>

        {!account ? (
          <button
            onClick={() => connect(wallets[0].name)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="mb-2 text-gray-700">
              <span className="font-semibold">Connected:</span> {account.address.toString()}
            </p>
            {balance !== null && (
              <p className="mb-2 text-gray-700">
                <span className="font-semibold">Balance:</span> {balance.toFixed(2)} APT
              </p>
            )}
            <button
              onClick={disconnect}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Unpaid Invoices</h2>
        {invoices.map((inv) => (
          <div key={inv.id} className="border border-gray-200 p-4 mb-4 rounded-md hover:shadow-md transition-shadow">
            <p className="text-lg font-medium text-gray-800">Invoice #{inv.id}</p>
            <p className="text-gray-600 mb-3">Amount: {inv.amount} APT</p>
            <button
              disabled={!account || isLoading}
              onClick={() => handlePay(inv)}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                !account || isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLoading ? 'Processing...' : 'Pay with Aptos'}
            </button>
          </div>
        ))}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {txHash && (
          <div className={`mt-4 p-3 rounded-md ${
            txStatus === 'success' ? 'bg-green-50 border-green-200' :
            txStatus === 'failed' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          } border`}>
            <p className={`${
              txStatus === 'success' ? 'text-green-600' :
              txStatus === 'failed' ? 'text-red-600' :
              'text-blue-600'
            }`}>
              {txStatus === 'success' && '✅ Payment successful!'}
              {txStatus === 'failed' && '❌ Payment failed!'}
              {txStatus === 'pending' && '⏳ Payment processing...'}
              <br />
              <span className="text-sm">Transaction Hash: {txHash}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AptosWalletAdapterProvider>
      <Home />
    </AptosWalletAdapterProvider>
  );
} 