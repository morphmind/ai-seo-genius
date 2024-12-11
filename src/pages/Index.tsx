import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import ContentGenerator from "@/components/ContentGenerator";
import ImagePromptGenerator from "@/components/ImagePromptGenerator";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content");
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(186,73,73)] to-[rgb(186,73,73,0.7)] bg-clip-text text-transparent dark:from-[rgb(186,73,73,0.8)] dark:to-[rgb(186,73,73,0.5)]">
            KAho Write Tools
          </h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="content">Content Generator</TabsTrigger>
              <TabsTrigger value="image">Image Prompt</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-0">
              <ContentGenerator />
            </TabsContent>
            <TabsContent value="image" className="mt-0">
              <ImagePromptGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;