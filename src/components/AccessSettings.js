import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AccessSettings = () => {
  const { id } = useParams(); // Extract id from URL parameters
  const [users, setUsers] = useState([]);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [deniedUsers, setDeniedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get('http://localhost:5000/routes/user/users', config);
      setUsers(response.data);
    };

    const fetchAccessSettings = async () => {
      const response = await axios.get(`http://localhost:5000/routes/user/access-settings/${id}`);
      setAllowedUsers(response.data.filter(setting => setting.can_access).map(setting => setting.user_id));
      setDeniedUsers(response.data.filter(setting => !setting.can_access).map(setting => setting.user_id));
    };

    fetchUsers();
    fetchAccessSettings();
  }, [id]);

  const updateAccess = async (userId, canAccess) => {
    await axios.post('http://localhost:5000/routes/user/access-settings/', { templateId: id, userId, canAccess });
    if (canAccess) {
      setAllowedUsers([...allowedUsers, userId]);
      setDeniedUsers(deniedUsers.filter(user => user !== userId));
    } else {
      setDeniedUsers([...deniedUsers, userId]);
      setAllowedUsers(allowedUsers.filter(user => user !== userId));
    }
  };

  return (
    <div>
      <h3>Access Settings</h3>
      <h4>Allowed Users:</h4>
      <ul>
        {allowedUsers.map(userId => {
          const user = users.find(user => user.id === userId); // Fetch user object directly
          return (
            <li key={userId}>
              {user ? user.username : "Unknown User"} {/* Show username or fallback text */}
              <button onClick={() => updateAccess(userId, false)}>Remove</button>
            </li>
          );
        })}
      </ul>
      <h4>Denied Users:</h4>
      <ul>
        {deniedUsers.map(userId => {
          const user = users.find(user => user.id === userId);
          return (
            <li key={userId}>
              {user ? user.username : "Unknown User"} {/* Show username or fallback text */}
              <button onClick={() => updateAccess(userId, true)}>Allow</button>
            </li>
          );
        })}
      </ul>
      <h4>Add User:</h4>
      <select onChange={(e) => updateAccess(e.target.value, true)}>
        <option value="">Select User</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.username}</option>
        ))}
      </select>
    </div>
  );
};

export default AccessSettings;
