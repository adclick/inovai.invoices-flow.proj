import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
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
import { PlusCircle, Edit, Trash2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Manager {
  id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const ManagersList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<Manager | null>(null);

  const { data: managers, isLoading, isError } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }
      return data as Manager[];
    }
  });

  const deleteManagerMutation = useMutation({
    mutationFn: async (managerId: string) => {
      const { error } = await supabase
        .from("managers")
        .delete()
        .eq("id", managerId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["managers"] });
      toast({
        title: t("managers.managerDeleted"),
        description: t("managers.managerDeletedDescription"),
      });
      setDeleteDialogOpen(false);
      setManagerToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("managers.managerDeleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = (manager: Manager) => {
    setManagerToDelete(manager);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (managerToDelete) {
      deleteManagerMutation.mutate(managerToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{t("managers.title")}</h1>
            <Button asChild>
              <Link to="/managers/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("managers.createNew")}
              </Link>
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p>{t("managers.loadingManagers")}</p>
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
            <h1 className="text-2xl font-bold">{t("managers.title")}</h1>
            <Button asChild>
              <Link to="/managers/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("managers.createNew")}
              </Link>
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t("managers.errorLoadingManagers")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("managers.title")}</h1>
          <Button asChild>
            <Link to="/managers/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("managers.createNew")}
            </Link>
          </Button>
        </div>

        {managers && managers.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("managers.managerName")}</TableHead>
                  <TableHead>{t("managers.email")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager.id} onClick={() => navigate(`/managers/edit/${manager.id}`)} className="cursor-pointer">
                    <TableCell className="font-medium">{manager.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                        {manager.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${manager.active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {manager.active ? t("common.active") : t("common.inactive")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          onClick={e =>{ e.stopPropagation(); handleDelete(manager)}}
                          to={null}
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
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t("managers.noManagers")}</p>
            <Button asChild>
              <Link to="/managers/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("managers.createFirstManager")}
              </Link>
            </Button>
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("managers.deleteManager")}</DialogTitle>
              <DialogDescription>
                {t("managers.deleteConfirmation", { name: managerToDelete?.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteManagerMutation.isPending}
              >
                {deleteManagerMutation.isPending ? t("managers.deleting") : t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ManagersList;
