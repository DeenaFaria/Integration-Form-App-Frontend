import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // Correctly import jwtDecode

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // State for messages
  const [error, setError] = useState(false); // State for error handling

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear any previous message
    setError(false); // Reset error state

    const body = { email, password };
    try {
      const res = await axios.post("http://localhost:5000/routes/auth/login", body);

      // Store the token
      const token = res.data.token;
      localStorage.setItem("token", token);

      // Decode the token to get user information
      const decoded = jwtDecode(token);
      localStorage.setItem("userId", decoded.id); // Store the userId
      localStorage.setItem("isAdmin", decoded.isAdmin); // Store the isAdmin flag

      // Debugging Log
      console.log("is_admin value:", decoded.isAdmin); // Log the is_admin value

      // Check if the user is an admin
      if (decoded.isAdmin) {
        console.log("Redirecting to admin panel");
        window.location = "/admin-panel"; // Redirect to admin panel if the user is an admin
      } else {
        console.log("Redirecting to dashboard");
        window.location = "/dashboard"; // Redirect to dashboard for regular users
      }
    } catch (err) {
      console.error(err.response.data);
      setError(true); // Set error state
      setMessage(err.response.data.message || 'An error occurred. Please try again.'); // Display error message
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
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage(""); // Clear message on input change
            }}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMessage(""); // Clear message on input change
            }}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>

        {/* Display success or error message */}
        {message && (
          <div className={`mt-3 alert ${error ? 'alert-danger' : 'alert-success'}`} role="alert">
            {message}
          </div>
        )}

        {/* Add a link to the registration page */}
        <p className="mt-3 text-center">
          Don't have an account? <Link to="/register" className="link-primary">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
