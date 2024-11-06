import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const api = process.env.REACT_APP_API_URL;

const ViewResponses = () => {
  const { id } = useParams(); // Get formId from URL parameters
  const [responses, setResponses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [odooResponse, setOdooResponse] = useState(null);

  useEffect(() => {
    const fetchResponses = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        // Fetch form responses
        const res = await axios.get(`${api}/routes/user/formResponses/${id}`, config);
        setResponses(res.data);

        // Fetch analytics data
        const analyticsRes = await axios.get(`${api}/routes/user/analytics/templates/${id}`, config);
        setAnalyticsData(analyticsRes.data);
      } catch (err) {
        setError(err.response ? err.response.data : 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id]);

  // Handler to send data to Odoo
  const sendToOdoo = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const response = await axios.post(`${api}/routes/user/templates/${id}/odoo`, {}, config);
      setOdooResponse(response.data.message);
    } catch (err) {
      setOdooResponse(err.response ? err.response.data : 'Failed to send data to Odoo');
    }
  };

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
                    {typeof value === 'object' ? (
                      <pre>{JSON.stringify(value, null, 2)}</pre>
                    ) : (
                      value
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

      {/* Button to send data to Odoo */}
      <button className="btn btn-primary mt-3" onClick={sendToOdoo}>
        Send Data to Odoo
      </button>

      {/* Display the response from the Odoo request */}
      {odooResponse && <p className="mt-3">{odooResponse}</p>}
    </div>
  );
};

export default ViewResponses;
