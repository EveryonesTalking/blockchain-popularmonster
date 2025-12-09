// Polyfill for Buffer (needed by Lucid in browser)
import { Buffer as BufferPolyfill } from "buffer/";
window.Buffer = BufferPolyfill;

import React, { useState, useEffect } from "react";
import { Blockfrost, Lucid } from "lucid-cardano";
import "../css/Wallet.css";

const CARDANO_NETWORK = import.meta.env.VITE_CARDANO_NETWORK || "Preprod";
const BLOCKFROST_PROJECT_ID = import.meta.env.VITE_BLOCKFROST_PROJECT_ID_PREPROD || "";

export default function Wallet() {
  const [lucid, setLucid] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [address, setAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load available wallets (Nami, Eternl, Lace, Typhon)
  useEffect(() => {
    const loadWallets = () => {
      if (window.cardano) {
        const keys = Object.keys(window.cardano). filter(
          (w) => typeof window.cardano[w] === "object"
        );
        setWallets(keys);
      }
    };
    loadWallets();
    const interval = setInterval(loadWallets, 800);
    return () => clearInterval(interval);
  }, []);

  // Connect wallet
  const handleConnect = async () => {
    setError("");
    if (!selectedWallet) return setError("Select a wallet first");

    try {
      setLoading(true);

      const lucidInstance = await Lucid.new(
        new Blockfrost(
          "https://cardano-preprod.blockfrost.io/api/v0",
          BLOCKFROST_PROJECT_ID
        ),
        "Preprod"
      );

      const api = await window.cardano[selectedWallet].enable();
      lucidInstance.selectWallet(api);

      const addr = await lucidInstance.wallet.address();

      setAddress(addr);
      setLucid(lucidInstance);
    } catch (err) {
      setError("Connection failed: " + (err?. message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    setLucid(null);
    setAddress("");
    setSelectedWallet("");
    setTxHash("");
    setError("");
  };

  // Send ADA
  const handleSend = async () => {
    setError("");
    setTxHash("");

    if (!lucid) return setError("Connect your wallet first");
    if (!recipient) return setError("Enter recipient address");

    const lovelace = Number(amount);
    if (isNaN(lovelace) || lovelace <= 0)
      return setError("Enter valid amount in Lovelace");

    try {
      setLoading(true);

      const tx = await lucid
        .newTx()
        .payToAddress(recipient, { lovelace: BigInt(Math.floor(lovelace)) })
        .complete();

      const signedTx = await tx.sign(). complete();
      const hash = await signedTx.submit();

      setTxHash(hash);
      setRecipient("");
      setAmount("");
    } catch (err) {
      setError("Transaction failed: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-wrapper">
      {/* Header */}
      <div className="wallet-header">
        <div className="wallet-header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <circle cx="16" cy="14" r="2" />
          </svg>
        </div>
        <div className="wallet-header-text">
          <h2>Cardano Wallet</h2>
          <span className="wallet-header-badge">Preprod Network</span>
        </div>
      </div>

      {/* Network Info Cards */}
      <div className="wallet-info-grid">
        <div className="wallet-info-card">
          <div className="wallet-info-card-icon network">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15. 3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="wallet-info-card-content">
            <span className="wallet-info-label">Network</span>
            <span className="wallet-info-value">{CARDANO_NETWORK}</span>
          </div>
        </div>
        <div className="wallet-info-card">
          <div className="wallet-info-card-icon api">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="wallet-info-card-content">
            <span className="wallet-info-label">Blockfrost API</span>
            <span className="wallet-info-value">
              {BLOCKFROST_PROJECT_ID ?  BLOCKFROST_PROJECT_ID. slice(0, 12) + "..." : "Not configured"}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Section */}
      {! lucid ? (
        <div className="wallet-connect-section">
          <div className="wallet-connect-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h3>Connect Your Wallet</h3>
          </div>
          <p className="wallet-connect-desc">Select a Cardano wallet to connect and start sending ADA</p>
          
          <div className="wallet-select-wrapper">
            <label>Available Wallets</label>
            <div className="wallet-select-container">
              <select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}>
                <option value="">Choose a wallet...</option>
                {wallets.map((w) => (
                  <option key={w} value={w}>
                    {w. charAt(0).toUpperCase() + w.slice(1)}
                  </option>
                ))}
              </select>
              <div className="wallet-select-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
          
          <button className="wallet-connect-btn" onClick={handleConnect} disabled={!selectedWallet || loading}>
            {loading ? (
              <>
                <span className="wallet-spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13. 8 12H3" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Connected State */}
          <div className="wallet-connected-card">
            <div className="wallet-connected-header">
              <div className="wallet-connected-status">
                <div className="wallet-status-dot"></div>
                <span>Connected</span>
              </div>
              <button className="wallet-disconnect-btn" onClick={handleDisconnect}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Disconnect
              </button>
            </div>
            <div className="wallet-address-box">
              <span className="wallet-address-label">Wallet Address</span>
              <div className="wallet-address-value">
                <span>{address. slice(0, 20)}... {address.slice(-15)}</span>
                <button 
                  className="wallet-copy-btn" 
                  onClick={() => navigator.clipboard.writeText(address)} 
                  title="Copy address"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Send ADA Section */}
          <div className="wallet-send-section">
            <div className="wallet-send-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <h3>Send ADA</h3>
            </div>
            
            <div className="wallet-input-group">
              <div className="wallet-input-wrapper">
                <label>Recipient Address</label>
                <input
                  type="text"
                  placeholder="addr_test1..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="wallet-input-wrapper">
                <label>Amount (Lovelace)</label>
                <div className="wallet-amount-input">
                  <input
                    type="number"
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target. value)}
                    disabled={loading}
                  />
                  <span className="wallet-amount-hint">1 ADA = 1,000,000 Lovelace</span>
                </div>
              </div>
              
              <button className="wallet-send-btn" onClick={handleSend} disabled={loading || !recipient || ! amount}>
                {loading ? (
                  <>
                    <span className="wallet-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send Transaction
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="wallet-alert error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Success Message with Cardanoscan Link */}
      {txHash && (
        <div className="wallet-alert success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11. 08V12a10 10 0 1 1-5. 93-9.14" />
            <polyline points="22 4 12 14. 01 9 11.01" />
          </svg>
          <div>
            <strong>Transaction Submitted!</strong>
            <p className="wallet-tx-hash">{txHash}</p>
            
            {/* Cardanoscan Link */}
            <a
              href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wallet-cardanoscan-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View on Cardanoscan
            </a>
            
            <p className="wallet-tx-reminder">
              🕒 Please wait 3–5 minutes for Cardanoscan to display the transaction. 
            </p>
          </div>
        </div>
      )}
    </div>
  );
}