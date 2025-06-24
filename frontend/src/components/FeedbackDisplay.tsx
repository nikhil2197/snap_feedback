"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SubmissionResponse, CriterionFeedback } from "@/lib/api";

interface EvaluationSectionProps {
  title: string
  feedback: Record<string, CriterionFeedback> | undefined
}

function EvaluationSection({ title, feedback }: EvaluationSectionProps) {
  const getScoreColor = (score: number) => {
    if (score === 1) return 'text-green-600';
    if (score === 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreText = (score: number) => {
    if (score === 1) return 'Perfect';
    if (score === 0.5) return 'Partial';
    return 'Not Done';
  };

  const getSignalColor = (score: number) => {
    if (score === 1) return 'bg-green-500';
    if (score === 0.5) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {feedback && Object.keys(feedback).length > 0 ? (
          Object.entries(feedback).map(([criterionName, criterion], index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-foreground">{criterionName}</h3>
              <div className="space-y-2 flex items-center gap-2">
                <span className={`inline-block w-4 h-4 rounded-full ${getSignalColor(criterion.score)}`}></span>
                <p className={`font-medium ${getScoreColor(criterion.score)}`}>
                  {getScoreText(criterion.score)} ({criterion.score})
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded-md space-y-1">
                <p className="font-semibold text-sm">What went well:</p>
                <p className="text-muted-foreground text-sm">{criterion.what_went_well || '-'}</p>
                <p className="font-semibold text-sm mt-2">What could be improved:</p>
                <p className="text-muted-foreground text-sm">{criterion.what_could_be_improved || '-'}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No feedback provided.</p>
        )}
      </CardContent>
    </Card>
  )
}

export function FeedbackDisplay({ submission }: { submission: SubmissionResponse | null }) {
    if (!submission) {
        return (
            <div className="text-center">
                <p>No submission data found. Please start over.</p>
            </div>
        )
    }

  const {
    playground_feedback,
    toy_feedback
  } = submission;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Design Evaluation Feedback</h1>
          <p className="text-muted-foreground">
            Here is the AI-generated feedback for your designs.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-1">
          <EvaluationSection title="Playground Design" feedback={playground_feedback} />
          <EvaluationSection title="Toy Design" feedback={toy_feedback} />
        </div>

        <div className="flex justify-center pt-6">
          <Button size="lg" className="px-8" onClick={() => window.location.reload()}>
            Start New Evaluation
          </Button>
        </div>
      </div>
    </div>
  )
} 