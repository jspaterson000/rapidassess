import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Video, 
  Mic, 
  Square, 
  RotateCcw,
  Check,
  X,
  Maximize2,
  Download
} from 'lucide-react'
import { storage } from '@/lib/storage'

export default function MobileAssessmentCapture({ 
  onPhotoCapture, 
  onVideoCapture, 
  onAudioCapture,
  className 
}) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureMode, setCaptureMode] = useState('photo') // 'photo', 'video', 'audio'
  const [mediaStream, setMediaStream] = useState(null)
  const [capturedMedia, setCapturedMedia] = useState([])
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  const startCapture = async () => {
    try {
      const constraints = {
        video: captureMode === 'photo' || captureMode === 'video',
        audio: captureMode === 'video' || captureMode === 'audio'
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setMediaStream(stream)
      setIsCapturing(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      if (captureMode === 'video' || captureMode === 'audio') {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        
        const chunks = []
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data)
        }
        
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { 
            type: captureMode === 'video' ? 'video/webm' : 'audio/webm' 
          })
          const file = new File([blob], `${captureMode}-${Date.now()}.webm`, {
            type: blob.type
          })
          
          const uploadResult = await storage.uploadFile(file)
          setCapturedMedia(prev => [...prev, { ...uploadResult, type: captureMode }])
          
          if (captureMode === 'video') {
            onVideoCapture?.(uploadResult)
          } else {
            onAudioCapture?.(uploadResult)
          }
        }
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Could not access camera/microphone. Please check permissions.')
    }
  }

  const stopCapture = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
    setIsCapturing(false)
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const uploadResult = await storage.uploadFile(file)
      setCapturedMedia(prev => [...prev, { ...uploadResult, type: 'photo' }])
      onPhotoCapture?.(uploadResult)
    }, 'image/jpeg', 0.9)
  }

  const startRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  return (
    <Card className={`${className} bg-slate-900 text-white`}>
      <CardContent className="p-6">
        {/* Mode Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={captureMode === 'photo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCaptureMode('photo')}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button
            variant={captureMode === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCaptureMode('video')}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
          <Button
            variant={captureMode === 'audio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCaptureMode('audio')}
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            Audio
          </Button>
        </div>

        {/* Camera Preview */}
        {isCapturing && (captureMode === 'photo' || captureMode === 'video') && (
          <div className="relative mb-4 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              {captureMode === 'photo' && (
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="rounded-full w-16 h-16 bg-white text-slate-900 hover:bg-slate-100"
                >
                  <Camera className="w-6 h-6" />
                </Button>
              )}
              
              {captureMode === 'video' && (
                <Button
                  size="lg"
                  onClick={mediaRecorderRef.current?.state === 'recording' ? stopRecording : startRecording}
                  className={`rounded-full w-16 h-16 ${
                    mediaRecorderRef.current?.state === 'recording' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {mediaRecorderRef.current?.state === 'recording' ? (
                    <Square className="w-6 h-6" />
                  ) : (
                    <Video className="w-6 h-6" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Audio Recording */}
        {isCapturing && captureMode === 'audio' && (
          <div className="mb-4 p-8 bg-slate-800 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <Mic className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium mb-4">Recording Audio...</p>
            <Button
              onClick={mediaRecorderRef.current?.state === 'recording' ? stopRecording : startRecording}
              className={mediaRecorderRef.current?.state === 'recording' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {mediaRecorderRef.current?.state === 'recording' ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isCapturing ? (
            <Button onClick={startCapture} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start {captureMode === 'photo' ? 'Camera' : captureMode === 'video' ? 'Video' : 'Audio'}
            </Button>
          ) : (
            <Button onClick={stopCapture} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>

        {/* Captured Media Preview */}
        {capturedMedia.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Captured Media ({capturedMedia.length})</h4>
            <div className="grid grid-cols-3 gap-2">
              {capturedMedia.slice(-6).map((media, index) => (
                <div key={index} className="relative aspect-square bg-slate-800 rounded-lg overflow-hidden">
                  {media.type === 'photo' && (
                    <img src={media.url} alt="Captured" className="w-full h-full object-cover" />
                  )}
                  {media.type === 'video' && (
                    <video src={media.url} className="w-full h-full object-cover" />
                  )}
                  {media.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Mic className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <Badge className="absolute top-1 right-1 text-xs">
                    {media.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}