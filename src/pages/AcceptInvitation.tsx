
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
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

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullname: z.string().min(1, "Full name is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormValues = z.infer<typeof formSchema>;
// Define the role type to match the database enum
type AppRole = Database["public"]["Enums"]["app_role"];

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string;
    role: AppRole;
  } | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('validate_invitation_token', { token_value: token });

        if (error || !data || data.length === 0 || !data[0].is_valid) {
          toast.error("Invitation is invalid or has expired");
          navigate('/');
          return;
        }

        setInvitationDetails({
          email: data[0].email,
          role: data[0].role as AppRole
        });
      } catch (error: any) {
        toast.error(`Error validating invitation: ${error.message}`);
        navigate('/');
      }
    };

    validateInvitation();
  }, [token, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: invitationDetails?.email || "",
      fullname: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!token || !invitationDetails) return;

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullname,
            invited: true
          }
        }
      });

      if (authError) throw authError;

      // Mark invitation as used
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ used: true })
        .eq('token', token);

      if (updateError) throw updateError;

      // Assign the role from the invitation
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user?.id,
          role: invitationDetails.role
        });

      if (roleError) throw roleError;

      toast.success("Account created successfully");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(`Error creating account: ${error.message}`);
    }
  };

  if (!invitationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            Complete your registration for {invitationDetails?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        readOnly
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
