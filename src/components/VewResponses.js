import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewResponses = () => {
  const { id } = useParams(); // Get formId from URL parameters
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
  
      console.log('Fetching responses with token:', token); // Log the token being used
  
      try {
        const res = await axios.get(`http://localhost:5000/user/formResponses/${id}`, config);
        console.log('Fetched responses:', res.data); // Log fetched responses
        setResponses(res.data);
      } catch (err) {
        console.error('Error fetching responses:', err); // Log the error for more insight
        setError(err.response ? err.response.data : 'Error fetching responses');
      } finally {
        setLoading(false);
      }
    };
  
    fetchResponses(); // Call the function to fetch responses
  }, [id]);
  

  if (loading) return <p>Loading...</p>; // Loading state
  if (error) return <p className="text-danger">{error}</p>; // Error state
  return (
    <div className="container mt-5">
      <h2>Responses for Form ID: {id}</h2>
      <ul className="list-group">
        {responses.length > 0 ? (
          responses.map((response, index) => (
            <li key={index} className="list-group-item">
              <h5>Response {index + 1}</h5>
              <p><strong>Submitted At:</strong> {new Date(response.submitted_at).toLocaleString()}</p>
              <p><strong>Response Data:</strong></p>
              <pre>{JSON.stringify(response.response_data, null, 2)}</pre>
            </li>
          ))
        ) : (
          <li className="list-group-item">No responses found.</li>
        )}
      </ul>
    </div>
  );
  
};

export default ViewResponses;
