import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../wallet/walletContext";
import "../css/navbar.css";

export default function Header() {
    const navigate = useNavigate();
    const { connected, address, connectWallet, disconnectWallet } = useWallet();

    return (
        <header className="navbar">
            <h1 className="navbar-title" onClick={() => navigate("/")}>
                Notes App
            </h1>

            <div>
                {!connected ? (
                    <button className="navbar-button" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                ) : (
                    <>
                        <span className="navbar-address">{address.slice(0, 12)}...</span>
                        <button className="navbar-button" onClick={disconnectWallet} style={{ marginLeft: "10px" }}>
                            Log Out
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
