import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const FillForm = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplate = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const res = await axios.get(`http://localhost:5000/user/templates/${id}`, config);
        const parsedTags = JSON.parse(res.data.tags || '[]');

        // Parse options for questions
        const parsedQuestions = res.data.questions.map((question) => {
          if ((question.type === 'radio' || question.type === 'checkbox') && typeof question.options === 'string') {
            const optionsArray = question.options.split(',').map((option) => ({
              label: option.trim(),
              value: option.trim(),
            }));
            return { ...question, options: optionsArray };
          }
          return question;
        });

        setTemplate({
          ...res.data,
          tags: parsedTags,
          questions: parsedQuestions,
        });
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data : 'Error fetching template');
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleInputChange = (questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      await axios.post(`http://localhost:5000/user/submitForm/${id}`, { responses: formData }, config);
      navigate('/success'); // Navigate to a success page or back to the template
    } catch (err) {
      setError(err.response ? err.response.data : 'Error submitting form');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit}>
        <h2>{template.title}</h2>
        <p>{template.description}</p>

        <h3 className="mt-4">Questions</h3>
        <ul className="list-group mb-4">
          {template.questions.map((question, index) => (
            <li key={index} className="list-group-item">
              <strong>Question {index + 1}:</strong> {question.value}
              <br />
              <strong>Type:</strong> {question.type}
              <br />
              {renderInputField(question, formData, handleInputChange)}
            </li>
          ))}
        </ul>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

// Function to render different types of input fields based on question type
const renderInputField = (question, formData, handleInputChange) => {
  const { id, type, options } = question;

  switch (type) {
    case 'text':
      return (
        <input
          type="text"
          className="form-control mt-2"
          value={formData[id] || ''}
          onChange={(e) => handleInputChange(id, e.target.value)}
          placeholder={question.value}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          className="form-control mt-2"
          value={formData[id] || ''}
          onChange={(e) => handleInputChange(id, e.target.value)}
          placeholder={question.value}
        />
      );
    case 'textarea':
      return (
        <textarea
          className="form-control mt-2"
          value={formData[id] || ''}
          onChange={(e) => handleInputChange(id, e.target.value)}
          placeholder={question.value}
        ></textarea>
      );
    case 'checkbox':
      return options.map((option, index) => (
        <div key={index} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id={`checkbox-${id}-${index}`}
            checked={formData[id] && formData[id].includes(option.value)}
            onChange={(e) => {
              const newValue = e.target.checked
                ? [...(formData[id] || []), option.value]
                : (formData[id] || []).filter((val) => val !== option.value);
              handleInputChange(id, newValue);
            }}
          />
          <label className="form-check-label" htmlFor={`checkbox-${id}-${index}`}>
            {option.label}
          </label>
        </div>
      ));
    case 'radio':
      return options.map((option, index) => (
        <div key={index} className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name={id}
            value={option.value}
            checked={formData[id] === option.value}
            onChange={(e) => handleInputChange(id, e.target.value)}
          />
          <label className="form-check-label">{option.label}</label>
        </div>
      ));
    default:
      return <p>Unsupported question type: {type}</p>;
  }
};

export default FillForm;
