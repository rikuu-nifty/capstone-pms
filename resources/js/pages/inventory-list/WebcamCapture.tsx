// components/WebcamCapture.tsx
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onCapture: (file: File) => void;
  onCancel: () => void;
};

export function WebcamCapture({ onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        alert("Could not access camera");
        onCancel();
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onCancel]);

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "asset-photo.jpg", { type: "image/jpeg" });
        onCapture(file);
      }
    }, "image/jpeg");
  };

  return (
    <div className="mt-3 flex flex-col items-center gap-3 rounded-lg border bg-gray-50 p-3">
      <video ref={videoRef} autoPlay className="w-full rounded border" />

      <div className="flex justify-end gap-2 w-full">
        {/* ❌ fix: prevent form submit */}
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleCapture}>
          Capture
        </Button>
      </div>
    </div>
  );
}
