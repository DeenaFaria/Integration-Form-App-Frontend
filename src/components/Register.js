import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState(""); // Change name to username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const body = { username, email, password }; // Change name to username

    try {
        const res = await axios.post("http://localhost:5000/routes/auth/register", body);

      localStorage.setItem("token", res.data.token); // Store token
      window.location = "/login"; // Redirect to dashboard after registration
    } catch (err) {
      console.error(err.response.data);
      alert("Error registering. Please try again.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Username" // Change placeholder to Username
        value={username} // Change name to username
        onChange={(e) => setUsername(e.target.value)} // Change name to username
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
