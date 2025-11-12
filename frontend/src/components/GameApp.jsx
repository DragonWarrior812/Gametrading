import React, { useState, useEffect, useContext, useRef } from 'react';
import HUD from './HUD';
import GameCanvas from './GameCanvas';
import PlayerInfo from './PlayerInfo';
import Leaderboard from './Leaderboard';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import ToastContainer from './ToastContainer';
import FABMenu from './FABMenu';
import { TradingGameContext } from '../context/TradingGameContext';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL, Transaction, SystemProgram } from "@solana/web3.js";

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletSelectionModal } from '../components/WalletSelectionModal';

function GameApp() {
  const {
    balance,
    stake,
    currentMarket,
    currentTimeframe,
    currentPrice,
    playerCount,
    allBoxes,
    midLineY,
    scaleCenterPrice,
    pixelsPerPrice,
    priceScaleInner,
    setStake,
    setCurrentMarket,
    setCurrentTimeframe,
    setPlayerCount,
    setBalance,
    centerMidLine,
    placeBet,
    drawTicks,
    startMockUpdates,
    //initializePlayers,
  } = useContext(TradingGameContext);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [players, setPlayers] = useState([]);
  const [initialPlayers, setInitialPlayers] = useState([]);
  const wallet = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const wsRef = useRef(null); // Store WebSocket reference
  
  // Get wallet address from wallet adapter
  const initializePlayers = (players) => {
    if (players.length === 0) return; // Don't process if players array is empty
    
    const avatars = [
      { emoji: "🚀", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
      { emoji: "💎", bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
      { emoji: "🐋", bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
      { emoji: "🔥", bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
      { emoji: "⚡", bg: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
      { emoji: "🎯", bg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
      { emoji: "👑", bg: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)" },
      { emoji: "🦅", bg: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
      { emoji: "🌟", bg: "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)" },
      { emoji: "💰", bg: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" },
    ];

    const updatedPlayers = [];
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      if (!player) continue; // Skip if player doesn't exist
      
      const name = player.name;
      const winRate = player.winRate;
      const joinTime = player.joinTime;
      const avatar = avatars[Math.floor(joinTime % avatars.length)];
      updatedPlayers.push({ id: Date.now() + i, name, avatar, winRate, joinTime });
    }
    setInitialPlayers(updatedPlayers);
  };
  // Check if Phantom is installed
  const getProvider = () => {
    if("solana" in window) {
      const provider = window.solana;
      if(provider.isPhantom) {
        return provider;
      }
    }
    window.open("https://phantom.app/", "_blank");
    return null;
  };

  const connectWallet = () => {
    setShowWalletModal(true);
    // const provider = getProvider();
    // if(!provider) return;
    
    // try{
    //   const response = await provider.connect();
    //   const walletAddress = response.publicKey.toString();
    //   console.log("✅ Connected with wallet address:", walletAddress);
    //   setWalletAddress(walletAddress);
      
    //   return walletAddress;
    // } catch (error) {
    //   console.error("Error connecting to wallet", error);
    // }
  };


  const depositSol = async(depositAmount) => {
    const provider = getProvider();
    if (!provider || !walletAddress) {
      console.error("No wallet provider or wallet address found");
      return;
    }
    
    const amount = depositAmount;
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      // Replace with your platform wallet address
      const platformWalletAddress = import.meta.env.VITE_PLATFORM_WALLET_ADDRESS;
      const platformWallet = new PublicKey(platformWalletAddress);
      const amountInLamports = LAMPORTS_PER_SOL * parseFloat(amount);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: platformWallet,
          lamports: amountInLamports,
        })
      );

      transaction.feePayer = provider.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await provider.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      console.log("Deposit sent! Tx ID:", txid);
      alert(`Deposit successful! TX ID: ${txid}`);
      setDepositModalOpen(false);
    } catch(error) {
      console.error("Transaction failed:", error);
      if (error.code === 4001) {
        alert("Transaction was rejected by user.");
      } else {
        alert("Transaction failed. Please try again.");
      }
    }
  };

  const withdrawSol = async(amountSol) => {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
      alert("Phantom wallet not found!");
      return;
    }

    if(!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    const amount = amountSol;
    const amountInLamports = LAMPORTS_PER_SOL * parseFloat(amount);
    
    try {
      await provider.connect();
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const platformWalletAddress = import.meta.env.VITE_PLATFORM_WALLET_ADDRESS;
      const platformWallet = new PublicKey(platformWalletAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: new PublicKey(walletAddress),
          lamports: amountInLamports,
        })
      );
      
      transaction.feePayer = platformWallet;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      // Note: This would typically be signed by the platform wallet on the backend
      // For now, we'll need the user to sign (this is a simplified version)
      const signedTx = await signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid, 'confirmed');
      
      console.log("Withdraw sent! Tx ID:", txid);
      alert(`Withdraw successful! TX ID: ${txid}`);
      setWithdrawModalOpen(false);
    } catch (error){
      console.error("Withdraw failed:", error);
      if (error.code === 4001) {
        alert("Transaction was rejected by user.");
      } else {
        alert("Withdraw failed. Please try again.");
      }
    }
  };
  
  const handleDisconnect = () => {
    setWalletAddress(null);
    setShowWalletModal(false);
    wallet.disconnect();
    console.log("✅ Wallet disconnected");
  };

  // WebSocket connection setup
  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket('ws://' + import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    // Event handler: Triggered when the WebSocket connection is successfully established
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      // Send wallet address to server if available
      if (walletAddress) {
        ws.send(JSON.stringify({ type: 'connect', walletAddress: walletAddress }));
      }
    };

    // Event handler: Triggered when a message is received from the WebSocket server
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      
      // Handle different message types
      if (data.type === 'count') {
        setPlayerCount(data.players_count);
        setPlayers(data.players);
        initializePlayers(data.players);
      } 
      // else if(data.type === 'balance') {
      //   setBalance(0);
      // }
      // Add more message type handlers as needed
    };

    // Event handler: Triggered when a WebSocket error occurs
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Event handler: Triggered when the WebSocket connection is closed
    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    // Cleanup: Close WebSocket when component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []); // Run once on mount

  // Send wallet address when it becomes available
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && walletAddress) {
      wsRef.current.send(JSON.stringify({ type: 'connect', walletAddress: walletAddress }));
    }
  }, [walletAddress]); // Run when walletAddress changes
  
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      const address = wallet.publicKey.toString();
      setWalletAddress(address);
      console.log("✅ Wallet connected:", address);
    } else {
      setWalletAddress(null);
    }
  }, [wallet.connected, wallet.publicKey]);

  // Initialize game state when market changes: restart price updates and reinitialize players
  useEffect(() => {
    startMockUpdates();
    initializePlayers(players);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMarket]);

  return (
    <div className="app-container" id="gameApp">
      <HUD
        balance={balance}
        stake={stake}
        currentMarket={currentMarket}
        currentTimeframe={currentTimeframe}
        walletAddress={walletAddress}
        onStakeChange={setStake}
        onMarketChange={setCurrentMarket}
        onTimeframeChange={setCurrentTimeframe}
        onDepositClick={() => setDepositModalOpen(true)}
        onConnectWalletClick={() => setShowWalletModal(true)}
        onDisConnectWalletClick={() => handleDisconnect()}
        onWithdrawClick={() => setWithdrawModalOpen(true)}
      />
      <PlayerInfo balance={balance} playerCount={playerCount} />
      <Leaderboard players={initialPlayers} />
      <FABMenu
        onDepositClick={() => setDepositModalOpen(true)}
        onWithdrawClick={() => setWithdrawModalOpen(true)}
      />
      <GameCanvas
        currentMarket={currentMarket}
        currentPrice={currentPrice}
        midLineY={midLineY}
        scaleCenterPrice={scaleCenterPrice}
        pixelsPerPrice={pixelsPerPrice}
        allBoxes={allBoxes}
        onCanvasClick={placeBet}
        onCenterClick={centerMidLine}
        priceScaleInner={priceScaleInner}
        drawTicks={drawTicks}
      />
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        amount={stake}
        walletAddress={walletAddress}
        onDeposit={depositSol}
      />
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        amount={stake}
        onWithdraw={(amount) => withdrawSol(amount)}
      />
      <ToastContainer />
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  );
}

export default GameApp;

