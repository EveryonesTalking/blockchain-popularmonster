import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Navbar";


function Login() {
    const navigate = useNavigate();

    return (
        <div>
            <Header />
            <h1>Login Page</h1>
            <button onClick={() => navigate("/dashboard")}>Login (placeholder)</button>
        </div>
    );
}

export default Login;
