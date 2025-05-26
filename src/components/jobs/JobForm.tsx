import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BaseEntityFormProps } from "../common/EntityModal";
import { Form } from "@/components/ui/form";
import DetailsForm from "./DetailsForm";
import { Job } from "@/types/job";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

// Form schema with validation
const jobSchema = z.object({
	campaign_id: z.string().min(1, "jobs.selectCampaign"),
	provider_id: z.string().min(1, "jobs.selectProvider"),
	manager_id: z.string().min(1, "jobs.selectManager"),
	job_type_id: z.string().min(1, "jobs.selectJobType"),
	value: z.coerce.number().min(0, "jobs.valueRequired"),
	status: z.enum(["draft", "active", "pending_invoice", "pending_validation", "pending_payment", "paid"]),
	paid: z.boolean().default(false),
	manager_ok: z.boolean().default(false),
	months: z.array(z.enum([
		"january", "february", "march", "april", "may", "june",
		"july", "august", "september", "october", "november", "december"
	])).min(1, "jobs.selectMonths"),
	due_date: z.string().optional(),
	public_notes: z.string().optional(),
	private_notes: z.string().optional(),
	provider_message: z.string().optional(),
});

type FormValues = z.infer<typeof jobSchema>;
type JobFormValues = z.infer<typeof jobSchema>;

// Define the expected payload structure for Supabase insert
type SupabaseJobInsertPayload = {
	campaign_id: string;
	provider_id: string;
	manager_id: string;
	job_type_id: string;
	value: number;
	status: "draft" | "active" | "pending_invoice" | "pending_validation" | "pending_payment" | "paid";
	paid: boolean;
	manager_ok: boolean;
	months: Array<"january" | "february" | "march" | "april" | "may" | "june" | "july" | "august" | "september" | "october" | "november" | "december">;
	due_date?: string;
	public_notes?: string;
	private_notes?: string;
	provider_message?: string;
	// Optional fields that Supabase might auto-fill or allow null
	created_at?: string;
	id?: string;
	currency?: "euro" | "usd" | "gbp"; // Kept as optional per Supabase type hint
	documents?: string[];
};

// Move ConfirmUpdateModal outside of EditJob component
interface ConfirmUpdateModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	onCancel: () => void;
	pendingFormData: JobFormValues | null;
	providerMessage: string;
	onProviderMessageChange: (message: string) => void;
	t: (key: string) => string;
}

const ConfirmUpdateModal: React.FC<ConfirmUpdateModalProps> = ({
	isOpen,
	onOpenChange,
	onConfirm,
	onCancel,
	pendingFormData,
	providerMessage,
	onProviderMessageChange,
	t,
}) => (
	<Dialog open={isOpen} onOpenChange={onOpenChange}>
		<DialogContent className="max-w-lg">
			<DialogHeader>
				<DialogTitle>{t("jobs.confirmJobUpdate")}</DialogTitle>
				<DialogDescription>
					{t("jobs.confirmUpdateMessage")}
				</DialogDescription>

			</DialogHeader>

			{pendingFormData && pendingFormData.status === "pending_invoice" && (
				<div className="mt-4">
					<label
						htmlFor="providerMessage"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
					>
						{t("jobs.messageToProviderLabel")}
					</label>
					<textarea
						id="providerMessage"
						rows={4}
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-slate-800 dark:text-white"
						value={providerMessage}
						onChange={(e) => onProviderMessageChange(e.target.value)}
					/>
				</div>
			)}

			<DialogFooter className="flex justify-end space-x-2 mt-6">
				<Button
					variant="outline"
					onClick={onCancel}
				>
					{t("common.cancel")}
				</Button>
				<Button onClick={onConfirm}>
					{t("common.confirm")}
				</Button>
			</DialogFooter>

			<DialogClose />
		</DialogContent>
	</Dialog>
);

const JobForm: React.FC<BaseEntityFormProps> = ({
	id,
	mode,
	onClose,
	onSuccess
}) => {
	const { t } = useTranslation();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const isEditMode = mode === "edit";
	const [selectedClientId, setSelectedClientId] = useState("");
	const [selectedCampaign, setSelectedCampaign] = useState("");
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [pendingFormData, setPendingFormData] = useState<JobFormValues | null>(null);
	const [providerMessageForModal, setProviderMessageForModal] = useState<string>("");

	// Handle confirmation modal cancel
	const handleConfirmCancel = () => {
		setIsConfirmOpen(false);
		setPendingFormData(null);
		setProviderMessageForModal("");
	};

	// Handle confirmation modal confirm save
	const handleConfirmSave = () => {
		if (!pendingFormData) {
			setIsConfirmOpen(false);
			return;
		}
		// If status is pending_invoice, override provider_message with modal value
		const saveData = {
			...pendingFormData,
			provider_message: pendingFormData.status === "pending_invoice" ? providerMessageForModal : pendingFormData.provider_message,
		};
		updateJobMutation.mutate(saveData);
		setIsConfirmOpen(false);
	};

	// Setup form with default values
	const form = useForm<FormValues>({
		resolver: zodResolver(jobSchema),
		defaultValues: {
			campaign_id: "",
			provider_id: "",
			manager_id: "",
			job_type_id: "",
			value: 0,
			status: "draft",
			paid: false,
			manager_ok: false,
			months: [],
			due_date: "",
			public_notes: "",
			private_notes: "",
		},
	});

	// Fetch clients for selection
	const { data: clients, isLoading: isClientsLoading } = useQuery({
		queryKey: ["clients"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("clients")
				.select("id, name")
				.order("name");

			if (error) throw error;
			return data;
		},
	});

	// Fetch campaigns
	const { data: campaigns, isLoading: isCampaignsLoading } = useQuery({
		queryKey: ["campaigns"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("campaigns")
				.select("id, name, client_id, client:client_id(id, name)")
				.order("name");

			if (error) throw error;
			return data;
		},
	});

	// Fetch providers
	const { data: providers, isLoading: isProvidersLoading } = useQuery({
		queryKey: ["providers"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("providers")
				.select("id, name")
				.eq("active", true)
				.order("name");

			if (error) throw error;
			return data;
		},
	});

	// Fetch job types
	const { data: jobTypes, isLoading: isJobTypesLoading } = useQuery({
		queryKey: ["jobTypes"],
		queryFn: async () => {
			const { data, error } = await supabase.from("job_type").select("id, name");

			if (error) throw error;
			return data;
		},
	});

	// Fetch managers
	const { data: managers, isLoading: isManagersLoading } = useQuery({
		queryKey: ["managers"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("managers")
				.select("id, name")
				.eq("active", true)
				.order("name");

			if (error) throw error;
			return data;
		},
	});


	// Update job mutation
	const updateJobMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			const { data, error } = await supabase
				.from("jobs")
				.update(values)
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;
			return data as Job;
		},
		onSuccess: async (data, values) => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			queryClient.invalidateQueries({ queryKey: ["job", id] });
			toast({
				title: t("jobs.jobUpdated"),
				description: t("jobs.jobUpdatedDescription"),
			});
			onSuccess?.();
			onClose();
		},
		onError: (error) => {
			console.error("Error updating job:", error);
			toast({
				title: t("common.error"),
				description: t("jobs.jobUpdateError"),
				variant: "destructive",
			});
		},
	});

	// Create job mutation
	const createJobMutation = useMutation({
		mutationFn: async (values: FormValues) => {
			const { data, error } = await supabase
				.from("jobs")
				.insert([values as SupabaseJobInsertPayload]) // Cast values to the explicit Supabase insert type
				.select()
				.single();

			if (error) throw error;
			return data as Job;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			toast({
				title: t("jobs.jobCreated"),
				description: t("jobs.jobCreatedDescription"),
			});
			onSuccess?.();
			onClose();
		},
		onError: (error) => {
			console.error("Error creating job:", error);
			toast({
				title: t("common.error"),
				description: t("jobs.jobCreateError"),
				variant: "destructive",
			});
		},
	});

	// Form submission handler
	const onSubmit = (values: FormValues) => {
		console.log("values", values);
		if (isEditMode && id) {
			updateJobMutation.mutate(values);
		} else {
			createJobMutation.mutate(values);
		}
	};

	const handleClientChange = (clientId: string) => {
		setSelectedClientId(clientId);
		setSelectedCampaign("");
		form.setValue("campaign_id", "");
	};

  // Fetch job data if in edit mode
  useQuery({
		queryKey: ["job", id],
    queryFn: async () => {
			if (!id) return null;
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Find client ID from campaign
      if (campaigns) {
        const campaign = campaigns.find(c => c.id === data.campaign_id);
        if (campaign && campaign.client) {
          setSelectedClientId(campaign.client.id);
        }
      }
      
      setSelectedCampaign(data.campaign_id);
      
      // Fill form with job data
      form.reset({
        campaign_id: data.campaign_id,
        provider_id: data.provider_id,
        manager_id: data.manager_id,
				job_type_id: data.job_type_id,
        value: data.value,
        status: data.status,
        paid: data.paid,
        manager_ok: data.manager_ok,
        months: data.months || [],
        due_date: data.due_date || "",
        public_notes: data.public_notes || "",
        private_notes: data.private_notes || "",
      });
      
      return data;
    },
    enabled: isEditMode && !!id && !!campaigns,
  });

	
	// Status options
	const statusOptions = [
		{ value: "draft", label: t("jobs.draft") },
		{ value: "active", label: t("jobs.active") },
		{ value: "pending_invoice", label: t("jobs.pendingInvoice") },
		{ value: "pending_validation", label: t("jobs.pendingValidation") },
		{ value: "pending_payment", label: t("jobs.pendingPayment") },
		{ value: "paid", label: t("jobs.paid") },
	];

	// Months options
	const months = [
		{ value: "january", label: t("common.january") },
		{ value: "february", label: t("common.february") },
		{ value: "march", label: t("common.march") },
		{ value: "april", label: t("common.april") },
		{ value: "may", label: t("common.may") },
		{ value: "june", label: t("common.june") },
		{ value: "july", label: t("common.july") },
		{ value: "august", label: t("common.august") },
		{ value: "september", label: t("common.september") },
		{ value: "october", label: t("common.october") },
		{ value: "november", label: t("common.november") },
		{ value: "december", label: t("common.december") },
	];

	return (
		<Form {...form}>
			<DetailsForm
				form={form}
				campaigns={campaigns || []}
				providers={providers || []}
				managers={managers || []}
				clients={clients || []}
				jobTypes={jobTypes || []}
				months={months}
				statusOptions={statusOptions}
				selectedClientId={selectedClientId}
				onClientChange={handleClientChange}
				setSelectedCampaign={setSelectedCampaign}
				updateJobMutation={updateJobMutation}
				formSubmitHandler={onSubmit}
				t={t}
				onCancel={onClose}
			/>
			<ConfirmUpdateModal
				isOpen={isConfirmOpen}
				onOpenChange={setIsConfirmOpen}
				onConfirm={handleConfirmSave}
				onCancel={handleConfirmCancel}
				pendingFormData={pendingFormData}
				providerMessage={providerMessageForModal}
				onProviderMessageChange={setProviderMessageForModal}
				t={t}
			/>
		</Form>
	);
};

export default JobForm;
