import { createContext, useContext, useState } from "react";
import * as Cardano from "@emurgo/cardano-serialization-lib-asmjs";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebaseConfig"; // your Firebase app

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState(null);

    function hexToBytes(hex) {
        if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    const connectWallet = async () => {
        try {
            setLoading(true);

            if (!window.cardano || !window.cardano.lace) {
                console.error("Lace wallet not found");
                return false;
            }

            const api = await window.cardano.lace.enable();
            if (!api) return false;

            // Try used -> unused -> change addresses
            let addresses = await api.getUsedAddresses();
            if (!addresses || addresses.length === 0) addresses = await api.getUnusedAddresses();
            if (!addresses || addresses.length === 0) {
                const changeAddr = await api.getChangeAddress();
                if (!changeAddr) {
                    console.error("Wallet returned no addresses");
                    return false;
                }
                addresses = [changeAddr];
            }

            const cbor = addresses[0];
            const addrBytes = Cardano.Address.from_bytes(hexToBytes(cbor));
            const bech32 = addrBytes.to_bech32();

            // Call v2 Cloud Function to register/verify user
            const functions = getFunctions(app);
            const loginFn = httpsCallable(functions, "loginWithWallet");
            const result = await loginFn({ address: bech32 });

            if (!result.data.success) {
                console.error("Wallet login failed");
                return false;
            }

            setAddress(bech32);
            console.log("Wallet connected and verified:", bech32);
            return true;
        } catch (err) {
            console.error("Wallet connection error:", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <WalletContext.Provider value={{ connectWallet, address, loading }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
