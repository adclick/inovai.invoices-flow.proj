import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileIcon, Upload, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

type DocumentUploaderProps = {
	jobId: string;
	existingDocuments: string[] | null;
	onDocumentsUpdated: (newDocuments: string[]) => void;
};

type FileUploadState = {
	id: string;
	file: File;
	progress: number;
	status: "idle" | "uploading" | "completed" | "error";
	errorMessage?: string;
	url?: string;
};

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
	jobId,
	existingDocuments = [],
	onDocumentsUpdated,
}) => {
	const { t } = useTranslation();
	const [uploadingFiles, setUploadingFiles] = useState<FileUploadState[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;

		const filesArray = Array.from(e.target.files);

		const newFileStates = filesArray.map(file => ({
			id: uuidv4(),
			file,
			progress: 0,
			status: "idle" as const,
		}));

		setUploadingFiles(prev => [...prev, ...newFileStates]);

		// Start uploading each file
		newFileStates.forEach(fileState => {
			handleFileUpload(fileState);
		});

		// Clear the input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleFileUpload = async (fileState: FileUploadState) => {
		const { file, id } = fileState;

		// Update status to uploading
		setUploadingFiles(prev =>
			prev.map(fs => fs.id === id ? { ...fs, status: "uploading" as const } : fs)
		);

		try {
			// Generate a unique file path
			const fileExt = file.name.split('.').pop();
			const fileName = `${jobId}/${uuidv4()}.${fileExt}`;
			const filePath = fileName;

			// Start with 0 progress
			setUploadingFiles(prev =>
				prev.map(fs => fs.id === id ? { ...fs, progress: 0 } : fs)
			);

			// Upload to Supabase Storage
			const { error } = await supabase.storage
				.from('job-documents')
				.upload(filePath, file, {
					cacheControl: '3600',
					upsert: false
				});

			if (error) throw error;

			// Set progress to 100% after successful upload
			setUploadingFiles(prev =>
				prev.map(fs => fs.id === id ? { ...fs, progress: 100 } : fs)
			);

			// Get the public URL for the file
			const { data: { publicUrl } } = supabase.storage
				.from('job-documents')
				.getPublicUrl(filePath);

			const {
				data: webhookResponseData,
				error: webhookError
			} = await supabase.functions.invoke('job-document-uploader-webhook', {
				body: {
					"job_id": jobId,
					"file_url": publicUrl,
					"file_name": fileName,
					"timestamp": Date.now()
				},
			});

			const { data: webhookFileUrl } = webhookResponseData;

			if (webhookError) throw error;

			// Update file status to completed
			setUploadingFiles(prev =>
				prev.map(fs => fs.id === id ? {
					...fs,
					status: "completed" as const,
					url: webhookFileUrl,
				} : fs)
			);

			// Update job documents in database
			const newDocuments = [...(existingDocuments || []), webhookFileUrl];

			const { error: updateError } = await supabase
				.from('jobs')
				.update({ documents: newDocuments })
				.eq('id', jobId);

			if (updateError) {
				console.error("Error updating job documents:", updateError);
				throw new Error("Failed to update job documents");
			}

			// Call the callback to update documents in parent component
			onDocumentsUpdated(newDocuments);

			toast({
				title: t("common.success"),
				description: t("jobs.documentUploaded", { fileName: file.name }),
			});

		} catch (error: any) {
			console.error("Upload error:", error);

			// Update file status to error
			setUploadingFiles(prev =>
				prev.map(fs => fs.id === id ? {
					...fs,
					status: "error" as const,
					errorMessage: error.message || t("jobs.uploadFailed"),
				} : fs)
			);

			toast({
				title: t("common.error"),
				description: error.message || t("jobs.uploadFailedTryAgain"),
				variant: "destructive",
			});
		}
	};

	const removeFile = (id: string) => {
		setUploadingFiles(prev => prev.filter(fs => fs.id !== id));
	};

	const openFileDialog = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">{t("jobs.documents")}</h3>
				<Button
					onClick={openFileDialog}
					variant="outline"
					size="sm"
				>
					<Upload className="h-4 w-4 mr-2" />
					{t("common.upload")}
				</Button>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					className="hidden"
					multiple
					accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
				/>
			</div>

			{/* File upload list */}
			{uploadingFiles.length > 0 && (
				<div className="space-y-2 mt-4">
					{uploadingFiles.map((fileState) => (
						<div
							key={fileState.id}
							className="flex items-center justify-between p-3 border rounded-md bg-background"
						>
							<div className="flex items-center space-x-3 overflow-hidden">
								<FileIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
								<div className="truncate flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{fileState.file.name}</p>
									<p className="text-xs text-muted-foreground">
										{(fileState.file.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{fileState.status === 'uploading' && (
									<div className="w-24">
										<Progress value={fileState.progress} className="h-2" />
									</div>
								)}
								{fileState.status === 'completed' && (
									<span className="text-xs text-green-600 font-medium">
										{t("common.uploaded")}
									</span>
								)}
								{fileState.status === 'error' && (
									<span className="text-xs text-red-600 font-medium">
										{t("common.failed")}
									</span>
								)}
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => removeFile(fileState.id)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Display error if any file failed */}
			{uploadingFiles.some(file => file.status === 'error') && (
				<Alert variant="destructive" className="mt-4">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{t("jobs.someFilesFailed")}
					</AlertDescription>
				</Alert>
			)}

			{/* Display existing documents */}
			{existingDocuments && existingDocuments.length > 0 && (
				<div className="mt-4">
					<h4 className="text-sm font-medium mb-2">{t("jobs.uploadedDocuments")}</h4>
					<div className="space-y-2">
						{existingDocuments.map((docUrl, index) => {
							// Extract filename from the URL
							const fileName = decodeURIComponent(docUrl.split('/').pop() || `Document ${index + 1}`);
							const displayName = fileName.substring(fileName.indexOf('-') + 1);

							return (
								<div
									key={index}
									className="flex items-center justify-between p-2.5 border rounded-md bg-muted/30"
								>
									<div className="flex items-center space-x-3 overflow-hidden">
										<FileIcon className="h-4 w-4 flex-shrink-0 text-primary" />
										<span className="text-sm truncate">{docUrl}</span>
									</div>
									<a
										href={docUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-primary hover:underline flex items-center gap-1"
									>
										{t("common.view")} <ExternalLink className="h-3 w-3" />
									</a>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};
