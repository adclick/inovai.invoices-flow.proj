
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
  role: z.enum(["admin", "finance"], {
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
      email: "",
      role: "admin",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Check if the user exists in profiles
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();

      if (userError) {
        toast.error(`User not found with email: ${data.email}. They must sign up first.`);
        return;
      }

      const userId = existingUser.id;

      // Check if the user already has this role
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', data.role);

      if (roleCheckError) {
        toast.error(`Error checking existing roles: ${roleCheckError.message}`);
        return;
      }

      if (existingRole && existingRole.length > 0) {
        toast.error(`User already has the ${data.role} role`);
        return;
      }

      // Add the new role to the user
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: data.role,
        });

      if (insertError) {
        toast.error(`Error assigning role: ${insertError.message}`);
        return;
      }

      toast.success("User role assigned successfully");
      navigate("/users");
    } catch (error: any) {
      toast.error(`Error creating user role: ${error.message}`);
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
            <CardTitle>Assign User Role</CardTitle>
            <CardDescription>
              Assign a role to an existing user account.
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
                      <FormLabel>User Email</FormLabel>
                      <FormControl>
                        <Input
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
                    Assign Role
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
