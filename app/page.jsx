'use client'
import React, { useRef, useState } from 'react';
import { Camera, Download, FlipHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WebcamCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [frameImage, setFrameImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for rear
  const [stream, setStream] = useState(null);
  
  // Preload frame image
  React.useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setFrameImage(img);
    img.src = 'https://raw.githubusercontent.com/Vegapod-Hyperloop/Photobooth/refs/heads/main/Overlay.png';
  }, []);

  // Start webcam stream
  const startWebcam = async (facing = facingMode) => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: facing,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setStream(newStream);
        setIsStreaming(true);
        setFacingMode(facing);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Unable to access webcam. Please ensure you have granted camera permissions.");
    }
  };

  // Switch camera
  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    await startWebcam(newFacingMode);
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
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
      
      // Save the current context state
      ctx.save();
      
      // Mirror the image if using front camera
      if (facingMode === 'user') {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Restore the context state before drawing the frame overlay
      ctx.restore();
      
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
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
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
              onClick={() => startWebcam()}
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
                onClick={switchCamera}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FlipHorizontal className="w-4 h-4" />
                Switch Camera
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
