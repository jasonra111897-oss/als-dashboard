import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Temporary logic: replace with database check later
    if (credentials.email.endsWith("@deped.gov.ph") && credentials.password === "ncr123") {
      onLogin(credentials.email);
    } else {
      setError("Invalid credentials. Please use your @deped.gov.ph email.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card shadow-hover">
        <img src="/deped.png" alt="DepEd Logo" className="login-logo" />
        <h2>ALS NCR Management</h2>
        <p>Please sign in to manage division data</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@deped.gov.ph"
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required 
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;