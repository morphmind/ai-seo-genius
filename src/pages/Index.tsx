import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContentGenerator from "@/components/ContentGenerator";
import ImagePromptGenerator from "@/components/ImagePromptGenerator";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("content");

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">SEO Tools</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Content Generator</TabsTrigger>
          <TabsTrigger value="image">Image Prompt</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="content">
            <ContentGenerator />
          </TabsContent>
          <TabsContent value="image">
            <ImagePromptGenerator />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Index;