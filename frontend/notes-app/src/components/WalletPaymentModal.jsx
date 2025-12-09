import React, { useState, useEffect } from 'react';
import '../css/WalletPaymentModal.css';

const WalletPaymentModal = ({ isOpen, onClose, onPaymentSuccess, wallet }) => {
  const [step, setStep] = useState('connect'); // 'connect', 'pay', 'processing', 'success', 'error'
  const [selectedWallet, setSelectedWallet] = useState('lace');
  const [availableWallets, setAvailableWallets] = useState([]);
  const [txHash, setTxHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    isConnected,
    isConnecting,
    isProcessingPayment,
    walletAddress,
    paymentAmount,
    connectWallet,
    payForNote,
    error: walletError
  } = wallet;

  // Load available wallets
  useEffect(() => {
    const wallets = wallet.getAvailableWallets();
    setAvailableWallets(wallets);
    
    // Default to lace if available
    if (wallets.includes('lace')) {
      setSelectedWallet('lace');
    } else if (wallets.length > 0) {
      setSelectedWallet(wallets[0]);
    }
  }, []);

  // Update step based on wallet state
  useEffect(() => {
    if (isConnected && step === 'connect') {
      setStep('pay');
    }
  }, [isConnected]);

  // Handle wallet errors
  useEffect(() => {
    if (walletError) {
      setErrorMessage(walletError);
      setStep('error');
    }
  }, [walletError]);

  const handleConnect = async () => {
    setErrorMessage('');
    const result = await connectWallet(selectedWallet);
    
    if (result.success) {
      setStep('pay');
    } else {
      setErrorMessage(result.error);
      setStep('error');
    }
  };

  const handlePayment = async () => {
    setErrorMessage('');
    setStep('processing');
    
    const result = await payForNote();
    
    if (result.success) {
      setTxHash(result.txHash);
      setStep('success');
    } else {
      setErrorMessage(result.error);
      setStep('error');
    }
  };

  const handleComplete = () => {
    onPaymentSuccess(txHash);
  };

  const handleRetry = () => {
    setErrorMessage('');
    wallet.clearError();
    setStep(isConnected ? 'pay' : 'connect');
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        {/* Header */}
        <div className="wallet-modal-header">
          <div className="wallet-modal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              <circle cx="16" cy="14" r="2" />
            </svg>
          </div>
          <h2>Payment Required</h2>
          <p>Pay {paymentAmount} ADA to save your note</p>
        </div>

        {/* Content based on step */}
        <div className="wallet-modal-content">
          
          {/* Step: Connect Wallet */}
          {step === 'connect' && (
            <div className="wallet-step">
              <div className="step-indicator">
                <div className="step active">1</div>
                <div className="step-line"></div>
                <div className="step">2</div>
              </div>
              
              <h3>Connect Your Wallet</h3>
              <p>Select a Cardano wallet to continue</p>

              {availableWallets.length > 0 ? (
                <>
                  <div className="wallet-select">
                    <select 
                      value={selectedWallet} 
                      onChange={(e) => setSelectedWallet(e.target.value)}
                    >
                      {availableWallets.map((w) => (
                        <option key={w} value={w}>
                          {w.charAt(0).toUpperCase() + w.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    className="wallet-modal-btn primary"
                    onClick={handleConnect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <span className="spinner"></span>
                        Connecting...
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                </>
              ) : (
                <div className="no-wallet-message">
                  <p>No Cardano wallet detected.</p>
                  <p>Please install <a href="https://www.lace.io/" target="_blank" rel="noopener noreferrer">Lace</a> or another Cardano wallet.</p>
                </div>
              )}
            </div>
          )}

          {/* Step: Pay */}
          {step === 'pay' && (
            <div className="wallet-step">
              <div className="step-indicator">
                <div className="step completed">✓</div>
                <div className="step-line completed"></div>
                <div className="step active">2</div>
              </div>

              <h3>Confirm Payment</h3>
              
              <div className="wallet-connected-info">
                <span className="connected-badge">
                  <span className="green-dot"></span>
                  Connected
                </span>
                <span className="wallet-addr">
                  {walletAddress.slice(0, 12)}...{walletAddress.slice(-8)}
                </span>
              </div>

              <div className="payment-details">
                <div className="payment-row">
                  <span>Amount</span>
                  <span className="payment-amount">{paymentAmount} ADA</span>
                </div>
                <div className="payment-row">
                  <span>Network</span>
                  <span>Preprod Testnet</span>
                </div>
              </div>

              <button 
                className="wallet-modal-btn primary"
                onClick={handlePayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  `Pay ${paymentAmount} ADA`
                )}
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="wallet-step processing">
              <div className="processing-spinner"></div>
              <h3>Processing Payment</h3>
              <p>Please confirm the transaction in your wallet...</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="wallet-step success">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>Payment Successful!</h3>
              <p className="tx-hash">
                Transaction: {txHash.slice(0, 20)}...
              </p>
              <a 
                href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-tx-link"
              >
                View on Cardanoscan →
              </a>

              <button 
                className="wallet-modal-btn primary"
                onClick={handleComplete}
              >
                Save Note
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="wallet-step error">
              <div className="error-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Payment Failed</h3>
              <p className="error-message">{errorMessage}</p>

              <button 
                className="wallet-modal-btn primary"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer - Hide cancel button on success and processing */}
        {step !== 'success' && step !== 'processing' && (
          <div className="wallet-modal-footer">
            <button 
              className="wallet-modal-btn secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPaymentModal;