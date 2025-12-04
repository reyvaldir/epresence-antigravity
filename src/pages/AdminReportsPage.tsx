import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, Clock, AlertTriangle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useState } from 'react';

export default function AdminReportsPage() {
  const records = useQuery(api.admin.getAttendanceReport, {});
  const users = useQuery(api.admin.getAllUsers);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!records || !users) {
    return <div className="p-8 text-center">Loading reports...</div>;
  }

  // Process data for charts
  const checkIns = records.filter(r => r.type === 'check_in');
  
  // Status Distribution (Pie Chart)
  const statusCounts = checkIns.reduce((acc: any, curr) => {
    const status = curr.status || 'on_time';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'On Time', value: statusCounts['on_time'] || 0, color: '#22c55e' },
    { name: 'Late', value: statusCounts['late'] || 0, color: '#ef4444' },
    { name: 'Early Leave', value: statusCounts['early_leave'] || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Daily Attendance (Bar Chart)
  const dailyCounts = checkIns.reduce((acc: any, curr) => {
    const date = new Date(curr.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(dailyCounts).map(key => ({
    name: key,
    attendees: dailyCounts[key]
  }));

  // Late Comers List
  const lateRecords = checkIns.filter(r => r.status === 'late').sort((a, b) => b.timestamp - a.timestamp);

  // Export Functions
  const getExportData = () => {
    return checkIns.map(r => ({
      Date: new Date(r.timestamp).toLocaleDateString(),
      Time: new Date(r.timestamp).toLocaleTimeString(),
      Employee: r.userName || 'Unknown',
      Email: r.userEmail || 'Unknown',
      Status: r.status || 'on_time',
      Location: `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`
    }));
  };

  const exportToCSV = () => {
    const data = getExportData();
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    const data = getExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance_report.xlsx");
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const data = getExportData();
    
    doc.text("Attendance Report", 14, 15);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      head: [['Date', 'Time', 'Employee', 'Status']],
      body: data.map(r => [r.Date, r.Time, r.Employee, r.Status]),
      startY: 30,
    });

    doc.save("attendance_report.pdf");
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="text-indigo-600" />
              Attendance Reports
            </h1>
            <p className="text-gray-500">Overview of employee attendance and punctuality</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                <button onClick={exportToCSV} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  Export as CSV
                </button>
                <button onClick={exportToExcel} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  Export as Excel
                </button>
                <button onClick={exportToPDF} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-gray-500 font-medium">Total Check-ins</span>
            </div>
            <p className="text-3xl font-bold">{checkIns.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-gray-500 font-medium">Late Arrivals</span>
            </div>
            <p className="text-3xl font-bold">{statusCounts['late'] || 0}</p>
            <p className="text-xs text-red-500 mt-1">
              {((statusCounts['late'] || 0) / checkIns.length * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-gray-500 font-medium">On Time Rate</span>
            </div>
            <p className="text-3xl font-bold">
              {checkIns.length > 0 
                ? ((statusCounts['on_time'] || 0) / checkIns.length * 100).toFixed(1) 
                : 0}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Attendance Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Daily Attendance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendees" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Late Comers List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold flex items-center gap-2">
              <AlertTriangle className="text-red-500 w-5 h-5" />
              Recent Late Arrivals
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {lateRecords.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No late arrivals recorded 🎉</p>
            ) : (
              lateRecords.map((record) => (
                <div key={record._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                      {record.userName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.userName}</p>
                      <p className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
