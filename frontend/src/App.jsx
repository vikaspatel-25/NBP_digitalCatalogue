import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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
  Store,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileText
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

function NavItem({ to, icon: Icon, label, badge = null }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
        isActive
          ? 'bg-slate-800 text-white font-semibold shadow-2xs'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
          {badge}
        </span>
      )}
    </Link>
  );
}

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const adminTitles = {
    '/admin': 'Dashboard Overview',
    '/admin/userApproval': 'Pending Approvals',
    '/admin/userManagement': 'Active Vendor Directory',
    '/admin/removeProduct': 'Remove Products',
    '/admin/removeArticle': 'Remove Articles',
    '/admin/resetPassword': 'Change Password',
  };
  const currentTitle = adminTitles[currentPath] || 'Dashboard Overview';

  useEffect(() => {
    axios.get('/api/admin/userApproval')
      .then(res => {
        if (res.data && res.data.users) {
          setPendingCount(res.data.users.length);
        }
      })
      .catch(() => {});
  }, []);

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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out border-r border-slate-900 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <a href="/home" className="flex items-center space-x-2.5 group no-underline" title="Go to NetZeroMart Storefront">
            <img
              src="/assets/netZeroStickerIcon.png"
              alt="NetZeroMart"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                <span>NetZeroMart</span>
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Master Admin
              </span>
            </div>
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">Overview</p>
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mt-4 mb-1.5">Vendor Relations</p>
          <NavItem to="/admin/userApproval" icon={UserCheck} label="Pending Approvals" badge={pendingCount} />
          <NavItem to="/admin/userManagement" icon={Users} label="Active Vendors" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mt-4 mb-1.5">Content Moderation</p>
          <NavItem to="/admin/removeProduct" icon={Trash2} label="Remove Products" />
          <NavItem to="/admin/removeArticle" icon={FileMinus} label="Remove Articles" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mt-4 mb-1.5">System Security</p>
          <NavItem to="/admin/resetPassword" icon={KeyRound} label="Change Password" />
        </nav>

        <div className="p-3 border-t border-slate-900 bg-slate-950/80">
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out Session</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="hidden sm:inline">Admin Portal</span>
              <ChevronRight size={13} className="hidden sm:inline text-slate-400" />
              <span className="font-semibold text-slate-800">{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs group"
              title="Visit Live Storefront"
            >
              <Store size={14} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
              <span>Storefront</span>
              <ExternalLink size={11} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </div>
        </header>

        <div className="p-4 sm:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function UserLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const userTitles = {
    '/userPanel': 'Vendor Dashboard',
    '/userPanel/addProduct': 'Add New Product',
    '/userPanel/updateProduct': 'Update Products',
    '/userPanel/removeProduct': 'Remove Products',
    '/userPanel/addArticle': 'Publish Article',
    '/userPanel/removeArticle': 'Manage Articles',
    '/userPanel/resetPassword': 'Change Password',
  };
  const currentTitle = userTitles[currentPath] || 'Vendor Dashboard';

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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out border-r border-slate-900 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <a href="/home" className="flex items-center space-x-2.5 group no-underline" title="Go to NetZeroMart Storefront">
            <img
              src="/assets/netZeroStickerIcon.png"
              alt="NetZeroMart"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 group-hover:text-emerald-400 transition-colors">
                <span>NetZeroMart</span>
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Vendor Portal
              </span>
            </div>
          </a>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">Overview</p>
          <NavItem to="/userPanel" icon={LayoutDashboard} label="Vendor Dashboard" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mt-4 mb-1.5">Catalogue Listings</p>
          <NavItem to="/userPanel/addProduct" icon={PlusCircle} label="Add New Product" />
          <NavItem to="/userPanel/updateProduct" icon={Edit3} label="Update Products" />
          <NavItem to="/userPanel/removeProduct" icon={Trash2} label="Remove Products" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mt-4 mb-1.5">Content & Stories</p>
          <NavItem to="/userPanel/addArticle" icon={FilePlus} label="Publish Article" />
          <NavItem to="/userPanel/removeArticle" icon={FileMinus} label="Manage Articles" />

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2.5 mt-4 mb-1.5">Security</p>
          <NavItem to="/userPanel/resetPassword" icon={KeyRound} label="Change Password" />
        </nav>

        <div className="p-3 border-t border-slate-900 bg-slate-950/80">
          <form action="/userPanel/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut size={15} />
              <span>Log Out Portal</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="hidden sm:inline">Vendor Portal</span>
              <ChevronRight size={13} className="hidden sm:inline text-slate-400" />
              <span className="font-semibold text-slate-800">{currentTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs group"
              title="Visit Live Storefront"
            >
              <Store size={14} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
              <span>Storefront</span>
              <ExternalLink size={11} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </a>
          </div>
        </header>

        <div className="p-4 sm:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    products: 0,
    articles: 0,
    pendingUsers: 0,
    activeUsers: 0,
    loading: true
  });

  useEffect(() => {
    Promise.allSettled([
      axios.get('/api/admin/removeProduct'),
      axios.get('/api/admin/removeArticle'),
      axios.get('/api/admin/userApproval'),
      axios.get('/api/admin/userManagement')
    ]).then(([prodRes, artRes, pendRes, userRes]) => {
      setStats({
        products: prodRes.status === 'fulfilled' ? (prodRes.value.data.products?.length || 0) : 0,
        articles: artRes.status === 'fulfilled' ? (artRes.value.data.articles?.length || 0) : 0,
        pendingUsers: pendRes.status === 'fulfilled' ? (pendRes.value.data.users?.length || 0) : 0,
        activeUsers: userRes.status === 'fulfilled' ? (userRes.value.data.users?.length || 0) : 0,
        loading: false
      });
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner - Minimal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <ShieldCheck size={13} />
            <span>Master Administration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Central Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oversee catalogue listings, manage vendor registrations, and monitor platform health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/userApproval"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-2xs active:scale-95"
          >
            <UserCheck size={14} />
            <span>Review Applications</span>
          </Link>
        </div>
      </div>

      {/* Attention alert if pending applications exist */}
      {stats.pendingUsers > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs sm:text-sm flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">{stats.pendingUsers} vendor application(s)</span> awaiting your verification.
            </div>
          </div>
          <Link
            to="/admin/userApproval"
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition shadow-2xs flex-shrink-0"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* Metric Counters - Ordered: Products, Articles, Approvals, Vendors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Package size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {stats.loading ? '...' : stats.products}
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate">Products in Catalogue</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {stats.loading ? '...' : stats.articles}
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate">Published Articles</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <UserCheck size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {stats.loading ? '...' : stats.pendingUsers}
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate">Pending Approvals</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {stats.loading ? '...' : stats.activeUsers}
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate">Verified Vendors</div>
          </div>
        </div>
      </div>

      {/* Quick Action Panels - Clean & Non-Verbose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Moderation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Content Moderation</h2>
              <p className="text-xs text-slate-400">Admin moderation and deletion only</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/admin/removeProduct"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <Package size={16} className="text-slate-500 group-hover:text-rose-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Remove Products</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{stats.products} listed</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/admin/removeArticle"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <FileMinus size={16} className="text-slate-500 group-hover:text-rose-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Remove Articles</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{stats.articles} published</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Vendor Relations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Vendor Management</h2>
              <p className="text-xs text-slate-400">Registration approvals & vendor directory</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/admin/userApproval"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck size={16} className="text-slate-500 group-hover:text-emerald-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Pending Approvals</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {stats.pendingUsers > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {stats.pendingUsers} waiting
                  </span>
                ) : (
                  <span className="text-slate-400">0 waiting</span>
                )}
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
            <Link
              to="/admin/userManagement"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Active Vendor Directory</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{stats.activeUsers} active</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboardOverview() {
  const [stats, setStats] = useState({
    products: 0,
    articles: 0,
    loading: true
  });

  useEffect(() => {
    Promise.allSettled([
      axios.get('/api/userPanel/removeProduct'),
      axios.get('/api/userPanel/removeArticle')
    ]).then(([prodRes, artRes]) => {
      setStats({
        products: prodRes.status === 'fulfilled' ? (prodRes.value.data.products?.length || 0) : 0,
        articles: artRes.status === 'fulfilled' ? (artRes.value.data.articles?.length || 0) : 0,
        loading: false
      });
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner - Minimal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <Store size={13} />
            <span>Verified Vendor Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your catalogue listings and published industry articles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/userPanel/addProduct"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-2xs active:scale-95"
          >
            <PlusCircle size={14} />
            <span>List New Product</span>
          </Link>
          <Link
            to="/userPanel/updateProduct"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200 shadow-2xs active:scale-95"
          >
            <Edit3 size={14} />
            <span>Update Existing</span>
          </Link>
        </div>
      </div>

      {/* Live Metric Counters */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Package size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {stats.loading ? '...' : stats.products}
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate">My Listed Products</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {stats.loading ? '...' : stats.articles}
            </div>
            <div className="text-[11px] font-medium text-slate-500 truncate">My Published Articles</div>
          </div>
        </div>
      </div>

      {/* Quick Action Panels - Clean & Non-Verbose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Catalogue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Package size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Catalogue Management</h2>
              <p className="text-xs text-slate-400">Create, edit and manage product listings</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/userPanel/addProduct"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle size={16} className="text-slate-500 group-hover:text-emerald-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Add New Product</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/userPanel/updateProduct"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <Edit3 size={16} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Update Specifications</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/userPanel/removeProduct"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 size={16} className="text-slate-500 group-hover:text-rose-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Remove Listed Products</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Content & Articles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Articles & Insights</h2>
              <p className="text-xs text-slate-400">Publish and manage sustainability articles</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link
              to="/userPanel/addArticle"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <FilePlus size={16} className="text-slate-500 group-hover:text-emerald-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Publish New Article</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/userPanel/removeArticle"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition group"
            >
              <div className="flex items-center gap-2.5">
                <FileMinus size={16} className="text-slate-500 group-hover:text-rose-600 transition-colors" />
                <span className="text-xs font-semibold text-slate-800">Manage Published Articles</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
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

        {/* Master Admin Routes - deletion & moderation only */}
        <Route path="/admin" element={<AdminLayout><AdminDashboardOverview /></AdminLayout>} />
        <Route path="/admin/userApproval" element={<AdminLayout><UserApproval /></AdminLayout>} />
        <Route path="/admin/userManagement" element={<AdminLayout><UserManagement /></AdminLayout>} />
        <Route path="/admin/addProduct" element={<Navigate to="/admin/removeProduct" replace />} />
        <Route path="/admin/updateProduct" element={<Navigate to="/admin/removeProduct" replace />} />
        <Route path="/admin/removeProduct" element={<AdminLayout><RemoveProduct basePath="/api/admin" /></AdminLayout>} />
        <Route path="/admin/addArticle" element={<Navigate to="/admin/removeArticle" replace />} />
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
