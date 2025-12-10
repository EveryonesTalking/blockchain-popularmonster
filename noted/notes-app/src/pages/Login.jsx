import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Navbar";
import "../css/login.css";

export default function Login() {
    const navigate = useNavigate();

    // Simulate login (for flow testing)
    const handleLogin = () => {
        navigate("/dashboard");
    };

    return (
        <div className="login-container">
            <Header />
            <div className="login-content-wrapper">
                <h1 className="login-title">Welcome Back to Glyph</h1>
                <p className="login-intro">
                    Connect your wallet to access your notes and blockchain-powered workflow.
                </p>
                <button className="login-button" onClick={handleLogin}>
                    Connect Wallet / Login
                </button>
            </div>
        </div>
    );
}
