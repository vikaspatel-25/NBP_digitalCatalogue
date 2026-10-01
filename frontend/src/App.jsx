import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AddProduct from './pages/AddProduct';
import UserApproval from './pages/UserApproval';
import UserManagement from './pages/UserManagement';
import RemoveProduct from './pages/RemoveProduct';
import UpdateProduct from './pages/UpdateProduct';
import AddArticle from './pages/AddArticle';
import RemoveArticle from './pages/RemoveArticle';

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-64 bg-slate-900 text-white p-5 flex flex-col h-full shadow-lg">
        <h2 className="text-xl font-bold mb-8 tracking-wider uppercase text-slate-300">Admin Panel</h2>
        <ul className="flex-1 overflow-y-auto">
          <li className="mb-3"><Link to="/v2/admin" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">Dashboard</Link></li>
          <li className="mb-3"><Link to="/v2/admin/userApproval" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">User Approvals</Link></li>
          <li className="mb-3"><Link to="/v2/admin/userManagement" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">User Management</Link></li>
          <li className="mb-3"><Link to="/v2/admin/addProduct" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">Add Product</Link></li>
          <li className="mb-3"><Link to="/v2/admin/updateProduct" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">Update Product</Link></li>
          <li className="mb-3"><Link to="/v2/admin/removeProduct" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">Remove Product</Link></li>
          <li className="mb-3"><Link to="/v2/admin/addArticle" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">Add Article</Link></li>
          <li className="mb-3"><Link to="/v2/admin/removeArticle" className="block px-3 py-2 rounded transition hover:bg-slate-800 hover:text-blue-400">Remove Article</Link></li>
        </ul>
        <div className="pt-4 border-t border-slate-700">
           <a href="/admin/logout" className="block px-3 py-2 rounded text-red-400 hover:bg-slate-800 transition">Logout</a>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function UserLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-64 bg-blue-800 text-white p-5 flex flex-col h-full shadow-lg">
        <h2 className="text-xl font-bold mb-8 tracking-wider uppercase text-blue-200">User Panel</h2>
        <ul className="flex-1 overflow-y-auto">
          <li className="mb-3"><Link to="/v2/userPanel" className="block px-3 py-2 rounded transition hover:bg-blue-900 hover:text-blue-200">Dashboard</Link></li>
          <li className="mb-3"><Link to="/v2/userPanel/addProduct" className="block px-3 py-2 rounded transition hover:bg-blue-900 hover:text-blue-200">Add Product</Link></li>
          <li className="mb-3"><Link to="/v2/userPanel/updateProduct" className="block px-3 py-2 rounded transition hover:bg-blue-900 hover:text-blue-200">Update Product</Link></li>
          <li className="mb-3"><Link to="/v2/userPanel/removeProduct" className="block px-3 py-2 rounded transition hover:bg-blue-900 hover:text-blue-200">Remove Product</Link></li>
          <li className="mb-3"><Link to="/v2/userPanel/addArticle" className="block px-3 py-2 rounded transition hover:bg-blue-900 hover:text-blue-200">Add Article</Link></li>
          <li className="mb-3"><Link to="/v2/userPanel/removeArticle" className="block px-3 py-2 rounded transition hover:bg-blue-900 hover:text-blue-200">Remove Article</Link></li>
        </ul>
        <div className="pt-4 border-t border-blue-700">
           <a href="/userPanel/logout" className="block px-3 py-2 rounded text-red-200 hover:bg-blue-900 transition">Logout</a>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function DashboardPlaceholder({ title }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">{title}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600 text-lg">Welcome to the new React-based {title}. This interface is currently under construction and will replace the EJS views.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/v2/admin" element={<AdminLayout><DashboardPlaceholder title="Admin Dashboard" /></AdminLayout>} />
        <Route path="/v2/admin/userApproval" element={<AdminLayout><UserApproval /></AdminLayout>} />
        <Route path="/v2/admin/userManagement" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/v2/admin/addProduct" element={<AdminLayout><AddProduct apiEndpoint="/api/admin/addProduct" role="admin" /></AdminLayout>} />
        <Route path="/v2/admin/updateProduct" element={<AdminLayout><UpdateProduct basePath="/api/admin" /></AdminLayout>} />
        <Route path="/v2/admin/removeProduct" element={<AdminLayout><RemoveProduct basePath="/api/admin" /></AdminLayout>} />
        <Route path="/v2/admin/addArticle" element={<AdminLayout><AddArticle basePath="/api/admin" /></AdminLayout>} />
        <Route path="/v2/admin/removeArticle" element={<AdminLayout><RemoveArticle basePath="/api/admin" /></AdminLayout>} />
        
        <Route path="/v2/userPanel" element={<UserLayout><DashboardPlaceholder title="User Dashboard" /></UserLayout>} />
        <Route path="/v2/userPanel/addProduct" element={<UserLayout><AddProduct apiEndpoint="/api/userPanel/addProduct" role="user" /></UserLayout>} />
        <Route path="/v2/userPanel/updateProduct" element={<UserLayout><UpdateProduct basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/v2/userPanel/removeProduct" element={<UserLayout><RemoveProduct basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/v2/userPanel/addArticle" element={<UserLayout><AddArticle basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/v2/userPanel/removeArticle" element={<UserLayout><RemoveArticle basePath="/api/userPanel" /></UserLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
