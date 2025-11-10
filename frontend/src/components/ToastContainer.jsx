import React, { useContext } from 'react';
import { TradingGameContext } from '../context/TradingGameContext';

function ToastContainer() {
  const { toasts } = useContext(TradingGameContext);

  return (
    <div id="toastContainer">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.isWin ? "win" : "lose"}`}>
          {toast.title} {toast.amount}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;

