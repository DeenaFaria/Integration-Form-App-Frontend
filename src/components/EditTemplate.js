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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Handle adding a new question
  const handleAddQuestion = () => {
    const newQuestion = { id: Date.now(), type: 'text', value: '', options: [] };
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
          return { ...question, [key]: value };
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

  // Handle drag-and-drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedQuestions = Array.from(template.questions);
    const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
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
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
        console.log('Template ID:', id);
      await axios.put(`http://localhost:5000/user/templates/${id}`, template, config);
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
          value={template.tags.join(', ')}
          onChange={handleTagsChange}
          placeholder="Enter tags"
        />
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

                      <button className="btn btn-danger" onClick={() => handleDeleteQuestion(question.id)}>Delete Question</button>
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
