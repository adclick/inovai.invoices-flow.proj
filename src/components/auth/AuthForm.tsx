
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AuthCard from "./AuthCard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

type FormMode = "login" | "register";

const REGISTRATION_ENABLED = false;
const FORGOT_PASSWORD_ENABLED = false;

const AuthForm: React.FC = () => {
	const { t } = useTranslation();
	const [mode, setMode] = useState<FormMode>("login");
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);

	const { toast } = useToast();
	const navigate = useNavigate();
	const { user } = useAuth();

	// Redirect to dashboard if already logged in
	useEffect(() => {
		if (user) {
			navigate("/dashboard");
		}
	}, [user, navigate]);

	const toggleMode = () => {
		setMode(mode === "login" ? "register" : "login");
		setEmail("");
		setPassword("");
		setName("");
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (mode === "login") {
				// Handle login
				const { data, error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});

				if (error) throw error;

				toast({
					title: t("auth.welcomeBack"),
					description: t("auth.loginSuccess"),
				});

				// Redirect to dashboard
				navigate("/dashboard");
			} else {
				// Handle registration
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							full_name: name,
						},
					},
				});

				if (error) throw error;

				toast({
					title: t("auth.accountCreated"),
					description: t("auth.emailConfirmation"),
				});

				// Switch to login mode after successful registration
				setMode("login");
			}
		} catch (error: any) {
			toast({
				title: t("common.error"),
				description: error.message || t("common.error"),
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthCard>
			<div className="mb-4 sm:mb-6 text-center">
				<h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					{mode === "login" ? t("auth.signInToAccount") : t("auth.createAccount")}
				</h2>
				<p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
					{mode === "login"
						? t("auth.enterCredentials")
						: t("auth.fillForm")}
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 animate-slide-up">
				{mode === "register" && (
					<div className="form-group">
						<Label htmlFor="name" className="auth-label">{t("auth.fullName")}</Label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
								<User size={16} />
							</div>
							<Input
								id="name"
								type="text"
								placeholder="John Doe"
								className="pl-10"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
					</div>
				)}

				<div className="form-group">
					<Label htmlFor="email" className="auth-label">{t("auth.email")}</Label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
							<Mail size={16} />
						</div>
						<Input
							id="email"
							type="email"
							placeholder="name@company.com"
							className="pl-10"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
				</div>

				<div className="form-group">
					<Label htmlFor="password" className="auth-label">{t("auth.password")}</Label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
							<Lock size={16} />
						</div>
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							className="pl-10"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<button
							type="button"
							onClick={togglePasswordVisibility}
							className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
						>
							{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
				</div>

				{mode === "login" && FORGOT_PASSWORD_ENABLED && (
					<div className="flex items-center justify-end">
						<a
							href="#"
							className="text-xs sm:text-sm font-medium text-primary hover:underline dark:text-primary"
						>
							{t("auth.forgotPassword")}
						</a>
					</div>
				)}

				<Button
					type="submit"
					className="w-full mt-2"
					disabled={loading}
				>
					{loading ? (
						<div className="flex items-center justify-center">
							<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							<span className="text-sm">
								{mode === "login" ? t("auth.signingIn") : t("auth.creatingAccount")}
							</span>
						</div>
					) : (
						<span className="text-sm">{mode === "login" ? t("auth.signIn") : t("auth.signUp")}</span>
					)}
				</Button>

				{
					REGISTRATION_ENABLED &&
					<div className="text-center text-xs sm:text-sm mt-4">
						{mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
						<button
							type="button"
							onClick={toggleMode}
							className="ml-1 text-primary hover:underline font-medium"
						>
							{mode === "login" ? t("auth.signUp") : t("auth.signIn")}
						</button>
					</div>
				}
			</form>
		</AuthCard>
	);
};

export default AuthForm;
