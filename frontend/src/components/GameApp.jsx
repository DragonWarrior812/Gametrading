import React, { useState, useEffect, useContext } from 'react';
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
    centerMidLine,
    placeBet,
    drawTicks,
    startMockUpdates,
    initializePlayers,
    players,
  } = useContext(TradingGameContext);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

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

  const connectWallet = async () => {
    const provider = getProvider();
    if(!provider) return;
    
    try{
      const response = await provider.connect();
      const walletAddress = response.publicKey.toString();
      console.log("✅ Connected with wallet address:", walletAddress);
      setWalletAddress(walletAddress);
      return walletAddress;
    } catch (error) {
      console.error("Error connecting to wallet", error);
    }
  };

  const depositSol = async() => {
    const provider = getProvider();
    if (!provider || !walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      // Replace with your platform wallet address
      const platformWalletAddress = env.platformWalletAddress;
      const platformWallet = new PublicKey(platformWalletAddress);
      const amount = LAMPORTS_PER_SOL * 0.001; // 0.001 SOL
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: platformWallet,
          lamports: amount,
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

  const withdrawSol = async(toAddress, amountSol) => {
    const provider = window.solana;
    if (!provider || !provider.isPhantom) {
      alert("Phantom wallet not found!");
      return;
    }

    try {
      await provider.connect();
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: amountSol,
        })
      );
      transaction.feePayer = provider.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      //Ask user to sign in Phantom
      const signedTx = await provider.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      console.log("Withdraw sent! Tx ID:", txid);
    } catch (error){
      console.error("Withdraw failed:", error);
    }
  };

  useEffect(() => {
    startMockUpdates();
    initializePlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMarket]);

  return (
    <div className="app-container" id="gameApp">
      <HUD
        balance={balance}
        stake={stake}
        currentMarket={currentMarket}
        currentTimeframe={currentTimeframe}
        onStakeChange={setStake}
        onMarketChange={setCurrentMarket}
        onTimeframeChange={setCurrentTimeframe}
        onDepositClick={() => setDepositModalOpen(true)}
        onConnectWalletClick={() => connectWallet()}
        onWithdrawClick={() => setWithdrawModalOpen(true)}
      />
      <PlayerInfo balance={balance} playerCount={playerCount} />
      <Leaderboard players={players} />
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
        onWithdraw={withdrawSol}
      />
      <ToastContainer />
    </div>
  );
}

export default GameApp;

