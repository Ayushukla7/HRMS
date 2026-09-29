import React from 'react';
import { FileText, CheckSquare, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A56ABD] hover:text-[#E7DBEF] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bento-card p-6 sm:p-10 space-y-6 relative overflow-hidden">
        <div className="border-b border-[#A56ABD]/20 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E3482]/20 border border-[#A56ABD]/30 text-[#A56ABD] text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Enterprise Compliance & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5EBFA] tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-[#E7DBEF]/70 mt-1">Effective date: September 29, 2026</p>
        </div>

        <section className="space-y-2 text-xs sm:text-sm text-[#E7DBEF] leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-[#F5EBFA] uppercase tracking-wider">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the HR Pulse Enterprise Platform, employees and administrative users agree to comply with organizational conduct policies, punctuality standards, and secure credential handling.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-[#E7DBEF] leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-[#F5EBFA] uppercase tracking-wider">2. User Accounts & Responsibilities</h2>
          <p>
            Authorized personnel must maintain the strict confidentiality of their portal credentials. Sharing account access, falsifying biometric time stamps, manipulating leave balances, or misrepresenting expenses violates internal workplace compliance standards.
          </p>
        </section>

        <section className="space-y-2 text-xs sm:text-sm text-[#E7DBEF] leading-relaxed font-normal">
          <h2 className="text-sm font-bold text-[#F5EBFA] uppercase tracking-wider">3. Service Uptime & Maintenance</h2>
          <p>
            The platform is provided for authorized organizational operations. Automated cloud backup routines and security updates are deployed to guarantee high availability and data integrity.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
