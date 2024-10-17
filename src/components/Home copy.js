import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DarkModeContext } from '../context/DarkModeContext';
import { useTranslation } from 'react-i18next'; // Import the hook for translations

const Home = () => {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [templates, setTemplates] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { t, i18n } = useTranslation(); // Hook for translations
    // Function to switch language
    const changeLanguage = (lang) => {
      i18n.changeLanguage(lang);
    };

  // Fetch all templates (for the gallery)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/routes/user/latest");
        setTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTemplates();
  }, []);

  // Fetch top 5 most popular templates
  useEffect(() => {
    const fetchPopularTemplates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/routes/user/most-liked");
        setPopularTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPopularTemplates();
  }, []);

  // Fetch all tags for the tag cloud
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get("http://localhost:5000/routes/user/tags");
        setTags(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTags();
  }, []);

  // Debounce function to limit the number of API calls for search
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
    axios.get(`http://localhost:5000/routes/user/search?query=${term}`)
      .then(res => {
        setSearchResults(res.data.templates);
      })
      .catch(err => {
        console.error(err);
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
<header className="bg-primary text-white py-3 d-flex justify-content-between align-items-center">
  <input
    type="text"
    value={searchTerm}
    onChange={handleSearch}
    className="form-control"
    placeholder={t('searchPlaceholder')} 
    style={{ maxWidth: '400px', borderRadius: '30px' }}
  />
  <button
    onClick={toggleDarkMode}
    className="btn btn-light"
    style={{ marginLeft: 'auto', borderRadius: '20px', padding: '5px 15px' }}
  >
    {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  </button>
            {/* Language Switcher */}
            <button
            onClick={() => changeLanguage('en')}
            className="btn btn-light mx-2"
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('es')}
            className="btn btn-light mx-2"
          >
            Español
          </button>
</header>

{/* Display Search Results */}
<div className="row">
  {searchResults.length ? (
    searchResults.map(template => (
      <div key={template.id} className="col-md-4 mb-4">
        <div className="card h-100 border-0 shadow-sm animate__animated animate__fadeIn">
          <div className="card-body">
            <Link to={`/template/${template.id}`} className="text-decoration-none">
              <h5 className="card-title text-primary">{template.title}</h5>
            </Link>
            <p className="card-text text-muted">{template.description}</p>
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center w-100">No results found</p>
  )}
</div>

{/* Tag Cloud */}
<h2 className="mt-5 mb-4 text-center">Tag Cloud</h2>
<div className="d-flex flex-wrap justify-content-center tag-cloud" style={{ maxWidth: '800px', margin: '0 auto' }}>
  {tags.length ? (
    tags.map(tag => (
      <button
        key={tag}
        className="btn btn-outline-primary m-1"
        onClick={() => fetchSearchResults(tag)}
      >
        {tag}
      </button>
    ))
  ) : (
    <p>No tags available</p>
  )}
</div>


      <div className="container mt-5">
        {/* Latest Templates Section */}
        <h2 className="text-center mb-4">Latest Templates</h2>
        <div className="row">
          {templates.length ? (
            templates.map((template) => (
              <div key={template.id} className="col-md-4 mb-4">
                <div className="card h-100 border-0 shadow-lg">
                  <img
                    src={template.image_url}
                    alt={template.title}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{template.title}</h5>
                    <p className="card-text">{template.description}</p>
                    <p className="text-muted">By {template.author}</p>
                    <Link to={`/template/${template.id}`} className="btn btn-primary">View Template</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No templates available</p>
          )}
        </div>

        {/* Popular Templates Table */}
        <h2 className="mt-5 mb-4 text-center">Top 5 Most Popular Templates</h2>
        <table className="table table-striped table-hover">
          <thead className="thead-dark">
            <tr>
              <th>Title</th>
              <th>Number of Filled Forms</th>
            </tr>
          </thead>
          <tbody>
            {popularTemplates.length ? (
              popularTemplates.map((template) => (
                <tr key={template.id}>
                  <td>
                    <Link to={`/template/${template.id}`} className="text-decoration-none">
                      {template.title}
                    </Link>
                  </td>
                  <td>{template.filledFormsCount}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="2">No popular templates available</td></tr>
            )}
          </tbody>
        </table>



        {/* Login Link */}
        <p className="mt-5 text-center">
          To create new templates, please <Link to="/login" className="text-primary">Log in</Link>
        </p>
      </div>
    </>
  );
};

export default Home;
