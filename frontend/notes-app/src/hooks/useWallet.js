// Polyfill for Buffer (needed by Lucid in browser)
import { Buffer as BufferPolyfill } from "buffer/";
if (typeof window !== "undefined") {
  window.Buffer = BufferPolyfill;
}

import { useState, useCallback } from "react";
import { Blockfrost, Lucid } from "lucid-cardano";

const CARDANO_NETWORK = import.meta.env.VITE_CARDANO_NETWORK || "Preprod";
const BLOCKFROST_PROJECT_ID = import.meta.env.VITE_BLOCKFROST_PROJECT_ID_PREPROD || "";

// Payment configuration
const PAYMENT_CONFIG = {
  recipientAddress: "addr_test1qqt6gp96cldazkxg79ugk8k7qpgeyu8qnuxktg0q2f00ev5jv3g8druqq7ep8eyy6mj66hcle5vdp3rt5k9jrspteywqpy9mra",
  amountLovelace: 2000000, // 2 ADA
  amountAda: 2
};

export const useWallet = () => {
  const [lucid, setLucid] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState("");

  // Get available wallets
  const getAvailableWallets = useCallback(() => {
    if (typeof window !== "undefined" && window.cardano) {
      return Object.keys(window.cardano).filter(
        (w) => typeof window.cardano[w] === "object" && window.cardano[w].enable
      );
    }
    return [];
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async (walletName = "lace") => {
    setError("");
    setIsConnecting(true);

    try {
      if (!window.cardano || !window.cardano[walletName]) {
        throw new Error(`${walletName} wallet not found. Please install it first.`);
      }

      const lucidInstance = await Lucid.new(
        new Blockfrost(
          "https://cardano-preprod.blockfrost.io/api/v0",
          BLOCKFROST_PROJECT_ID
        ),
        CARDANO_NETWORK
      );

      const api = await window.cardano[walletName].enable();
      lucidInstance.selectWallet(api);

      const addr = await lucidInstance.wallet.address();

      setWalletAddress(addr);
      setLucid(lucidInstance);

      return { success: true, address: addr };
    } catch (err) {
      const errorMsg = err?.message || String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setLucid(null);
    setWalletAddress("");
    setError("");
  }, []);

  // Pay for note creation
  const payForNote = useCallback(async () => {
    setError("");
    setIsProcessingPayment(true);

    try {
      if (!lucid) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      // Build transaction
      const tx = await lucid
        .newTx()
        .payToAddress(PAYMENT_CONFIG.recipientAddress, {
          lovelace: BigInt(PAYMENT_CONFIG.amountLovelace)
        })
        .complete();

      // Sign transaction
      const signedTx = await tx.sign().complete();

      // Submit transaction
      const txHash = await signedTx.submit();

      return { success: true, txHash };
    } catch (err) {
      const errorMsg = err?.message || String(err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsProcessingPayment(false);
    }
  }, [lucid]);

  // Check if wallet is connected
  const isConnected = Boolean(lucid && walletAddress);

  return {
    // State
    lucid,
    walletAddress,
    isConnected,
    isConnecting,
    isProcessingPayment,
    error,
    
    // Config
    paymentAmount: PAYMENT_CONFIG.amountAda,
    
    // Actions
    getAvailableWallets,
    connectWallet,
    disconnectWallet,
    payForNote,
    clearError: () => setError("")
  };
};

export default useWallet;