import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function WalletSelectionModal({ isOpen, onClose }) {
  const { wallets, select, connect, connecting, connected } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    if (typeof window !== 'undefined') {
      const checkMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
      setIsMobile(checkMobile);
    }
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling on the body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Re-enable scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsConnecting(false);
      setSelectedWallet(null);
      setError(null);
    }
  }, [isOpen]);

  // Auto-close modal when successfully connected
  useEffect(() => {
    if (connected && isOpen) {
      console.log('connected-----------', connected)
      setTimeout(() => {
        onClose();
      }, 500);
    }
  }, [connected, isOpen, onClose]);

  const handleWalletSelect = useCallback(async (walletName) => {
    try {
      setIsConnecting(true);
      setSelectedWallet(walletName);
      setError(null);
      
      // Select the wallet first
      select(walletName);
      
      // For mobile, give more time for app switching and deep linking
      // For desktop, shorter timeout is fine
      const timeout = isMobile ? 1000 : 300;
      
      await new Promise(resolve => setTimeout(resolve, timeout));
      
      try {
        // Attempt to connect with timeout
        const connectionTimeout = isMobile ? 30000 : 10000; // 30s for mobile, 10s for desktop
        const connectionPromise = connect();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), connectionTimeout)
        );
        
        await Promise.race([connectionPromise, timeoutPromise]);
        
        // Connection successful - modal will auto-close via useEffect
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        
        // Provide user-friendly error messages
        let errorMessage = "Failed to connect to wallet";
        
        if (error?.message?.includes('User rejected')) {
          errorMessage = "Connection request was rejected";
        } else if (error?.message?.includes('timeout')) {
          errorMessage = isMobile 
            ? "Connection timed out. Please ensure the wallet app is installed and try again."
            : "Connection timed out. Please try again.";
        } else if (error?.message?.includes('WalletNotReadyError')) {
          errorMessage = "Wallet not ready. Please install or enable the wallet extension/app.";
        }
        
        setError(errorMessage);
        setIsConnecting(false);
        setSelectedWallet(null);
      }
    } catch (error) {
      console.error("Error selecting wallet:", error);
      setError("Failed to select wallet");
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  }, [select, connect, isMobile]);

  const getWalletIcon = (walletName) => {
    const wallet = wallets.find(w => w.adapter.name === walletName);
    return wallet?.adapter.icon || "";
  };

  if (!isOpen) return null;

  const installedWallets = wallets.filter(wallet =>
    wallet.readyState === "Installed" || wallet.readyState === "Loadable"
  );
  
  const notDetectedWallets = wallets.filter(wallet => 
    wallet.readyState === "NotDetected"
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={isConnecting ? undefined : onClose}
      style={{ minHeight: '100vh', minWidth: '100vw' }}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-md w-full p-6 m-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {isMobile ? "Connect wallet" : "Connect or create wallet"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isConnecting}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
            <div className="text-black text-2xl font-bold">O</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {isMobile && isConnecting && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
            <p className="text-sm text-blue-400">
              If your wallet app opens, please approve the connection request.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {installedWallets.length > 0 ? (
            <>
              {installedWallets.map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  className="w-full bg-slate-700 border border-slate-600 hover:bg-slate-600 text-white rounded-md px-2 py-2 flex items-center justify-start transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleWalletSelect(wallet.adapter.name)}
                  disabled={isConnecting}
                >
                  {wallet.adapter.icon && (
                    <img
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      className="w-6 h-6 mr-3 rounded"
                    />
                  )}
                  <span className="flex-1 text-left">
                    {isConnecting && selectedWallet === wallet.adapter.name
                      ? "Connecting..."
                      : wallet.adapter.name}
                  </span>
                  {isConnecting && selectedWallet === wallet.adapter.name && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="p-4 bg-slate-700/50 rounded-md text-center">
              <p className="text-sm text-gray-300 mb-3">
                {isMobile 
                  ? "No wallet detected. Please install a Solana wallet app."
                  : "No wallet extension detected. Please install a wallet."}
              </p>
            </div>
          )}

          {notDetectedWallets.length > 0 && (
            <>
              <div className="text-sm text-gray-400 mt-4 mb-2">
                {isMobile ? "Install a wallet" : "Available Wallets"}
              </div>
              {notDetectedWallets.slice(0, isMobile ? 4 : 3).map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  className="w-full bg-slate-700 border border-slate-600 hover:bg-slate-600 text-white rounded-md px-2 py-2 flex items-center justify-start transition-colors opacity-60 hover:opacity-100"
                  onClick={() => {
                    if (wallet.adapter.url) {
                      window.open(wallet.adapter.url, "_blank");
                    }
                  }}
                  disabled={isConnecting}
                >
                  {wallet.adapter.icon && (
                    <img
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      className="w-6 h-6 mr-3 rounded"
                    />
                  )}
                  <span className="flex-1 text-left">{wallet.adapter.name}</span>
                  <span className="text-xs text-gray-400">Install</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          {isMobile 
            ? "Make sure your wallet app is installed before connecting"
            : "Only connect to wallets you trust"}
        </div>
      </div>
    </div>
  );
}

export default WalletSelectionModal; 