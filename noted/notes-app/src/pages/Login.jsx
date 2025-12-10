import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../wallet/WalletContext";
import "../css/login.css";

export default function Login() {
    const navigate = useNavigate();
    const { connectWallet, loading, address } = useWallet();
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        const success = await connectWallet();

        if (success && address) {
            navigate("/dashboard");
        } else {
            setError("Failed to connect. Please install or unlock Lace Wallet.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-content-wrapper">
                <h1 className="login-title">Welcome Back to Glyph</h1>
                <p className="login-intro">
                    Connect your wallet to access your notes and blockchain-powered workflow.
                </p>

                <button className="login-button" onClick={handleLogin} disabled={loading}>
                    {loading ? "Connecting..." : "Connect Wallet / Login"}
                </button>

                {error && <p className="login-error">{error}</p>}
            </div>
        </div>
    );
}
