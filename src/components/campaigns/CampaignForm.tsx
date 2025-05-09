
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BaseEntityFormProps } from "../common/EntityModal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ActiveSwitchField from "../common/ActiveSwitchField";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  client_id: z.string().min(1, { message: "Client is required" }),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, { message: "Duration must be at least 1 month" }),
  estimated_cost: z.coerce.number().optional(),
  revenue: z.coerce.number().optional(),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const CampaignForm: React.FC<BaseEntityFormProps> = ({
  id,
  mode,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit";

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      client_id: "",
      description: "",
      duration: 1,
      estimated_cost: 0,
      revenue: 0,
      active: true,
    },
  });

  // Fetch clients for selection
  const { data: clients, isLoading: clientsLoading } = useQuery({
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

  // Fetch campaign data if in edit mode
  const { isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Fill form with campaign data
      form.reset({
        name: data.name,
        client_id: data.client_id,
        description: data.description || "",
        duration: data.duration,
        estimated_cost: data.estimated_cost || 0,
        revenue: data.revenue || 0,
        active: data.active,
      });
      
      return data;
    },
    enabled: isEditMode && !!id,
  });

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert([values])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({
        title: t("campaigns.campaignCreated"),
        description: t("campaigns.campaignCreatedDescription"),
      });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error("Error creating campaign:", error);
      toast({
        title: t("common.error"),
        description: t("campaigns.campaignCreateError"),
        variant: "destructive",
      });
    },
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast({
        title: t("campaigns.campaignUpdated"),
        description: t("campaigns.campaignUpdatedDescription"),
      });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error("Error updating campaign:", error);
      toast({
        title: t("common.error"),
        description: t("campaigns.campaignUpdateError"),
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    if (isEditMode && id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Client selection */}
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("campaigns.client")}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={clientsLoading || isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("campaigns.selectClient")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campaign name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("campaigns.campaignName")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("campaigns.enterCampaignName")} 
                  disabled={isLoading} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("common.description")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("campaigns.enterCampaignDescription")} 
                  disabled={isLoading} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration in months */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("campaigns.duration")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="3" 
                  disabled={isLoading} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {t("campaigns.durationDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimated cost */}
        <FormField
          control={form.control}
          name="estimated_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("campaigns.estimatedCost")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  disabled={isLoading} 
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Revenue */}
        <FormField
          control={form.control}
          name="revenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("campaigns.revenue")}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  disabled={isLoading} 
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active status */}
        <ActiveSwitchField 
          form={form} 
          isLoading={isLoading}
          name="active" 
          label={t("common.status")}
          activeText={t("common.active")}
          inactiveText={t("common.inactive")}
        />

        {/* Form actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("common.saving")
              : isEditMode
                ? t("common.update")
                : t("common.create")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CampaignForm;
