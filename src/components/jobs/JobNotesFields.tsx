
import React from "react";
import { Control } from "react-hook-form";
import { JobFormValues } from "@/hooks/useJobFormLogic";
import TextAreaField from "@/components/common/form/TextAreaField";

interface JobNotesFieldsProps {
  control: Control<JobFormValues>;
  t: (key: string) => string;
}

const JobNotesFields: React.FC<JobNotesFieldsProps> = ({
  control,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <TextAreaField
        control={control}
        name="public_notes"
        label={t("jobs.publicNotes")}
        placeholder={t("jobs.publicNotesPlaceholder")}
        rows={4}
      />

      <TextAreaField
        control={control}
        name="private_notes"
        label={t("jobs.privateNotes")}
        placeholder={t("jobs.privateNotesPlaceholder")}
        rows={4}
      />
    </div>
  );
};

export default JobNotesFields;
