
import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import LogoBox from "@/components/auth/LogoBox";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Brand/Logo Section */}
      <div className="hidden md:flex md:w-1/2 gradient-bg p-4 sm:p-6 lg:p-10 items-center justify-center">
        <LogoBox />
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6">
        {/* Mobile logo (only visible on small screens) */}
        <div className="md:hidden w-full text-center mb-6">
          <div className="inline-block p-3 rounded-full gradient-bg mb-2">
            <div className="text-white font-bold text-2xl">IF</div>
          </div>
          <h1 className="text-2xl font-bold">InvoicesFlow</h1>
        </div>
        
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
