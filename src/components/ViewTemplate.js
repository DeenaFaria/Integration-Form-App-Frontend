import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const ViewTemplate = () => {
  const { id } = useParams();
   const { t } = useTranslation(); // Initialize useTranslation hook
  const [template, setTemplate] = useState({
    title: '',
    description: '',
    questions: [],
    tags: [],
    creatorId: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('username');
  const userRole = localStorage.getItem('isAdmin'); // This assumes the role is stored when the user logs in
  console.log("user role:", userRole);


  useEffect(() => {
    const fetchTemplate = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const res = await axios.get(`/user/templates/${id}`, config);
        console.log('Template data fetched:', res.data);
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
          tags: parsedTags,
          questions: parsedQuestions,
          imageUrl: res.data.image_url,
          creatorId: res.data.user_id,
        });

        setLoading(false);
        setLikes(res.data.likes_count || 0);
        setLiked(res.data.likedByCurrentUser || false);
        
      } catch (err) {
        if (err.response && err.response.status === 403) {
          // Handle permission error specifically
          setError('You do not have permission to view this template.');
        } else {
          setError(err.response ? err.response.data : 'Error fetching template');
        }
        setLoading(false);
      }
    };

    fetchComments();
    fetchTemplate();
  }, [id]);

  const fetchComments = async (templateId) => {
    try {
      const response = await axios.get(`/user/templates/${id}/comments`);
      console.log("Comments for Template:", response.data);
      setComments(response.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
    
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    try {
      if (liked) {
        const res = await axios.delete(`/user/templates/${id}/unlike`, config);
        setLikes(res.data.likes_count); // Update likes count from server response
        console.log("Likes count: ", res.data.likes_count);
      } else {
        const res = await axios.post(`/user/templates/${id}/like`, {}, config);
        setLikes(res.data.likes_count); // Update likes count from server response
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking/unliking template', error);
    }
  };
  
  

  const handleAddComment = async () => {
    if (!newComment.trim()) return; // Prevent empty comments
    setIsCommentLoading(true); // Set loading state
  
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    try {
      const res = await axios.post(`/user/templates/${id}/comments`, { text: newComment }, config); // No need to send userId
      setComments((prevComments) => [...prevComments, res.data]); // Update with the new comment data
      setNewComment(''); // Clear the comment input
    } catch (error) {
      console.error('Error adding comment', error);
    } finally {
      setIsCommentLoading(false); // Reset loading state
    }
  };
  
  const handleInputChange = (questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [questionId]: value,
    }));
  };

  const handleTitleChange = (e) => {
    setTemplate({ ...template, title: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setTemplate({ ...template, description: e.target.value });
  };

  const handleQuestionChange = (questionId, value) => {
    setTemplate((prevTemplate) => {
      const updatedQuestions = prevTemplate.questions.map((question) => {
        if (question.id === questionId) {
          return { ...question, value };
        }
        return question;
      });
      return { ...prevTemplate, questions: updatedQuestions };
    });
  };

  const handleDeleteTemplate = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
  
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`/user/templates/${id}`, config);
        alert('Template deleted successfully.');
        // Redirect the user after deletion (you can change this route)
        window.location.href = '/templates';
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template');
      }
    }
  };
  

 

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">

      <h1>{template.title}</h1>



      {template.imageUrl && (
        <div className="image-container mb-4">
          <img src={template.imageUrl} alt="Template Visual" style={{ width: '300px', height: 'auto' }} />
        </div>
      )}

<div className="action-buttons mb-4">
  <Link to={`/fill-form/${id}`} className="btn btn-primary me-2">
    <i className="fas fa-edit"></i> Fill the Form
  </Link>

  {(String(userId) === String(template.creatorId) || userRole === '1') && (
    <div className="btn-group" role="group" aria-label="Template Actions">
      <Link to={`/edit/${id}`} className="btn btn-warning me-2">
        <i className="fas fa-pencil-alt"></i> Edit Template
      </Link>
      <Link to={`/responses/${id}`} className="btn btn-info me-2">
        <i className="fas fa-list-alt"></i> View Responses
      </Link>
      <Link to={`/access-settings/${id}`} className="btn btn-success me-2">
        <i className="fas fa-cog"></i> Access Settings
      </Link>
      <button onClick={handleDeleteTemplate} className="btn btn-danger">
        <i className="fas fa-trash"></i> Delete Template
      </button>
    </div>
  )}
</div>


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
                  value={question.value}
                  onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                  placeholder="Edit question"
                />
                <br />
                <strong>Type:</strong> {question.type}
                <br />
                {renderInputField(question, formData, handleInputChange)}
              </li>
            ))
          ) : (
            <li className="list-group-item">No questions available</li>
          )}
        </ul>
      </form>
 <div className="input-group mb-3">
 <button onClick={handleLike} className={`btn ${liked ? 'btn-danger' : 'btn-outline-primary'}`}>
        {liked ? '❤️ Liked' : '♡ Like'} ({likes})
      </button>
 </div>

            {/* Comment Input */}
            <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={handleAddComment} className="btn btn-primary" disabled={isCommentLoading}>
          {isCommentLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      <h3>Comments</h3>
      {comments.length > 0 ? (
        comments.map(comment => (
          <div key={comment.id}>
            <p><strong>{comment.username}:</strong> {comment.content}</p>
            <p><small>Posted on {new Date(comment.created_at).toLocaleString()}</small></p>
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

const renderInputField = (question, formData, handleInputChange) => {
  switch (question.type) {
    case 'text':
      return (
        <input
          type="text"
          value={formData[question.id] || ''}
          onChange={(e) => handleInputChange(question.id, e.target.value)}
          className="form-control"
        />
      );
    case 'textarea':
      return (
        <textarea
          value={formData[question.id] || ''}
          onChange={(e) => handleInputChange(question.id, e.target.value)}
          className="form-control"
        />
      );
    case 'radio':
      return Array.isArray(question.options) ? question.options.map((option) => (
        <div key={option.value} className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name={question.id}
            value={option.value}
            checked={formData[question.id] === option.value}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
          <label className="form-check-label">{option.label}</label>
        </div>
      )) : <p>No options available</p>;
    case 'checkbox':
      return Array.isArray(question.options) ? question.options.map((option) => (
        <div key={option.value} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            value={option.value}
            checked={formData[question.id]?.includes(option.value) || false}
            onChange={(e) => {
              const value = e.target.value;
              const checked = e.target.checked;
              handleInputChange(question.id, checked 
                ? [...(formData[question.id] || []), value] 
                : (formData[question.id] || []).filter(v => v !== value));
            }}
          />
          <label className="form-check-label">{option.label}</label>
        </div>
      )) : <p>No options available</p>;
    default:
      return null;
  }
};

export default ViewTemplate;
