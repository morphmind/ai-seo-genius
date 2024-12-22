import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormValues } from "../types";

const listNumberingFormats = [
  { value: "parenthesis", label: "1) 2) 3)" },
  { value: "dot", label: "1. 2. 3." },
  { value: "colon", label: "1: 2: 3:" },
  { value: "none", label: "None" }
];

interface ListicleSettingsProps {
  control: Control<FormValues>;
}

export function ListicleSettings({ control }: ListicleSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>List Numbering Format</Label>
        <Controller
          name="listNumberingFormat"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {listNumberingFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>List Item Prompt</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Additional instructions that will be applied individually to every list item section.
                For example, if you are writing about "best dog breeds" then these instructions would
                be applied to each breed section individually.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="listItemPrompt"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Example: only write a max of 200 words. at the end include a table that includes Personality, Weight, and Trainability"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Enable Supplemental Information</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>
                  If enabled, 1-3 relevant sections will be added at the end of article.
                  This is recommended for a comprehensive and optimized article.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Controller
            name="enableSupplementalInfo"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Enable Automatic Length</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Auto: If a number of items is specified in the Target Keyword then that will be used,
                  otherwise it will default to 10. For example, "5 cutest dog breeds" would use 5 items.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Controller
            name="enableAutoLength"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
