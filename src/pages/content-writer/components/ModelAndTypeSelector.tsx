import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";
import { FormValues } from "../types";

interface ModelAndTypeSelectorProps {
  control: Control<FormValues>;
  watchArticleType: string;
}

export function ModelAndTypeSelector({ control, watchArticleType }: ModelAndTypeSelectorProps) {
  const extractKeywordFromURL = (url: string) => {
    try {
      const urlPath = new URL(url).pathname;
      const segments = urlPath.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      
      const keyword = lastSegment
        .replace(/[-_]/g, ' ')
        .replace(/\.[^/.]+$/, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
      return keyword;
    } catch (error) {
      console.error('Error extracting keyword:', error);
      return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Model</Label>
        <Controller
          name="model"
          control={control}
          defaultValue="gpt-4o-mini"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || "gpt-4o-mini"}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">
                  GPT-4o Mini - High quality but often not as accurate or original as GPT-4o
                </SelectItem>
                <SelectItem value="gpt-4o">
                  GPT-4o - Uses 2x more words. Higher quality and follows custom prompts better
                </SelectItem>
                <SelectItem value="claude-3.5-sonnet">
                  Claude 3.5 Sonnet - Uses 2x more words. Highest quality and works very well with custom writing styles
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Article Type</Label>
        <Controller
          name="articleType"
          control={control}
          defaultValue="blog_post"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || "blog_post"}>
              <SelectTrigger>
                <SelectValue placeholder="Select article type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog_post">Blog Post</SelectItem>
                <SelectItem value="listicle">Listicle</SelectItem>
                <SelectItem value="rewrite_blog_post">Rewrite Blog Post</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {watchArticleType === "blog_post" && (
        <div className="space-y-2">
          <Label>Target Keyword</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Controller
                    name="targetKeyword"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Enter target keyword"
                      />
                    )}
                  />
                  <HelpCircle className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                What is the target keyword or article topic that you want to rank for?
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {watchArticleType === "listicle" && (
        <>
          <div className="space-y-2">
            <Label>Target Keyword</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="targetKeyword"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder='e.g., "10 fun dog facts", "7 best houseplants"'
                        />
                      )}
                    />
                    <HelpCircle className="w-4 h-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Examples: "10 fun dog facts", "7 best houseplants", "8 ways to save money"
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-2">
            <Label>List Numbering Format</Label>
            <Controller
              name="listNumberingFormat"
              control={control}
              defaultValue="dot"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || "dot"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parenthesis">1) 2) 3)</SelectItem>
                    <SelectItem value="dot">1. 2. 3.</SelectItem>
                    <SelectItem value="colon">1: 2: 3:</SelectItem>
                    <SelectItem value="none">None</SelectItem>
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
                  <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>
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
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Example: only write a max of 200 words. at the end include a table..."
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Enable Supplemental Information</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
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
              defaultValue={false}
              render={({ field }) => (
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Enable Automatic Length</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Auto: If a number of items is specified in the Target Keyword then that will be used,
                    otherwise it will default to 10. For example, "5 cutest dog breeds" would use 5 items.
                    Custom: Used to specify a custom number of items that will be used instead.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              name="enableAutoLength"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </>
      )}

      {watchArticleType === "rewrite_blog_post" && (
        <>
          <div className="space-y-2">
            <Label>Article URL</Label>
            <Controller
              name="articleUrl"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="https://..."
                  onChange={(e) => {
                    field.onChange(e);
                    const keyword = extractKeywordFromURL(e.target.value);
                    if (keyword) {
                      control.setValue('targetKeyword', keyword);
                    }
                  }}
                />
              )}
            />
            <p className="text-sm text-gray-500">
              Please provide the URL to the article that you would like to rewrite.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Enable Rewriting</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button" onClick={(e) => e.preventDefault()}>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    If enabled, we will make sure the AI rewrites all of the source data from the given article
                    so that there is no plagiarism. You can disable this if you are using your own article.
                    When disabled we will also try to include the original images and links from the source article
                    (works best with GPT-4).
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              name="enableRewriting"
              control={control}
              defaultValue={true}
              render={({ field }) => (
                <Switch
                  checked={field.value !== undefined ? field.value : true}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Keyword</Label>
            <Controller
              name="targetKeyword"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter target keyword"
                />
              )}
            />
            <p className="text-sm text-gray-500">
              What is the target keyword or article topic that you want to rank for?
            </p>
          </div>
        </>
      )}
    </div>
  );
}
