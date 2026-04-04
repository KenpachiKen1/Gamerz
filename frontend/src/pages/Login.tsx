// src/pages/Login.tsx

import "../styles/signup.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // later: replace with Firebase login
            localStorage.setItem("token", "fake-token");

            navigate("/");
        } catch (err) {
            setError("Login failed");
        } finally {
            setLoading(false);
        }
    };

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

                    <input
                        placeholder="Email"
                        className="input"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="input"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                    />

                    {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

                    <button
                        className="button"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
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