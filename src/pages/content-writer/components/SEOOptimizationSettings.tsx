import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormValues } from "../types";

interface SEOOptimizationSettingsProps {
  control: Control<FormValues>;
}

export function SEOOptimizationSettings({ control }: SEOOptimizationSettingsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>SEO Optimization</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
              <Info className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>
              Default: Articles will naturally be optimized but there will not be any SERP analysis done.
              Manual: Specify a list of keywords to be used in the article.
              AI-Powered: We will analyze top ranking pages and extract relevant keywords.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Controller
        name="seoOptimization"
        control={control}
        render={({ field }) => (
          <Tabs
            defaultValue={field.value}
            onValueChange={field.onChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="default">Default</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="ai_powered">AI-Powered ✨</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <div className="space-y-2 mt-2">
                <Label>Keywords to Include</Label>
                <Controller
                  name="keywords"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter keywords separated by commas"
                    />
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      />
    </div>
  );
}
