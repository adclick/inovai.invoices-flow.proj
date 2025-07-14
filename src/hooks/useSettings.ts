
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type Setting, type SettingUpdate } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";

export const useSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Setting[]> => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as unknown as Setting[];
    },
  });

  // Update a setting
  const updateSettingMutation = useMutation({
    mutationFn: async (settingUpdate: SettingUpdate) => {
      setIsUpdating(true);
      const { name, value } = settingUpdate;
      
      const { data, error } = await supabase
        .from("settings")
        .update({ value } as any)
        .eq("name", name as any)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Setting updated",
        description: "The setting has been successfully updated.",
      });
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
      setIsUpdating(false);
    },
  });

  // Update multiple settings at once
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsUpdates: SettingUpdate[]) => {
      setIsUpdating(true);
      
      // We need to run the updates one by one because Supabase doesn't support
      // multiple updates with different conditions in a single query
      const results = [];
      for (const update of settingsUpdates) {
        const { name, value } = update;
        const { data, error } = await supabase
          .from("settings")
          .update({ value } as any)
          .eq("name", name as any)
          .select();
          
        if (error) throw error;
        results.push(data);
      }
      
      return results;
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "All settings have been successfully updated.",
      });
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
      setIsUpdating(false);
    },
  });

  return {
    settings,
    isLoading,
    error,
    isUpdating,
    updateSetting: (settingUpdate: SettingUpdate) => updateSettingMutation.mutate(settingUpdate),
    updateSettings: (settingsUpdates: SettingUpdate[]) => updateSettingsMutation.mutate(settingsUpdates),
  };
};
