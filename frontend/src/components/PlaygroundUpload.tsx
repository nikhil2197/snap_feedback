"use client"

import type React from "react"
import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Plus } from "lucide-react"

interface PlaygroundUploadProps {
    selectedImages: string[];
    onImagesChange: (images: string[]) => void;
    nextStep: () => void;
}

export function PlaygroundUpload({ selectedImages, onImagesChange, nextStep }: PlaygroundUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = e.target?.result as string
        if (currentImageIndex !== null) {
          // Replace existing image
          const updatedImages = [...selectedImages]
          updatedImages[currentImageIndex] = newImage
          onImagesChange(updatedImages)
          setCurrentImageIndex(null)
        } else {
          // Add new image
          if (selectedImages.length < 3) {
            onImagesChange([...selectedImages, newImage])
          }
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = (index?: number) => {
    setCurrentImageIndex(index !== undefined ? index : null)
    fileInputRef.current?.click()
  }

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index)
    onImagesChange(updatedImages)
  }

  const canAddMore = selectedImages.length < 3

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Evaluate Playground</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">Add up to 3 pictures of your playground - cover as much of the environment as possible</p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 gap-4">
        {selectedImages.map((image, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image src={image} alt={`Playground ${index + 1}`} fill className="object-cover" />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {index + 1}/{selectedImages.length}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={() => handleUploadClick(index)}
                  >
                    Replace
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs bg-red-500/80 hover:bg-red-500 text-white border-0"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Image Card */}
        {canAddMore && (
          <Card className="aspect-square overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="h-full w-full flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/25 p-4">
                <Plus className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
                  Add another photo
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleUploadClick()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Photo Button - only show if no images */}
      {selectedImages.length === 0 && (
        <Button onClick={() => handleUploadClick()} className="w-full h-12 sm:h-10">
          <Upload className="h-4 w-4 mr-2" />
          <span className="text-sm sm:text-base">Upload Photo</span>
        </Button>
      )}

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Next Step Button */}
      <Button onClick={nextStep} className="w-full h-12 sm:h-10" disabled={selectedImages.length === 0} variant="default">
        <span className="text-sm sm:text-base">Next Step - Upload Toy Setup</span>
      </Button>

      {selectedImages.length === 0 && <p className="text-xs sm:text-sm text-muted-foreground text-center">Please upload at least one photo to continue</p>}
    </div>
  )
} 