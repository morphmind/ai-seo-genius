import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FormValues } from "../types";

const toneOptions = [
  { value: "seo_optimized", label: "SEO Optimized (Confident, Knowledgeable, Neutral and Clear)" },
  { value: "excited", label: "Excited" },
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "humorous", label: "Humorous" }
];

const pointOfViewOptions = [
  { value: "first_person", label: "First Person (I, me, my, mine)" },
  { value: "first_person_plural", label: "First Person Plural (we, us, our, ours)" },
  { value: "second_person", label: "Second Person (you, your, yours)" },
  { value: "third_person", label: "Third Person (he, she, it, they)" }
];

interface ToneAndLanguageSettingsProps {
  control: Control<FormValues>;
  languages: string[];
  countries: { code: string; name: string; }[];
}

export function ToneAndLanguageSettings({ control, languages, countries }: ToneAndLanguageSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tone of Voice</Label>
        <Controller
          name="toneOfVoice"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Language</Label>
        <Controller
          name="language"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Country</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="cursor-help" onClick={(e) => e.preventDefault()}>
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                Choose the primary country you want to rank for. This option will help localize
                the results we use for Real-Time Data, SEO Optimization, and FAQ.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Point of View</Label>
        <Controller
          name="pointOfView"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select point of view" />
              </SelectTrigger>
              <SelectContent>
                {pointOfViewOptions.map((pov) => (
                  <SelectItem key={pov.value} value={pov.value}>
                    {pov.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}
