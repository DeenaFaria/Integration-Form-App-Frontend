import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
const api = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [userTemplates, setUserTemplates] = useState([]);
  const [otherTemplates, setOtherTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiToken, setApiToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const res = await axios.get(`${api}/routes/user/templates`, config);
        const allTemplates = res.data;

        const userTemplates = allTemplates.filter(
          (template) => template.user_id == userId
        );
        const otherTemplates = allTemplates.filter(
          (template) => template.user_id != userId
        );

        setUserTemplates(userTemplates);
        setOtherTemplates(otherTemplates);
      } catch (err) {
        console.error(err);
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);

          if (err.response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            alert("Your account has been blocked. Logging you out.");
            navigate("/login");
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [navigate]);

  const generateToken = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const res = await axios.post(`${api}/routes/user/generate-token`, {}, config);
      const newToken = res.data.apiToken;
      setApiToken(newToken);
      localStorage.setItem("apiToken", newToken);
      alert("API token generated successfully!");
    } catch (err) {
      console.error("Error generating API token:", err);
      alert("Failed to generate API token. Please try again.");
    }
  };

  const createJiraTicket = async () => {
    const token = localStorage.getItem("token");
    const currentPageUrl = window.location.href; // Get the current page URL
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const userId = localStorage.getItem("userId");

    try {
      const summary = prompt("Enter the ticket summary:");
      const priority = prompt("Enter the ticket priority (High, Average, Low):");

      if (!summary || !priority) {
        alert("Summary and priority are required to create a ticket.");
        return;
      }

      // Make a request to your backend to create a Jira ticket
      const res = await axios.post(
        `${api}/routes/user/create-jira-ticket`,
        {
          summary,
          priority,
          link: currentPageUrl, // Link to the page from where the user invoked the ticket creation
          userId,
        },
        config
      );

      const jiraTicketUrl = res.data.jiraTicketUrl; // Assume your backend returns the Jira ticket URL
      alert(`Jira ticket created successfully! View it here: ${jiraTicketUrl}`);
    } catch (err) {
      console.error("Error creating Jira ticket:", err);
      alert("Failed to create Jira ticket. Please try again.");
    }
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Your Dashboard</h1>

      {/* Button to generate API Token */}
      <div className="text-center mb-4">
        <button onClick={generateToken} className="btn btn-secondary">
          Generate API Token
        </button>
      </div>

      {apiToken && (
        <div className="alert alert-success text-center" role="alert">
          Your API Token: {apiToken}
        </div>
      )}

      {/* Button to create Jira ticket */}
      <div className="text-center mb-4">
        <button onClick={createJiraTicket} className="btn btn-warning">
          Create Jira Ticket
        </button>
      </div>

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
                {template.title} (by {template.creator_name || "Anonymous"})
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
