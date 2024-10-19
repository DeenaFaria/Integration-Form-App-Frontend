import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DarkModeContext } from '../context/DarkModeContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [templates, setTemplates] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get("https://form-app-backend-vz4z.onrender.com/routes/user/latest");
        setTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchPopularTemplates = async () => {
      try {
        const res = await axios.get("https://form-app-backend-vz4z.onrender.com/routes/user/most-liked");
        setPopularTemplates(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPopularTemplates();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get("https://form-app-backend-vz4z.onrender.com/routes/user/tags");
        setTags(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTags();
  }, []);

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

  const fetchSearchResults = (term) => {
    axios.get(`https://form-app-backend-vz4z.onrender.com/routes/user/search?query=${term}`)
      .then(res => {
        setSearchResults(res.data.templates);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const debouncedSearch = debounce(fetchSearchResults, 500);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      debouncedSearch(e.target.value);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
    
      <div className="container mt-5">
        {/* Latest Templates Section */}
        <h2 className="text-center mb-4">{t('latestTemplates')}</h2>
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
                    <p className="text-muted">{t('by')} {template.author}</p>
                    <Link to={`/template/${template.id}`} className="btn btn-primary">{t('viewTemplate')}</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>{t('noTemplatesAvailable')}</p>
          )}
        </div>

        {/* Popular Templates Table */}
        <h2 className="mt-5 mb-4 text-center">{t('popularTemplates')}</h2>
        <table className="table table-striped table-hover">
          <thead className="thead-dark">
            <tr>
              <th>{t('title')}</th>
              <th>{t('numberOfFilledForms')}</th>
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
              <tr><td colSpan="2">{t('noPopularTemplatesAvailable')}</td></tr>
            )}
          </tbody>
        </table>

              {/* Tag Cloud */}
      <h2 className="mt-5 mb-4 text-center">{t('tagCloud')}</h2>
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
          <p>{t('noTagsAvailable')}</p>
        )}
      </div>
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
          <p className="text-center w-100">{t('noResultsFound')}</p>
        )}
      </div>

        {/* Login Link */}
        <p className="mt-5 text-center">
          {t('loginMessage')} <Link to="/login" className="text-primary">{t('logIn')}</Link>
        </p>
      </div>
    </>
  );
};

export default Home;
