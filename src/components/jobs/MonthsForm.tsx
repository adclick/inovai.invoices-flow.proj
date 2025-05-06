
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

const MonthsForm = ({ form }) => {
  const { t } = useTranslation();

  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("jobs.months")}</CardTitle>
        <CardDescription>{t("jobs.selectMonthsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="months"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {months.map((month) => (
                  <FormField
                    key={month}
                    control={form.control}
                    name="months"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={month}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(month)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), month])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== month
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t(`common.${month}`)}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default MonthsForm;
