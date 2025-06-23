"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getFeedback } from "@/lib/api"
import { useEffect, useState } from "react"

interface EvaluationSectionProps {
  title: string
  sections: string[]
  feedback: string
}

interface SubsectionProps {
  title: string
  id: string
}

function Subsection({ title, id }: SubsectionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center space-x-2">
        <Checkbox id={`${id}-pass`} />
        <Label htmlFor={`${id}-pass`} className="text-sm font-medium">
          Pass
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-well`} className="text-sm font-medium text-green-700">
          What went well:
        </Label>
        <Textarea
          id={`${id}-well`}
          placeholder="Describe the positive aspects and strengths..."
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-improvement`} className="text-sm font-medium text-orange-700">
          Areas for improvement:
        </Label>
        <Textarea
          id={`${id}-improvement`}
          placeholder="Suggest specific improvements and recommendations..."
          className="min-h-[80px] resize-none"
        />
      </div>
    </div>
  )
}

function EvaluationSection({ title, sections, feedback }: EvaluationSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{feedback}</p>
        {sections.map((section, index) => (
          <div key={index} className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{section}</h3>
            <Subsection
              title={section}
              id={`${title.toLowerCase().replace(/\s+/g, "-")}-${section.toLowerCase().replace(/\s+/g, "-")}`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function FeedbackDisplay({ submissionId }: { submissionId: number | null }) {
  const [playgroundFeedback, setPlaygroundFeedback] = useState("");
  const [toyFeedback, setToyFeedback] = useState("");

  useEffect(() => {
    if (submissionId) {
      getFeedback(submissionId).then(data => {
        setPlaygroundFeedback(data.playground_feedback);
        setToyFeedback(data.toy_feedback);
      })
    }
  }, [submissionId]);

  const playgroundSections = ["Narrative", "Layout and flow", "Cleanup"]

  const toyDesignSections = [
    "Purpose",
    "Anchor and choice material",
    "Spark curiosity",
    "Challenge adjustment",
    "Self-served",
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Design Evaluation Feedback</h1>
          <p className="text-muted-foreground">
            Comprehensive evaluation form for Playground Design and Toy Design categories
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2">
          <EvaluationSection title="Playground Design" sections={playgroundSections} feedback={playgroundFeedback} />

          <EvaluationSection title="Toy Design" sections={toyDesignSections} feedback={toyFeedback}/>
        </div>

        <div className="flex justify-center pt-6">
          <Button size="lg" className="px-8">
            Submit Evaluation
          </Button>
        </div>
      </div>
    </div>
  )
} 