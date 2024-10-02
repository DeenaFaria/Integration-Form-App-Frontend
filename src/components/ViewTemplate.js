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

    useEffect(() => {
        const fetchTemplate = async () => {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
        
            try {
                const res = await axios.get(`http://localhost:5000/routes/user/templates/${id}`, config);
                console.log("Fetched Template Data:", res.data); // Check this log
                
                // Parse tags if they're stored as JSON
                const parsedTags = JSON.parse(res.data.tags); // Convert string to array
                
                // Set state with fetched data
                setTemplate({
                    ...res.data,
                    tags: parsedTags, // Use the parsed tags
                });
                setLoading(false);
            } catch (err) {
                setError(err.response ? err.response.data : 'Error fetching template');
                setLoading(false);
            }
        };
        

        fetchTemplate();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">{template.title}</h1>
            <p className="lead">{template.description}</p>

            <h2 className="mt-4">Questions</h2>
            <ul className="list-group mb-4">
                {template.questions && template.questions.length > 0 ? (
                    template.questions.map((question, index) => (
                        <li key={index} className="list-group-item">
                            <strong>Question {index + 1}:</strong> {question.value} <br />
                            <strong>Type:</strong> {question.type}
                        </li>
                    ))
                ) : (
                    <li className="list-group-item">No questions available.</li>
                )}
            </ul>

            <h2 className="mt-4">Tags</h2>
            <p>
                {Array.isArray(template.tags) && template.tags.length > 0 ? template.tags.join(', ') : 'No tags available.'}
            </p>
        </div>
    );
};

export default ViewTemplate;
