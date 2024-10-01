import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateTemplate from './components/CreateTemplate';
import ViewTemplate from './components/ViewTemplate'; // A new component to view a template

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-template" element={<CreateTemplate />} />
        <Route path="/template/:id" element={<ViewTemplate />} /> {/* Route for viewing a specific template */}
      </Routes>
    </Router>
  );
}

export default App;
