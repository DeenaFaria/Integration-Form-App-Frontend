import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); // Add state for current user's ID

  useEffect(() => {
    // Fetch the current user's ID (assuming it's stored in localStorage)
    const currentUserId = localStorage.getItem('userId'); // Adjust according to your app
    setCurrentUserId(currentUserId);

    // Fetch the list of users when the component mounts
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Assume token is stored in localStorage
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get('https://form-app-backend-vz4z.onrender.com/admin/users', config);
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleBlock = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post(`https://form-app-backend-vz4z.onrender.com/admin/block/${userId}`, {}, config);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_blocked: true } : user
        )
      );
    } catch (err) {
      setError('Error blocking user');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post(`https://form-app-backend-vz4z.onrender.com/admin/unblock/${userId}`, {}, config);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_blocked: false } : user
        )
      );
    } catch (err) {
      setError('Error unblocking user');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`https://form-app-backend-vz4z.onrender.com/admin/delete/${userId}`, config);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (err) {
      setError('Error deleting user');
    }
  };

  const handlePromote = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post(`https://form-app-backend-vz4z.onrender.com/admin/promote/${userId}`, {}, config);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_admin: true } : user
        )
      );
    } catch (err) {
      setError('Error promoting user to admin');
    }
  };

  const handleDemote = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post(`https://form-app-backend-vz4z.onrender.com/admin/demote/${userId}`, {}, config);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_admin: false } : user
        )
      );
    } catch (err) {
      setError('Error demoting user');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h2>Admin Panel</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.is_blocked ? 'Blocked' : 'Active'}</td>
              <td>{user.is_admin ? 'Admin' : 'User'}</td>
              <td>
                {user.is_blocked ? (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUnblock(user.id)}
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleBlock(user.id)}
                  >
                    Block
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm ml-2"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
                {user.is_admin ? (
                  <button
                    className="btn btn-secondary btn-sm ml-2"
                    onClick={() => handleDemote(user.id)}
                    disabled={user.id === currentUserId} // Ensure you can't demote yourself
                  >
                    Demote from Admin
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm ml-2"
                    onClick={() => handlePromote(user.id)}
                  >
                    Promote to Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
