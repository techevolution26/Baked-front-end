"use client";

import { useRef, useState } from "react";

export default function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/images", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not upload image");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
          dragging ? "border-berry bg-berry/5" : "border-cocoa/20 bg-white"
        }`}
      >
        {value ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={value}
              alt="Cover preview"
              className="h-32 w-32 object-cover rounded-lg"
            />
            <p className="text-xs text-cocoa/50">Click or drop to replace</p>
          </div>
        ) : uploading ? (
          <p className="text-sm text-cocoa/50">Uploading...</p>
        ) : (
          <p className="text-sm text-cocoa/50">
            Drag a photo here, or click to choose one
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      {error && <p className="text-berry text-sm mt-2">{error}</p>}
    </div>
  );
}
