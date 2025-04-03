
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
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "finance", "super_admin"], {
    required_error: "Please select a role",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateUser = () => {
  const navigate = useNavigate();
  const { checkHasRole } = useAuth();
  
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
      fullname: "",
      email: "",
      role: "admin",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Call our edge function instead of direct auth.admin calls
      const { data: responseData, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: data.email,
          fullname: data.fullname,
          role: data.role
        }
      });
      
      if (error) {
        toast.error(`Error creating user: ${error.message}`);
        return;
      }
      
      if (!responseData.success) {
        toast.error(responseData.error || "Failed to create user");
        return;
      }

      toast.success("User created successfully");
      navigate("/users");
    } catch (error: any) {
      toast.error(`Error creating user: ${error.message}`);
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
            <CardTitle>Create User</CardTitle>
            <CardDescription>
              Create a new user account with appropriate role
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
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user's full name"
                          {...field}
                        />
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
                    Create User
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
