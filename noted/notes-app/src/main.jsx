// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { WalletProvider } from "./wallet/walletContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <WalletProvider>
            <App />
        </WalletProvider>
    </React.StrictMode>
);
