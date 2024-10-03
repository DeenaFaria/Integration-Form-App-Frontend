import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewTemplate = () => {
    const { id } = useParams();
    const [template, setTemplate] = useState({
        title: '',
        description: '',
        questions: [],
        tags: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({}); // Store user input values

    useEffect(() => {
        const fetchTemplate = async () => {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
        
            try {
                const res = await axios.get(`http://localhost:5000/user/templates/${id}`, config);
                
                const parsedTags = JSON.parse(res.data.tags || "[]");

                // Parse options for questions
                const parsedQuestions = res.data.questions.map(question => {
                    // Ensure the question has the required properties
                    if (question.type === 'radio' && typeof question.options === 'string') {
                        const optionsArray = question.options.split(',').map(option => ({
                            label: option.trim(),
                            value: option.trim()
                        }));
                        return { ...question, options: optionsArray };
                    } else if (question.type === 'checkbox' && typeof question.options === 'string') {
                        const optionsArray = question.options.split(',').map(option => ({
                            label: option.trim(),
                            value: option.trim()
                        }));
                        return { ...question, options: optionsArray };
                    }
                    return question;
                });

                setTemplate({
                    ...res.data,
                    tags: parsedTags,
                    questions: parsedQuestions, // Update questions here
                });
                setLoading(false);
            } catch (err) {
                setError(err.response ? err.response.data : 'Error fetching template');
                setLoading(false);
            }
        };
        
        fetchTemplate();
    }, [id]);
    
    // Handle input changes
    const handleInputChange = (questionId, value) => {
        setFormData(prevData => ({
            ...prevData,
            [questionId]: value
        }));
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">{template.title}</h1>
            <p className="lead">{template.description}</p>

            <h2 className="mt-4">Questions</h2>
            <form>
                <ul className="list-group mb-4">
                {template.questions && template.questions.length > 0 ? (
                    template.questions.map((question, index) => (
                        <li key={index} className="list-group-item">
                            <strong>Question {index + 1}:</strong> {question.value}
                            <br />
                            <strong>Type:</strong> {question.type}
                            <br />
                            {renderInputField(question, formData, handleInputChange)}
                        </li>
                    ))
                ) : (
                    <li className="list-group-item">No questions available.</li>
                )}
                </ul>
            </form>

            <h2 className="mt-4">Tags</h2>
            <p>
                {Array.isArray(template.tags) && template.tags.length > 0 ? template.tags.join(', ') : 'No tags available.'}
            </p>
        </div>
    );
};

// Function to render different types of input fields based on question type
const renderInputField = (question, formData, handleInputChange) => {
    const { id, type, options } = question; // Ensure you have id and options if needed

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
            return (
                <input
                    type="checkbox"
                    className="form-check-input mt-2"
                    checked={formData[id] || false}
                    onChange={(e) => handleInputChange(id, e.target.checked)}
                />
            );
        case 'radio':
            if (Array.isArray(options) && options.length > 0) {
                return (
                    <div className="mt-2">
                        {options.map((option, index) => (
                            <div key={index} className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name={id} // Group radios by question id
                                    value={option.value} // Use the value from the option
                                    checked={formData[id] === option.value}
                                    onChange={(e) => handleInputChange(id, e.target.value)}
                                />
                                <label className="form-check-label">{option.label}</label>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return <p>No options available for this question.</p>;
            }
        default:
            return <p>Unsupported question type: {type}</p>;
    }
};

export default ViewTemplate;
