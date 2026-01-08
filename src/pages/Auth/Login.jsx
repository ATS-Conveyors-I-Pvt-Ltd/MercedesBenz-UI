import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        try {
            login(loginId, password);
            // Use plain window location to ensure full app reload/reset if needed, 
            // but normal navigate is better for SPA. 
            // However, with our LoadingScreen logic in App.jsx, a refresh is nice.
            //  window.location.href = '/'; 
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAdminFill = () => {
        setLoginId('admin@MB');
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Login ID</label>
                            <button type="button" onClick={handleAdminFill} style={{ background: 'none', border: 'none', color: '#00aad2', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>Login as Admin</button>
                        </div>
                        <input
                            type="text"
                            className="auth-input"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
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
