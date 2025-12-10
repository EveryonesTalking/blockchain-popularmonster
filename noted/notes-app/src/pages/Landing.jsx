import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Navbar";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div>
            <Header />
            <h1>Welcome</h1>
            <button onClick={() => navigate("/login")}>
                Connect Wallet / Login
            </button>
        </div>
    );
}
