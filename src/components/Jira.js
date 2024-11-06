import React, { useState } from 'react';
import axios from 'axios';

const CreateTicket = () => {
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState('Low');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/create-ticket', {
        summary,
        priority,
        link: window.location.href,
        userEmail: 'user@example.com', // Replace with the actual user's email
      });
      alert(`Ticket created: ${response.data.ticketUrl}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    }
  };

  return (
    <div>
      <h2>Create Support Ticket</h2>
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default CreateTicket;
