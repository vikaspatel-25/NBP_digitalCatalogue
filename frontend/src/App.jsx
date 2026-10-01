import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import AddProduct from './pages/AddProduct';
import UserApproval from './pages/UserApproval';
import UserManagement from './pages/UserManagement';
import RemoveProduct from './pages/RemoveProduct';
import UpdateProduct from './pages/UpdateProduct';
import AddArticle from './pages/AddArticle';
import RemoveArticle from './pages/RemoveArticle';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  FilePlus, 
  FileMinus, 
  LogOut,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl flex-shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow">
              NZ
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">NetZeroMart</h2>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 font-medium">Admin Portal</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Overview</p>
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <LayoutDashboard size={18} className="text-blue-400" />
            <span>Dashboard</span>
          </Link>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-5 mb-2">Users</p>
          <Link to="/admin/userApproval" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <UserCheck size={18} className="text-emerald-400" />
            <span>User Approvals</span>
          </Link>
          <Link to="/admin/userManagement" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <Users size={18} className="text-indigo-400" />
            <span>User Management</span>
          </Link>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-5 mb-2">Catalog</p>
          <Link to="/admin/addProduct" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <PlusCircle size={18} className="text-sky-400" />
            <span>Add Product</span>
          </Link>
          <Link to="/admin/updateProduct" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <Edit3 size={18} className="text-amber-400" />
            <span>Update Product</span>
          </Link>
          <Link to="/admin/removeProduct" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <Trash2 size={18} className="text-rose-400" />
            <span>Remove Product</span>
          </Link>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-5 mb-2">Articles</p>
          <Link to="/admin/addArticle" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <FilePlus size={18} className="text-teal-400" />
            <span>Add Article</span>
          </Link>
          <Link to="/admin/removeArticle" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-slate-800 text-slate-200 hover:text-white">
            <FileMinus size={18} className="text-orange-400" />
            <span>Remove Article</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action="/admin/logout" method="POST">
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition">
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Administration</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Overview</span>
          </div>
          <a href="/home" className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition">
            View Live Site →
          </a>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function UserLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col h-full shadow-xl flex-shrink-0">
        <div className="p-5 border-b border-blue-900 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow">
              VP
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Vendor Portal</h2>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900 text-blue-300 font-medium">NetZeroMart</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[11px] font-bold text-blue-300/60 uppercase tracking-wider px-3 mb-2">Overview</p>
          <Link to="/userPanel" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-blue-900 text-blue-100 hover:text-white">
            <LayoutDashboard size={18} className="text-blue-300" />
            <span>Dashboard</span>
          </Link>

          <p className="text-[11px] font-bold text-blue-300/60 uppercase tracking-wider px-3 mt-5 mb-2">My Products</p>
          <Link to="/userPanel/addProduct" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-blue-900 text-blue-100 hover:text-white">
            <PlusCircle size={18} className="text-emerald-300" />
            <span>Add Product</span>
          </Link>
          <Link to="/userPanel/updateProduct" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-blue-900 text-blue-100 hover:text-white">
            <Edit3 size={18} className="text-amber-300" />
            <span>Update Product</span>
          </Link>
          <Link to="/userPanel/removeProduct" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-blue-900 text-blue-100 hover:text-white">
            <Trash2 size={18} className="text-rose-300" />
            <span>Remove Product</span>
          </Link>

          <p className="text-[11px] font-bold text-blue-300/60 uppercase tracking-wider px-3 mt-5 mb-2">Articles</p>
          <Link to="/userPanel/addArticle" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-blue-900 text-blue-100 hover:text-white">
            <FilePlus size={18} className="text-teal-300" />
            <span>Add Article</span>
          </Link>
          <Link to="/userPanel/removeArticle" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition hover:bg-blue-900 text-blue-100 hover:text-white">
            <FileMinus size={18} className="text-orange-300" />
            <span>Remove Article</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-900">
          <form action="/userPanel/logout" method="POST">
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition">
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Vendor Portal</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">My Catalogue</span>
          </div>
          <a href="/home" className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition">
            View Live Site →
          </a>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminDashboardOverview() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your catalog, vendor approvals, and articles from this panel.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/addProduct" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">
            <PlusCircle size={16} />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Catalogue Management</h3>
            <p className="text-slate-900 font-bold text-lg mt-1">Products & Items</p>
            <div className="mt-3 flex gap-2">
              <Link to="/admin/addProduct" className="text-xs text-blue-600 font-semibold hover:underline">Add</Link>
              <span className="text-slate-300">•</span>
              <Link to="/admin/updateProduct" className="text-xs text-slate-600 hover:underline">Update</Link>
              <span className="text-slate-300">•</span>
              <Link to="/admin/removeProduct" className="text-xs text-rose-600 hover:underline">Remove</Link>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Vendor Management</h3>
            <p className="text-slate-900 font-bold text-lg mt-1">Approvals & Users</p>
            <div className="mt-3 flex gap-2">
              <Link to="/admin/userApproval" className="text-xs text-emerald-600 font-semibold hover:underline">Pending Approvals</Link>
              <span className="text-slate-300">•</span>
              <Link to="/admin/userManagement" className="text-xs text-slate-600 hover:underline">All Users</Link>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Content & SEO</h3>
            <p className="text-slate-900 font-bold text-lg mt-1">Articles & News</p>
            <div className="mt-3 flex gap-2">
              <Link to="/admin/addArticle" className="text-xs text-teal-600 font-semibold hover:underline">Publish Article</Link>
              <span className="text-slate-300">•</span>
              <Link to="/admin/removeArticle" className="text-xs text-rose-600 hover:underline">Remove</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboardOverview() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to Vendor Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your catalog listings and articles on NetZeroMart.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/userPanel/addProduct" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shadow-sm">
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">My Products</h3>
            <p className="text-slate-900 font-bold text-lg mt-1">Product Listings</p>
            <div className="mt-3 flex gap-2">
              <Link to="/userPanel/addProduct" className="text-xs text-emerald-600 font-semibold hover:underline">Add New</Link>
              <span className="text-slate-300">•</span>
              <Link to="/userPanel/updateProduct" className="text-xs text-slate-600 hover:underline">Update Existing</Link>
              <span className="text-slate-300">•</span>
              <Link to="/userPanel/removeProduct" className="text-xs text-rose-600 hover:underline">Remove</Link>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">My Articles</h3>
            <p className="text-slate-900 font-bold text-lg mt-1">Articles & Posts</p>
            <div className="mt-3 flex gap-2">
              <Link to="/userPanel/addArticle" className="text-xs text-teal-600 font-semibold hover:underline">Write Article</Link>
              <span className="text-slate-300">•</span>
              <Link to="/userPanel/removeArticle" className="text-xs text-rose-600 hover:underline">Manage</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout><AdminDashboardOverview /></AdminLayout>} />
        <Route path="/admin/userApproval" element={<AdminLayout><UserApproval /></AdminLayout>} />
        <Route path="/admin/userManagement" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/addProduct" element={<AdminLayout><AddProduct apiEndpoint="/api/admin/addProduct" role="admin" /></AdminLayout>} />
        <Route path="/admin/updateProduct" element={<AdminLayout><UpdateProduct basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/removeProduct" element={<AdminLayout><RemoveProduct basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/addArticle" element={<AdminLayout><AddArticle basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/removeArticle" element={<AdminLayout><RemoveArticle basePath="/api/admin" /></AdminLayout>} />
        
        {/* User / Vendor Routes */}
        <Route path="/userPanel" element={<UserLayout><UserDashboardOverview /></UserLayout>} />
        <Route path="/userPanel/addProduct" element={<UserLayout><AddProduct apiEndpoint="/api/userPanel/addProduct" role="user" /></UserLayout>} />
        <Route path="/userPanel/updateProduct" element={<UserLayout><UpdateProduct basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/userPanel/removeProduct" element={<UserLayout><RemoveProduct basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/userPanel/addArticle" element={<UserLayout><AddArticle basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/userPanel/removeArticle" element={<UserLayout><RemoveArticle basePath="/api/userPanel" /></UserLayout>} />

        {/* Beta Route compatibility */}
        <Route path="/v2/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/v2/userPanel/*" element={<Navigate to="/userPanel" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
