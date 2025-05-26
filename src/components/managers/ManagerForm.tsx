
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

interface ManagerFormProps extends BaseEntityFormProps {}

const ManagerForm: React.FC<ManagerFormProps> = ({ 
  onClose, 
  onSuccess, 
  id, 
  mode 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = mode === 'edit';

  // Schema for manager form validation
  const managerSchema = z.object({
    name: z.string().min(1, t("managers.nameRequired")),
    email: z.string().email(t("common.invalidEmail")),
    active: z.boolean().default(true),
  });

  type ManagerFormValues = z.infer<typeof managerSchema>;

  // Form setup
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      name: "",
      email: "",
      active: true,
    },
  });

  // Fetch manager data if in edit mode
  const { data: manager, isLoading } = useQuery({
    queryKey: ["manager", id],
    queryFn: async () => {
      if (!id) throw new Error("Manager ID is required for edit mode");

      const { data, error } = await supabase
        .from("managers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching manager:", error.message);
        throw error;
      }
      return data;
    },
    enabled: isEditMode && Boolean(id),
  });

  // Update form values when manager data is loaded
  useEffect(() => {
    if (manager) {
      form.reset({
        name: manager.name,
        email: manager.email,
        active: manager.active,
      });
    }
  }, [manager, form]);

  // Create manager mutation
  const createMutation = useMutation({
    mutationFn: async (values: ManagerFormValues) => {
      // Make sure email and name are not undefined
      const safeValues = {
        name: values.name,
        email: values.email,
        active: values.active
      };
      
      const { data, error } = await supabase
        .from("managers")
        .insert(safeValues)
        .select();

      if (error) {
        console.error("Error creating manager:", error.message);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      toast({
        title: t("managers.created"),
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

  // Update manager mutation
  const updateMutation = useMutation({
    mutationFn: async (values: ManagerFormValues) => {
      if (!id) throw new Error("Manager ID is required for update");

      // Make sure email and name are not undefined
      const safeValues = {
        name: values.name,
        email: values.email,
        active: values.active,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("managers")
        .update(safeValues)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating manager:", error.message);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      queryClient.invalidateQueries({ queryKey: ["manager", id] });
      toast({
        title: t("managers.updated"),
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
  const onSubmit = (values: ManagerFormValues) => {
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
              <FormLabel>{t("managers.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("managers.enterName")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.email")}</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder={t("common.enterEmail")} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditMode && (
          <ActiveSwitchField
            control={form.control}
            name="active"
            description={t("managers.activeDescription")}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
          >
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

export default ManagerForm;
