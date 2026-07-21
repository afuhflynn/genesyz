"use client";

import {
  ExternalLink,
  Globe,
  Image,
  Loader2,
  MapPin,
  Mic,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import { LocationSelector } from "@/components/location";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IdeaSubmittedSuccess } from "./IdeaSubmittedSuccess";

interface EnhancedNewIdeaFormProps {
  onClose?: () => void;
  enabledModes?: ("text" | "voice" | "image")[];
}

type InputMode = "text" | "voice" | "image";

export function EnhancedNewIdeaForm({
  onClose,
  enabledModes = ["text"],
}: EnhancedNewIdeaFormProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [targetLocation, setTargetLocation] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedIdeaId, setSubmittedIdeaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const userLocation = (session?.user as Record<string, unknown> | undefined)
    ?.location as string | undefined;

  const isVoiceEnabled = enabledModes.includes("voice");
  const isImageEnabled = enabledModes.includes("image");

  const handleModeChange = (value: string) => {
    const newMode = value as InputMode;
    if (newMode === "voice" && !isVoiceEnabled) return;
    if (newMode === "image" && !isImageEnabled) return;
    setMode(newMode);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "audio" | "image",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // In production, upload to storage service
      const fakeUrl = `https://storage.example.com/${Date.now()}-${file.name}`;

      if (type === "audio") {
        setAudioUrl(fakeUrl);
      } else {
        setImageUrl(fakeUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Stop recording and get audio
      setAudioUrl("https://storage.example.com/recording.webm");
    } else {
      setIsRecording(true);
      // Start recording (using MediaRecorder API in production)
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && !audioUrl && !imageUrl) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("targetLocation", JSON.stringify(targetLocation));

      if (audioUrl) {
        formData.append(
          "audio",
          JSON.stringify({
            url: audioUrl,
            name: "recording.webm",
            type: "audio/webm",
            size: 0,
          }),
        );
        formData.append(
          "transcription",
          transcription || "Transcription pending...",
        );
      }

      if (imageUrl) {
        formData.append(
          "image",
          JSON.stringify({
            url: imageUrl,
            name: "image.jpg",
            type: "image/jpeg",
            size: 0,
          }),
        );
        formData.append("ocrText", ocrText || "OCR pending...");
      }

      const response = await fetch("/api/ideas", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const createdIdea = await response.json();
        setSubmittedIdeaId(createdIdea?.id ?? null);
        setSubmitted(true);
      } else {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.error || `Failed to create idea (${response.status})`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create idea";
      toast.error(message);
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmittedIdeaId(null);
    setText("");
    setTargetLocation(null);
    setAudioUrl(null);
    setImageUrl(null);
    setTranscription("");
    setOcrText("");
    setMode("text");
  };

  if (submitted) {
    return (
      <IdeaSubmittedSuccess
        onReset={handleReset}
        ideaId={submittedIdeaId ?? undefined}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Capture Your Idea
        </CardTitle>
        <CardDescription>
          Describe your startup idea in text. Our AI agents will analyze it
          immediately with market insights.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Mode Tabs */}
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              disabled={!isVoiceEnabled}
              className={cn(
                "flex items-center gap-2",
                !isVoiceEnabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <Mic className="h-4 w-4" />
              Voice
              {!isVoiceEnabled && (
                <Badge variant="secondary" className="text-[10px] ml-1">
                  Soon
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="image"
              disabled={!isImageEnabled}
              className={cn(
                "flex items-center gap-2",
                !isImageEnabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <Image className="h-4 w-4" />
              Image
              {!isImageEnabled && (
                <Badge variant="secondary" className="text-[10px] ml-1">
                  Soon
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Text Input */}
          <TabsContent value="text" className="space-y-4 mt-4">
            <Textarea
              placeholder="Describe your startup idea... What problem are you solving? Who is your target customer? What's your solution?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={10000}
              className="min-h-[150px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Be specific about the problem, your solution, and who
              benefits most. (max 10,000 characters)
            </p>
          </TabsContent>

          {/* Voice Input */}
          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed rounded-lg">
              {audioUrl ? (
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Recording captured</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAudioUrl(null)}
                    >
                      Retake
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                    <Mic className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      {isRecording ? "Recording..." : "Record your idea"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRecording
                        ? "Tap to stop"
                        : "Tap to start recording (max 2 min)"}
                    </p>
                  </div>
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="lg"
                    onClick={handleVoiceRecording}
                    className={cn(
                      "h-14 w-14 rounded-full",
                      isRecording && "animate-pulse",
                    )}
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Transcription Preview */}
            {(audioUrl || transcription) && (
              <div className="space-y-2">
                <label htmlFor="transcription" className="text-sm font-medium">
                  Transcription
                </label>
                <Textarea
                  id="transcription"
                  placeholder="Transcription will appear here..."
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </TabsContent>

          {/* Image Input */}
          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed rounded-lg">
              {imageUrl ? (
                <div className="text-center space-y-4">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      className="max-h-48 rounded-lg object-contain"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={() => setImageUrl(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Upload an image</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a sketch, whiteboard, or document
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "image")}
                  />
                </>
              )}
            </div>

            {/* OCR Text Preview */}
            {(imageUrl || ocrText) && (
              <div className="space-y-2">
                <label htmlFor="ocr-text" className="text-sm font-medium">
                  Extracted Text
                </label>
                <Textarea
                  id="ocr-text"
                  placeholder="Text extracted from image..."
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Location Selector */}
        <div className="space-y-2">
          <label
            htmlFor="location-selector"
            className="text-sm font-medium flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Target Location
          </label>
          <LocationSelector
            id="location-selector"
            value={targetLocation}
            onChange={setTargetLocation}
          />
          <p className="text-xs text-muted-foreground">
            Where will this idea operate? Location context helps our AI research
            local market conditions, competitors, and regulations.
            {userLocation && !targetLocation && (
              <button
                type="button"
                onClick={() =>
                  setTargetLocation({
                    country: userLocation,
                    countryCode: "OTHER",
                    isGlobal: false,
                  })
                }
                className="ml-1 text-primary underline underline-offset-2 hover:no-underline"
              >
                Use saved location ({userLocation})
              </button>
            )}
          </p>
        </div>

        {/* Character Count */}
        <div className="flex items-center justify-between text-sm">
          <span
            className={
              text.length > 9000
                ? "text-destructive font-medium"
                : "text-muted-foreground"
            }
          >
            {text.length}/10000 characters
          </span>
          <span className="text-muted-foreground">
            ~{Math.ceil(text.length / 200)} min read
          </span>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 pt-4 border-t">
          {onClose && (
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() && !audioUrl && !imageUrl}
            className={cn("flex-1", !onClose && "w-full")}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Idea...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Research
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
