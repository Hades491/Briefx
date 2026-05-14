'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ImageUploadProps {
  onImageUpload?: (file: File, preview: string) => void
  maxSize?: number // in MB
  accept?: string
}

export function ImageUpload({
  onImageUpload,
  maxSize = 5,
  accept = 'image/*',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPreview(result)
      setFileName(file.name)
      onImageUpload?.(file, result)
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    setPreview(null)
    setFileName(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Upload Image
        </CardTitle>
        <CardDescription>Upload a screenshot or image to analyze</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!preview ? (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 w-full"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Click to upload</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to {maxSize}MB
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate">{fileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
