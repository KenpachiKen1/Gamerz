// src/pages/Login.tsx

import "../styles/signup.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    return (
        <div className="signup-container">
            {/* Left Side */}
            <div className="left-panel">
                <h1>Game Haven</h1>
                <p>Welcome back! Jump back into the haven.</p>
            </div>

            {/* Right Side */}
            <div className="right-panel">
                <div className="form-box">
                    <h2>Login</h2>

                    <input placeholder="Email" className="input" />

                    <input
                        type="password"
                        placeholder="Password"
                        className="input"
                    />
                    
                    <button
                        className="button"
                        onClick={() => {
                            // later: send data to backend

                            navigate("/"); // redirect
                        }}
                    >
                        Login
                    </button>

                    <p style={{ marginTop: "10px" }}>
                        Don’t have an account?{" "}
                        <span
                            style={{ color: "#38bdf8", cursor: "pointer" }}
                            onClick={() => navigate("/signup")}
                        >
                            Sign up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}