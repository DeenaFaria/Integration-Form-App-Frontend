import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchUserTemplates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/routes/user/templates");
        setTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserTemplates();
  }, []);

  // Debounce function to limit the number of API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Fetch search results based on input
  const fetchSearchResults = (term) => {
    fetch(`http://localhost:5000/routes/user/search?query=${term}`)
      .then(response => response.json())
      .then(data => {
        setSearchResults(data.templates);
      });
  };

  // Debounced version of fetchSearchResults
  const debouncedSearch = debounce(fetchSearchResults, 500); // 500ms delay

  // Handle input change for live search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      debouncedSearch(e.target.value);
    } else {
      setSearchResults([]); // Reset results when search term is empty
    }
  };

  return (
    <>
      <header>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search templates..."
        />
      </header>

      <div>
      {searchResults && searchResults.length ? (
  searchResults.map(template => (
    <div key={template.id}>
       <Link to={`/template/${template.id}`} className="text-decoration-none">
      <p>{template.title}</p>
      
      </Link>
      <p>{template.description}</p>
    </div>
  ))
) : (
  <p>No results found</p>
)}

      </div>

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
    </>
  );
};

export default Home;
