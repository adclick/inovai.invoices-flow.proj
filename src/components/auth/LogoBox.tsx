
import React from "react";
import { FileText } from "lucide-react";

const LogoBox: React.FC = () => {
  return (
    <div className="text-center animate-fade-in w-full max-w-lg">
      <div className="inline-block p-3 rounded-full bg-white/10 mb-4 sm:mb-6">
        <FileText size={32} className="text-white sm:h-10 sm:w-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">InvoicesFlow</h1>
      <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
        Streamline your invoice management process with our powerful platform.
        Manage providers, track payments, and collaborate efficiently.
      </p>
      
      <div className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
        <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
          <div className="font-bold text-white text-sm sm:text-base">Providers</div>
          <div className="text-xs sm:text-sm text-white/70">Manage all your service providers</div>
        </div>
        <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
          <div className="font-bold text-white text-sm sm:text-base">Invoices</div>
          <div className="text-xs sm:text-sm text-white/70">Track and approve payments</div>
        </div>
        <div className="bg-white/10 p-3 sm:p-4 rounded-lg">
          <div className="font-bold text-white text-sm sm:text-base">Workflow</div>
          <div className="text-xs sm:text-sm text-white/70">Structured approval process</div>
        </div>
      </div>
      
      <div className="mt-6 sm:mt-10 text-white/50 text-xs sm:text-sm">
        © 2025 InvoicesFlow. All rights reserved.
      </div>
    </div>
  );
};

export default LogoBox;
