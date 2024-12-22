import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  urlDatabase: File | null;
}

const FileUploader = ({ onFileUpload, urlDatabase }: FileUploaderProps) => {
  const { toast } = useToast();

  const handleUrlDatabaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.json')) {
        onFileUpload(file);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen .json formatında bir URL database dosyası yükleyin",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="urlDatabase">URL Database (.json)</Label>
      <Input
        id="urlDatabase"
        type="file"
        accept=".json"
        onChange={handleUrlDatabaseUpload}
        className="cursor-pointer"
      />
      {urlDatabase && (
        <p className="text-sm text-muted-foreground">
          Yüklenen dosya: {urlDatabase.name}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
