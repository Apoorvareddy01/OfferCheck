import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
} from "react-icons/fa";
import "../App.css";

function Register() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const registerUser = async () => {
    if (!fullname.trim() || !email.trim() || !password || !confirmPassword)
      return alert("Please fill all fields.");

    const namePattern = /^[a-zA-Z\s]{2,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!namePattern.test(fullname.trim()))
      return alert("Please enter a valid full name using letters only.");

    if (!emailPattern.test(email.trim()))
      return alert("Please enter a valid email address.");

    if (password.length < 6)
      return alert("Password must contain at least 6 characters.");

    if (password !== confirmPassword)
      return alert("Passwords do not match.");

    try {
      await axios.post("http://127.0.0.1:5000/register", {
        fullname: fullname.trim(),
        email: email.trim(),
        password,
      });

      alert("Registration Successful! Please login.");

      setFullname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration Failed"
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">

        <div className="auth-logo">
          <div className="auth-shield">
            <FaShieldAlt />
          </div>
          <h1>OfferCheck</h1>
          <p>AI-Powered Job Scam Detection</p>
        </div>

        <div className="auth-heading">
          <h2>Create Account</h2>
          <span>Join OfferCheck and protect your career journey</span>
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />
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
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="auth-button" onClick={registerUser}>
          <FaUserPlus /> Create Account
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;