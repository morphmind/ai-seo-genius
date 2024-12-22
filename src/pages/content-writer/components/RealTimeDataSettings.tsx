import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormValues } from "../types";

interface RealTimeDataSettingsProps {
  control: Control<FormValues>;
  watchRealTimeSourceFilter: string;
}

export function RealTimeDataSettings({ control, watchRealTimeSourceFilter }: RealTimeDataSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Use Real-Time Data */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Use Real-Time Data</Label>
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
                  If enabled, we will fetch real-time data from search results
                  to enhance the article with current information.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Controller
            name="useRealTimeData"
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

      {/* Real-Time Source Filtering */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Real-Time Source Filtering</Label>
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
                If enabled, we will fetch data from the search results for each section
                and use that data to help generate the article.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Controller
          name="realTimeSourceFilter"
          control={control}
          render={({ field }) => (
            <Tabs
              defaultValue={field.value}
              onValueChange={field.onChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="default">Default</TabsTrigger>
                <TabsTrigger value="scholarly">Scholarly</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />

        {watchRealTimeSourceFilter === "custom" && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <Label>Custom Search Operators</Label>
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
                    You can use DA (Domain Authority), site, and filetype search operators.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              name="customSearchOperators"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter custom search operators"
                />
              )}
            />
          </div>
        )}

        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Cite Sources</Label>
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
                    If enabled, we will attempt to cite sources from the real-time data that we fetch.
                    Works best when using GPT-4.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              name="citeSources"
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
    </div>
  );
}
