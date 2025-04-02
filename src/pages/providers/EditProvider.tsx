
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema for provider form validation
const providerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().optional(),
  iban: z.string().optional(),
  active: z.boolean().default(true),
}).required();

type ProviderFormValues = z.infer<typeof providerSchema>;

const EditProvider = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch provider details
  const { data: provider, isLoading: isLoadingProvider } = useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      if (!id) throw new Error("Provider ID is required");
      
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Form setup
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      iban: "",
      active: true,
    },
  });

  // Update form values when provider data is loaded
  useEffect(() => {
    if (provider) {
      form.reset({
        name: provider.name,
        email: provider.email,
        country: provider.country || "",
        iban: provider.iban || "",
        active: provider.active,
      });
    }
  }, [provider, form]);

  // Update provider mutation
  const updateProvider = useMutation({
    mutationFn: async (values: ProviderFormValues) => {
      if (!id) throw new Error("Provider ID is required");
      
      const { data, error } = await supabase
        .from("providers")
        .update({
          name: values.name,
          email: values.email,
          country: values.country || null,
          iban: values.iban || null,
          active: values.active
        })
        .eq("id", id)
        .select("id")
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["provider", id] });
      toast({
        title: "Provider updated",
        description: "The provider has been successfully updated.",
      });
      navigate("/providers");
    },
    onError: (error) => {
      console.error("Error updating provider:", error);
      toast({
        title: "Error",
        description: "Failed to update the provider. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: ProviderFormValues) => {
    updateProvider.mutate(values);
  };

  if (isLoadingProvider) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Provider</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500 dark:text-slate-400">Loading provider details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Provider</h1>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-red-600 dark:text-red-400">Provider not found</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/providers")}
            >
              Back to Providers
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Provider</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Update provider details
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter provider name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter country (optional)"
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
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter IBAN (optional)"
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
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-slate-200 dark:border-slate-700">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Provider</FormLabel>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Mark this provider as active
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/providers")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProvider.isPending}>
                  {updateProvider.isPending ? "Updating..." : "Update Provider"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProvider;
