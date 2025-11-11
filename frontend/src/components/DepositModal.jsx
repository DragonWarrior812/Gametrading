import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
//import env from '../env';

function DepositModal({ isOpen, onClose, amount, walletAddress, onDeposit }) {
  
  const [localAmount, setLocalAmount] = useState(amount);
  // Update local amount when prop changes
  useEffect(() => {
    setLocalAmount(amount);
  }, [amount]);

  if (!isOpen) return null;
  // Generate Solana payment URL
  // For now, using a placeholder address - replace with your platform wallet address
  const platformWalletAddress = import.meta.env.VITE_PLATFORM_WALLET_ADDRESS;
  const solanaUrl = `solana:${platformWalletAddress}?amount=${localAmount}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=deposit`;

  return (
    <div className="modal" id="depositModal" onClick={(e) => e.target.id === 'depositModal' && onClose()}>
      <div className="modal-content">
        <div className="modal-header">Deposit USDC</div>
        <div className="qr-container">
          <div className="qr-code-wrapper">
            <QRCodeSVG
              value={solanaUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="qr-info">
              <div className="qr-address">
                {platformWalletAddress.slice(0, 8)}...{platformWalletAddress.slice(-8)}
              </div>
              <div className="qr-amount">
                Amount: <input type="number" id="depositAmount" className="stake-input" value={localAmount} onChange={(e) => setLocalAmount(e.target.value)} min="5" step="0.1" /> USDC
              </div>
            </div>
          </div>
        </div>
        {onDeposit && (
          <button className="close-modal" id="confirmDeposit" onClick={() =>onDeposit(localAmount)}>
            Deposit
          </button>
        )}
        <button className="close-modal" id="closeDeposit" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default DepositModal;

