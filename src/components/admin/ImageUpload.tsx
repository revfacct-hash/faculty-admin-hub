import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { convertFileToBase64, validateFileSize, validateFileType, formatFileSize } from "@/lib/admin-utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
  label: string;
  helperText?: string;
  maxSizeBytes?: number;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  circular?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label,
  helperText,
  maxSizeBytes = 1000000, // 1MB default
  className,
  aspectRatio = "auto",
  circular = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handleFile = async (file: File) => {
    // Validate type
    if (!validateFileType(file, allowedTypes)) {
      toast.error("Solo se permiten imágenes JPG, PNG o WebP");
      return;
    }

    // Validate size
    if (!validateFileSize(file, maxSizeBytes)) {
      toast.error(`La imagen es muy grande. Máximo ${formatFileSize(maxSizeBytes)}`);
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await convertFileToBase64(file);
      onChange(base64);
      toast.success("Imagen cargada correctamente");
    } catch (error) {
      toast.error("Error al cargar la imagen");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          value ? "bg-muted/50" : "bg-card",
          circular && "rounded-full overflow-hidden",
          aspectRatioClass
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {value ? (
          <div className={cn("relative group", aspectRatioClass, !aspectRatioClass && "min-h-[150px]")}>
            <img
              src={value}
              alt="Preview"
              className={cn(
                "w-full h-full object-cover",
                circular ? "rounded-full" : "rounded-lg"
              )}
            />
            <div className={cn(
              "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2",
              circular ? "rounded-full" : "rounded-lg"
            )}>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                Cambiar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className={cn(
              "flex flex-col items-center justify-center py-8 px-4 cursor-pointer",
              circular && "aspect-square"
            )}
            onClick={() => inputRef.current?.click()}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  <span className="text-primary font-medium">Haz clic</span> o arrastra una imagen
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP · Máx {formatFileSize(maxSizeBytes)}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
