import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { DocumentUploader } from "@/components/jobs/DocumentUploader";

const DocumentsTab: React.FC<{
  jobId: string;
  documents: string[] | null;
  onDocumentsUpdated: (newDocuments: string[]) => void;
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  t: (key: string) => string;
}> = ({ jobId, documents, onDocumentsUpdated, currentTab, setCurrentTab, t }) => {
  const navigate = useNavigate();
  return (
    <TabsContent value="documents" aria-label={t("jobs.documentsTabContent")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("jobs.documents")}</CardTitle>
          <CardDescription>{t("jobs.documents")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <DocumentUploader
              jobId={jobId}
              existingDocuments={documents}
              onDocumentsUpdated={onDocumentsUpdated}
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentTab("details")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/jobs")}>
              {t("common.done")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default DocumentsTab;