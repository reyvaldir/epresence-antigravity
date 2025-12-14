import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useUser } from '@clerk/clerk-react';
import { UPDATE_PROFILE } from '../graphql/operations';
import { Camera, User, CheckCircle, Settings } from 'lucide-react';
import * as faceapi from 'face-api.js';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  
  // We don't implement full face reg in frontend anymore as per new architecture
  // But we keep the UI for now as placeholder or future implementation
  // const registerFace = useMutation(api.users.registerFace);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile Settings State
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.primaryPhoneNumber?.phoneNumber || '');
  
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  // Sync state when user loads
  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      setPhone(user.primaryPhoneNumber?.phoneNumber || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update in our backend
      await updateProfile({
        variables: {
          name,
          phone,
          avatarUrl: user.imageUrl
        }
      });
      
      // Also try to update Clerk profile
      await user.update({
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    } catch (err) {
      console.error("Error accessing camera", err);
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
      interval = setInterval(detectFace, 500);
    }
    return () => clearInterval(interval);
  }, [isCameraOpen]);

  const handleRegisterFace = async () => {
    if (!videoRef.current || !user) return;
    
    setLoading(true);
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      // const descriptor = Array.from(detections[0].descriptor);
      
      try {
        // await registerFace({ userId, faceEmbedding: descriptor });
        setIsRegistered(true);
        setIsCameraOpen(false);
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        alert("Face registered successfully (Local Mock)");
      } catch (err) {
        console.error("Failed to register face", err);
        alert("Failed to save face data.");
      }
    } else {
      alert("No face detected. Please try again.");
    }
    setLoading(false);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName || 'User Profile'}</h1>
          <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            Face Registration
          </h2>
          
          {isRegistered ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="font-bold">Face Registered</p>
                <p className="text-sm">You can now use face verification.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Register your face to enable secure check-ins. Please ensure good lighting.
              </p>

              {isCameraOpen ? (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                  <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                    faceDetected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {faceDetected ? 'Face Detected' : 'No Face'}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={startCamera}
                  className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-12 h-12 mb-2 opacity-50" />
                  <span>Tap to open camera</span>
                </button>
              )}

              {isCameraOpen && (
                <button
                  onClick={handleRegisterFace}
                  disabled={!faceDetected || loading}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                    faceDetected && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Saving...' : 'Register Face'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Account Settings Section */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            Account Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your Name"
              />
            </div>
            
             <div> // New Phone field for Clerk/Backend sync
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+1234567890"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
