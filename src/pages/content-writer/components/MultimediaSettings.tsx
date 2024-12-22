import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormValues } from "../types";

const imageSizes = [
  "1024x1024",
  "1152x896",
  "1216x832",
  "1344x768",
  "1536x640",
  "640x1536",
  "768x1344",
  "832x1216",
  "896x1152"
];

const imageStyles = [
  { value: "illustration", label: "Illustration" },
  { value: "photo", label: "Photo" },
  { value: "watercolor", label: "Watercolor" },
  { value: "fantasy", label: "Fantasy" },
  { value: "anime", label: "Anime" },
  { value: "3d_rendering", label: "3D Rendering" },
  { value: "isometric", label: "Isometric" }
];

interface MultimediaSettingsProps {
  control: Control<FormValues>;
  watchImageOption: string;
}

export function MultimediaSettings({ control, watchImageOption }: MultimediaSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>AI Images & YouTube Videos</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  type="button" 
                  className="cursor-help"
                  onClick={(e) => e.preventDefault()}
                >
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Choose "Auto" and for each H2 section we will automatically decide between
                creating a unique AI image or embedding a YouTube video!
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="imageOption"
          control={control}
          defaultValue="none"
          render={({ field: { onChange, value } }) => (
            <div className="border rounded-md p-1">
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onChange("none")}
                  className={`py-2 px-4 rounded-md ${
                    value === "none"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => onChange("auto")}
                  className={`py-2 px-4 rounded-md ${
                    value === "auto"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => onChange("images")}
                  className={`py-2 px-4 rounded-md ${
                    value === "images"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Images
                </button>
                <button
                  type="button"
                  onClick={() => onChange("videos")}
                  className={`py-2 px-4 rounded-md ${
                    value === "videos"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  Videos
                </button>
              </div>
            </div>
          )}
        />
      </div>

      {watchImageOption !== "none" && watchImageOption !== "videos" && (
        <>
          <div className="space-y-2">
            <Label>Image Model</Label>
            <Controller
              name="imageModel"
              control={control}
              defaultValue="premium"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Image Style</Label>
            <Controller
              name="imageStyle"
              control={control}
              defaultValue="illustration"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageStyles.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Image Size</Label>
            <Controller
              name="imageSize"
              control={control}
              defaultValue="1024x1024"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Max Images</Label>
            <Controller
              name="maxImages"
              control={control}
              defaultValue={3}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={field.value}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </div>
        </>
      )}

      {(watchImageOption === "auto" || watchImageOption === "videos") && (
        <div className="space-y-2">
          <Label>Max Videos</Label>
          <Controller
            name="maxVideos"
            control={control}
            defaultValue={2}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                max={10}
                value={field.value}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
