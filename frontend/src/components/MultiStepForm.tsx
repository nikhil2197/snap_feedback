"use client";

import { useState } from "react";
import { PlaygroundUpload } from "./PlaygroundUpload";
import { ToyUpload } from "./ToyUpload";
import { ActivityDescription } from "./ActivityDescription";
import { FeedbackDisplay } from "./FeedbackDisplay";
import { submitDesign } from "@/lib/api";

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [playgroundImage, setPlaygroundImage] = useState<string | null>(null);
  const [toyImage, setToyImage] = useState<string | null>(null);
  const [activityDescription, setActivityDescription] = useState("");
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (playgroundImage && toyImage) {
      const response = await submitDesign(playgroundImage, toyImage, activityDescription);
      setSubmissionId(response.submission_id);
      nextStep();
    }
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
      return <FeedbackDisplay submissionId={submissionId} />;
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