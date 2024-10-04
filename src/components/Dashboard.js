import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";



const Dashboard = () => {
  const [templates, setTemplates] = useState([]);
  // Inside your Form Management component
const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTemplates = async () => {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const res = await axios.get("http://localhost:5000/routes/user/templates", config);
        setTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserTemplates();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Your Dashboard</h1>
      <h2 className="mb-3">Existing Templates</h2>
      
      {templates.length ? (
        <ul className="list-group mb-4">
          {templates.map((template) => (
            <li key={template.id} className="list-group-item">
              <Link to={`/template/${template.id}`} className="text-decoration-none">{template.title}</Link>
              <button onClick={() => navigate(`/responses/${template.id}`)}>View All Responses</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">You haven't created any templates yet.</p>
      )}
      
      <div className="text-center">
        <Link to="/create-template" className="btn btn-primary">Create New Template</Link>
      </div>
    </div>
  );
};

export default Dashboard;
