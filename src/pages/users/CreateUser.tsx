
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "finance", "super_admin"], {
    required_error: "Please select a role",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateUser = () => {
  const navigate = useNavigate();
  const { user, checkHasRole } = useAuth();
  
  // Check if the current user is a super_admin
  const isSuperAdmin = checkHasRole('super_admin');
  
  // Redirect if the user is not a super_admin
  React.useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard');
      toast.error("You don't have permission to access this page");
    }
  }, [isSuperAdmin, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "admin",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Call the edge function to send invitation
      const { data: responseData, error } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: data.email,
          role: data.role,
          created_by: user?.id
        }
      });
      
      if (error) {
        toast.error(`Error sending invitation: ${error.message}`);
        return;
      }
      
      if (!responseData.success) {
        toast.error(responseData.error || "Failed to send invitation");
        return;
      }

      toast.success("Invitation sent successfully");
      navigate("/users");
    } catch (error: any) {
      toast.error(`Error sending invitation: ${error.message}`);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Send User Invitation</CardTitle>
            <CardDescription>
              Send an invitation to a new user with a specific role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter user's email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/users")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Send Invitation
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateUser;
