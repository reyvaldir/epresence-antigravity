import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Calendar, Clock, Save, X } from 'lucide-react';
import type { Id } from '../../convex/_generated/dataModel';

type DaySchedule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isDayOff: boolean;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminSchedulePage() {
  const users = useQuery(api.admin.getAllUsers);
  const schedules = useQuery((api as any).schedules.getAllSchedules);
  const updateSchedule = useMutation((api as any).schedules.updateSchedule);

  const [selectedUser, setSelectedUser] = useState<{ id: Id<"users">, name: string } | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<DaySchedule[]>([]);

  const handleEditClick = (userId: Id<"users">, name: string) => {
    const userSchedule = schedules?.find((s: any) => s.userId === userId);
    
    if (userSchedule) {
      setEditingSchedule(userSchedule.days);
    } else {
      // Default schedule: Mon-Fri 9-5
      const defaultSchedule = DAYS.map((_, index) => ({
        dayOfWeek: index,
        startTime: '09:00',
        endTime: '17:00',
        isDayOff: index === 0 || index === 6, // Weekend off
      }));
      setEditingSchedule(defaultSchedule);
    }
    
    setSelectedUser({ id: userId, name });
  };

  const handleDayChange = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...editingSchedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setEditingSchedule(newSchedule);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    
    try {
      await updateSchedule({
        userId: selectedUser.id,
        days: editingSchedule,
      });
      alert('Schedule updated successfully!');
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update schedule');
    }
  };

  const applyToWeekdays = (sourceIndex: number) => {
    const source = editingSchedule[sourceIndex];
    const newSchedule = editingSchedule.map((day, index) => {
      if (index > 0 && index < 6) { // Mon-Fri
        return { ...day, startTime: source.startTime, endTime: source.endTime, isDayOff: source.isDayOff };
      }
      return day;
    });
    setEditingSchedule(newSchedule);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Employee Schedules
          </h1>
          <p className="text-gray-500">Manage working hours and shifts for all employees</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map((user) => {
            const hasSchedule = schedules?.some((s: any) => s.userId === user._id);
            return (
              <div key={user._id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${hasSchedule ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {hasSchedule ? 'Custom Schedule' : 'Default Schedule'}
                  </span>
                  <button
                    onClick={() => handleEditClick(user._id, user.name)}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    Edit Schedule
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit Schedule: {selectedUser.name}</h2>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {editingSchedule.map((day, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-24 font-medium">{DAYS[day.dayOfWeek]}</div>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isDayOff}
                        onChange={(e) => handleDayChange(index, 'isDayOff', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-600">Day Off</span>
                    </label>

                    {!day.isDayOff && (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleDayChange(index, 'startTime', e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleDayChange(index, 'endTime', e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        {index === 1 && (
                          <button
                            onClick={() => applyToWeekdays(index)}
                            className="text-xs text-blue-600 hover:underline ml-auto"
                          >
                            Apply to Mon-Fri
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
