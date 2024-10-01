import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [templates, setTemplates] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get('/api/templates');
        setTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTemplates();

    // Check if the user is authenticated (you can use token stored in localStorage)
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div>
      <h1>Welcome to the Customizable Forms App</h1>
      {isAuthenticated ? (
        <>
          <Link to="/create-template">Create New Template</Link>
          <h2>Your Forms:</h2>
          {/* List of the user's forms */}
        </>
      ) : (
        <p>Please log in to create and manage your forms.</p>
      )}
      <h2>Available Templates</h2>
      {templates.length ? (
        <ul>
          {templates.map((template) => (
            <li key={template.id}>
              <Link to={`/template/${template.id}`}>{template.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No templates available</p>
      )}
    </div>
  );
};

export default Home;
