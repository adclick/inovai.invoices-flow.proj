
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  role: z.enum(["admin", "finance", "super_admin"], {
    required_error: "Please select a role",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkHasRole } = useAuth();
  
  // Check if the current user is a super_admin
  const isSuperAdmin = checkHasRole('super_admin');
  
  // Redirect if the user is not a super_admin
  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard');
      toast.error("You don't have permission to access this page");
    }
  }, [isSuperAdmin, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "admin",
    },
  });

  // Fetch user and their roles
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) throw new Error("User ID is required");

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', id)
        .single();

      if (profileError) {
        toast.error(`Error fetching user: ${profileError.message}`);
        throw profileError;
      }

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id);

      if (rolesError) {
        toast.error(`Error fetching roles: ${rolesError.message}`);
        throw rolesError;
      }

      return {
        profile,
        roles: roles.map(r => r.role),
      };
    },
    enabled: !!id && isSuperAdmin,
  });

  useEffect(() => {
    if (userData && userData.roles && userData.roles.length > 0) {
      // Set the current role in the form
      form.setValue('role', userData.roles[0] as "admin" | "finance" | "super_admin");
    }
  }, [userData, form]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    
    try {
      // Check if the user already has this role
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', id)
        .eq('role', data.role);

      if (roleCheckError) {
        toast.error(`Error checking roles: ${roleCheckError.message}`);
        return;
      }

      if (existingRole && existingRole.length > 0) {
        toast.info(`User already has the ${data.role} role`);
        navigate("/users");
        return;
      }

      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', id);

      if (deleteError) {
        toast.error(`Error removing existing roles: ${deleteError.message}`);
        return;
      }

      // Add the new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: id,
          role: data.role,
        });

      if (insertError) {
        toast.error(`Error updating role: ${insertError.message}`);
        return;
      }

      toast.success("User role updated successfully");
      navigate("/users");
    } catch (error: any) {
      toast.error(`Error updating user role: ${error.message}`);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit User Role</CardTitle>
            <CardDescription>
              {userData?.profile?.email ? `Update role for ${userData.profile.email}` : 'Loading user details...'}
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
                    Update Role
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

export default EditUser;
