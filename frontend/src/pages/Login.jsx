import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa";
import "../App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginUser = async () => {
    if (!email.trim() || !password.trim()) {
      return alert("Please fill all fields.");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return alert("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return alert("Password must contain at least 6 characters.");
    }

    try {
      const { data } = await axios.post("http://127.0.0.1:5000/login", {
        email: email.trim(),
        password,
      });

      if (!data.token || !data.user) {
        return alert(data.error || "Invalid email or password");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.error || "Invalid email or password"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-shield"><FaShieldAlt /></div>
          <h1>OfferCheck</h1>
          <p>AI-Powered Job Scam Detection</p>
        </div>

        <div className="auth-heading">
          <h2>Welcome Back</h2>
          <span>Login to continue protecting your career</span>
        </div>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="auth-button" onClick={loginUser}>
          <FaSignInAlt /> Login
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;