
import { useEntitiesQuery } from "./useEntityQuery";

export const useJobTypesData = () => {
  return useEntitiesQuery("job_types", {
    orderBy: "name",
  });
};
