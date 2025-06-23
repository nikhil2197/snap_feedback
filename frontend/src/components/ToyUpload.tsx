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
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Evaluate Toy</h1>
        <p className="text-muted-foreground">Add a picture of the main toy - ensure that it is in focus and you have zoomed in appropriately</p>
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
                className="absolute top-2 right-2"
                onClick={() => onImageSelect("")}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/25">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center px-4">
                Drag photos here or click the button below to upload
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Photo Button */}
      <Button onClick={handleUploadClick} className="w-full" variant={selectedImage ? "outline" : "default"}>
        <Upload className="h-4 w-4 mr-2" />
        {selectedImage ? "Change Photo" : "Upload Photo"}
      </Button>

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={prevStep} className="w-full" variant="outline">
            Back
        </Button>
        <Button onClick={nextStep} className="w-full" disabled={!selectedImage} variant="default">
            Next Step - Add Activity Description
        </Button>
      </div>


      {!selectedImage && <p className="text-sm text-muted-foreground text-center">Please upload a photo to continue</p>}
    </div>
  )
} 