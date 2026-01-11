"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateIdea } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Image as ImageIcon, Type, Loader2 } from "lucide-react";

import { useUploadThing } from "@/lib/uploadthing";

export default function NewIdeaPage() {
  const router = useRouter();
  const createIdea = useCreateIdea();
  const { startUpload: startImageUpload, isUploading: isImageUploading } =
    useUploadThing("imageUploader");
  const { startUpload: startAudioUpload, isUploading: isAudioUploading } =
    useUploadThing("audioUploader");

  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("text");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text && !audioFile && !imageFile) {
      return;
    }

    const formData = new FormData();
    if (text) formData.append("text", text);

    try {
      if (audioFile) {
        const res = await startAudioUpload([audioFile]);
        if (res && res[0]) {
          formData.append("audio", JSON.stringify(res[0]));
        } else {
          throw new Error("Audio upload failed");
        }
      }

      if (imageFile) {
        const res = await startImageUpload([imageFile]);
        if (res && res[0]) {
          formData.append("image", JSON.stringify(res[0]));
        } else {
          throw new Error("Image upload failed");
        }
      }

      createIdea.mutate(formData, {
        onSuccess: (data) => {
          router.push(`/ideas/${data.id}`);
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      // Handle error (toast is already shown by useCreateIdea for mutation errors, but upload errors need handling)
    }
  };

  const isSubmitting =
    createIdea.isPending || isImageUploading || isAudioUploading;

  return (
    <div className="max-w-2xl mx-auto space-y-8 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Capture New Idea</h1>
        <p className="text-muted-foreground mt-2">
          Describe your startup idea using text, voice, or an image (like a
          napkin sketch). Our AI agents will analyze it immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Idea Input</CardTitle>
          <CardDescription>
            Choose the most convenient way to express your idea.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="text">
                  <Type className="mr-2 h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="audio">
                  <Mic className="mr-2 h-4 w-4" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="image">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idea-text">Describe your idea</Label>
                  <Textarea
                    id="idea-text"
                    placeholder="I want to build a platform that..."
                    className="min-h-[200px] resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload voice memo</Label>
                  <FileUpload
                    onFileSelect={setAudioFile}
                    accept={{ "audio/*": [".mp3", ".wav", ".m4a", ".webm"] }}
                    label="Drop audio file here (mp3, wav, m4a)"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll transcribe your audio automatically.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload sketch or diagram</Label>
                  <FileUpload
                    onFileSelect={setImageFile}
                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                    label="Drop image file here"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Our vision AI will extract text and structure from your
                    image.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || (!text && !audioFile && !imageFile)}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Analyze Idea
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
