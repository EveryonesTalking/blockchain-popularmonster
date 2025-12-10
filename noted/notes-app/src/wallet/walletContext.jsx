import React, { createContext, useState, useContext } from "react";

// Create the context
export const WalletContext = createContext();

// Provider component
export const WalletProvider = ({ children }) => {
    // Just simulate a wallet
    const [address, setAddress] = useState("addr_test_fakewallet123");
    const [connected, setConnected] = useState(true);

    // Simulate connecting wallet
    const connectWallet = () => {
        setAddress("addr_test_fakewallet123");
        setConnected(true);
    };

    return (
        <WalletContext.Provider value={{ connected, address, connectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

// Hook to use wallet
export function useWallet() {
    return useContext(WalletContext);
}
