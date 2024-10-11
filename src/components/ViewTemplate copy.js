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
    creatorId: '',
    imageUrl: '',
  });
  const [likes, setLikes] = useState(0); // Store like count
  const [liked, setLiked] = useState(false); // Check if user liked the template
  const [comments, setComments] = useState([]); // Store comments
  const [newComment, setNewComment] = useState(''); // New comment input
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchTemplate = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const res = await axios.get(`http://localhost:5000/user/templates/${id}`, config);
        setTemplate({
          ...res.data,
          tags: JSON.parse(res.data.tags || '[]'),
          imageUrl: res.data.image_url,
          creatorId: res.data.user_id,
        });

        setLikes(res.data.likesCount || 0); // Fetch like count
        setLiked(res.data.likedByCurrentUser || false); // Check if user liked the template
        setComments(res.data.comments || []); // Fetch comments
      } catch (err) {
        console.error('Error fetching template', err);
      }
    };

    fetchTemplate();
  }, [id]);

  // Handle liking/unliking the template
  const handleLike = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      if (liked) {
        await axios.delete(`http://localhost:5000/templates/${id}/unlike`, config);
        setLikes(likes - 1);
      } else {
        await axios.post(`http://localhost:5000/templates/${id}/like`, {}, config);
        setLikes(likes + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking/unliking template', error);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const res = await axios.post(`http://localhost:5000/templates/${id}/comments`, { text: newComment }, config);
      setComments([...comments, res.data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1>{template.title}</h1>

      {/* Display the image */}
      {template.imageUrl && (
        <div className="image-container mb-4">
          <img src={template.imageUrl} alt="Template Visual" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}

      {/* Like button */}
      <button onClick={handleLike} className={`btn ${liked ? 'btn-danger' : 'btn-outline-primary'}`}>
        {liked ? 'Unlike' : 'Like'} ({likes})
      </button>

      {/* Comment Section */}
      <div className="mt-4">
        <h3>Comments</h3>
        <ul className="list-group mb-4">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <li key={index} className="list-group-item">
                <strong>{comment.authorName}:</strong> {comment.text}
              </li>
            ))
          ) : (
            <li className="list-group-item">No comments yet.</li>
          )}
        </ul>

        {/* Add new comment */}
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handleAddComment} className="btn btn-primary">
            Submit
          </button>
        </div>
      </div>

      {/* Display the questions */}
      <h2 className="mt-4">Questions</h2>
      {template.questions.length > 0 ? (
        <ul className="list-group mb-4">
          {template.questions.map((question, index) => (
            <li key={index} className="list-group-item">
              <strong>{index + 1}. {question.text}</strong>
              {question.type === 'multiple-choice' && (
                <ul>
                  {question.options.map((option, i) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No questions yet.</p>
      )}

      {/* Existing template display code */}
      <Link to={`/fill-form/${id}`} className="btn btn-primary mb-4">
        Fill the form
      </Link>
      {String(userId) === String(template.creatorId) && (
        <>
          <Link to={`/edit/${id}`} className="btn btn-primary mb-4">Edit the form</Link>
          <Link to={`/responses/${id}`} className="btn btn-primary mb-4">View Responses</Link>
          <Link to={`/settings/${id}`} className="btn btn-primary mb-4">Settings</Link>
        </>
      )}

      {/* Display Form Title and Description */}
      <div className="form-group mb-3">
        <label htmlFor="formTitle" className="form-label">Form Title</label>
        <input type="text" className="form-control" id="formTitle" value={template.title} readOnly />
      </div>
      <div className="form-group mb-3">
        <label htmlFor="formDescription" className="form-label">Description</label>
        <textarea className="form-control" id="formDescription" value={template.description} readOnly></textarea>
      </div>
    </div>
  );
};

export default ViewTemplate;

