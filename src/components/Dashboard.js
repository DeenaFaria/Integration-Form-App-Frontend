import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userTemplates, setUserTemplates] = useState([]);  // User's own templates
  const [otherTemplates, setOtherTemplates] = useState([]);  // Templates created by others
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId"); // Fetch the logged-in user's ID from localStorage
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      console.log("Logged-in userId:", userId); // Debugging log

      try {
        // Fetch all templates
        const res = await axios.get("http://localhost:5000/routes/user/templates", config);
        const allTemplates = res.data;

        // Log the fetched templates to debug
        console.log("Fetched templates:", allTemplates);

        // Use user_id instead of creatorId
        const userTemplates = allTemplates.filter(template => template.user_id == userId); // Ensure types match
        const otherTemplates = allTemplates.filter(template => template.user_id != userId);

        // Debugging logs for template categorization
        console.log("User's templates:", userTemplates);
        console.log("Other users' templates:", otherTemplates);

        setUserTemplates(userTemplates);
        setOtherTemplates(otherTemplates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Your Dashboard</h1>

      {/* Section for User's Own Templates */}
      <h2 className="mb-3">Your Templates</h2>
      {userTemplates.length ? (
        <ul className="list-group mb-4">
          {userTemplates.map((template) => (
            <li key={template.id} className="list-group-item">
              <Link to={`/template/${template.id}`} className="text-decoration-none">
                {template.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">You haven't created any templates yet.</p>
      )}

      <div className="text-center mb-5">
        <Link to="/create-template" className="btn btn-primary">
          Create New Template
        </Link>
      </div>

      {/* Section for Templates Created by Others */}
      <h2 className="mb-3">Templates by Others</h2>
      {otherTemplates.length ? (
        <ul className="list-group mb-4">
          {otherTemplates.map((template) => (
            <li key={template.id} className="list-group-item">
              <Link to={`/template/${template.id}`} className="text-decoration-none">
                {template.title} (by {template.creator || 'Anonymous'})
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">No templates from other users yet.</p>
      )}
    </div>
  );
};

export default Dashboard;
