
import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import LogoBox from "@/components/auth/LogoBox";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen md:flex">
      {/* Left Side - Brand/Logo Section */}
      <div className="hidden md:flex md:w-1/2 gradient-bg p-10 items-center justify-center">
        <LogoBox />
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        {/* Mobile logo (only visible on small screens) */}
        <div className="md:hidden w-full text-center mb-8">
          <div className="inline-block p-3 rounded-full gradient-bg mb-2">
            <div className="text-white font-bold text-2xl">IF</div>
          </div>
          <h1 className="text-2xl font-bold">InvoicesFlow</h1>
        </div>
        
        <div className="w-full">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
