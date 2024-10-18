import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const EditTemplate = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState({
    title: '',
    description: '',
    questions: [],
    tags: [],
    image: '', // Add image to the template state
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUpdated, setImageUpdated] = useState(false); // Track if the image was updated
  const [selectedTopic, setSelectedTopic] = useState('');
  const predefinedTopics = ['Education', 'Quiz', 'Other'];


  useEffect(() => {
    const fetchTemplate = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const res = await axios.get(`http://localhost:5000/user/templates/${id}`, config);
        const parsedTags = JSON.parse(res.data.tags || '[]');

        const parsedQuestions = res.data.questions.map((question) => {
          if ((question.type === 'radio' || question.type === 'checkbox') && typeof question.options === 'string') {
            try {
              const optionsArray = JSON.parse(question.options);
              return { ...question, options: optionsArray };
            } catch (error) {
              const optionsArray = question.options.split(',').map((option) => ({
                label: option.trim(),
                value: option.trim(),
              }));
              return { ...question, options: optionsArray };
            }
          }
          return question;
        });


        setTemplate({
          ...res.data,
          tags: Array.isArray(parsedTags) ? parsedTags : [],
          questions: parsedQuestions,
          image: res.data.image_url || '', // Initialize image field
        });
        // Set the selected topic based on fetched data
        setSelectedTopic(res.data.topic || ''); 
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data : 'Error fetching template');
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  // Handle input changes for title, description, and tags
  const handleTitleChange = (e) => {
    setTemplate({ ...template, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setTemplate({ ...template, description: e.target.value });
  };

  const handleTagsChange = (e) => {
    setTemplate({ ...template, tags: e.target.value.split(',').map(tag => tag.trim()) });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      setTemplate((prev) => ({ ...prev, image: file }));
      setImageUpdated(true);
    }
  };
  

  // Remove the uploaded image
  const handleRemoveImage = () => {
    setTemplate({ ...template, image: '' });
    setImageUpdated(true); // Mark the image as updated
  };

  // Handle adding a new question
  const handleAddQuestion = () => {
    const newQuestion = { id: Date.now(), type: 'text', value: '', options: [], showQuestion: true }; // Initialize with empty options array
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      questions: [...prevTemplate.questions, newQuestion],
    }));
  };
  


// Handle question changes (edit question text, type, or options)
const handleQuestionChange = (questionId, key, value) => {
  setTemplate((prevTemplate) => {
    const updatedQuestions = prevTemplate.questions.map((question) => {
      if (question.id === questionId) {
        return { ...question, [key]: value }; // This will update the specific property
      }
      return question;
    });
    return { ...prevTemplate, questions: updatedQuestions };
  });
};

  // Handle deleting a question
  const handleDeleteQuestion = (questionId) => {
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      questions: prevTemplate.questions.filter((question) => question.id !== questionId),
    }));
  };

  const handleAddOption = (questionId) => {
    setTemplate((prevTemplate) => {
      const updatedQuestions = prevTemplate.questions.map((question) => {
        if (question.id === questionId) {
          return { ...question, options: [...(question.options || []), { label: '', value: '' }] };
        }
        return question;
      });
      return { ...prevTemplate, questions: updatedQuestions };
    });
  };
  
  const handleDeleteOption = (questionId, optionIndex) => {
    setTemplate((prevTemplate) => {
      const updatedQuestions = prevTemplate.questions.map((question) => {
        if (question.id === questionId) {
          const updatedOptions = question.options.filter((_, index) => index !== optionIndex);
          return { ...question, options: updatedOptions };
        }
        return question;
      });
      return { ...prevTemplate, questions: updatedQuestions };
    });
  };
  
  const handleOptionChange = (questionId, optionIndex, value) => {
    setTemplate((prevTemplate) => {
      const updatedQuestions = prevTemplate.questions.map((question) => {
        if (question.id === questionId) {
          const updatedOptions = question.options.map((option, index) => {
            if (index === optionIndex) {
              return { ...option, label: value, value: value };
            }
            return option;
          });
          return { ...question, options: updatedOptions };
        }
        return question;
      });
      return { ...prevTemplate, questions: updatedQuestions };
    });
  };
  
      
  const handleDragEnd = (result) => {
    if (!result.destination) return;
  
    const reorderedQuestions = Array.from(template.questions);
    const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
    
    // Ensure we are only moving to an existing index
    if (result.destination.index >= reorderedQuestions.length) {
      console.warn("Attempting to move to an invalid index");
      return;
    }
  
    reorderedQuestions.splice(result.destination.index, 0, movedQuestion);
  
    setTemplate((prevTemplate) => ({
      ...prevTemplate,
      questions: reorderedQuestions,
    }));
  };
  
  

  // Save changes
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' // Required for file uploads
      },
    };
    console.log('Token:', token); // Check if the token is available

  
    const formData = new FormData();
    formData.append('title', template.title);
    formData.append('description', template.description);
    formData.append('tags', JSON.stringify(template.tags));
    formData.append('topic', selectedTopic);
  
    // Add the image only if it was updated
    if (imageUpdated) {
      formData.append('image', template.image); 
    }
  
    // Append each question separately as formData cannot directly handle arrays
    template.questions.forEach((question, index) => {
      formData.append(`questions[${index}][id]`, question.id);
      formData.append(`questions[${index}][type]`, question.type);
      formData.append(`questions[${index}][value]`, question.value);
      formData.append(`questions[${index}][showQuestion]`, question.showQuestion); 
  
      // Safeguard to ensure options are processed only if they exist and are an array
      if (Array.isArray(question.options)) {
        question.options.forEach((option, optIndex) => {
          formData.append(`questions[${index}][options][${optIndex}][label]`, option.label);
          formData.append(`questions[${index}][options][${optIndex}][value]`, option.value);
        });
      }
    });
  
    try {
      await axios.put(`http://localhost:5000/user/templates/${id}`, formData, config);
      alert('Template saved successfully');
    } catch (err) {
      setError(err.response ? err.response.data : 'Error saving template');
    }
  };
  
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error.message || 'An error occurred'}</p>;

  return (
    <div className="container mt-5">
      <h1>Edit Form</h1>

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

      <div className="form-group mb-3">
        <label htmlFor="formTags" className="form-label">Tags (comma-separated)</label>
        <input
          type="text"
          className="form-control"
          id="formTags"
          value={template.tags.join(', ')} // Joining tags for input display
          onChange={handleTagsChange}
          placeholder="Enter tags"
        />
      </div>
      <div className="form-group mb-3">
        <label htmlFor="formTopic" className="form-label">Topic</label>
        <select
          className="form-control"
          id="formTopic"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">Select a topic</option>
          {predefinedTopics.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="formImage" className="form-label">Image</label>
        <input type="file" className="form-control" id="ImageFile" onChange={handleImageUpload} />
        {template.image && (
          <div className="mt-2">
            <img src={template.image} alt="Template Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
            <button className="btn btn-danger mt-2" onClick={handleRemoveImage}>Remove Image</button>
          </div>
        )}
      </div>

      <h2 className="mt-4">Questions</h2>
      <button className="btn btn-primary mb-3" onClick={handleAddQuestion}>Add Question</button>

      <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <ul className="list-group mb-4" {...provided.droppableProps} ref={provided.innerRef}>
            {template.questions.map((question, index) => (
              <Draggable key={question.id} draggableId={question.id.toString()} index={index}>
                {(provided) => (
                  <li
                    className="list-group-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                  <div className="form-check mt-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`showQuestion-${index}`}
                      checked={question.showQuestion} // Ensure this links to the question's showQuestion state
                      onChange={(e) => handleQuestionChange(question.id, 'showQuestion', e.target.checked)} // Use question.id instead of index
                    />
                    <label className="form-check-label" htmlFor={`showQuestion-${index}`}>
                      Show Question
                    </label>
                  </div>

                    <input
                      type="text"
                      className="form-control mb-2"
                      value={question.value}
                      onChange={(e) => handleQuestionChange(question.id, 'value', e.target.value)}
                      placeholder="Edit question"
                    />
                    <select
                      className="form-control mb-2"
                      value={question.type}
                      onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="number">Number</option>
                    </select>

                    {question.type === 'radio' || question.type === 'checkbox' ? (
                      <>
                        {question.options && question.options.length > 0 ? (
                          question.options.map((option, optionIndex) => (
                            <div key={optionIndex}>
                              <input
                                type="text"
                                className="form-control"
                                value={option.label}
                                onChange={(e) => handleOptionChange(question.id, optionIndex, e.target.value)}
                              />
                              <button onClick={() => handleDeleteOption(question.id, optionIndex)}>Delete Option</button>
                            </div>
                          ))
                        ) : (
                          <p>No options available. Add some!</p>
                        )}
                        <button onClick={() => handleAddOption(question.id)}>Add Option</button>
                      </>
                    ) : null}

                    <button className="btn btn-danger" onClick={() => handleDeleteQuestion(question.id)}>
                      Delete Question
                    </button>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>

      <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditTemplate;
