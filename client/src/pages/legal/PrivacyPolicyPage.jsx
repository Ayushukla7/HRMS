import React from 'react';
import { Shield, Lock, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Compliance & Data Protection</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last revised: September 29, 2026</p>
        </div>

        <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">1. Information We Collect</h2>
          <p>
            HR Pulse collects personal and professional information necessary for employment records, payroll processing, shift attendance, and workforce management. This includes names, work email addresses, telephone numbers, bank account numbers for salary disbursement, attendance timestamps, and performance appraisal notes.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">2. How Data is Used</h2>
          <p>
            Collected information is solely utilized for internal human resource operations, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Calculating monthly gross and net compensation packages and generating payslips.</li>
            <li>Tracking shift hours, punctuality, and managing leave balance allocations.</li>
            <li>Maintaining departmental organizational hierarchies and performance evaluations.</li>
            <li>Role-based access verification and session authentication via JSON Web Tokens.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">3. Data Security & Storage</h2>
          <p>
            All user passwords are encrypted using one-way bcrypt hashing. Data transmissions between client applications and backend APIs are secured with industry-standard TLS encryption. Employee financial and personal details are restricted under role-based authorization rules.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">4. Contact & Data Requests</h2>
          <p>
            Employees may review, rectify, or request deletion of their profile details by contacting their organizational HR Administrator or submitting a request to privacy@hrms.internal.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
