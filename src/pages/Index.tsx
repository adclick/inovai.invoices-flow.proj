
import React, { useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import LogoBox from "@/components/auth/LogoBox";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LanguageSelector from "@/components/language/LanguageSelector";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";

const THEME_TOGGLE_ACTIVE = true;

const Index: React.FC = () => {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		if (user && !isLoading) {
			navigate("/dashboard");
		}
	}, [user, isLoading, navigate]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center dark:bg-slate-900">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col md:flex-row dark:bg-slate-900">
			{/* Left Side - Brand/Logo Section */}
			<div className="hidden md:flex md:w-1/2 gradient-bg dark:bg-none border-r border-r-gray p-4 sm:p-6 lg:p-10 items-center justify-center">
				<LogoBox />
			</div>

			{/* Right Side - Auth Form */}
			<div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 h-lvh relative">
				{/* Theme toggle and Language selector in top-right corner */}
				<div className="absolute top-4 right-4 flex items-center space-x-2">
					<LanguageSelector />
					<ThemeToggle />
				</div>

				{/* Mobile logo (only visible on small screens) */}
				<div className="md:hidden w-full text-center mb-6">
					<div className="inline-block p-3 rounded-full gradient-bg mb-2">
						<div className="text-white font-bold text-2xl">IF</div>
					</div>
					<h1 className="text-2xl font-bold dark:text-white">InvoicesFlow</h1>
				</div>

				<div className="w-full max-w-md px-4 sm:px-0">
					<AuthForm />
					
					{/* About link */}
					<div className="text-center mt-6">
						<Link to="/about" className="inline-flex items-center text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
							<HelpCircle className="h-4 w-4 mr-1" />
							{t("about.howItWorks")}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Index;
