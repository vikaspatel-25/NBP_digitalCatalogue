import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { TERMS_AND_CONDITIONS } from '../data/termsData';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>

          <a
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl shadow-sm transition active:scale-[0.98]"
          >
            <span>Proceed to Registration</span>
            <span>→</span>
          </a>
        </div>

        {/* Policy Document Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden p-6 sm:p-12">
          
          {/* Header Banner */}
          <div className="border-b border-slate-200 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
              <ShieldCheck size={14} />
              <span>Seller Compliance & Legal Policy</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              COPYRIGHT POLICY &amp; TERMS &amp; CONDITIONS
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              For Third-Party Sellers, Products and Services
            </p>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
              <span>Jurisdiction: Courts at Indore, Madhya Pradesh, India</span>
              <span>•</span>
              <span>Effective: October 2026</span>
              <span>•</span>
              <span>Version: 2.0</span>
            </div>
          </div>

          {/* Clauses List */}
          <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {TERMS_AND_CONDITIONS.map((clause) => (
              <section key={clause.id} className="space-y-2.5 scroll-mt-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 text-white inline-flex items-center justify-center text-xs shrink-0 font-bold">
                    {clause.id}
                  </span>
                  <span>{clause.title.replace(/^\d+\.\s*/, '')}</span>
                </h2>

                {clause.paragraphs?.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-600 leading-relaxed">
                    {p}
                  </p>
                ))}

                {clause.bulletTitle && (
                  <p className="font-semibold text-slate-800 text-xs pt-1">
                    {clause.bulletTitle}
                  </p>
                )}

                {clause.bullets && (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
                    {clause.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}

                {clause.contactInfo && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-xs space-y-1.5 my-3">
                    <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Mail size={13} className="text-blue-600" />
                      <span>{clause.contactInfo.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span>{' '}
                      <a href={`mailto:${clause.contactInfo.email}`} className="font-bold text-blue-600 hover:underline">
                        {clause.contactInfo.email}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500">Subject Line:</span>{' '}
                      <span className="font-semibold text-slate-800">{clause.contactInfo.subject}</span>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Acknowledgement Footer */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} NetZeroMart. All rights reserved.
            </div>
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
            >
              <CheckCircle2 size={16} />
              <span>Back to Vendor Registration</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
