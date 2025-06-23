"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SubmissionResponse, CriterionFeedback } from "@/lib/api";

interface EvaluationSectionProps {
  title: string
  feedback: CriterionFeedback[] | undefined
}

function EvaluationSection({ title, feedback }: EvaluationSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {feedback && feedback.length > 0 ? (
          feedback.map((criterion, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-foreground">{criterion.criterion_name}</h3>
              <div className="space-y-2">
                <p className={`font-medium ${criterion.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {criterion.passed ? "Pass" : "Fail"}
                </p>
                <div className="p-2 bg-muted/30 rounded-md">
                    <p className="font-semibold text-sm">What went well:</p>
                    <p className="text-muted-foreground text-sm">{criterion.what_went_well}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-md">
                    <p className="font-semibold text-sm">What could be better:</p>
                    <p className="text-muted-foreground text-sm">{criterion.what_could_be_better}</p>
                </div>
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