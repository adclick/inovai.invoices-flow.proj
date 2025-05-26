
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ClientModal from "@/components/clients/ClientModal";
import { useModalState } from "@/hooks/useModalState";

interface Client {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const ClientsList = () => {
  const { t } = useTranslation();
  const navigate = useModalState();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Fetch clients
  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }
      return data as Client[];
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: t("clients.clientDeleted"),
        description: t("clients.clientDeletedDescription"),
      });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("clients.clientDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };

  const handleEditClient = (id: string) => {
    navigate.openModal('client', 'edit', id);
  };

  const handleCreateClient = () => {
    navigate.openModal('client', 'create');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
            <Button onClick={handleCreateClient}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("clients.createNew")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p>{t("clients.loadingClients")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
            <Button onClick={handleCreateClient}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("clients.createNew")}
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t("clients.errorLoadingClients")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("clients.title")}</h1>
          <Button onClick={handleCreateClient}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("clients.createNew")}
          </Button>
        </div>

        {clients && clients.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("clients.clientName")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    onClick={() => handleEditClient(client.id)} 
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${client.active 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                          : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                        }`}>
                        {client.active ? t("common.active") : t("common.inactive")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          onClick={e =>{ e.stopPropagation(); handleDelete(client)}}
                          to="#"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("common.delete")}</span>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-slate-50 dark:bg-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t("clients.noClients")}</p>
            <Button onClick={handleCreateClient}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("clients.createFirstClient")}
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("clients.deleteClient")}</DialogTitle>
              <DialogDescription>
                {t("clients.deleteConfirmation", { name: clientToDelete?.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteClientMutation.isPending}
              >
                {deleteClientMutation.isPending ? t("clients.deleting") : t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Client modal */}
        <ClientModal />
      </div>
    </DashboardLayout>
  );
};

export default ClientsList;
