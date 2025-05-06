
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const DocumentsForm = ({ form }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("jobs.documents")}</CardTitle>
        <CardDescription>{t("jobs.uploadDocuments")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{t("jobs.documentUploadInstructions")}</p>
        <div className="mt-4 p-8 border-2 border-dashed rounded-lg text-center">
          <p>{t("jobs.dragAndDropOrClick")}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsForm;
