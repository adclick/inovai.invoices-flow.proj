
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BanknoteIcon, Calendar, CheckCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/hooks/useJobsData";

const PaymentConfirm = () => {
  const { jobId, token } = useParams<{ jobId: string; token: string }>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationComplete, setConfirmationComplete] = useState(false);

  // Validate token and jobId using the edge function
  const { data, isLoading, error } = useQuery({
    queryKey: ["payment-validation", jobId, token],
    queryFn: async () => {
      if (!jobId || !token) return { valid: false };

      try {
        const { data, error } = await supabase.functions.invoke('validate-payment-token', {
          body: { jobId, token },
        });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error validating token:", error);
        return { valid: false };
      }
    },
    retry: false,
  });

  const job = data?.valid ? data.job : null;
  const clientName = job?.clients?.name || "Client";
  const campaignName = job?.campaigns?.name || "Campaign";
  const providerName = job?.providers?.name || "Provider";
  const managerName = job?.managers?.name || "Manager";
  const formattedValue = job ? formatCurrency(job.value, job.currency) : "$0";
  const formattedDueDate = job?.due_date 
    ? new Date(job.due_date).toLocaleDateString() 
    : "No deadline";

  const handleConfirmPayment = async () => {
    if (!jobId || !token) return;
    
    try {
      setIsConfirming(true);
      
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { jobId, token },
      });
      
      if (error) throw error;
      
      if (data.success) {
        setConfirmationComplete(true);
        toast.success("Payment confirmed successfully!");
      } else {
        toast.error(data.error || "Failed to confirm payment");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container max-w-3xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-primary">Loading...</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data?.valid || !job) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container max-w-3xl mx-auto px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Invalid Access
              </CardTitle>
              <CardDescription>
                This payment confirmation link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                The link you've accessed is not valid. This could be because:
              </p>
              <ul className="list-disc pl-5 mt-2 text-slate-600 dark:text-slate-400">
                <li>The payment has already been confirmed</li>
                <li>The URL is incorrect</li>
                <li>The link has expired</li>
              </ul>
              <Button 
                className="mt-6" 
                onClick={() => window.location.href = "/"}
                variant="outline"
              >
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (confirmationComplete) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container max-w-3xl mx-auto px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="mr-2 h-5 w-5" />
                Payment Confirmed
              </CardTitle>
              <CardDescription>
                The payment has been successfully confirmed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Thank you for confirming this payment. All relevant parties have been notified.
              </p>
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-sm text-green-700 dark:text-green-400">
                Payment of {formattedValue} for {clientName} - {campaignName} has been recorded.
              </div>
              <Button 
                className="mt-6" 
                onClick={() => window.location.href = "/"}
                variant="outline"
              >
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/10 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center mb-8">
          <div className="p-2.5 rounded-full bg-white/10 dark:bg-primary/20 mr-2">
            <div className="text-primary font-bold text-lg">IF</div>
          </div>
          <span className="text-xl font-semibold text-slate-800 dark:text-white">InvoicesFlow</span>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Confirmation</CardTitle>
            <CardDescription>
              Please confirm payment for {clientName} - {campaignName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">CLIENT</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{clientName}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">CAMPAIGN</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{campaignName}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">PROVIDER</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{providerName}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">MANAGER</span>
                  <p className="font-medium text-slate-900 dark:text-white mt-1">{managerName}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md flex items-start">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5 mr-1.5" />
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AMOUNT</span>
                    <p className="font-medium text-slate-900 dark:text-white mt-1">{formattedValue}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md flex items-start">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 mr-1.5" />
                  <div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">DUE DATE</span>
                    <p className="font-medium text-slate-900 dark:text-white mt-1">{formattedDueDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 flex items-center">
                  <BanknoteIcon className="h-4 w-4 mr-2" />
                  Payment Confirmation
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  By clicking the button below, you confirm that payment of {formattedValue} has been processed and will be marked as "Paid" in the system.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="w-full md:w-auto"
                size="lg"
              >
                {isConfirming ? "Processing..." : "Confirm Payment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentConfirm;
