import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

type ProviderDocumentUploaderProps = {
  jobId: string;
  token: string;
  existingDocuments: string[] | null;
  onUploadComplete: (newDocuments: string[]) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
};

type FileUploadState = {
  id: string;
  file: File;
  progress: number;
  status: "idle" | "uploading" | "completed" | "error";
  errorMessage?: string;
  url?: string;
};

export const ProviderDocumentUploader: React.FC<ProviderDocumentUploaderProps> = ({
  jobId,
  token,
  existingDocuments = [],
  onUploadComplete,
  isSubmitting,
  setIsSubmitting
}) => {
  const { t } = useTranslation();
  const [uploadingFiles, setUploadingFiles] = useState<FileUploadState[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      
      const newFileStates = filesArray.map(file => ({
        id: uuidv4(),
        file,
        progress: 0,
        status: "idle" as const,
      }));

      setUploadingFiles(prev => [...prev, ...newFileStates]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processUploads = async () => {
    if (uploadingFiles.length === 0) {
      toast.error(t("jobs.pleaseAddFiles"));
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const results = await Promise.all(
        uploadingFiles.map(fileState => handleFileUpload(fileState))
      );
      
      // Check if any uploads failed
      if (results.some(result => !result.success)) {
        toast.error(t("jobs.someFilesFailed"));
        setIsSubmitting(false);
        return false;
      }
      
      // Get all URLs from successful uploads
      const newUrls = results
        .filter(result => result.success && result.url)
        .map(result => result.url as string);
      
      // Use the final document list provided by the server
      onUploadComplete(newUrls);
      
      toast.success(t("jobs.filesUploadedSuccessfully"));
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Upload process error:", error);
      toast.error(t("jobs.uploadProcessFailed"));
      setIsSubmitting(false);
      return false;
    }
  };

  const handleFileUpload = async (fileState: FileUploadState): Promise<{success: boolean, url?: string}> => {
    const { file, id } = fileState;

    // Update status to uploading
    setUploadingFiles(prev =>
      prev.map(fs => fs.id === id ? { ...fs, status: "uploading" as const } : fs)
    );

    try {
      // Start with 0 progress
      setUploadingFiles(prev =>
        prev.map(fs => fs.id === id ? { ...fs, progress: 0 } : fs)
      );

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobId', jobId);
      formData.append('token', token);

      // Upload file through edge function
      const { data, error } = await supabase.functions.invoke('upload-provider-document', {
        body: formData,
      });

      if (error || !data.success) {
        throw error || new Error(data.error || 'Upload failed');
      }

      // Set progress to 100% after successful upload
      setUploadingFiles(prev =>
        prev.map(fs => fs.id === id ? { ...fs, progress: 100 } : fs)
      );

      // Update file status to completed with the URL returned from the server
      setUploadingFiles(prev =>
        prev.map(fs => fs.id === id ? {
          ...fs,
          status: "completed" as const,
          url: data.fileUrl,
        } : fs)
      );

      return { success: true, url: data.fileUrl };

    } catch (error: any) {
      console.error("Upload error:", error);

      // Update file status to error
      setUploadingFiles(prev =>
        prev.map(fs => fs.id === id ? {
          ...fs,
          status: "error" as const,
          errorMessage: error.message || "Upload failed",
        } : fs)
      );

      return { success: false };
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
      {/* Drag & Drop Area */}
      <div 
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">{t("jobs.dropFilesHere")}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("jobs.uploadAnyDocument")}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          disabled={isSubmitting}
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
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    {t("common.ready")}
                  </span>
                )}
                {fileState.status === 'error' && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {t("common.failed")}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(fileState.id)}
                  disabled={isSubmitting}
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

      <Button 
        className="mt-4 w-full" 
        onClick={processUploads} 
        disabled={isSubmitting || uploadingFiles.length === 0}
      >
        {isSubmitting ? t("common.uploading") : t("jobs.uploadFiles")}
      </Button>
    </div>
  );
};
