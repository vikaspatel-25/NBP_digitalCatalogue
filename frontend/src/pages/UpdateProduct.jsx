import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UpdateProduct({ basePath = '/api/admin' }) {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  
  useEffect(() => {
    axios.get(`${basePath}/updateProduct`).then(res => setProducts(res.data.products)).catch(console.error);
  }, [basePath]);

  if (selectedId) {
    return <div className="p-8">Product Edit Form Placeholder for ID: {selectedId}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Update Product</h1>
      <div className="grid gap-4">
        {products.map(p => (
          <div key={p._id} className="p-4 border rounded shadow cursor-pointer hover:bg-gray-50" onClick={() => setSelectedId(p._id)}>
            <p className="font-semibold">{p.productName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}