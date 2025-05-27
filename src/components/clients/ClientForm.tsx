
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ActiveSwitchField from "@/components/common/ActiveSwitchField";
import { BaseEntityFormProps } from "../common/EntityModal";

interface ClientFormProps extends BaseEntityFormProps {}

const ClientForm: React.FC<ClientFormProps> = ({
  onClose,
  onSuccess,
  id,
  mode,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = mode === 'edit';

  // Schema for client form validation
  const clientSchema = z.object({
    name: z.string().min(1, t("clients.nameRequired")),
    active: z.boolean().default(true),
  });

  type ClientFormValues = z.infer<typeof clientSchema>;

  // Form setup
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  // Fetch client data if in edit mode
  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      if (!id) throw new Error("Client ID is required for edit mode");

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching client:", error.message);
        throw error;
      }
      return data;
    },
    enabled: isEditMode && Boolean(id),
  });

  // Update form values when client data is loaded
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        active: client.active,
      });
    }
  }, [client, form]);

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      // Ensure name is not undefined
      const safeValues = {
        name: values.name,
        active: values.active,
      };
      
      const { data, error } = await supabase
        .from("clients")
        .insert(safeValues)
        .select();

      if (error) {
        console.error("Error creating client:", error.message);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: t("clients.created"),
      });
      form.reset();
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      if (!id) throw new Error("Client ID is required for update");

      // Ensure name is not undefined
      const safeValues = {
        name: values.name,
        active: values.active,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("clients")
        .update(safeValues)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating client:", error.message);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      toast({
        title: t("clients.updated"),
      });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Combined mutation for both create and update
  const mutation = isEditMode ? updateMutation : createMutation;
  const isPending = mutation.isPending || isLoading;

  // Form submission handler
  const onSubmit = (values: ClientFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("clients.clientName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("clients.enterName")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditMode && (
          <ActiveSwitchField
            control={form.control}
            name="active"
            description={t("clients.activeDescription")}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditMode
                ? t("common.updating")
                : t("common.creating")
              : isEditMode
              ? t("common.save")
              : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
