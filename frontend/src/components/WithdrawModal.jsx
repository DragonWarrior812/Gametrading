import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

function WithdrawModal({ isOpen, onClose, amount, onWithdraw }) {
  if (!isOpen) return null;
  const platformWalletAddress = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
  const solanaUrl = `solana:${platformWalletAddress}?amount=${amount}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=deposit`;
  
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
                Withdraw <span id="withdrawAmount">{amount.toFixed(2)}</span> USDC<br /><br />
              </div>
              
            </div>
          </div>
        </div>
        <button className="close-modal" id="confirmWithdraw" onClick={onWithdraw}>Withdraw</button>
        <button className="close-modal" id="closeWithdraw" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default WithdrawModal;

