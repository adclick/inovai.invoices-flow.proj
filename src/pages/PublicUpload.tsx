import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProviderDocumentUploader } from "@/components/jobs/ProviderDocumentUploader";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/language/LanguageSelector";

const PublicUpload = () => {
	const { t } = useTranslation();
	const { jobId, token } = useParams<{ jobId: string; token: string }>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadComplete, setUploadComplete] = useState(false);

	// Validate token and jobId using the edge function
	const { data, isLoading, error } = useQuery({
		queryKey: ["public-job-validation", jobId, token],
		queryFn: async () => {
			if (!jobId || !token) return { valid: false };

			try {
				const { data, error } = await supabase.functions.invoke('validate-job-token', {
					body: { jobId, token },
				});

				if (error) throw error;
				
				// Add additional check for expired due date
				if (data.valid && data.job?.due_date) {
					const dueDate = new Date(data.job.due_date);
					const now = new Date();
					
					if (dueDate < now) {
						console.log("Job due date has expired:", dueDate);
						return { 
							valid: false, 
							expired: true,
							message: t("jobs.uploadLinkExpired") 
						};
					}
				}
				
				return data;
			} catch (error) {
				console.error("Error validating token:", error);
				return { valid: false };
			}
		},
		retry: false,
	});

	const job = data?.valid ? data.job : null;
	const clientName = job?.clients?.name || "Client";
	const campaignName = job?.campaigns?.name || "Campaign";
	const providerName = job?.providers?.name || "Provider";
	const formattedDueDate = job?.due_date
		? new Date(job.due_date).toLocaleDateString()
		: "No deadline";

	const handleUploadComplete = (newDocuments: string[]) => {
		setUploadComplete(true);
		toast.success(t("jobs.documentsUploadedSuccessfully"));
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
				<div className="container max-w-3xl mx-auto px-4 py-16">
					<Card>
						<CardContent className="pt-6">
							<div className="flex justify-center py-8">
								<div className="animate-pulse text-primary">{t("common.loading")}</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (error || !data?.valid || !job) {
		return (
			<div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
				<div className="container max-w-3xl mx-auto px-4 py-16">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center text-destructive">
								<AlertTriangle className="mr-2 h-5 w-5" />
								{data?.expired ? t("jobs.uploadLinkExpired") : t("jobs.uploadLinkInvalid")}
							</CardTitle>
							<CardDescription>
								{t("jobs.uploadLinkInvalidDescription")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-slate-600 dark:text-slate-400">
								{t("jobs.uploadLinkInvalidDescription")}
							</p>
							<ul className="list-disc pl-5 mt-2 text-slate-600 dark:text-slate-400">
								<li>{data?.expired ? t("jobs.dueDatePassed") : t("jobs.jobNoLongerAccepting")}</li>
								<li>{t("jobs.urlIncorrect")}</li>
								<li>{t("jobs.linkExpired")}</li>
							</ul>
							<Button
								className="mt-6"
								onClick={() => window.location.href = "/"}
								variant="outline"
							>
								{t("common.returnToHomepage")}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (uploadComplete) {
		return (
			<div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
				<div className="container max-w-3xl mx-auto px-4 py-16">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center text-green-600 dark:text-green-400">
								<CheckCircle className="mr-2 h-5 w-5" />
								{t("jobs.uploadComplete")}
							</CardTitle>
							<CardDescription>
								{t("jobs.documentsUploadedSuccessfully")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-slate-600 dark:text-slate-400">
								{t("jobs.thankYouForSubmission")}
							</p>
							<div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-sm text-green-700 dark:text-green-400">
								{t("jobs.youMayCloseWindow")}
							</div>
							<Button
								className="mt-6"
								onClick={() => window.location.href = "/"}
								variant="outline"
							>
								{t("common.returnToHomepage")}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<div className="container max-w-3xl mx-auto px-4 py-16">
				<div className="flex items-center justify-center mb-8">
					<div className="p-2.5 rounded-full bg-white/10 dark:bg-primary/20 mr-2">
						<div className="text-primary font-bold text-lg">IF</div>
					</div>
					<span className="text-xl font-semibold text-slate-800 dark:text-white">InvoicesFlow</span>
				</div>

				<Card>
					<CardHeader>
						<div className="flex justify-between">
							<div>
								<CardTitle>{t("jobs.uploadDocuments")}</CardTitle>
								<CardDescription>
									{t("jobs.uploadDocumentsFor", { clientName, campaignName })}
								</CardDescription>
							</div>
							<LanguageSelector />
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("common.client")}</span>
									<p className="font-medium text-slate-900 dark:text-white mt-1">{clientName}</p>
								</div>
								<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("common.campaign")}</span>
									<p className="font-medium text-slate-900 dark:text-white mt-1">{campaignName}</p>
								</div>
								<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
									<span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("common.provider")}</span>
									<p className="font-medium text-slate-900 dark:text-white mt-1">{providerName}</p>
								</div>
								<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md flex items-start">
									<Calendar className="h-4 w-4 text-primary mt-0.5 mr-1.5" />
									<div>
										<span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("common.dueDate")}</span>
										<p className="font-medium text-slate-900 dark:text-white mt-1">{formattedDueDate}</p>
									</div>
								</div>
							</div>

							{job.public_notes && (
								<div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-md">
									<h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">{t("common.instructions")}:</h4>
									<p className="text-sm text-slate-600 dark:text-slate-300">{job.public_notes}</p>
								</div>
							)}
						</div>

						<div className="mt-8">
							<h3 className="text-lg font-medium mb-4">{t("jobs.uploadFiles")}</h3>
							<ProviderDocumentUploader
								jobId={job.id}
								token={token || ''}
								existingDocuments={job.documents}
								onUploadComplete={handleUploadComplete}
								isSubmitting={isSubmitting}
								setIsSubmitting={setIsSubmitting}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default PublicUpload;
