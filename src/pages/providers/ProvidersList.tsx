
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useModalState } from "@/hooks/useModalState";
import { Mail, Trash2, Globe, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProviderModal from "@/components/providers/ProviderModal";

interface Provider {
  id: string;
  name: string;
  email: string;
  language: string;
  country: string | null;
  iban: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const ProvidersList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { openModal } = useModalState();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null);

  const { data: providers, isLoading, isError } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }
      return data as Provider[];
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from("providers")
        .delete()
        .eq("id", providerId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast({
        title: t("providers.providerDeleted"),
        description: t("providers.providerDeletedDescription"),
      });
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("providers.providerDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = (provider: Provider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (providerToDelete) {
      deleteProviderMutation.mutate(providerToDelete.id);
    }
  };

  const handleCreateProvider = () => {
    openModal('provider', 'create');
  };

  const handleEditProvider = (id: string) => {
    openModal('provider', 'edit', id);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <DashboardHeader 
            title={t("providers.title")}
            showCreateButton
            createButtonText={t("providers.createNew")}
            createButtonAction={handleCreateProvider}
          />
          <div className="flex justify-center items-center h-64">
            <p>{t("providers.loadingProviders")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <DashboardHeader 
            title={t("providers.title")}
            showCreateButton
            createButtonText={t("providers.createNew")}
            createButtonAction={handleCreateProvider}
          />
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t("providers.errorLoadingProviders")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
			<div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("providers.title")}</h1>
          <Button onClick={handleCreateProvider}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("providers.createNew")}
          </Button>
        </div>

        {providers && providers.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("providers.providerName")}</TableHead>
                  <TableHead>{t("providers.email")}</TableHead>
                  <TableHead>{t("providers.language")}</TableHead>
                  <TableHead>{t("providers.country")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id} onClick={() => handleEditProvider(provider.id)} className="cursor-pointer">
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                        {provider.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-slate-400" />
                        {provider.language.toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {provider.country || "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${provider.active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {provider.active ? t("common.active") : t("common.inactive")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <a
                          onClick={(e) => { e.stopPropagation(); handleDelete(provider); }}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("common.delete")}</span>
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-slate-50 dark:bg-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t("providers.noProviders")}</p>
            <Button onClick={handleCreateProvider}>
              {t("providers.createFirstProvider")}
            </Button>
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("providers.deleteProvider")}</DialogTitle>
              <DialogDescription>
                {t("providers.deleteConfirmation", { name: providerToDelete?.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteProviderMutation.isPending}
              >
                {deleteProviderMutation.isPending ? t("providers.deleting") : t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ProviderModal />
      </div>
    </DashboardLayout>
  );
};

export default ProvidersList;
