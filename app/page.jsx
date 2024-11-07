'use client';
import React, { useRef, useState } from 'react';
import { Camera, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WebcamCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [frameImage, setFrameImage] = useState(null);
  
  // Preload frame image
  React.useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setFrameImage(img);
    img.src = 'https://raw.githubusercontent.com/Vegapod-Hyperloop/Photobooth/refs/heads/main/Overlay.png';
  }, []);

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Unable to access webcam. Please ensure you have granted camera permissions.");
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Capture photo with frame
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && frameImage) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Draw frame overlay
      ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
      
      // Get the final image
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
    }
  };

  // Download the captured photo
  const downloadPhoto = () => {
    if (capturedImage) {
      const a = document.createElement('a');
      a.href = capturedImage;
      a.download = `framed-photo-${new Date().toISOString()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Vegapod Photobooooooth</CardTitle>
        <CardDescription>Made with ❤️ by Atharva Arbat</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[7/10] bg-gray-100 rounded-lg overflow-hidden">
          {/* Video preview with frame overlay */}
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {isStreaming && frameImage && (
              <img 
                src={frameImage.src}
                alt="frame"
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                
              />
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        
        
        <div className="flex gap-4 justify-center">
          {!isStreaming ? (
            <Button 
              onClick={startWebcam}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button 
                onClick={capturePhoto}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
              <Button 
                onClick={stopWebcam}
                variant="outline"
              >
                Stop Camera
              </Button>
            </>
          )}
          
          {capturedImage && (
            <Button 
              onClick={downloadPhoto}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
        </div>
        {/* Captured photo preview */}
        {capturedImage && (
          <div className="relative aspect-[7/10] bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Captured photo" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebcamCapture;