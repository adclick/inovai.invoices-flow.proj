import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Job } from "@/types/job";
import { z } from "zod";

const jobSchema = z.object({
	campaign_id: z.string().min(1, "jobs.selectCampaign"),
	provider_id: z.string().min(1, "jobs.selectProvider"),
	manager_id: z.string().min(1, "jobs.selectManager"),
	value: z.coerce.number().min(0, "jobs.valueRequired"),
	currency: z.string().min(1, "jobs.selectCurrency"),
	status: z.string().min(1, "jobs.selectStatus"),
	paid: z.boolean().default(false),
	manager_ok: z.boolean().default(false),
	months: z.array(z.string()).min(1, "jobs.selectMonths"),
	due_date: z.string().optional(),
	public_notes: z.string().optional(),
	private_notes: z.string().optional(),
	provider_message: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface DetailsFormProps {
	form: ReturnType<typeof useForm<JobFormValues>>;
	campaigns: any[];
	providers: any[];
	managers: any[];
	clients: any[];
	months: { value: string; label: string }[];
	currencyOptions: { value: string; label: string }[];
	statusOptions: { value: string; label: string }[];
	selectedClientId: string;
	onClientChange: (clientId: string) => void;
	selectedCampaign: string;
	setSelectedCampaign: React.Dispatch<React.SetStateAction<string>>;
	updateJobMutation: ReturnType<
		typeof useMutation<Job, unknown, JobFormValues, unknown>
	>;
	t: (key: string) => string;
	onCancel: () => void;
	formSubmitHandler: (data: JobFormValues) => void;
}

const DetailsForm: React.FC<DetailsFormProps> = ({
	form,
	campaigns,
	providers,
	managers,
	clients,
	months,
	currencyOptions,
	statusOptions,
	selectedClientId,
	onClientChange,
	selectedCampaign,
	setSelectedCampaign,
	updateJobMutation,
	formSubmitHandler,
	t,
	onCancel,
}) => {
	// Filter campaigns by selected client
	const filteredCampaigns = selectedClientId 
		? campaigns.filter(campaign => campaign.client?.id === selectedClientId)
		: campaigns;

	// Handle client selection change
	const handleClientChange = (value: string) => {
		setValue("campaign_id", "");  // Reset campaign when client changes
		setValue("provider_id", "");  // Reset provider when client changes
		// Correct field name from client_id to campaign_id
		setCampaignOptions([]);
		setSelectedClient(value);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("jobs.jobDetails")}</CardTitle>
				<CardDescription>{t("jobs.updateJobDetails")}</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit((data) => formSubmitHandler(data))} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

							{/* Client Selection */}
							<FormField
								control={form.control}
								name="client_id"
								render={() => (
									<FormItem>
										<FormLabel>{t("jobs.client")}</FormLabel>
										<Select
											value={selectedClientId}
											onValueChange={(value) => {
												onClientChange(value);
											}}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("jobs.selectClient")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{clients && clients.length > 0 ? (
													clients.map((client) => (
														<SelectItem key={client.id} value={client.id}>
															{client.name}
														</SelectItem>
													))
												) : (
													<SelectItem value="no-clients" disabled>
														{t("clients.noClientsAvailable")}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							
							{/* Campaign Selection */}
							<FormField
								control={form.control}
								name="campaign_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("jobs.campaign")}</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												setSelectedCampaign(value);
											}}
											value={field.value}
											disabled={!selectedClientId}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={selectedClientId ? t("jobs.selectCampaign") : t("jobs.selectClientFirst")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{filteredCampaigns && filteredCampaigns.length > 0 ? (
													filteredCampaigns.map((campaign) => (
														<SelectItem key={campaign.id} value={campaign.id}>
															{campaign.name}
														</SelectItem>
													))
												) : (
													<SelectItem value="no-campaigns" disabled>
														{selectedClientId ? t("campaigns.noCampaignsForClient") : t("campaigns.selectClientFirst")}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="provider_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("jobs.provider")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("jobs.selectProvider")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{providers && providers.length > 0 ? (
													providers.map((provider) => (
														<SelectItem key={provider.id} value={provider.id}>
															{provider.name}
														</SelectItem>
													))
												) : (
													<SelectItem value="no-providers" disabled>
														{t("providers.noProvidersAvailable")}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="manager_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("jobs.manager")}</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder={t("jobs.selectManager")} />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{managers && managers.length > 0 ? (
													managers.map((manager) => (
														<SelectItem key={manager.id} value={manager.id}>
															{manager.name}
														</SelectItem>
													))
												) : (
													<SelectItem value="no-managers" disabled>
														{t("managers.noManagersAvailable")}
													</SelectItem>
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="value"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("jobs.value")}</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												step="0.01"
												placeholder={t("jobs.value")}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="due_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("jobs.dueDate")}</FormLabel>
										<FormControl>
											<Input
												type="date"
												placeholder={t("jobs.dueDate")}
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="months"
							render={() => (
								<FormItem>
									<div className="mb-4">
										<FormLabel>{t("jobs.months")}</FormLabel>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{t("jobs.selectMonthsDescription")}
										</p>
									</div>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
										{months.map((month) => (
											<FormField
												key={month.value}
												control={form.control}
												name="months"
												render={({ field }) => {
													return (
														<FormItem
															className="flex flex-row items-start space-x-3 space-y-0"
														>
															<FormControl>
																<Checkbox
																	checked={field.value?.includes(month.value)}
																	onCheckedChange={(checked) =>
																		checked
																			? field.onChange([...field.value, month.value])
																			: field.onChange(
																				field.value?.filter(
																					(value) => value !== month.value
																				)
																			)
																	}
																/>
															</FormControl>
															<FormLabel className="font-normal cursor-pointer">
																{month.label}
															</FormLabel>
														</FormItem>
													);
												}}
											/>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="public_notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("jobs.publicNotes")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("jobs.publicNotesPlaceholder")}
												className="resize-none"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="private_notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("jobs.privateNotes")}</FormLabel>
										<FormControl>
											<Textarea
												placeholder={t("jobs.privateNotesPlaceholder")}
												className="resize-none"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex justify-between pt-4">
							<Button variant="outline" onClick={onCancel}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								{t("common.back")}
							</Button>
							<div className="flex justify-end space-x-4">
								<Button type="button" variant="outline" onClick={onCancel}>
									{t("common.cancel")}
								</Button>
								<Button type="submit" disabled={updateJobMutation.isPending}>
									{updateJobMutation.isPending
										? t("common.updating")
										: t("jobs.updateJob")}
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
};

export default DetailsForm;
