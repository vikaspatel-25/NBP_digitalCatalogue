import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash } from 'lucide-react';

export default function RemoveArticle({ basePath = '/api/admin' }) {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    axios.get(`${basePath}/removeArticle`).then(res => setArticles(res.data.articles)).catch(console.error);
  }, [basePath]);

  const remove = (id) => axios.post(`${basePath}/removeArticle`, { articleId: id }).then(() => setArticles(articles.filter(a => a._id !== id)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Remove Article</h1>
      <div className="grid gap-4">
        {articles.map(a => (
          <div key={a._id} className="p-4 border rounded shadow flex justify-between items-center">
            <p className="font-semibold">{a.title}</p>
            <button onClick={() => remove(a._id)} className="p-2 bg-red-500 text-white rounded"><Trash size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}