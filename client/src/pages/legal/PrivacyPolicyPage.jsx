import React from 'react';
import { Shield, Lock, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bento-card p-6 sm:p-10 space-y-6 relative overflow-hidden">
        <div className="border-b border-white/[0.08] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Compliance & Indian Data Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last revised: September 29, 2026 &bull; Digital Personal Data Protection Act (DPDP)</p>
        </div>

        <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Information We Collect</h2>
          <p>
            HR Pulse collects personal and professional information strictly necessary for Indian statutory employment records, payroll processing, biometric shift attendance, and workforce management. This includes employee names, work email addresses, mobile numbers, bank account numbers / IFSC / UPI for salary disbursement, attendance timestamps, and performance appraisal evaluations.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. How Data is Processed</h2>
          <p>Collected information is exclusively utilized for internal organizational operations, including:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
            <li>Calculating monthly gross and net compensation packages with EPF and TDS deductions.</li>
            <li>Tracking shift hours, punctuality, and managing annual leave balance quotas.</li>
            <li>Maintaining departmental organizational hierarchies and annual performance reviews.</li>
            <li>Role-based access verification and session authentication via JSON Web Tokens.</li>
          </ul>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Data Security & Encryption</h2>
          <p>
            All user passwords are encrypted using one-way bcrypt hashing. Data transmissions between client applications and backend APIs are secured with TLS 1.3 encryption. Employee financial and personal details are restricted under strict role-based authorization rules.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">4. Contact & Data Privacy Officer</h2>
          <p>
            Employees may review, rectify, or request updates to their profile details by contacting their organizational HR Administrator or submitting a request to privacy@hrms.internal.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
