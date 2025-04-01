
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

// Define form validation schema
const managerFormSchema = z.object({
  name: z.string().min(1, "Manager name is required").max(100, "Manager name must be less than 100 characters"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

type ManagerFormValues = z.infer<typeof managerFormSchema>;

const CreateManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Create manager mutation
  const createManagerMutation = useMutation({
    mutationFn: async (values: ManagerFormValues) => {
      const { data, error } = await supabase
        .from("managers")
        .insert({ 
          name: values.name, 
          email: values.email 
        })
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      toast({
        title: "Manager created",
        description: "The manager has been successfully created.",
      });
      navigate("/dashboard/managers");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create manager: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (values: ManagerFormValues) => {
    createManagerMutation.mutate(values);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard/managers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Managers
          </Button>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Add a new manager to your system
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
                    <FormLabel>Manager Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manager name" {...field} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter manager email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/managers")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createManagerMutation.isPending}
                >
                  {createManagerMutation.isPending ? "Creating..." : "Create Manager"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateManager;
