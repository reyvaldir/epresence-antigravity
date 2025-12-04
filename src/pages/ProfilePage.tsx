import { useState, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Camera, User, CheckCircle, Settings } from 'lucide-react';
import * as faceapi from 'face-api.js';

export default function ProfilePage() {
  // Mock user ID from localStorage for now (in real app, use AuthContext)
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id;

  const registerFace = useMutation(api.users.registerFace);
  // const userData = useQuery(api.users.getUser, userId ? { userId } : "skip");

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile Settings State
  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const updateProfile = useMutation(api.users.updateProfile);

  const handleUpdateProfile = async () => {
    if (!userId) return;
    
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        userId,
        name,
        password: newPassword || undefined,
      });
      
      // Update local storage to reflect new name immediately
      const updatedUser = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert("Profile updated successfully!");
      setNewPassword('');
      setConfirmPassword('');
      // Update the name state to reflect changes immediately
      setName(name); 
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
    if (!videoRef.current || !userId) return;
    
    setLoading(true);
    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length > 0) {
      const descriptor = Array.from(detections[0].descriptor);
      
      try {
        await registerFace({ userId, faceEmbedding: descriptor });
        setIsRegistered(true);
        setIsCameraOpen(false);
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Failed to register face", err);
        alert("Failed to save face data.");
      }
    } else {
      alert("No face detected. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User Profile'}</h1>
          <p className="text-gray-500">{user?.email}</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Leave blank to keep current"
              />
            </div>

            {newPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Confirm new password"
                />
              </div>
            )}

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
