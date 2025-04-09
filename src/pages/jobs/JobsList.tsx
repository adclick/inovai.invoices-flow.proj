
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useJobsData, Job, formatCurrency } from "@/hooks/useJobsData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ChevronRight, ChevronDown, Search, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type GroupedJobs = {
  [clientId: string]: {
    clientName: string;
    campaigns: {
      [campaignId: string]: {
        campaignName: string;
        jobs: Job[];
      };
    };
  };
};

const JobsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch jobs data using the custom hook
  const { data: jobs = [], isLoading, error } = useJobsData();

  // Filter jobs based on search term
  const filteredJobs = searchTerm 
    ? jobs.filter(job => 
        job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatCurrency(job.value, job.currency).includes(searchTerm)
      )
    : jobs;

  // Group jobs by client and campaign for grouped view
  const groupJobs = (jobs: Job[]): GroupedJobs => {
    return jobs.reduce((acc: GroupedJobs, job) => {
      const clientId = job.client_id;
      const campaignId = job.campaign_id;
      
      if (!acc[clientId]) {
        acc[clientId] = {
          clientName: job.client_name || "Unknown Client",
          campaigns: {}
        };
      }
      
      if (!acc[clientId].campaigns[campaignId]) {
        acc[clientId].campaigns[campaignId] = {
          campaignName: job.campaign_name || "Unknown Campaign",
          jobs: []
        };
      }
      
      acc[clientId].campaigns[campaignId].jobs.push(job);
      return acc;
    }, {});
  };
  
  const groupedJobs = groupJobs(filteredJobs);

  // Pagination logic
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);
      if (error) throw error;
      return jobId;
    },
    onSuccess: (jobId) => {
      toast({
        title: "Job deleted",
        description: "The job has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete job: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  });

  const confirmDelete = (job: Job) => {
    setJobToDelete(job);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (jobToDelete) {
      deleteJobMutation.mutate(jobToDelete.id);
    }
  };

  const toggleClient = (clientId: string) => {
    setExpandedClients({
      ...expandedClients,
      [clientId]: !expandedClients[clientId]
    });
  };

  const toggleCampaign = (campaignId: string) => {
    setExpandedCampaigns({
      ...expandedCampaigns,
      [campaignId]: !expandedCampaigns[campaignId]
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">New</Badge>;
      case 'Manager OK':
        return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">Manager OK</Badge>;
      case 'Pending Invoice':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Pending Invoice</Badge>;
      case 'Pending Payment':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">Pending Payment</Badge>;
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-lg">
            <p>Error loading jobs: {error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Jobs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage all jobs in one place</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <Input
                type="text"
                placeholder="Search jobs..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => navigate("/jobs/create")} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Add Job
            </Button>
          </div>
        </div>
        
        {/* Jobs table - Desktop view */}
        <div className="hidden md:block overflow-hidden">
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Client</TableHead>
                  <TableHead className="w-[180px]">Campaign</TableHead>
                  <TableHead className="w-[180px]">Provider</TableHead>
                  <TableHead className="w-[120px]">Value</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                      No jobs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.client_name}</TableCell>
                      <TableCell>{job.campaign_name}</TableCell>
                      <TableCell>{job.provider_name}</TableCell>
                      <TableCell>{formatCurrency(job.value, job.currency)}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/jobs/edit/${job.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(job)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Jobs cards - Mobile view */}
        <div className="md:hidden space-y-4">
          {paginatedJobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              No jobs found.
            </div>
          ) : (
            paginatedJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{job.client_name}</CardTitle>
                    {getStatusBadge(job.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-slate-500 dark:text-slate-400">Campaign:</div>
                      <div>{job.campaign_name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-slate-500 dark:text-slate-400">Provider:</div>
                      <div>{job.provider_name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-slate-500 dark:text-slate-400">Value:</div>
                      <div className="font-semibold">{formatCurrency(job.value, job.currency)}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/jobs/edit/${job.id}`)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(job)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* Generate page links with ellipsis for large page counts */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                // Only show first, last, current, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={pageNumber === currentPage}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (pageNumber === currentPage - 2 && currentPage > 3) ||
                  (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <span className="px-4 py-2">...</span>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job for {jobToDelete?.client_name || "this client"}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default JobsList;
