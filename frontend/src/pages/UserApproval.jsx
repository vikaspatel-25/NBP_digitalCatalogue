import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X } from 'lucide-react';

export default function UserApproval() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    axios.get('/api/admin/userApproval').then(res => setUsers(res.data.users)).catch(console.error);
  }, []);

  const approve = (id) => axios.post('/api/admin/userApproval/approve', { userId: id }).then(() => setUsers(users.filter(u => u._id !== id)));
  const reject = (id) => axios.post('/api/admin/userApproval/reject', { userId: id }).then(() => setUsers(users.filter(u => u._id !== id)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Approval</h1>
      <div className="grid gap-4">
        {users.map(u => (
          <div key={u._id} className="p-4 border rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{u.companyName}</p>
              <p>{u.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(u._id)} className="p-2 bg-green-500 text-white rounded"><Check /></button>
              <button onClick={() => reject(u._id)} className="p-2 bg-red-500 text-white rounded"><X /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}