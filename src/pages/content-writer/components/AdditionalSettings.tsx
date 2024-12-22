import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormValues } from "../types";

interface AdditionalSettingsProps {
  control: Control<FormValues>;
}

export function AdditionalSettings({ control }: AdditionalSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Use Outline Editor</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  If enabled, an outline will first be created that you can edit.
                  You can re-order, delete, and add new sections.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Controller
            name="useOutlineEditor"
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
            <Label>Include FAQ Section</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  If enabled, we will add a FAQ section based on SERP analysis.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Controller
            name="includeFaq"
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
            <Label>Include Key Takeaways</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  If enabled, a new version of the introduction will be used that includes a Key Takeaways section.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Controller
            name="includeKeyTakeaways"
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
            <Label>Improve Readability</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-help"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  If enabled, the output will contain shorter sentences and simpler language to target an 8th grade reading level.
                  Important: Works best with GPT-4o.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Controller
            name="improveReadability"
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
        <div className="flex items-center gap-2">
          <Label>URLs to Link To</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="cursor-help"
                >
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                For internal linking we highly recommend using the "Automatic Internal Linking" feature.
                But if you want to manually specify URLs to link to you can do so here.
                Separate URLs by new lines or commas. Only the first 100 URLs will be considered.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="urlsToLinkTo"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Enter URLs (separated by new lines or commas)"
            />
          )}
        />
      </div>
    </div>
  );
}
