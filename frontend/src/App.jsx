import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import AddProduct from './pages/AddProduct';
import UserApproval from './pages/UserApproval';
import UserManagement from './pages/UserManagement';
import RemoveProduct from './pages/RemoveProduct';
import UpdateProduct from './pages/UpdateProduct';
import AddArticle from './pages/AddArticle';
import RemoveArticle from './pages/RemoveArticle';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import ResetPassword from './pages/ResetPassword';
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
  KeyRound,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Store
} from 'lucide-react';

// Dynamic Document Title Sync
function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const p = location.pathname;
    const titleMap = {
      '/admin': 'Admin Dashboard | NetZeroMart',
      '/admin/userApproval': 'Vendor Approvals | NetZeroMart',
      '/admin/userManagement': 'Vendor Directory | NetZeroMart',
      '/admin/addProduct': 'Add Product | NetZeroMart Admin',
      '/admin/updateProduct': 'Update Product | NetZeroMart Admin',
      '/admin/removeProduct': 'Remove Products | NetZeroMart Admin',
      '/admin/addArticle': 'Publish Article | NetZeroMart Admin',
      '/admin/removeArticle': 'Manage Articles | NetZeroMart Admin',
      '/admin/resetPassword': 'Change Password | NetZeroMart Admin',
      '/userPanel': 'Vendor Portal Dashboard | NetZeroMart',
      '/userPanel/addProduct': 'Add Listing | NetZeroMart Vendor',
      '/userPanel/updateProduct': 'Update Listing | NetZeroMart Vendor',
      '/userPanel/removeProduct': 'Manage Listings | NetZeroMart Vendor',
      '/userPanel/addArticle': 'Publish Article | NetZeroMart Vendor',
      '/userPanel/removeArticle': 'Manage Articles | NetZeroMart Vendor',
      '/userPanel/resetPassword': 'Change Password | NetZeroMart Vendor',
      '/register': 'Vendor Registration & Onboarding | NetZeroMart',
      '/adminLogin': 'Administrator Sign In | NetZeroMart',
      '/userLogin': 'Vendor Portal Sign In | NetZeroMart',
    };

    document.title = titleMap[p] || 'NetZeroMart | Sustainable Digital Catalogue';
  }, [location]);

  return null;
}

function NavItem({ to, icon: Icon, label, color = "text-slate-400" }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
      }`}
    >
      <Icon size={18} className={isActive ? 'text-white' : color} />
      <span>{label}</span>
    </Link>
  );
}

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-850 flex items-center justify-between">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20">
              NZ
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>NetZeroMart</span>
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-850">
                Master Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider px-3 mb-2">Main Menu</p>
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" color="text-blue-400" />

          <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider px-3 mt-5 mb-2">Vendor Relations</p>
          <NavItem to="/admin/userApproval" icon={UserCheck} label="Pending Approvals" color="text-emerald-400" />
          <NavItem to="/admin/userManagement" icon={Users} label="Active Vendors" color="text-indigo-400" />

          <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider px-3 mt-5 mb-2">Catalog Operations</p>
          <NavItem to="/admin/addProduct" icon={PlusCircle} label="Add Product" color="text-sky-400" />
          <NavItem to="/admin/updateProduct" icon={Edit3} label="Update Product" color="text-amber-400" />
          <NavItem to="/admin/removeProduct" icon={Trash2} label="Remove Product" color="text-rose-400" />

          <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider px-3 mt-5 mb-2">Publishing & Content</p>
          <NavItem to="/admin/addArticle" icon={FilePlus} label="Publish Article" color="text-teal-400" />
          <NavItem to="/admin/removeArticle" icon={FileMinus} label="Manage Articles" color="text-orange-400" />

          <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider px-3 mt-5 mb-2">System Security</p>
          <NavItem to="/admin/resetPassword" icon={KeyRound} label="Change Password" color="text-violet-400" />
        </nav>

        <div className="p-4 border-t border-slate-850 bg-slate-950/80">
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
            >
              <LogOut size={16} />
              <span>Sign Out Session</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="hidden sm:inline">Administration</span>
              <ChevronRight size={14} className="hidden sm:inline text-slate-400" />
              <span className="font-bold text-slate-800">Control Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/home"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition shadow-sm"
            >
              <Store size={14} className="text-blue-600" />
              <span className="hidden sm:inline">View Public Storefront</span>
              <ExternalLink size={12} className="text-slate-400" />
            </a>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function UserLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-blue-900/40 flex items-center justify-between">
          <Link to="/userPanel" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-emerald-500/20">
              VP
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">Vendor Portal</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                Verified Vendor
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <p className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider px-3 mb-2">Overview</p>
          <NavItem to="/userPanel" icon={LayoutDashboard} label="Vendor Dashboard" color="text-teal-400" />

          <p className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider px-3 mt-5 mb-2">Catalogue Listings</p>
          <NavItem to="/userPanel/addProduct" icon={PlusCircle} label="Add New Product" color="text-emerald-400" />
          <NavItem to="/userPanel/updateProduct" icon={Edit3} label="Update Products" color="text-amber-400" />
          <NavItem to="/userPanel/removeProduct" icon={Trash2} label="Remove Products" color="text-rose-400" />

          <p className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider px-3 mt-5 mb-2">Content & Stories</p>
          <NavItem to="/userPanel/addArticle" icon={FilePlus} label="Publish Article" color="text-cyan-400" />
          <NavItem to="/userPanel/removeArticle" icon={FileMinus} label="Manage Articles" color="text-orange-400" />

          <p className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider px-3 mt-5 mb-2">Security</p>
          <NavItem to="/userPanel/resetPassword" icon={KeyRound} label="Change Password" color="text-indigo-400" />
        </nav>

        <div className="p-4 border-t border-blue-900/40 bg-slate-950/80">
          <form action="/userPanel/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
            >
              <LogOut size={16} />
              <span>Log Out Portal</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="hidden sm:inline">Vendor Center</span>
              <ChevronRight size={14} className="hidden sm:inline text-slate-400" />
              <span className="font-bold text-slate-800">Catalogue Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/home"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition shadow-sm"
            >
              <Store size={14} className="text-emerald-600" />
              <span className="hidden sm:inline">View Public Storefront</span>
              <ExternalLink size={12} className="text-slate-400" />
            </a>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminDashboardOverview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={14} />
            Master Administration
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Welcome to the Central Command
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Review incoming vendor requests, oversee verified digital catalog products, and curate educational articles.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            to="/admin/userApproval"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95"
          >
            <UserCheck size={15} />
            <span>Review Applications</span>
          </Link>
          <Link
            to="/admin/addProduct"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95"
          >
            <PlusCircle size={15} />
            <span>Publish Product</span>
          </Link>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalogue Management</h3>
              <p className="text-slate-900 font-black text-lg mt-0.5">Products & Innovations</p>
              <p className="text-xs text-slate-500 mt-1">
                Upload new clean-tech items, modify specifications, or delete legacy listings.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs font-bold">
            <Link to="/admin/addProduct" className="text-blue-600 hover:text-blue-800">Add New</Link>
            <span className="text-slate-300">•</span>
            <Link to="/admin/updateProduct" className="text-amber-600 hover:text-amber-800">Update</Link>
            <span className="text-slate-300">•</span>
            <Link to="/admin/removeProduct" className="text-rose-600 hover:text-rose-800">Remove</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendor Operations</h3>
              <p className="text-slate-900 font-black text-lg mt-0.5">Verification & Access</p>
              <p className="text-xs text-slate-500 mt-1">
                Verify business certificates, approve incoming vendor signups, or terminate access.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs font-bold">
            <Link to="/admin/userApproval" className="text-emerald-600 hover:text-emerald-800">Approvals</Link>
            <span className="text-slate-300">•</span>
            <Link to="/admin/userManagement" className="text-indigo-600 hover:text-indigo-800">Active Directory</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knowledge Base</h3>
              <p className="text-slate-900 font-black text-lg mt-0.5">Articles & Insights</p>
              <p className="text-xs text-slate-500 mt-1">
                Publish case studies, sustainability guides, and technical whitepapers with product links.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs font-bold">
            <Link to="/admin/addArticle" className="text-teal-600 hover:text-teal-800">New Article</Link>
            <span className="text-slate-300">•</span>
            <Link to="/admin/removeArticle" className="text-rose-600 hover:text-rose-800">Manage Content</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboardOverview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Store size={14} />
            Verified Vendor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Manage Your Sustainable Catalogue
          </h1>
          <p className="text-emerald-100/80 text-sm max-w-xl">
            Promote your eco-friendly products, update specifications, and share technical research articles.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <Link
            to="/userPanel/addProduct"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95"
          >
            <PlusCircle size={15} />
            <span>List New Product</span>
          </Link>
          <Link
            to="/userPanel/updateProduct"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 flex items-center gap-2 active:scale-95"
          >
            <Edit3 size={15} />
            <span>Update Existing</span>
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Inventory</h3>
              <p className="text-slate-900 font-black text-lg mt-0.5">My Listed Catalog</p>
              <p className="text-xs text-slate-500 mt-1">
                Keep your product specs, price estimations, brochure links, and imagery up to date.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs font-bold">
            <Link to="/userPanel/addProduct" className="text-emerald-600 hover:text-emerald-800">Add New</Link>
            <span className="text-slate-300">•</span>
            <Link to="/userPanel/updateProduct" className="text-amber-600 hover:text-amber-800">Update Specs</Link>
            <span className="text-slate-300">•</span>
            <Link to="/userPanel/removeProduct" className="text-rose-600 hover:text-rose-800">Remove</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thought Leadership</h3>
              <p className="text-slate-900 font-black text-lg mt-0.5">My Articles & Research</p>
              <p className="text-xs text-slate-500 mt-1">
                Publish case studies on your green engineering implementations and tag relevant products.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs font-bold">
            <Link to="/userPanel/addArticle" className="text-teal-600 hover:text-teal-800">Write Article</Link>
            <span className="text-slate-300">•</span>
            <Link to="/userPanel/removeArticle" className="text-rose-600 hover:text-rose-800">Manage Articles</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <Routes>
        {/* Public Authentication & Registration (React SPA) */}
        <Route path="/register" element={<Register />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/userLogin" element={<UserLogin />} />
        <Route path="/login" element={<Navigate to="/adminLogin" replace />} />

        {/* Master Admin Routes */}
        <Route path="/admin" element={<AdminLayout><AdminDashboardOverview /></AdminLayout>} />
        <Route path="/admin/userApproval" element={<AdminLayout><UserApproval /></AdminLayout>} />
        <Route path="/admin/userManagement" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/addProduct" element={<AdminLayout><AddProduct apiEndpoint="/api/admin/addProduct" role="admin" /></AdminLayout>} />
        <Route path="/admin/updateProduct" element={<AdminLayout><UpdateProduct basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/removeProduct" element={<AdminLayout><RemoveProduct basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/addArticle" element={<AdminLayout><AddArticle basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/removeArticle" element={<AdminLayout><RemoveArticle basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/resetPassword" element={<AdminLayout><ResetPassword role="admin" /></AdminLayout>} />
        
        {/* Vendor Portal Routes */}
        <Route path="/userPanel" element={<UserLayout><UserDashboardOverview /></UserLayout>} />
        <Route path="/userPanel/addProduct" element={<UserLayout><AddProduct apiEndpoint="/api/userPanel/addProduct" role="user" /></UserLayout>} />
        <Route path="/userPanel/updateProduct" element={<UserLayout><UpdateProduct basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/userPanel/removeProduct" element={<UserLayout><RemoveProduct basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/userPanel/addArticle" element={<UserLayout><AddArticle basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/userPanel/removeArticle" element={<UserLayout><RemoveArticle basePath="/api/userPanel" /></UserLayout>} />
        <Route path="/userPanel/resetPassword" element={<UserLayout><ResetPassword role="user" /></UserLayout>} />

        {/* Beta Route compatibility */}
        <Route path="/v2/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/v2/userPanel/*" element={<Navigate to="/userPanel" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
