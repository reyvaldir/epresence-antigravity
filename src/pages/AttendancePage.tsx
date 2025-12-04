import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { useDeviceFingerprint } from '../hooks/useDeviceFingerprint';
import MapComponent from '../components/MapComponent';
import { Camera, MapPin, RefreshCw } from 'lucide-react';
import * as faceapi from 'face-api.js';

export default function AttendancePage() {
  const { location, loading: geoLoading } = useGeolocation();
  const { fingerprint } = useDeviceFingerprint();
  const [, setStep] = useState<'location' | 'photo' | 'verify'>('location');
  const [selfie, setSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [, setFaceDetected] = useState(false);

  // Mock user ID (replace with AuthContext)
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id;

  const checkIn = useMutation(api.attendance.checkIn);
  const checkOut = useMutation(api.attendance.checkOut);
  const userData = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const deviceVerification = useQuery(api.devices.verifyDevice, 
    userId && fingerprint ? { userId, deviceId: fingerprint } : "skip"
  );
  const todayAttendance = useQuery(api.attendance.getTodayAttendance, userId ? { userId } : "skip");

  const today = new Date().toISOString().split('T')[0];
  useQuery((api as any).schedules.getEffectiveSchedule, userId ? { userId, date: today } : "skip");

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

  // Determine current status
  const isCheckedIn = todayAttendance?.type === 'check_in';

  // Mock office location
  const officeLocation = {
    latitude: -6.2088,
    longitude: 106.8456,
    radius: 100 // meters
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Load face-api models from CDN
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      ]);
      console.log("Models loaded");
    } catch (err) {
      console.error("Error accessing camera or loading models", err);
    }
  };

  const detectFace = async () => {
    if (videoRef.current && isCameraOpen) {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
      
      if (detections.length > 0) {
        setFaceDetected(true);
      } else {
        setFaceDetected(false);
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCameraOpen) {
      interval = setInterval(detectFace, 1000); // Check every second
    }
    return () => clearInterval(interval);
  }, [isCameraOpen]);

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        alert("No face detected! Please look at the camera.");
        return;
      }

      // Face Verification Logic
      if (userData?.faceEmbedding) {
        setVerificationStatus('verifying');
        const distance = faceapi.euclideanDistance(detections[0].descriptor, userData.faceEmbedding);
        console.log("Face Distance:", distance);
        
        // Threshold: 0.6 is standard, lower is stricter
        if (distance > 0.6) {
          alert("Face verification failed! Face does not match registered profile.");
          setVerificationStatus('failed');
          return;
        }
        setVerificationStatus('success');
      } else {
        console.warn("No registered face found for user. Skipping verification (Dev Mode).");
      }

      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setSelfie(dataUrl);
        setStep('verify');
        
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsCameraOpen(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!location || !selfie || !userId || !fingerprint) return;

    // Check device verification
    if (!deviceVerification?.isKnown) {
      alert('⚠️ Unrecognized device! This action will be flagged for admin review.');
    }

    try {
      if (isCheckedIn) {
        await checkOut({
          userId,
          latitude: location.latitude,
          longitude: location.longitude,
          selfieUrl: selfie,
          isSuspicious: verificationStatus === 'failed' || !deviceVerification?.isKnown,
        });
        alert('Check-out Successful!');
      } else {
        await checkIn({
          userId,
          latitude: location.latitude,
          longitude: location.longitude,
          selfieUrl: selfie,
          isSuspicious: verificationStatus === 'failed' || !deviceVerification?.isKnown,
        });
        alert('Check-in Successful!');
      }
      // Reset state
      setSelfie(null);
      setStep('location');
    } catch (err) {
      console.error(err);
      alert('Action Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">Attendance</h1>
      </div>

      <div className="container max-w-md mx-auto p-4 space-y-6">
        
        {/* Location Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="text-blue-500" /> Location Status
            </h2>
            {geoLoading ? (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Locating...</span>
            ) : location ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Locked</span>
            ) : (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Error</span>
            )}
          </div>
          
          <MapComponent userLocation={location} officeLocation={officeLocation} />
          
          {location && (
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <span>Lat: {location.latitude.toFixed(6)}</span>
              <span>Long: {location.longitude.toFixed(6)}</span>
            </div>
          )}
        </div>

        {/* Camera Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Camera className="text-blue-500" /> Selfie Check-in
          </h2>

          {selfie ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={selfie} alt="Selfie" className="w-full h-64 object-cover" />
              <button 
                onClick={() => setSelfie(null)}
                className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-gray-700"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          ) : isCameraOpen ? (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay muted className="w-full h-64 object-cover" />
              <canvas ref={canvasRef} className="hidden" width="640" height="480" />
              <button 
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
              </button>
            </div>
          ) : (
            <button 
              onClick={startCamera}
              className="w-full h-64 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <Camera className="w-12 h-12 mb-2" />
              <span>Tap to open camera</span>
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!location || !selfie}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
            location && selfie
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isCheckedIn ? 'Check Out' : 'Check In'}
        </button>
      </div>
    </div>
  );
}
