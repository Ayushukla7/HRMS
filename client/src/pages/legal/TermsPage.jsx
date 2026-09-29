import React from 'react';
import { FileText, CheckSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
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
            <FileText className="w-3.5 h-3.5" />
            <span>Organizational Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-slate-400 mt-1">Effective date: September 29, 2026</p>
        </div>

        <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the HR Pulse Enterprise Platform, employees and administrative users agree to comply with organizational policies, accurate time-logging standards, and secure credential handling.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">2. User Accounts & Responsibilities</h2>
          <p>
            Authorized personnel must maintain the confidentiality of their portal credentials. Sharing account access or falsifying time stamps, leave applications, or payroll records violates internal workplace compliance standards.
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">3. System Availability & Maintenance</h2>
          <p>
            The system is provided for enterprise operations. Scheduled maintenance windows and automated data sync routines are conducted to ensure optimal service uptime.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
