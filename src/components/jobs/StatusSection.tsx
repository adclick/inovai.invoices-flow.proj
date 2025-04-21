import { JobStatusField } from "./JobStatusField";

const StatusSection: React.FC<{
  status: string;
  onChange: (value: string) => void;
  disabled: boolean;
  t: (key: string) => string;
}> = ({ status, onChange, disabled, t }) => {
  return (
    <div className="mb-6" aria-label={t("jobs.statusSection")}>
      <JobStatusField value={status} onChange={onChange} disabled={disabled} />
    </div>
  );
};

export default StatusSection;