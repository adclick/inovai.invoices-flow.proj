
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseEntityMutationProps {
  tableName: string;
  entityName: string;
  queryKey: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

export const useEntityMutation = ({
  tableName,
  entityName,
  queryKey,
  onSuccess,
  onClose,
  onError,
}: UseEntityMutationProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data, error } = await supabase
        .from(tableName as any)
        .insert(values)
        .select()
        .single();

      if (error) {
        console.error(`Error creating ${entityName}:`, error.message);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({
        title: t(`${entityName}.created`),
      });
      onSuccess?.();
      onClose?.();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: String(error),
        variant: "destructive",
      });
      onError?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const updateData = {
        ...values,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(tableName as any)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${entityName}:`, error.message);
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      queryClient.invalidateQueries({ queryKey: [entityName, id] });
      toast({
        title: t(`${entityName}.updated`),
      });
      onSuccess?.();
      onClose?.();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: String(error),
        variant: "destructive",
      });
      onError?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq("id", id);

      if (error) {
        console.error(`Error deleting ${entityName}:`, error.message);
        throw error;
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error(`Error deleting ${entityName}:`, error);
      onError?.();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
