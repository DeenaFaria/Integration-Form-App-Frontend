import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateTemplate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ type: 'text', value: '' }]);
  const [tags, setTags] = useState([]);
  
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => setQuestions([...questions, { type: 'text', value: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage after login

    if (!token) {
      console.error('No token found, please login.');
      return;
    }
    const data = { title, description, questions, tags };
    try {
        const response = await axios.post('http://localhost:5000/routes/user/templates', data, {
          headers: {
            'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
          }
        });
        console.log('Template created successfully:', response.data);
      } catch (error) {
        console.error('Error creating template:', error);
      }
    };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {questions.map((question, index) => (
        <div key={index}>
          <select
            value={question.type}
            onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
          >
            <option value="text">Single-Line Text</option>
            <option value="textarea">Multi-Line Text</option>
            <option value="number">Positive Integer</option>
            <option value="checkbox">Checkbox</option>
          </select>
          <input
            type="text"
            placeholder="Question"
            value={question.value}
            onChange={(e) => handleQuestionChange(index, 'value', e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={addQuestion}>Add Question</button>
      <button type="submit">Create Template</button>
    </form>
  );
};

export default CreateTemplate;
