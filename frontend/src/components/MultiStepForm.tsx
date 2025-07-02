"use client";

import { useState } from "react";
import { PlaygroundUpload } from "./PlaygroundUpload";
import { ToyUpload } from "./ToyUpload";
import { ActivityDescription } from "./ActivityDescription";
import { FeedbackDisplay } from "./FeedbackDisplay";
import { ImprovementSuggestions } from "./ImprovementSuggestions";
import { submitDesignMulti } from "@/lib/api";
import type { SubmissionResponse } from "@/lib/api";

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playgroundImages, setPlaygroundImages] = useState<string[]>([]);
  const [toyImages, setToyImages] = useState<string[]>([]);
  const [activityDescription, setActivityDescription] = useState("");
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [showImprovementSuggestions, setShowImprovementSuggestions] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (playgroundImages.length > 0 && toyImages.length > 0) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await submitDesignMulti(playgroundImages, toyImages, activityDescription);
        setSubmission(response);
        setSubmissionId((response as any)._id || response.id);
        nextStep();
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleShowImprovementSuggestions = () => {
    setShowImprovementSuggestions(true);
  };

  const handleBackToEvaluation = () => {
    setShowImprovementSuggestions(false);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
            <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground text-center px-4">Generating feedback, please wait...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
            <p className="text-destructive font-semibold text-lg sm:text-xl">An Error Occurred</p>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base px-4">{error}</p>
        </div>
    )
  }

  // Show improvement suggestions if requested
  if (showImprovementSuggestions && submissionId) {
    return (
      <ImprovementSuggestions 
        submissionId={submissionId}
        onBackToEvaluation={handleBackToEvaluation}
      />
    );
  }

  switch (step) {
    case 1:
      return (
        <PlaygroundUpload
          selectedImages={playgroundImages}
          onImagesChange={setPlaygroundImages}
          nextStep={nextStep}
        />
      );
    case 2:
      return (
        <ToyUpload
            selectedImages={toyImages}
            onImagesChange={setToyImages}
            nextStep={nextStep}
            prevStep={prevStep}
        />
      );
    case 3:
      return (
        <ActivityDescription
            description={activityDescription}
            onDescriptionChange={setActivityDescription}
            prevStep={prevStep}
            submit={handleSubmit}
        />
    );
    case 4:
      return (
        <FeedbackDisplay 
          submission={submission} 
          submissionId={submissionId}
          onShowImprovementSuggestions={handleShowImprovementSuggestions}
        />
      );
    default:
        return (
            <PlaygroundUpload
              selectedImages={playgroundImages}
              onImagesChange={setPlaygroundImages}
              nextStep={nextStep}
            />
          );
  }
} 