"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ActivityDescriptionProps {
    description: string;
    onDescriptionChange: (description: string) => void;
    prevStep: () => void;
    submit: () => void;
}

export function ActivityDescription({ description, onDescriptionChange, prevStep, submit }: ActivityDescriptionProps) {
  const maxLength = 240
  const remainingChars = maxLength - description.length
  const isOverLimit = remainingChars < 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 text-center">Describe the activity in 240 characters</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 space-y-6">
        {/* Text Area */}
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What activity would you like feedback on?"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-[200px] text-lg border-2 border-gray-200 rounded-lg p-4 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            maxLength={maxLength + 50}
          />

          {/* Character Counter */}
          <div className="text-right">
            <span
              className={`text-sm font-medium ${
                isOverLimit ? "text-red-500" : remainingChars <= 20 ? "text-orange-500" : "text-gray-500"
              }`}
            >
              {remainingChars < 0 ? `${Math.abs(remainingChars)} over limit` : `${remainingChars} characters left`}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pb-6">
          <Button
            onClick={submit}
            disabled={!description.trim() || isOverLimit}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg"
          >
            Submit for Feedback
          </Button>

          <Button
            onClick={prevStep}
            variant="outline"
            className="w-full h-14 text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            Back to Toy Design
          </Button>
        </div>
      </div>
    </div>
  )
} 