import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewResponses = () => {
  const { id } = useParams(); // Get formId from URL parameters
  const [responses, setResponses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        // Fetch form responses
        const res = await axios.get(`https://form-app-backend-vz4z.onrender.com/routes/user/formResponses/${id}`, config);
        setResponses(res.data);

        // Fetch analytics data
        const analyticsRes = await axios.get(`https://form-app-backend-vz4z.onrender.com/routes/user/analytics/templates/${id}`, config);
        setAnalyticsData(analyticsRes.data);
      } catch (err) {
        setError(err.response ? err.response.data : 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{typeof error === 'string' ? error : 'An unexpected error occurred.'}</p>;

  return (
    <div className="container mt-5">
      <h2>Responses for Form ID: {id}</h2>
      <ul className="list-group mb-4">
        {responses.length > 0 ? (
          responses.map((response, index) => (
            <li key={index} className="list-group-item">
              <h5>Response {index + 1}</h5>
              <p><strong>Submitted At:</strong> {new Date(response.submitted_at).toLocaleString()}</p>
              <p><strong>Response Data:</strong></p>
              <ul>
                {Object.entries(response.response_data).map(([key, value]) => (
                  <li key={key}> 
                    {/* Check if the response value is an object (for complex data) or display as string */}
                    {typeof value === 'object' ? (
                      <pre>{JSON.stringify(value, null, 2)}</pre> // Display complex objects as JSON
                    ) : (
                      value // Display string data directly
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <li className="list-group-item">No responses found.</li>
        )}
      </ul>

      <h3>Analytics Data</h3>
      {analyticsData.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Question Text</th>
              <th>Average Numeric Value</th>
              <th>Most Common String Value</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.map((data, index) => (
              <tr key={index}>
                <td>{data.question_text}</td>
                <td>{data.avg_numeric_value !== null ? data.avg_numeric_value : 'N/A'}</td>
                <td>{data.most_common_string_value || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No analytics data available.</p>
      )}
    </div>
  );
};

export default ViewResponses;
