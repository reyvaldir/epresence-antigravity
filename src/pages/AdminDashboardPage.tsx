import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, FileText, BarChart3, Clock, Calendar } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  
  const allUsers = useQuery(api.admin.getAllUsers);
  const pendingRequests = useQuery(api.absence.getAllPendingRequests);
  const pendingUsers = useQuery(api.admin.getPendingUsers);
  const attendanceRecords = useQuery(api.admin.getAttendanceReport, {});

  const stats = [
    {
      label: 'Total Employees',
      value: allUsers?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/employees',
    },
    {
      label: 'Pending Approvals',
      value: (pendingUsers?.length || 0) + (pendingRequests?.length || 0),
      icon: Clock,
      color: 'bg-orange-500',
      link: '/admin/pending',
    },
    {
      label: 'Today Check-ins',
      value: attendanceRecords?.filter(r => {
        const today = new Date().setHours(0, 0, 0, 0);
        return new Date(r.timestamp).setHours(0, 0, 0, 0) === today;
      }).length || 0,
      icon: BarChart3,
      color: 'bg-green-500',
      link: '/admin/reports',
    },
  ];

  const quickActions = [
    { label: 'Pending Users', icon: Clock, link: '/admin/pending', color: 'bg-orange-50 text-orange-600' },
    { label: 'Manage Employees', icon: Users, link: '/admin/employees', color: 'bg-blue-50 text-blue-600' },
    { label: 'Office Locations', icon: MapPin, link: '/admin/locations', color: 'bg-purple-50 text-purple-600' },
    { label: 'Work Schedules', icon: Calendar, link: '/admin/schedule', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Absence Requests', icon: FileText, link: '/admin/absence', color: 'bg-orange-50 text-orange-600' },
    { label: 'Attendance Reports', icon: BarChart3, link: '/admin/reports', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your organization's attendance system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={() => navigate(stat.link)}
              className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.link)}
                className={`p-4 rounded-xl ${action.color} hover:scale-105 transition-transform flex flex-col items-center gap-2`}
              >
                <action.icon className="w-8 h-8" />
                <span className="font-medium text-sm text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Recent Check-ins</h2>
          {!attendanceRecords || attendanceRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records yet</p>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.slice(0, 5).map((record) => (
                <div key={record._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{record.userName}</p>
                      <p className="text-sm text-gray-500">{record.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{record.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
