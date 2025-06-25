"use client"

import type React from "react"
import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ImageIcon } from "lucide-react"

interface ToyUploadProps {
    selectedImage: string | null;
    onImageSelect: (image: string) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export function ToyUpload({ selectedImage, onImageSelect, nextStep, prevStep }: ToyUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageSelect(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Evaluate Toy</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">Add a picture of the main toy / activity area - ensure the elements are in focus and you have zoomed in appropriately</p>
      </div>

      {/* Square Preview Area */}
      <Card className="aspect-square w-full overflow-hidden">
        <CardContent className="p-0 h-full">
          {selectedImage ? (
            <div className="relative h-full w-full">
              <Image src={selectedImage || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 text-xs sm:text-sm"
                onClick={() => onImageSelect("")}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/25 p-4">
              <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                Drag photos here or click the button below to upload
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Photo Button */}
      <Button onClick={handleUploadClick} className="w-full h-12 sm:h-10" variant={selectedImage ? "outline" : "default"}>
        <Upload className="h-4 w-4 mr-2" />
        <span className="text-sm sm:text-base">{selectedImage ? "Change Photo" : "Upload Photo"}</span>
      </Button>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <Button onClick={prevStep} className="w-full h-12 sm:h-10" variant="outline">
            <span className="text-sm sm:text-base">Back</span>
        </Button>
        <Button onClick={nextStep} className="w-full h-12 sm:h-10" disabled={!selectedImage} variant="default">
            <span className="text-xs sm:text-sm">Next Step - Add Activity Description</span>
        </Button>
      </div>

      {!selectedImage && <p className="text-xs sm:text-sm text-muted-foreground text-center">Please upload a photo to continue</p>}
    </div>
  )
} 