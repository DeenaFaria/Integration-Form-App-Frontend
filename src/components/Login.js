import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const body = { email, password };
    try {
        const res = await axios.post("http://localhost:5000/routes/auth/login", body);
      localStorage.setItem("token", res.data.token); // Store the token
      window.location = "/dashboard"; // Redirect to dashboard
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>

      {/* Add a link to the registration page */}
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </form>
  );
};

export default Login;
