import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    axios.get('/api/admin/userManagement').then(res => setUsers(res.data.users)).catch(console.error);
  }, []);

  const remove = (id) => axios.post('/api/admin/userManagement', { userId: id }).then(() => setUsers(users.filter(u => u._id !== id)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="grid gap-4">
        {users.map(u => (
          <div key={u._id} className="p-4 border rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{u.companyName}</p>
              <p>{u.email}</p>
            </div>
            <button onClick={() => remove(u._id)} className="p-2 bg-red-500 text-white rounded"><Trash /></button>
          </div>
        ))}
      </div>
    </div>
  );
}