import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userTemplates, setUserTemplates] = useState([]);  // User's own templates
  const [otherTemplates, setOtherTemplates] = useState([]);  // Templates created by others
  const [loading, setLoading] = useState(true);  // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId"); // Fetch the logged-in user's ID from localStorage
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
  
      try {
        const res = await axios.get("http://localhost:5000/routes/user/templates", config);
        const allTemplates = res.data;
  
        const userTemplates = allTemplates.filter(template => template.user_id == userId);
        const otherTemplates = allTemplates.filter(template => template.user_id != userId);
  
        setUserTemplates(userTemplates);
        setOtherTemplates(otherTemplates);
      } catch (err) {
        console.error(err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
  
          if (err.response.status === 403) {
            // If the user is blocked, log them out
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            alert("Your account has been blocked. Logging you out.");
            navigate("/login"); // Redirect to login page
            return; // Exit early after navigating
          }
        }
      } finally {
        setLoading(false); // Set loading to false whether success or error
      }
    };

    fetchTemplates();
  }, [navigate]);
  
  // Show a loading message while fetching
  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

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
