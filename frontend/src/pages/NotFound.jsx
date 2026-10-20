import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const isAdmin = document.cookie.includes('adminToken=');
  const isVendor = document.cookie.includes('userToken=');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Brand Header */}
        <a href="/home" className="inline-flex items-center gap-2 group cursor-pointer no-underline select-none">
          <img src="/assets/netZeroStickerIcon.png" alt="NetZeroMart" className="h-9 w-9 object-contain" />
          <span className="text-2xl font-black tracking-tight text-slate-900">
            NetZero<span className="text-blue-600">Mart</span>
          </span>
        </a>

        {/* 404 Visual Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-8 sm:p-10 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <Compass size={40} className="animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              404 • Not Found
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              The page or portal route you requested does not exist or may have been relocated.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
              >
                <LayoutDashboard size={16} />
                Return to Admin Dashboard
              </Link>
            )}

            {isVendor && !isAdmin && (
              <Link
                to="/userPanel"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
              >
                <LayoutDashboard size={16} />
                Return to Vendor Portal
              </Link>
            )}

            <a
              href="/home"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all no-underline"
            >
              <Home size={16} />
              Go to Storefront Homepage
            </a>

            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Go Back to Previous Page
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Need assistance? Email{' '}
          <a href="mailto:netzeromart@gmail.com" className="text-blue-600 hover:underline">
            netzeromart@gmail.com
          </a>
        </p>

      </div>
    </div>
  );
}
