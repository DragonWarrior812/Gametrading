import React, { useState } from 'react';

function FABMenu({ onDepositClick, onWithdrawClick }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fab-menu">
      <button className="fab-main" id="fabMain" onClick={() => setIsOpen(!isOpen)}>
        ＋
      </button>
      {isOpen && (
        <div className="fab-options" id="fabOptions">
          <button
            className="fab-option"
            id="fabDeposit"
            onClick={() => {
              setIsOpen(false);
              onDepositClick();
            }}
          >
            💰 Deposit
          </button>
          <button
            className="fab-option"
            id="fabWithdraw"
            onClick={() => {
              setIsOpen(false);
              onWithdrawClick();
            }}
          >
            🏦 Withdraw
          </button>
        </div>
      )}
    </div>
  );
}

export default FABMenu;

