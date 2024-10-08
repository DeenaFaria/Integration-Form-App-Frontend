import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateTemplate from './components/CreateTemplate';
import FillForm from './components/FillForm'; 
import ViewTemplate from './components/ViewTemplate';
import EditTemplate from './components/EditTemplate';
import SuccessPage from './components/SuccessPage';
import ViewResponses from './components/VewResponses';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/create-template" element={<CreateTemplate />} />
        <Route path="/template/:id" element={<ViewTemplate />} /> {/* Route for viewing a specific template */}
        <Route path="/fill-form/:id" element={<FillForm />} />
        <Route path="/edit/:id" element={<EditTemplate />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/responses/:id" element={<ViewResponses/>}/>

      </Routes>
    </Router>
  );
}

export default App;
