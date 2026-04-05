// src/pages/Signup.tsx

import "../styles/signup.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";


export default function Signup() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { signup } = useAuth();
    const handleSignup = async () => {
        if (!username || !email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            await signup({
                username,
                email,
                password,
                first_name: "temp",
                last_name: "temp",
            });

        } catch (err) {
            setError("Signup failed");
        } finally {
            setLoading(false);
        }

        navigate("/");

    };
    const [loading, setLoading] = useState(false);


    return (
        <div className="signup-container">
            {/* Left Side */}
            <div className="left-panel">
                <h1>Game Haven</h1>
                <p>Join the ultimate, all-in-one gaming social hub!</p>
            </div>

            {/* Right Side */}
            <div className="right-panel">
                <div className="form-box">
                    <h2>Create Account</h2>

                    <input
                        placeholder="Username"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        placeholder="Email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}


                    <button
                        className="button"
                        onClick={handleSignup}
                        disabled={loading}
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>

                    <p style={{ marginTop: "10px" }}>
                        Already have an account?{" "}
                        <span
                            style={{ color: "#38bdf8", cursor: "pointer" }}
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}