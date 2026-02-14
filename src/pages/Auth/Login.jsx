import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!userName || !password) {
            setError("Please enter both userName and password");
            return;
        }

        const result = await login(userName, password);

         console.log("LOGIN RESULT:", result);
        if (result.success) {
            navigate("/dashboard");

        } else {
            setError(result.message || "Invalid credentials");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-bg"></div>
            <div className="auth-card">
                <img src="/assets/MercBenzLogo.png" alt="Mercedes-Benz" className="auth-logo" />
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to the Digital Assembly Platform</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                    
                        <input
                            type="text"
                            className="auth-input"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="admin@MB"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">Sign In</button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
