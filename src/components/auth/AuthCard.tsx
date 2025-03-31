
import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AuthCard = ({ className, children, ...props }: AuthCardProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-fade-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AuthCard;
