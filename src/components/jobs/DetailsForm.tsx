
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Job } from "@/types/job";
import { z } from "zod";

// Define the form schema that matches JobForm
const jobSchema = z.object({
	campaign_id: z.string().min(1, "jobs.selectCampaign"),
	provider_id: z.string().min(1, "jobs.selectProvider"),
	manager_id: z.string().min(1, "jobs.selectManager"),
	job_type_id: z.string().min(1, "jobs.selectJobType"),
	value: z.coerce.number().min(0, "jobs.valueRequired"),
	status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"] as const),
	months: z.array(z.enum([
		"january", "february", "march", "april", "may", "june",
		"july", "august", "september", "october", "november", "december"
	] as const)).min(1, "jobs.selectMonths"),
	due_date: z.string().optional(),
	provider_message: z.string().optional(),
	public_notes: z.string().optional(),
	private_notes: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface DetailsFormProps {
	form: ReturnType<typeof useForm<JobFormValues>>;
	campaigns: any[];
	providers: any[];
	managers: any[];
	clients: any[];
	jobTypes: any[];
	months: { value: string; label: string }[];
	statusOptions: { value: string; label: string }[];
	selectedClientId: string;
	onClientChange: (clientId: string) => void;
	setSelectedCampaign: (value: string) => void;
	updateJobMutation: ReturnType<
		typeof useMutation<Job, unknown, JobFormValues, unknown>
	>;
	formSubmitHandler: (data: JobFormValues) => void;
	t: (key: string) => string;
	onCancel: () => void;
}

const DetailsForm: React.FC<DetailsFormProps> = ({
	form,
	campaigns,
	providers,
	managers,
	clients,
	jobTypes,
	months,
	statusOptions,
	selectedClientId,
	onClientChange,
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

	return (
		<form
			onSubmit={form.handleSubmit((data) => {
				formSubmitHandler(data)
			})}
			className="space-y-6"
		>
			<div className="grid grid-cols-1 gap-6">

				{/* Status Selection */}
				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("jobs.status")}</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={t("jobs.selectStatus")} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{statusOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="job_type_id"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("jobs.jobType")}</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={t("jobs.selectJobType")} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{jobTypes && jobTypes.length > 0 ? (
										jobTypes.map((jobType) => (
											<SelectItem key={jobType.id} value={jobType.id}>
												{jobType.name}
											</SelectItem>
										))
									) : (
										<SelectItem value="no-job-types" disabled>
											{t("jobs.noJobTypesAvailable")}
										</SelectItem>
									)}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Client Selection */}
				<FormField
					control={form.control}
					name="client_id"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("jobs.client")}</FormLabel>
							<Select
								value={selectedClientId}
								onValueChange={(value) => {
									onClientChange(value);
									field.onChange(value);
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
						<div className="grid gap-2">
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
														checked={field.value?.includes(month.value as any)}
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

			<div className="grid grid-cols-1 gap-6">
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

			<div className="sticky bottom-0 z-10 bg-card p-4 border-t border-border flex justify-between items-center">
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
	);
};

export default DetailsForm;
