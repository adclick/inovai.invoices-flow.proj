
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseEntityQueryProps {
  tableName: string;
  entityName: string;
  id?: string;
  enabled?: boolean;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: string;
}

export const useEntityQuery = ({
  tableName,
  entityName,
  id,
  enabled = true,
  select = "*",
  filters = {},
  orderBy,
}: UseEntityQueryProps) => {
  return useQuery({
    queryKey: id ? [entityName, id] : [tableName],
    queryFn: async () => {
      let query = supabase.from(tableName as any).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy);
      }

      // Single item query
      if (id) {
        const { data, error } = await query.eq("id", id).maybeSingle();
        if (error) {
          console.error(`Error fetching ${entityName}:`, error.message);
          throw error;
        }
        return data;
      }

      // Multiple items query
      const { data, error } = await query;
      if (error) {
        console.error(`Error fetching ${entityName}:`, error.message);
        throw error;
      }
      return data;
    },
    enabled,
  });
};

export const useEntitiesQuery = (tableName: string, options: Omit<UseEntityQueryProps, 'id' | 'entityName' | 'tableName'> = {}) => {
  return useEntityQuery({
    ...options,
    tableName,
    entityName: tableName,
  });
};
