import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
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
    <div className="container mt-5">
      <h1 className="text-center">Welcome to the Customizable Forms App</h1>

      <h2 className="mt-4">Available Templates</h2>
      {templates.length ? (
        <ul className="list-group">
          {templates.map((template) => (
            <li key={template.id} className="list-group-item">
              <Link to={`/template/${template.id}`} className="text-decoration-none">
                {template.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3">No templates available</p>
      )}

      <p className="mt-4">
        To create new templates, please <Link to="/login" className="link-primary">Log in</Link>
      </p>
    </div>
  );
};

export default Home;
