
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

const NotesForm = ({ form }) => {
  const { t } = useTranslation();
  const watchNotifyProvider = form.watch("notify_provider");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("common.details")}</CardTitle>
        <CardDescription>{t("jobs.notesDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="public_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.publicNotes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("jobs.publicNotesPlaceholder")}
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="private_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.privateNotes")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("jobs.privateNotesPlaceholder")}
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notify_provider"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("jobs.notifyProvider")}
                </FormLabel>
                <FormDescription>
                  {t("jobs.notifyProviderDescription")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watchNotifyProvider && (
          <FormField
            control={form.control}
            name="message_to_provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("jobs.messageToProvider")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("jobs.messageToProviderPlaceholder")}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Adding FormDescription component since it's used in this component
const FormDescription = ({ children }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>;
};

export default NotesForm;
