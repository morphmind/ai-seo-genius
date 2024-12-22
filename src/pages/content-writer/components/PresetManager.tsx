import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { FormValues } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PresetManagerProps {
  onLoad: (preset: Partial<FormValues>) => void;
  onSave: (preset: Partial<FormValues>) => void;
  currentValues: Partial<FormValues>;
}

export function PresetManager({ onLoad, onSave, currentValues }: PresetManagerProps) {
  const [presets, setPresets] = useState<Array<{id: string; name: string; config: Partial<FormValues>}>>(() => {
    const saved = localStorage.getItem("content_writer_presets");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  const handleSavePreset = (name: string, isUpdate = false) => {
    const id = isUpdate ? selectedPreset : crypto.randomUUID();
    const preset = {
      id,
      name,
      config: currentValues
    };

    let updatedPresets;
    if (isUpdate) {
      updatedPresets = presets.map(p => p.id === id ? preset : p);
    } else {
      updatedPresets = [...presets, preset];
    }

    setPresets(updatedPresets);
    localStorage.setItem("content_writer_presets", JSON.stringify(updatedPresets));
    onSave(currentValues);
    setShowNewDialog(false);
    setNewPresetName("");
    setSelectedPreset(id);
    
    toast({
      description: isUpdate ? "Preset updated successfully" : "New preset saved successfully"
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      onLoad(preset.config);
      toast({
        description: "Preset loaded successfully"
      });
    }
  };

  const handleDeletePreset = () => {
    if (selectedPreset) {
      const updatedPresets = presets.filter(preset => preset.id !== selectedPreset);
      setPresets(updatedPresets);
      localStorage.setItem("content_writer_presets", JSON.stringify(updatedPresets));
      setSelectedPreset("");
      toast({
        description: "Preset deleted successfully"
      });
    }
  };

  const handleSaveButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Form submit'i engellemek için
    if (selectedPreset) {
      // Mevcut preset'i güncelle
      const preset = presets.find(p => p.id === selectedPreset);
      if (preset) {
        handleSavePreset(preset.name, true);
      }
    } else {
      // Yeni preset oluşturma dialogunu göster
      setShowNewDialog(true);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Select value={selectedPreset} onValueChange={handleLoadPreset}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a preset" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          size="icon"
          title="Save Current Settings"
          onClick={handleSaveButtonClick}
        >
          <Save className="h-4 w-4" />
        </Button>

        <Button 
          variant="outline" 
          size="icon"
          title="New Preset"
          onClick={(e) => {
            e.preventDefault();
            setShowNewDialog(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>

        {selectedPreset && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                title="Delete Preset"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Preset</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this preset? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePreset}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Preset Name</Label>
              <Input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Enter preset name"
              />
            </div>
            <Button 
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                if (newPresetName.trim()) {
                  handleSavePreset(newPresetName);
                }
              }}
            >
              Create Preset
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
