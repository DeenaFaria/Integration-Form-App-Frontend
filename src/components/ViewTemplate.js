import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ViewTemplate = () => {
   const { id } = useParams();
   const [template, setTemplate] = useState({
       title: '',
       description: '',
       questions: [],
       tags: [] // Initialize tags as an empty array
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
               console.log(res.data); // Log the entire response
               setTemplate(res.data);
               setLoading(false);
           } catch (err) {
               setError(err.response ? err.response.data : 'Error fetching template');
               setLoading(false);
           }
       };

       fetchTemplate();
   }, [id]);

   if (loading) return <p>Loading...</p>;
   if (error) return <p>{error}</p>;

   return (
       <div>
           <h1>{template.title}</h1>
           <p>{template.description}</p>
           <h2>Questions</h2>
           <ul>
               {template.questions && template.questions.length > 0 ? (
                   template.questions.map((question, index) => (
                       <li key={index}>{question}</li>
                   ))
               ) : (
                   <p>No questions available.</p>
               )}
           </ul>
           <h2>Tags</h2>
           <p>{Array.isArray(template.tags) ? template.tags.join(', ') : 'No tags available.'}</p>
       </div>
   );
};

export default ViewTemplate;
