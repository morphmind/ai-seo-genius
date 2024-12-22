import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

interface ProcessButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

const ProcessButton = ({ onClick, isProcessing }: ProcessButtonProps) => {
  return (
    <Button
      className="w-full"
      onClick={onClick}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          İşleniyor...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          İç Linkleme İşlemini Başlat
        </>
      )}
    </Button>
  );
};

export default ProcessButton;
