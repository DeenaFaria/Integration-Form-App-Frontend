import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const ViewTemplate = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState({
    title: '',
    description: '',
    questions: [],
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({}); // Store user input values

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

  // Handle input changes for questions
  const handleInputChange = (questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [questionId]: value,
    }));
  };

  // Handle title and description changes
  const handleTitleChange = (e) => {
    setTemplate({ ...template, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setTemplate({ ...template, description: e.target.value });
  };

  // Handle option changes for MCQ
  const handleOptionChange = (questionId, index, value) => {
    setTemplate((prevTemplate) => {
      const updatedQuestions = prevTemplate.questions.map((question) => {
        if (question.id === questionId) {
          const updatedOptions = [...question.options];
          updatedOptions[index].label = value; // Update the option label
          return { ...question, options: updatedOptions };
        }
        return question;
      });
      return { ...prevTemplate, questions: updatedQuestions };
    });
  };

  // Handle question text changes
  const handleQuestionChange = (questionId, value) => {
    setTemplate((prevTemplate) => {
      const updatedQuestions = prevTemplate.questions.map((question) => {
        if (question.id === questionId) {
          return { ...question, value }; // Update the question text
        }
        return question;
      });
      return { ...prevTemplate, questions: updatedQuestions };
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h1>{template.title}</h1>
      <Link to={`/edit/${id}`} className="btn btn-primary mb-4">Edit Template</Link>

      <form>
        <div className="form-group mb-3">
          <label htmlFor="formTitle" className="form-label">Form Title</label>
          <input
            type="text"
            className="form-control"
            id="formTitle"
            value={template.title}
            onChange={handleTitleChange}
            placeholder="Enter form title"
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="formDescription" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="formDescription"
            value={template.description}
            onChange={handleDescriptionChange}
            placeholder="Enter form description"
          ></textarea>
        </div>

        <h2 className="mt-4">Questions</h2>
        <ul className="list-group mb-4">
          {template.questions && template.questions.length > 0 ? (
            template.questions.map((question, index) => (
              <li key={index} className="list-group-item">
                <strong>Question {index + 1}:</strong>
                <input
                  type="text"
                  className="form-control mt-2"
                  value={question.value} // Edit the question value
                  onChange={(e) => handleQuestionChange(question.id, e.target.value)} // Handle question edit
                  placeholder="Edit question"
                />
                <br />
                <strong>Type:</strong> {question.type}
                <br />
                {renderInputField(question, formData, handleInputChange, handleOptionChange)}
              </li>
            ))
          ) : (
            <li className="list-group-item">No questions available.</li>
          )}
        </ul>

        <h2 className="mt-4">Tags</h2>
        <p>{Array.isArray(template.tags) && template.tags.length > 0 ? template.tags.join(', ') : 'No tags available.'}</p>
      </form>
    </div>
  );
};

// Function to render different types of input fields based on question type
const renderInputField = (question, formData, handleInputChange, handleOptionChange) => {
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
            <input
              type="text"
              className="form-control mt-2"
              value={option.label}
              onChange={(e) => handleOptionChange(id, index, e.target.value)}
              placeholder="Edit option"
            />
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
            <input
              type="text"
              className="form-control mt-2"
              value={option.label}
              onChange={(e) => handleOptionChange(id, index, e.target.value)}
              placeholder="Edit option"
            />
          </div>
        ));
      default:
        return <p>Unsupported question type: {type}</p>;
    }
};

export default ViewTemplate;
