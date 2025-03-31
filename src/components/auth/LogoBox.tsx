
import React from "react";
import { FileText } from "lucide-react";

const LogoBox: React.FC = () => {
  return (
    <div className="text-center animate-fade-in">
      <div className="inline-block p-3 rounded-full bg-white/10 mb-6">
        <FileText size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">InvoicesFlow</h1>
      <p className="text-white/80 max-w-md mx-auto">
        Streamline your invoice management process with our powerful platform.
        Manage providers, track payments, and collaborate efficiently.
      </p>
      
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="bg-white/10 p-4 rounded-lg">
          <div className="font-bold text-white">Providers</div>
          <div className="text-sm text-white/70">Manage all your service providers</div>
        </div>
        <div className="bg-white/10 p-4 rounded-lg">
          <div className="font-bold text-white">Invoices</div>
          <div className="text-sm text-white/70">Track and approve payments</div>
        </div>
        <div className="bg-white/10 p-4 rounded-lg">
          <div className="font-bold text-white">Workflow</div>
          <div className="text-sm text-white/70">Structured approval process</div>
        </div>
      </div>
      
      <div className="mt-10 text-white/50 text-sm">
        © 2024 InvoicesFlow. All rights reserved.
      </div>
    </div>
  );
};

export default LogoBox;
