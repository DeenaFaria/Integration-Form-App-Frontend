import React from 'react';
import { useLocation } from 'react-router-dom';

const SuccessPage = () => {
  const location = useLocation();
  const { responses } = location.state || {}; // Safely access responses

  return (
    <div>
      <h1>Success!</h1>
      <p>Your form has been submitted successfully.</p>
      <h3>Your Submitted Responses:</h3>
      {responses ? (
        <pre>{JSON.stringify(responses, null, 2)}</pre> // Display responses in a readable format
      ) : (
        <p>No responses to display.</p> // Handle case where responses are undefined
      )}
    </div>
  );
};

export default SuccessPage;
