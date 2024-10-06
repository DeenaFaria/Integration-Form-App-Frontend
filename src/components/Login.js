import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // Correctly import jwtDecode

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const body = { email, password };
    try {
      const res = await axios.post("http://localhost:5000/routes/auth/login", body);

      // Store the token
      const token = res.data.token;
      localStorage.setItem("token", token);

      // Decode the token to get user information
      const decoded = jwtDecode(token);
      localStorage.setItem("userId", decoded.id); // Store the userId

      window.location = "/dashboard"; // Redirect to dashboard
    } catch (err) {
      console.error(err.response.data);
      // Optionally, handle error display here (e.g., show a message to the user)
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleLogin} className="shadow p-4 rounded bg-light">
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>

        {/* Add a link to the registration page */}
        <p className="mt-3 text-center">
          Don't have an account? <Link to="/register" className="link-primary">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
