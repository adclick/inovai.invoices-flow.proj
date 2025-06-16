import React from "react";
import { Control, useFieldArray, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

interface CampaignValue {
  campaign_id: string;
  value: number;
}

interface CampaignValueFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  filteredCampaigns: { id: string; name: string; client_id: string }[];
  disabled?: boolean;
  emptyMessage: string;
}

const CampaignValueField: React.FC<CampaignValueFieldProps> = ({
  control,
  name,
  label,
  placeholder,
  filteredCampaigns,
  disabled = false,
  emptyMessage,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const watchedValues = useWatch({
    control,
    name,
  }) as CampaignValue[];

  // Calculate total value
  const totalValue = watchedValues?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;

  // Get available campaigns (not already selected)
  const selectedCampaignIds = watchedValues?.map(item => item.campaign_id) || [];
  const availableCampaigns = filteredCampaigns.filter(
    campaign => !selectedCampaignIds.includes(campaign.id)
  );

  const handleAddCampaign = () => {
    if (availableCampaigns.length > 0) {
      append({ campaign_id: availableCampaigns[0].id, value: 0 });
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-3">
              {fields.length === 0 && (
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                  {disabled ? emptyMessage : placeholder}
                </div>
              )}

              {fields.map((field, index) => {
                const selectedCampaign = filteredCampaigns.find(
                  c => c.id === watchedValues?.[index]?.campaign_id
                );

                return (
                  <div key={field.id} className="flex items-center gap-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <FormField
                        control={control}
                        name={`${name}.${index}.campaign_id`}
                        render={({ field: campaignField }) => (
                          <Select
                            value={campaignField.value}
                            onValueChange={campaignField.onChange}
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select campaign" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Keep current selection available */}
                              {selectedCampaign && (
                                <SelectItem value={selectedCampaign.id}>
                                  {selectedCampaign.name}
                                </SelectItem>
                              )}
                              {/* Show other available campaigns */}
                              {availableCampaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                  {campaign.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    
                    <div className="w-32">
                      <FormField
                        control={control}
                        name={`${name}.${index}.value`}
                        render={({ field: valueField }) => (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Value"
                            disabled={disabled}
                            {...valueField}
                            onChange={(e) => valueField.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              {!disabled && availableCampaigns.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCampaign}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Campaign
                </Button>
              )}

              {fields.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                  <span className="font-medium">Total Value:</span>
                  <span className="font-bold">{totalValue.toLocaleString()}</span>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CampaignValueField;
