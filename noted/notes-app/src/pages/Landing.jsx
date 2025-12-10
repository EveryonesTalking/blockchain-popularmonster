import React from "react";
import { useNavigate } from "react-router-dom";
//import Header from "../components/Header";
import "../css/landing.css";

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* <Header /> */}
            <div className="landing-content">
                <h1 className="landing-title">Welcome to Glyph</h1>
                <p className="landing-intro">
                    The next-gen note-taking app on blockchain. Secure, fast, and fun.
                </p>
                <button className="landing-button" onClick={() => navigate("/login")}>
                    Get Started
                </button>
            </div>
        </div>
    );
}
