import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  Coin98WalletAdapter,
  LedgerWalletAdapter,
  NekoWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SkyWalletAdapter,
  TokenPocketWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { networkUrl } from '../engine/config';

export const WalletContextProvider = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = networkUrl;

  const wallets = useMemo(
    () => {
      // Initialize wallets with better mobile support
      const walletAdapters = [];
      
      try {
        // Phantom supports both desktop and mobile
        walletAdapters.push(new PhantomWalletAdapter());
      } catch (error) {
        console.warn('Failed to initialize Phantom wallet adapter:', error);
      }

      try {
        // Solflare with network config for better compatibility
        walletAdapters.push(new SolflareWalletAdapter({ network }));
      } catch (error) {
        console.warn('Failed to initialize Solflare wallet adapter:', error);
      }

      try {
        walletAdapters.push(new Coin98WalletAdapter());
      } catch (error) {
        console.warn('Failed to initialize Coin98 wallet adapter:', error);
      }

      try {
        walletAdapters.push(new TokenPocketWalletAdapter());
      } catch (error) {
        console.warn('Failed to initialize TokenPocket wallet adapter:', error);
      }

      try {
        walletAdapters.push(new SkyWalletAdapter());
      } catch (error) {
        console.warn('Failed to initialize Sky wallet adapter:', error);
      }

      try {
        walletAdapters.push(new NekoWalletAdapter());
      } catch (error) {
        console.warn('Failed to initialize Neko wallet adapter:', error);
      }

      try {
        // Ledger typically doesn't work on mobile
        if (typeof window !== 'undefined' && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          walletAdapters.push(new LedgerWalletAdapter());
        }
      } catch (error) {
        console.warn('Failed to initialize Ledger wallet adapter:', error);
      }

      return walletAdapters;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;

