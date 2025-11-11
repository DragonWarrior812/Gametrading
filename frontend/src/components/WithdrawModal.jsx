import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function WithdrawModal({ isOpen, onClose, amount, onWithdraw }) {
  
  const [localAmount, setLocalAmount] = useState(amount);
  
  useEffect(() => {
    setLocalAmount(amount);
  }, [amount]);
  
  if (!isOpen) return null;
  
  const platformWalletAddress = import.meta.env.VITE_PLATFORM_WALLET_ADDRESS;
  const solanaUrl = `solana:${platformWalletAddress}?amount=${localAmount}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=deposit`;
  
  return (
    <div className="modal" id="withdrawModal" onClick={(e) => e.target.id === 'withdrawModal' && onClose()}>
      <div className="modal-content">
        <div className="modal-header">Withdraw USDC</div>
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
                Amount: <input type="number" id="withdrawAmount" className="stake-input" value={localAmount} onChange={(e) => setLocalAmount(e.target.value)} min="5" step="0.1" /> USDC<br /><br />
              </div>
              
            </div>
          </div>
        </div>
        <button className="close-modal" id="confirmWithdraw" onClick={() =>onWithdraw(localAmount)}>Withdraw</button>
        <button className="close-modal" id="closeWithdraw" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default WithdrawModal;

