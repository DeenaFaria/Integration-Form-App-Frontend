import React, { useState } from 'react';
import axios from 'axios';

const CreateTemplate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ type: 'text', value: '', options: '' }]);
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null); // New state for image
  const [successMessage, setSuccessMessage] = useState('');

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => setQuestions([...questions, { type: 'text', value: '', options: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found, please login.');
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags.split(',').map((tag) => tag.trim()));

    // Append questions to FormData
    questions.forEach((question, index) => {
      formData.append(`questions[${index}][type]`, question.type);
      formData.append(`questions[${index}][value]`, question.value);
      formData.append(`questions[${index}][options]`, question.options);
    });

    // Append the image file
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:5000/user/templates', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Important for file upload
        },
      });
      console.log('Template created successfully:', response.data);
      setSuccessMessage('Template created successfully!');
    } catch (error) {
      console.error('Error creating template:', error);
      setSuccessMessage('Failed to create template. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create a Template</h2>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="image" className="form-label">Upload Image</label>
          <input
            type="file"
            className="form-control"
            id="image"
            onChange={(e) => setImage(e.target.files[0])} // Set the image file
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Questions</label>
          {questions.map((question, index) => (
            <div key={index} className="mb-2">
              <select
                className="form-select"
                value={question.type}
                onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
              >
                <option value="text">Single-Line Text</option>
                <option value="textarea">Multi-Line Text</option>
                <option value="number">Positive Integer</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio Button</option>
              </select>
              <input
                type="text"
                className="form-control mt-1"
                placeholder="Question"
                value={question.value}
                onChange={(e) => handleQuestionChange(index, 'value', e.target.value)}
              />
              {['checkbox', 'radio'].includes(question.type) && (
                <textarea
                  className="form-control mt-1"
                  placeholder="Options (comma-separated)"
                  value={question.options}
                  onChange={(e) => handleQuestionChange(index, 'options', e.target.value)}
                />
              )}
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>Add Question</button>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            id="tags"
            placeholder="Tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Template</button>
      </form>
    </div>
  );
};

export default CreateTemplate;
