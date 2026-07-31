import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../assets/css/login.css";
import { login } from "../services/auth";

import logo from "../assets/images/logo.jpg";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await login({
                email,
                password,
                remember,
            });

            if (response.success) {
                // sementara untuk Sprint 3A
                localStorage.setItem("loggedIn", "true");
                navigate("/dashboard");
            }

        } catch (error) {
            console.error(error);
            alert("Invalid email or password");
        }
    };

    return (
        <div className="login-page">
            <div className="card shadow login-card">
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <img
                            src={logo}
                            alt="WareSafe Logo"
                            className="login-logo"
                        />

                        <h2 className="login-title">
                            WARESAFE
                        </h2>

                        <p className="login-subtitle">
                            Building Monitoring System
                        </p>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Email
                        </label>

                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Password
                        </label>

                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                <i
                                    className={
                                        showPassword
                                            ? "bi bi-eye-slash"
                                            : "bi bi-eye"
                                    }
                                />
                            </button>
                        </div>
                    </div>

                    <div className="form-check mb-4">
                        <input
                            id="remember"
                            type="checkbox"
                            className="form-check-input"
                            checked={remember}
                            onChange={(e) =>
                                setRemember(e.target.checked)
                            }
                        />

                        <label
                            htmlFor="remember"
                            className="form-check-label"
                        >
                            Remember Me
                        </label>
                    </div>

                    <button
                        className="btn login-btn w-100"
                        onClick={handleLogin}
                    >
                        LOGIN
                    </button>
                </div>

                <div className="text-center pb-4 login-footer">
                    © WareSafe 2026
                </div>
            </div>
        </div>
    );
}