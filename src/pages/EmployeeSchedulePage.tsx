import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function EmployeeSchedulePage() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id;

  const schedule = useQuery((api as any).schedules.getSchedule, userId ? { userId } : "skip");
  
  // Helper to get dates for the current week
  const getWeekDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0-6
    const diff = today.getDate() - currentDay; // Adjust when day is Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.setDate(diff + i));
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            My Schedule
          </h1>
          <p className="text-gray-500">Your working hours for this week</p>
        </div>

        <div className="space-y-3">
          {weekDates.map((date, index) => {
            const dayOfWeek = date.getDay();
            const daySchedule = schedule?.days.find((d: any) => d.dayOfWeek === dayOfWeek);
            const isToday = new Date().toDateString() === date.toDateString();
            
            // Default to 9-5 Mon-Fri if no custom schedule
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const startTime = daySchedule?.startTime || (isWeekend ? null : "09:00");
            const endTime = daySchedule?.endTime || (isWeekend ? null : "17:00");
            const isDayOff = daySchedule ? daySchedule.isDayOff : isWeekend;

            return (
              <div 
                key={index} 
                className={`p-4 rounded-xl border transition-all ${
                  isToday 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className={`font-bold ${isToday ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {DAYS[dayOfWeek]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {isDayOff ? (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                      Day Off
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Working Day
                    </span>
                  )}
                </div>

                {!isDayOff && (
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {startTime} - {endTime}
                    </span>
                  </div>
                )}
                
                {isToday && !isDayOff && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-indigo-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Don't forget to check in!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
