import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MapPin, Calendar, Clock, FileText, Users, Settings } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Get actual logged-in user from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;

  // Get today's attendance records
  const attendanceRecords = useQuery(api.admin.getAttendanceReport, {});
  
  // Find today's check-in for this user
  const today = new Date().setHours(0, 0, 0, 0);
  const todayCheckIn = attendanceRecords?.find(record => {
    const recordDate = new Date(record.timestamp).setHours(0, 0, 0, 0);
    return record.userId === user._id && recordDate === today && record.type === 'check_in';
  });

  const todayCheckOut = attendanceRecords?.find(record => {
    const recordDate = new Date(record.timestamp).setHours(0, 0, 0, 0);
    return record.userId === user._id && recordDate === today && record.type === 'check_out';
  });

  const checkInTime = todayCheckIn 
    ? new Date(todayCheckIn.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';
  
  const checkInStatus = todayCheckIn ? 'On Time' : 'Not yet';

  const checkOutTime = todayCheckOut 
    ? new Date(todayCheckOut.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';
  
  const checkOutStatus = todayCheckOut ? 'On Time' : 'Not yet';

  const menuItems = [
    { icon: MapPin, label: 'Attendance', path: '/attendance', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Calendar, label: 'My Schedule', path: '/schedule', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: FileText, label: 'Leave Request', path: '/leave', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Clock, label: 'History', path: '/history', color: 'text-green-500', bg: 'bg-green-50' },
  ];

  if (user.role === 'admin' || user.role === 'super_admin') {
    menuItems.push(
      { icon: Users, label: 'Employees', path: '/employees', color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { icon: Settings, label: 'Settings', path: '/settings', color: 'text-gray-500', bg: 'bg-gray-50' }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hello, {user.name}</h1>
            <p className="text-gray-500">Have a great day at work!</p>
          </div>
          <img src={avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-2xl shadow-lg shadow-blue-200">
            <div className="text-blue-100 text-sm mb-1">Check In</div>
            <div className="text-2xl font-bold">{checkInTime}</div>
            <div className="text-xs opacity-80">{checkInStatus}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm mb-1">Check Out</div>
            <div className="text-2xl font-bold">{checkOutTime}</div>
            <div className="text-xs opacity-80">{checkOutStatus}</div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="container mx-auto p-6">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Menu</h2>
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className={`p-3 rounded-full ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-700 text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      

    </div>
  );
}
