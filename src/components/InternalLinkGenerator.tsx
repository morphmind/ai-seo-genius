import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FileUploader from "./internal-linking/FileUploader";
import LinkingMethodSelector from "./internal-linking/LinkingMethodSelector";
import ArticleInput from "./internal-linking/ArticleInput";
import ProcessButton from "./internal-linking/ProcessButton";
import LinkReport from "./internal-linking/LinkReport";
import { useContentProcessor, ProcessedLink } from "./internal-linking/LinkProcessor";

const InternalLinkGenerator = () => {
  const [urlDatabase, setUrlDatabase] = useState<File | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkingMethod, setLinkingMethod] = useState<"manual" | "auto">("manual");
  const [manualLinkCount, setManualLinkCount] = useState("3");
  const [processedLinks, setProcessedLinks] = useState<ProcessedLink[]>([]);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const { processContent } = useContentProcessor();

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(0);

    await processContent({
      urlDatabase,
      articleContent,
      linkingMethod,
      manualLinkCount,
      onProcessComplete: (links, content) => {
        setProcessedLinks(links);
        setProcessedContent(content);
        setIsProcessing(false);
      },
      onProgress: setProgress,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FileUploader 
              onFileUpload={setUrlDatabase}
              urlDatabase={urlDatabase}
            />

            <LinkingMethodSelector
              linkingMethod={linkingMethod}
              manualLinkCount={manualLinkCount}
              onMethodChange={setLinkingMethod}
              onCountChange={setManualLinkCount}
            />

            <ArticleInput
              value={articleContent}
              onChange={setArticleContent}
            />

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  İşleniyor... ({progress}%)
                </p>
              </div>
            )}

            <ProcessButton
              onClick={handleProcess}
              isProcessing={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {processedLinks.length > 0 && (
        <LinkReport links={processedLinks} content={processedContent} />
      )}
    </div>
  );
};

export default InternalLinkGenerator;
