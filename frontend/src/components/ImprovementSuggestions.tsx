"use client";

import { Button } from "@/components/ui/button"
import type { ImprovementSuggestionsResponse } from "@/lib/api";
import React, { useState, useCallback } from "react";

function SuggestionsSection({ suggestions }: { suggestions: Record<string, string[]> | undefined }) {
  return (
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6">
        {suggestions && Object.keys(suggestions).length > 0 ? (
          Object.entries(suggestions).map(([criterionName, suggestionList], index) => (
            <div
              key={index}
              className="space-y-3 p-3 sm:p-4 border rounded-lg mt-4 sm:mt-6"
            >
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{criterionName}</h3>
              <div className="p-2 sm:p-3 bg-muted/30 rounded-md space-y-2 sm:space-y-3">
                <p className="font-semibold text-xs sm:text-sm">Actionable Improvement Suggestions:</p>
                <ul className="space-y-1 sm:space-y-2">
                  {suggestionList.map((suggestion, suggestionIndex) => (
                    <li key={suggestionIndex} className="text-muted-foreground text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm sm:text-base">No improvement suggestions available.</p>
        )}
      </div>
    </div>
  )
}

export function ImprovementSuggestions({ 
  submissionId, 
  onBackToEvaluation 
}: { 
  submissionId: string;
  onBackToEvaluation: () => void;
}) {
  const [selectedTab, setSelectedTab] = useState<'playground' | 'toy'>('playground');
  const [suggestions, setSuggestions] = useState<ImprovementSuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/improvement-suggestions/${submissionId}`);
      if (!response.ok) {
        throw new Error('Failed to load improvement suggestions');
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  React.useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const response = await fetch(`/api/improvement-suggestions/${submissionId}/regenerate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to regenerate suggestions');
      }
      // Wait a bit and then reload
      setTimeout(() => {
        loadSuggestions();
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground text-center px-4">Loading improvement suggestions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <p className="text-destructive font-semibold text-lg sm:text-xl">An Error Occurred</p>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base px-4">{error}</p>
        <div className="mt-4 space-x-4">
          <Button onClick={handleRegenerate} disabled={isRegenerating}>
            {isRegenerating ? 'Regenerating...' : 'Retry Generation'}
          </Button>
          <Button variant="outline" onClick={onBackToEvaluation}>
            Back to Evaluation
          </Button>
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <p className="text-muted-foreground text-lg sm:text-xl">No improvement suggestions found</p>
        <div className="mt-4 space-x-4">
          <Button onClick={handleRegenerate} disabled={isRegenerating}>
            {isRegenerating ? 'Generating...' : 'Generate Suggestions'}
          </Button>
          <Button variant="outline" onClick={onBackToEvaluation}>
            Back to Evaluation
          </Button>
        </div>
      </div>
    );
  }

  const {
    playground_suggestions,
    toy_suggestions
  } = suggestions;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Improvement Suggestions</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Switch between playground and toy design tabs to see actionable improvement suggestions for each.
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
              <SuggestionsSection suggestions={playground_suggestions} />
            )}
            {selectedTab === 'toy' && (
              <SuggestionsSection suggestions={toy_suggestions} />
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4 sm:pt-6 space-x-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg" 
            onClick={onBackToEvaluation}
          >
            Back to Evaluation
          </Button>
          <Button 
            size="lg" 
            className="px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg" 
            onClick={() => window.location.reload()}
          >
            Start New
          </Button>
        </div>
      </div>
    </div>
  )
} 