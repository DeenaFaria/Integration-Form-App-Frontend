// src/components/Header.js
import React, { useContext } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';

const Header = ({ searchTerm, handleSearch }) => {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <header className="bg-primary text-white py-3 text-center">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        className="form-control mx-auto"
        placeholder="Search templates..."
        style={{ maxWidth: '400px', borderRadius: '30px' }}
      />
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </header>
  );
};

export default Header;
