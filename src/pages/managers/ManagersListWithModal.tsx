
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PlusCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManagerModal from "@/components/managers/ManagerModal";
import { useModalState } from "@/hooks/useModalState";

const ManagersList: React.FC = () => {
  const { t } = useTranslation();
  const { openModal } = useModalState();

  // Fetch managers
  const { data: managers, isLoading } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching managers:", error.message);
        throw error;
      }
      return data;
    },
  });

  // Handler to open the create manager modal
  const handleCreateManager = () => {
    openModal('manager', 'create');
  };

  // Handler to open the edit manager modal
  const handleEditManager = (id: string) => {
    openModal('manager', 'edit', id);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <DashboardHeader 
            title={t("managers.title")} 
          />
          <Button onClick={handleCreateManager} className="mt-4 md:mt-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("managers.createNew")}
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center">{t("common.loading")}</div>
          ) : managers && managers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {t("managers.name")}
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {t("common.email")}
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {t("common.status")}
                    </th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {managers.map((manager) => (
                    <tr 
                      key={manager.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-300">
                        {manager.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-300">
                        {manager.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          manager.active
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                        }`}>
                          {manager.active ? t("common.active") : t("common.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditManager(manager.id)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("common.edit")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              {t("managers.noData")}
            </div>
          )}
        </div>
      </div>
      <ManagerModal />
    </DashboardLayout>
  );
};

export default ManagersList;
