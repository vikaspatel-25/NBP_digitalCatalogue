import React, { useState } from 'react';
import axios from 'axios';

export default function AddArticle({ basePath = '/api/admin' }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [bodyText, setBodyText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    axios.post(`${basePath}/addArticle`, { title, date, bodyText }).then(() => alert('Added')).catch(console.error);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Add Article</h1>
      <form onSubmit={submit} className="flex flex-col gap-4 max-w-lg">
        <input className="border p-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="border p-2" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <textarea className="border p-2" placeholder="Body" value={bodyText} onChange={e => setBodyText(e.target.value)} required />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
    </div>
  );
}