
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useSecureStorage = (bucketName: string = 'job-documents') => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, fileName }: { file: File; fileName: string }) => {
      if (!user || !session) {
        throw new Error("Authentication required");
      }

      // Upload file with proper authentication
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Log security event
      await supabase.rpc('log_security_event', {
        p_action: 'file_uploaded',
        p_resource_type: 'storage',
        p_resource_id: fileName,
        p_details: { 
          bucket: bucketName,
          file_size: file.size,
          file_type: file.type
        }
      });

      return data;
    },
    onSuccess: () => {
      toast({
        title: "File uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['storage', bucketName] });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const getSecureUrl = async (filePath: string) => {
    if (!user || !session) {
      throw new Error("Authentication required");
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Failed to create signed URL:', error);
      throw error;
    }

    return data.signedUrl;
  };

  const deleteFile = useMutation({
    mutationFn: async (filePath: string) => {
      if (!user || !session) {
        throw new Error("Authentication required");
      }

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        throw error;
      }

      // Log security event
      await supabase.rpc('log_security_event', {
        p_action: 'file_deleted',
        p_resource_type: 'storage',
        p_resource_id: filePath,
        p_details: { bucket: bucketName }
      });

      return filePath;
    },
    onSuccess: () => {
      toast({
        title: "File deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['storage', bucketName] });
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      toast({
        title: "Delete failed",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  return {
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    getSecureUrl,
    deleteFile: deleteFile.mutate,
    isDeleting: deleteFile.isPending,
  };
};
