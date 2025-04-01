
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Define form validation schema
const clientFormSchema = z.object({
  name: z.string().min(1, "Client name is required").max(100, "Client name must be less than 100 characters"),
  active: z.boolean().default(true),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  // Fetch client data
  const { data: client, isLoading, isError } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      if (!id) throw new Error("Client ID is required");
      
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!id,
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

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      if (!id) throw new Error("Client ID is required");
      
      const { data, error } = await supabase
        .from("clients")
        .update({ 
          name: values.name,
          active: values.active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      toast({
        title: "Client updated",
        description: "The client has been successfully updated.",
      });
      navigate("/dashboard/clients");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: ClientFormValues) => {
    updateClientMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard/clients")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p>Loading client data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !client) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/dashboard/clients")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Error loading client data. Please try again later.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard/clients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Edit Client</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Update client information
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Set whether this client is active or inactive
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/clients")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateClientMutation.isPending}
                >
                  {updateClientMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditClient;
