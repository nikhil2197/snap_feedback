"use client";

import { useState } from "react";
import { PlaygroundUpload } from "./PlaygroundUpload";
import { ToyUpload } from "./ToyUpload";
import { ActivityDescription } from "./ActivityDescription";
import { FeedbackDisplay } from "./FeedbackDisplay";
import { submitDesign } from "@/lib/api";
import type { SubmissionResponse } from "@/lib/api";

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playgroundImage, setPlaygroundImage] = useState<string | null>(null);
  const [toyImage, setToyImage] = useState<string | null>(null);
  const [activityDescription, setActivityDescription] = useState("");
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (playgroundImage && toyImage) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await submitDesign(playgroundImage, toyImage, activityDescription);
        setSubmission(response);
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

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Generating feedback, please wait...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <p className="text-destructive font-semibold">An Error Occurred</p>
            <p className="text-muted-foreground mt-2">{error}</p>
        </div>
    )
  }

  switch (step) {
    case 1:
      return (
        <PlaygroundUpload
          selectedImage={playgroundImage}
          onImageSelect={setPlaygroundImage}
          nextStep={nextStep}
        />
      );
    case 2:
      return (
        <ToyUpload
            selectedImage={toyImage}
            onImageSelect={setToyImage}
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
      return <FeedbackDisplay submission={submission} />;
    default:
        return (
            <PlaygroundUpload
              selectedImage={playgroundImage}
              onImageSelect={setPlaygroundImage}
              nextStep={nextStep}
            />
          );
  }
} 