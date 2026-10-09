"use client"

import { TrashIcon, UploadIcon } from "lucide-react"
import { useRef, useTransition } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import { Button } from "@/shared/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/shared/ui/field"
import { Spinner } from "@/shared/ui/spinner"
import { toast } from "@/shared/ui/toast"

import { removeProfilePhoto, uploadProfilePhoto } from "../actions"

// Mirrors shared/lib/raster-image.ts; the server re-checks size and type.
const maxBytes = 2 * 1024 * 1024
const accept = "image/png,image/jpeg,image/webp"

function initials(name: string, email: string) {
  return (name.trim() || email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

/** Uploads or removes the profile photo right away. */
export function ProfilePhotoField({
  name,
  email,
  image,
}: {
  name: string
  email: string
  image: string | null | undefined
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, startUpload] = useTransition()
  const [isRemoving, startRemove] = useTransition()

  function upload(file: File) {
    if (file.size > maxBytes) {
      toast.add({
        type: "error",
        title:
          "Your photo is larger than 2 MB. Choose a smaller PNG, JPEG or WebP.",
      })
      return
    }
    startUpload(async () => {
      const formData = new FormData()
      formData.set("photo", file)
      const result = await uploadProfilePhoto(formData)
      toast.add(
        result.ok
          ? { type: "success", title: "Photo updated" }
          : { type: "error", title: result.error.message }
      )
    })
  }

  function remove() {
    startRemove(async () => {
      const result = await removeProfilePhoto()
      toast.add(
        result.ok
          ? { type: "success", title: "Photo removed" }
          : { type: "error", title: result.error.message }
      )
    })
  }

  const isBusy = isUploading || isRemoving

  return (
    <Field>
      <FieldLabel htmlFor="profile-photo">Photo</FieldLabel>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          {image && <AvatarImage src={image} alt="" />}
          <AvatarFallback className="text-lg">
            {initials(name, email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            id="profile-photo"
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) upload(file)
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <UploadIcon data-icon="inline-start" />
            )}
            {image ? "Replace photo" : "Upload photo"}
          </Button>
          {image && (
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              onClick={remove}
            >
              {isRemoving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <TrashIcon data-icon="inline-start" />
              )}
              Remove
            </Button>
          )}
        </div>
      </div>
      <FieldDescription>PNG, JPEG or WebP, up to 2 MB.</FieldDescription>
    </Field>
  )
}
