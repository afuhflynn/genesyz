"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import {
  UploadCloud,
  X,
  FileAudio,
  FileImage,
  File as FileIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept: Record<string, string[]>;
  maxSize?: number; // in bytes
  label?: string;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = "Drag & drop a file here, or click to select",
  className,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          toast.error(
            `File is too large. Max size is ${maxSize / 1024 / 1024}MB`
          );
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [maxSize, onFileSelect]
  );

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-10 transition-colors hover:border-muted-foreground/50",
        isDragActive && "border-primary bg-primary/5",
        selectedFile && "border-primary bg-primary/5",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {selectedFile ? (
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-background p-2 shadow-sm">
              {selectedFile.type.startsWith("image/") ? (
                <FileImage className="h-8 w-8 text-primary" />
              ) : selectedFile.type.startsWith("audio/") ? (
                <FileAudio className="h-8 w-8 text-primary" />
              ) : (
                <FileIcon className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-background p-4 shadow-sm">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSize / 1024 / 1024}MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
