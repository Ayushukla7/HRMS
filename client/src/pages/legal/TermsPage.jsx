import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in text-neutral-900">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-10 space-y-6 shadow-xs">
        <div className="border-b border-neutral-200 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5 text-black" />
            <span>Enterprise Compliance & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-neutral-500 mt-1">Effective date: September 29, 2026</p>
        </div>

        <section className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the HR Pulse Enterprise Platform, employees and administrative users agree to comply with organizational conduct policies, punctuality standards, and secure credential handling.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">2. User Accounts & Responsibilities</h2>
          <p>
            Authorized personnel must maintain the strict confidentiality of their portal credentials. Sharing account access, falsifying biometric time stamps, manipulating leave balances, or misrepresenting expenses violates internal workplace compliance standards.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">3. Service Uptime & Maintenance</h2>
          <p>
            The platform is provided for authorized organizational operations. Automated cloud backup routines and security updates are deployed to guarantee high availability and data integrity.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
