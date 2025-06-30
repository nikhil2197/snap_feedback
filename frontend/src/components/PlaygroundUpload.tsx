"use client"

import type React from "react"
import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Plus, ChevronLeft, ChevronRight } from "lucide-react"

interface PlaygroundUploadProps {
    selectedImages: string[];
    onImagesChange: (images: string[]) => void;
    nextStep: () => void;
}

export function PlaygroundUpload({ selectedImages, onImagesChange, nextStep }: PlaygroundUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      nextSlide()
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide()
    }
  }

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
            setCurrentSlide(selectedImages.length) // Move to the new image
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
    
    // Adjust current slide if needed
    if (updatedImages.length === 0) {
      setCurrentSlide(0)
    } else if (currentSlide >= updatedImages.length) {
      setCurrentSlide(updatedImages.length - 1)
    }
  }

  const canAddMore = selectedImages.length < 3
  const totalSlides = selectedImages.length + (canAddMore ? 1 : 0)

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Evaluate Playground</h1>
        <p className="text-sm sm:text-base text-muted-foreground px-2">Add up to 3 pictures of your playground - cover as much of the environment as possible</p>
      </div>

      {/* Image Counter */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
          <span className="text-sm font-medium">
            {selectedImages.length}/3 images
          </span>
          {selectedImages.length > 0 && (
            <span className="text-xs text-muted-foreground">
              • Swipe to view
            </span>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <Card className="aspect-square w-full overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="relative h-full w-full">
              {/* Carousel Slides */}
              <div 
                className="flex h-full transition-transform duration-300 ease-in-out" 
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                
                {/* Image Slides */}
                {selectedImages.map((image, index) => (
                  <div key={index} className="min-w-full h-full relative flex-shrink-0">
                    <Image src={image} alt={`Playground ${index + 1}`} fill className="object-cover" />
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {index + 1}/3
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
                ))}

                {/* Add Image Slide */}
                {canAddMore && (
                  <div className="min-w-full h-full flex-shrink-0 flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/25 p-4">
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
                )}
              </div>

              {/* Navigation Arrows */}
              {totalSlides > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dots Indicator */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
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