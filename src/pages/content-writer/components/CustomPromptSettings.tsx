import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormValues } from "../types";

interface CustomPromptSettingsProps {
  control: Control<FormValues>;
}

export function CustomPromptSettings({ control }: CustomPromptSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Extra Title Prompt</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="cursor-help"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Additional instructions for the title. Example: "choose a silly, creative title"
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="extraTitlePrompt"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Additional instructions for the title"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Extra Section Prompt</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="cursor-help"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Additional instructions that will be applied individually to every single section.
                You cannot give instructions such as "write 1,200 words" because it will be applied
                to each section individually not the whole article.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="extraSectionPrompt"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Additional instructions for each section"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Extra Introduction Prompt</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="cursor-help"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Additional instructions that will be applied to the introduction.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="extraIntroPrompt"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Additional instructions for the introduction"
            />
          )}
        />
      </div>
    </div>
  );
}
