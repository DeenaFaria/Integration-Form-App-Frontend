import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [templates, setTemplates] = useState([]);

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
    <div>
      <h1>Your Dashboard</h1>
      <h2>Your Templates</h2>
      {templates.length ? (
        <ul>
          {templates.map((template) => (
            <li key={template.id}>
              <Link to={`/template/${template.id}`}>{template.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't created any templates yet.</p>
      )}
      <Link to="/create-template">Create New Template</Link>
    </div>
  );
};

export default Dashboard;
