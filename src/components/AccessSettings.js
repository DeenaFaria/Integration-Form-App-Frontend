import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Select from 'react-select';

const AccessSettings = () => {
  const { id } = useParams(); // Extract id from URL parameters
  const [users, setUsers] = useState([]);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [deniedUsers, setDeniedUsers] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // Sorting state (name or email)

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get('https://form-app-backend-vz4z.onrender.com/routes/user/users', config);
      setUsers(response.data);
    };

    const fetchAccessSettings = async () => {
     
      const response = await axios.get(`https://form-app-backend-vz4z.onrender.com/routes/user/access-settings/${id}`);
      const allowed = response.data.filter(setting => setting.can_access).map(setting => setting.user_id);
      const denied = response.data.filter(setting => !setting.can_access).map(setting => setting.user_id);
      setAllowedUsers([...new Set(allowed)]); // Ensure no duplicates
      setDeniedUsers([...new Set(denied)]);   // Ensure no duplicates
    };

    fetchUsers();
    fetchAccessSettings();
  }, [id]);

  const updateAccess = async (userId, canAccess) => {
    const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
    await axios.post('https://form-app-backend-vz4z.onrender.com/routes/user/access-settings/', { templateId: id, userId, canAccess }, config);

    if (canAccess) {
      // Move user to allowedUsers, remove from deniedUsers
      setAllowedUsers(prevAllowed => [...new Set([...prevAllowed, userId])]);
      setDeniedUsers(prevDenied => prevDenied.filter(user => user !== userId)); // Remove from denied
    } else {
      // Move user to deniedUsers, remove from allowedUsers
      setDeniedUsers(prevDenied => [...new Set([...prevDenied, userId])]);
      setAllowedUsers(prevAllowed => prevAllowed.filter(user => user !== userId)); // Remove from allowed
    }
  };

  const handleSort = (a, b) => {
    if (sortBy === 'name') {
      return users.find(user => user.id === a)?.username.localeCompare(users.find(user => user.id === b)?.username);
    } else {
      return users.find(user => user.id === a)?.email.localeCompare(users.find(user => user.id === b)?.email);
    }
  };

  const userOptions = users.map(user => ({
    label: `${user.username} (${user.email})`,
    value: user.id,
  }));

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Access Settings</h3>

      {/* Public/Private Template Toggle */}
      <div className="form-check form-switch mb-4">
        <input
          type="checkbox"
          className="form-check-input"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
          id="publicSwitch"
        />
        <label className="form-check-label" htmlFor="publicSwitch">
          Public Template
        </label>
      </div>

      {/* Allowed Users List */}
      <h4 className="mb-3">Allowed Users:</h4>
      <ul className="list-group mb-4">
        {allowedUsers.sort(handleSort).map(userId => {
          const user = users.find(user => user.id === userId);
          return (
            <li key={userId} className="list-group-item d-flex justify-content-between align-items-center">
              {user ? `${user.username} (${user.email})` : 'Unknown User'}
              <button className="btn btn-danger btn-sm" onClick={() => updateAccess(userId, false)}>Remove</button>
            </li>
          );
        })}
      </ul>

      {/* Denied Users List */}
      <h4 className="mb-3">Denied Users:</h4>
      <ul className="list-group mb-4">
        {deniedUsers.sort(handleSort).map(userId => {
          const user = users.find(user => user.id === userId);
          return (
            <li key={userId} className="list-group-item d-flex justify-content-between align-items-center">
              {user ? `${user.username} (${user.email})` : 'Unknown User'}
              <button className="btn btn-success btn-sm" onClick={() => updateAccess(userId, true)}>Allow</button>
            </li>
          );
        })}
      </ul>

      {/* User Sorting Controls */}
      <div className="mb-4">
        <button className="btn btn-outline-primary me-2" onClick={() => setSortBy('name')}>Sort by Name</button>
        <button className="btn btn-outline-primary" onClick={() => setSortBy('email')}>Sort by Email</button>
      </div>

      {/* Add Users with Autocompletion */}
      <h4 className="mb-3">Add User:</h4>
      <Select
        options={userOptions}
        onChange={(selectedOption) => updateAccess(selectedOption.value, true)}
        placeholder="Search by name or email..."
        className="mb-4"
      />
    </div>
  );
};

export default AccessSettings;
