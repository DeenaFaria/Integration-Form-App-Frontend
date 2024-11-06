import React, { useState } from 'react'; // Import useState from React
import { useTranslation } from 'react-i18next';
import { DarkModeContext } from '../context/DarkModeContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
const api = process.env.REACT_APP_API_URL;

const Layout = ({ children }) => {
  const { isDarkMode, toggleDarkMode } = React.useContext(DarkModeContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

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

  // Fetch search results from the API
  const fetchSearchResults = (term) => {
    console.log(`Fetching results for: ${term}`);
    axios.get(`${api}/routes/user/search?query=${term}`)
      .then(res => {
        console.log(res.data); // Log the full response to check the structure
        setSearchResults(res.data.templates || []); // Fallback to empty array if templates are not found
      })
      .catch(err => {
        console.error('Error fetching search results:', err);
      });
  };

  // Create a debounced version of the fetch function
  const debouncedSearch = debounce(fetchSearchResults, 500);

  // Handle search input changes
  const handleSearch = (e) => {
    const term = e.target.value; // Extracting term from the event
    setSearchTerm(term);
    if (term.trim()) {
      debouncedSearch(term);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <>
   <header className="bg-primary text-white py-3 d-flex justify-content-between align-items-center">
  <div className="d-flex align-items-center justify-content-center flex-grow-1">
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearch}
      className="form-control mx-2"
      placeholder={t('searchPlaceholder')}
      style={{ maxWidth: '400px', borderRadius: '30px' }}
    />
  </div>

  <button
    onClick={toggleDarkMode}
    className="btn btn-light"
    style={{ marginLeft: '10px', borderRadius: '20px', padding: '5px 15px' }}
  >
    {isDarkMode ? t('switchToLightMode') : t('switchToDarkMode')}
  </button>
  {/* Language Switcher */}
  <div>
    <button onClick={() => changeLanguage('en')} className="btn btn-light mx-2">
      English
    </button>
    <button onClick={() => changeLanguage('es')} className="btn btn-light mx-2">
      Español
    </button>
    <button onClick={() => changeLanguage('bn')} className="btn btn-light mx-2">
      বাংলা
    </button>
  </div>
</header>

      <main>
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
        {children}
     
      </main>
    </>
  );
};

export default Layout;
