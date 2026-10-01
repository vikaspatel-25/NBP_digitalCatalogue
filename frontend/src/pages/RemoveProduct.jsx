import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash } from 'lucide-react';

export default function RemoveProduct({ basePath = '/api/admin' }) {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    axios.get(`${basePath}/removeProduct`).then(res => setProducts(res.data.products)).catch(console.error);
  }, [basePath]);

  const remove = (id) => axios.post(`${basePath}/removeProduct`, { productId: id }).then(() => setProducts(products.filter(p => p._id !== id)));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Remove Product</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {products.map(p => (
          <div key={p._id} className="p-4 border rounded shadow">
            {p.images && p.images[0] && <img src={p.images[0]} alt="product" className="h-32 object-cover mb-2" />}
            <p className="font-semibold">{p.productName}</p>
            <button onClick={() => remove(p._id)} className="mt-2 flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded"><Trash size={16} /> Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}