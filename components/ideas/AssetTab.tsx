"use client";

import { IdeaInput, IdeaInputType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileIcon,
  ImageIcon,
  MusicIcon,
  Trash2,
  Download,
  Play,
  Pause,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface AssetTabProps {
  ideaId: string;
  inputs: IdeaInput[];
}

export function AssetTab({ ideaId, inputs }: AssetTabProps) {
  const queryClient = useQueryClient();
  const images = inputs.filter((i) => i.type === "IMAGE");
  const audio = inputs.filter((i) => i.type === "AUDIO");

  const deleteAsset = useMutation({
    mutationFn: (assetId: string) => api.mutations.assets.delete(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea", ideaId] });
      toast.success("Asset deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete asset");
    },
  });

  return (
    <div className="space-y-8">
      {/* Images Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Images
          </h3>
        </div>
        {images.length === 0 ? (
          <Card className="bg-muted/10 border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              No images uploaded for this idea.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group relative">
                <div className="aspect-square relative">
                  <img
                    src={image.fileUrl || ""}
                    alt={image.fileName || "Idea image"}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(image.fileUrl || "", "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to delete this image?")
                        ) {
                          deleteAsset.mutate(image.id);
                        }
                      }}
                      disabled={deleteAsset.isPending}
                    >
                      {deleteAsset.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-2 text-xs truncate text-muted-foreground">
                  {image.fileName}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Audio Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MusicIcon className="h-5 w-5 text-primary" />
            Voice Notes
          </h3>
        </div>
        {audio.length === 0 ? (
          <Card className="bg-muted/10 border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              No voice notes uploaded for this idea.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {audio.map((note) => (
              <AudioPlayer
                key={note.id}
                note={note}
                onDelete={() => deleteAsset.mutate(note.id)}
                isDeleting={deleteAsset.isPending}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AudioPlayer({
  note,
  onDelete,
  isDeleting,
}: {
  note: IdeaInput;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audio) {
      const newAudio = new Audio(note.fileUrl || "");
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 fill-current" />
          )}
        </Button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {note.fileName || "Voice Note"}
          </div>
          <div className="text-xs text-muted-foreground">
            {note.transcription ? (
              <p className="line-clamp-1 italic">"{note.transcription}"</p>
            ) : (
              "No transcription available"
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(note.fileUrl || "", "_blank")}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm("Are you sure you want to delete this voice note?")) {
                onDelete();
              }
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
