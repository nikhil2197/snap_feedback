"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SubmissionResponse, CriterionFeedback } from "@/lib/api";
import React, { useState } from "react";

function EvaluationSection({ feedback }: { feedback: Record<string, CriterionFeedback> | undefined }) {
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
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6">
        {feedback && Object.keys(feedback).length > 0 ? (
          Object.entries(feedback).map(([criterionName, criterion], index) => (
            <div
              key={index}
              className="space-y-3 p-3 sm:p-4 border rounded-lg mt-4 sm:mt-6"
            >
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{criterionName}</h3>
              <div className="space-y-2 flex items-center gap-2">
                <span className={`inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getSignalColor(criterion.score)}`}></span>
                <p className={`font-medium text-sm sm:text-base ${getScoreColor(criterion.score)}`}>{getScoreText(criterion.score)} ({criterion.score})</p>
              </div>
              <div className="p-2 sm:p-3 bg-muted/30 rounded-md space-y-1 sm:space-y-2">
                <p className="font-semibold text-xs sm:text-sm">What went well:</p>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{criterion.what_went_well || '-'}</p>
                <p className="font-semibold text-xs sm:text-sm mt-2 sm:mt-3">What could be improved:</p>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{criterion.what_could_be_improved || '-'}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm sm:text-base">No feedback provided.</p>
        )}
      </div>
    </div>
  )
}

export function FeedbackDisplay({ submission }: { submission: SubmissionResponse | null }) {
    const [selectedTab, setSelectedTab] = useState<'playground' | 'toy'>('playground');

    if (!submission) {
        return (
            <div className="text-center p-4">
                <p className="text-sm sm:text-base">No submission data found. Please start over.</p>
            </div>
        )
    }

  const {
    playground_feedback,
    toy_feedback
  } = submission;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Feedback</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Switch between playground and toy design tabs to see the feedback for each.
          </p>
        </div>

        {/* Unified Tabs and Content Container */}
        <div className="w-full border-b border-gray-200 bg-card text-card-foreground shadow-sm rounded-none border-t-0">
          <div className="flex w-full pt-2 pb-0 bg-transparent">
            <button
              className={`flex-1 flex items-center justify-center px-6 sm:px-8 h-14 text-base sm:text-lg font-medium focus:outline-none border-x-0 border-t-0 border-b-2 ${selectedTab === 'playground' ? 'border-b-transparent border-b-0 bg-primary text-primary-foreground' : 'border-b-gray-200 bg-background text-foreground'} rounded-none`}
              style={{ borderBottomWidth: selectedTab === 'playground' ? '0px' : '2px' }}
              onClick={() => setSelectedTab('playground')}
            >
              Playground Design
            </button>
            <button
              className={`flex-1 flex items-center justify-center px-6 sm:px-8 h-14 text-base sm:text-lg font-medium focus:outline-none border-x-0 border-t-0 border-b-2 ${selectedTab === 'toy' ? 'border-b-transparent border-b-0 bg-primary text-primary-foreground' : 'border-b-gray-200 bg-background text-foreground'} rounded-none`}
              style={{ borderBottomWidth: selectedTab === 'toy' ? '0px' : '2px' }}
              onClick={() => setSelectedTab('toy')}
            >
              Toy Design
            </button>
          </div>
          {/* Border below tabs */}
          <div className="border-b border-gray-200 w-full" />
          <div className="p-0">
            {selectedTab === 'playground' && (
              <EvaluationSection feedback={playground_feedback} />
            )}
            {selectedTab === 'toy' && (
              <EvaluationSection feedback={toy_feedback} />
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4 sm:pt-6">
          <Button size="lg" className="px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg" onClick={() => window.location.reload()}>
            Start New Evaluation
          </Button>
        </div>
      </div>
    </div>
  )
} 