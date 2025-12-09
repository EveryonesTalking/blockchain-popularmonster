import React from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome</h1>
            <button onClick={() => navigate("/login")}>Connect Wallet / Login</button>
        </div>
    );
}

export default Landing;
