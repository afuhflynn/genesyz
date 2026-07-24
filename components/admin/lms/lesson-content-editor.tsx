"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizData {
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
}

interface AssignmentData {
  instructions: string;
  submissionType: "TEXT" | "FILE" | "LINK";
  dueDays: number | null;
}

interface LessonContentEditorProps {
  lesson: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Record<string, unknown>) => void;
  isSaving: boolean;
}

export function LessonContentEditor({
  lesson,
  open,
  onOpenChange,
  onSave,
  isSaving,
}: LessonContentEditorProps) {
  const type = lesson.type;

  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [duration, setDuration] = useState(lesson.duration?.toString() ?? "");

  const [textContent, setTextContent] = useState(
    typeof lesson.content === "string"
      ? lesson.content
      : lesson.content?.body ?? "",
  );

  const quizInitial =
    lesson.quiz && typeof lesson.quiz === "object"
      ? lesson.quiz
      : { questions: [], passingScore: 70, maxAttempts: 3 };
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    Array.isArray(quizInitial.questions) ? quizInitial.questions : [],
  );
  const [passingScore, setPassingScore] = useState(
    quizInitial.passingScore?.toString() ?? "70",
  );
  const [maxAttempts, setMaxAttempts] = useState(
    quizInitial.maxAttempts?.toString() ?? "3",
  );

  const assignmentInitial =
    lesson.assignment && typeof lesson.assignment === "object"
      ? lesson.assignment
      : { instructions: "", submissionType: "TEXT", dueDays: null };
  const [instructions, setInstructions] = useState(
    assignmentInitial.instructions ?? "",
  );
  const [submissionType, setSubmissionType] = useState(
    assignmentInitial.submissionType ?? "TEXT",
  );
  const [dueDays, setDueDays] = useState(
    assignmentInitial.dueDays?.toString() ?? "",
  );

  const handleSave = () => {
    const data: Record<string, unknown> = {};

    if (type === "VIDEO") {
      data.videoUrl = videoUrl || null;
      data.duration = duration ? parseInt(duration, 10) : null;
    }

    if (type === "TEXT") {
      data.content = textContent;
    }

    if (type === "QUIZ") {
      data.quiz = {
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          ...(q.explanation ? { explanation: q.explanation } : {}),
        })),
        passingScore: parseInt(passingScore, 10) || 70,
        maxAttempts: parseInt(maxAttempts, 10) || 3,
      };
    }

    if (type === "ASSIGNMENT") {
      data.assignment = {
        instructions,
        submissionType,
        ...(dueDays ? { dueDays: parseInt(dueDays, 10) } : { dueDays: null }),
      };
    }

    onSave(data);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    index: number,
    field: string,
    value: unknown,
  ) => {
    setQuestions(
      questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q,
      ),
    );
  };

  const updateOption = (
    qIndex: number,
    oIndex: number,
    value: string,
  ) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((o, j) => (j === oIndex ? value : o)),
            }
          : q,
      ),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(
      questions.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = q.options.filter((_, j) => j !== oIndex);
        const newCorrect =
          q.correctAnswer === oIndex
            ? 0
            : q.correctAnswer > oIndex
              ? q.correctAnswer - 1
              : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      }),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {type === "VIDEO" ? "Video" : type === "TEXT" ? "Text" : type === "QUIZ" ? "Quiz" : "Assignment"} Content
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {type === "VIDEO" && (
            <>
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="300"
                  min={0}
                />
              </div>
            </>
          )}

          {type === "TEXT" && (
            <div className="space-y-2">
              <Label>Content (Markdown)</Label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={16}
                placeholder="Write your lesson content here..."
                className="font-mono text-sm"
              />
            </div>
          )}

          {type === "QUIZ" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Attempts</Label>
                  <Input
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    min={1}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Questions</Label>
                  <Button size="sm" variant="outline" onClick={addQuestion}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add Question
                  </Button>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Question {qIndex + 1}</Label>
                        <Input
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(qIndex, "question", e.target.value)
                          }
                          placeholder="Enter your question"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-6 shrink-0"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2 pl-2">
                      <Label className="text-xs text-muted-foreground">
                        Answer Options
                      </Label>
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() =>
                              updateQuestion(qIndex, "correctAnswer", oIndex)
                            }
                            className="shrink-0"
                          />
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className="text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => removeOption(qIndex, oIndex)}
                            disabled={q.options.length <= 2}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => addOption(qIndex)}
                      >
                        + Add option
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Explanation (optional)
                      </Label>
                      <Input
                        value={q.explanation ?? ""}
                        onChange={(e) =>
                          updateQuestion(qIndex, "explanation", e.target.value)
                        }
                        placeholder="Why is this the correct answer?"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No questions yet. Click "Add Question" to get started.
                  </p>
                )}
              </div>
            </>
          )}

          {type === "ASSIGNMENT" && (
            <>
              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={10}
                  placeholder="Describe what the student needs to submit..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Submission Type</Label>
                  <Select value={submissionType} onValueChange={setSubmissionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="FILE">File Upload</SelectItem>
                      <SelectItem value="LINK">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Days (from enrollment)</Label>
                  <Input
                    type="number"
                    value={dueDays}
                    onChange={(e) => setDueDays(e.target.value)}
                    placeholder="7"
                    min={0}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Content"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
